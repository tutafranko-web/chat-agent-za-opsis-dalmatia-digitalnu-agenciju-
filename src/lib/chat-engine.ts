import { readRows, appendRows } from "./sheets";
import { chatCompletion, GroqMessage } from "./groq";
import { sendMail } from "./mail";
import { CONCIERGE_SYSTEM_PROMPT } from "./prompts";

const SHEET_OPERATORS_ID = process.env.SHEET_OPERATORS_ID || "";
const SHEET_LANDLORDS_ID = process.env.SHEET_LANDLORDS_ID || "";
const SHEET_BOOKINGS_ID = process.env.SHEET_BOOKINGS_ID || "";
const SHEET_BLACKOUTS_ID = process.env.SHEET_BLACKOUTS_ID || "";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "";

const OPERATORS_RANGE = process.env.SHEET_OPERATORS_RANGE || "A:Z";
const LANDLORDS_RANGE = process.env.SHEET_LANDLORDS_RANGE || "A:Z";
const BOOKINGS_RANGE = process.env.SHEET_BOOKINGS_RANGE || "A:Z";
const BLACKOUTS_RANGE = process.env.SHEET_BLACKOUTS_RANGE || "A:Z";

export interface BookingData {
  touristName: string;
  touristEmail: string;
  touristPhone: string;
  activity: string;
  operator: string;
  operatorEmail: string;
  date: string;
  adults: number;
  children: number;
  pricePerPerson: number;
  totalPrice: number;
  commissionPercent: number;
  commissionEur: number;
  landlordId: string;
}

// ────────────────────────────────────────────────────────────────────────────
// Session memory (in-memory window, cold-start ephemeral)
// ────────────────────────────────────────────────────────────────────────────

const HISTORY_WINDOW = 20;
const sessionHistory = new Map<string, { msgs: GroqMessage[]; expiresAt: number }>();
const SESSION_TTL = 60 * 60 * 1000;

setInterval(() => {
  const now = Date.now();
  for (const [k, v] of sessionHistory) if (v.expiresAt < now) sessionHistory.delete(k);
}, 5 * 60 * 1000);

function getHistory(sessionId: string): GroqMessage[] {
  const hit = sessionHistory.get(sessionId);
  if (!hit || hit.expiresAt < Date.now()) return [];
  return hit.msgs;
}

function pushHistory(sessionId: string, user: string, assistant: string) {
  const existing = getHistory(sessionId);
  const next = [...existing, { role: "user" as const, content: user }, { role: "assistant" as const, content: assistant }];
  const trimmed = next.slice(-HISTORY_WINDOW);
  sessionHistory.set(sessionId, { msgs: trimmed, expiresAt: Date.now() + SESSION_TTL });
}

// ────────────────────────────────────────────────────────────────────────────
// Operator + blackout loading & enrichment
// ────────────────────────────────────────────────────────────────────────────

interface Operator {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  city: string;
  galleryUrl: string;
  activities: { name: string; type: string; price: string; commission: string; childPrice: string }[];
}

interface Blackout {
  operatorName: string;
  start: string;
  end: string;
  reason: string;
}

async function loadOperators(): Promise<Operator[]> {
  if (!SHEET_OPERATORS_ID) return [];
  const rows = await readRows(SHEET_OPERATORS_ID, OPERATORS_RANGE);
  const dedup = new Map<string, Operator>();
  for (const r of rows) {
    const companyName = r["Company Name"] || "";
    const email = r["Email"] || "";
    if (!companyName) continue;
    const key = `${companyName}||${email}`;
    if (dedup.has(key)) continue;
    const activities: Operator["activities"] = [];
    for (let i = 1; i <= 5; i++) {
      const name = (r[`Activity ${i} Name`] || "").trim();
      if (!name) continue;
      activities.push({
        name,
        type: (r[`Activity ${i} Type`] || "").trim(),
        price: (r[`Activity ${i} Price`] || "").trim(),
        commission: (r[`Activity ${i} Commission`] || "").trim(),
        childPrice: (r[`Activity ${i} Child Price`] || "").trim(),
      });
    }
    dedup.set(key, {
      companyName,
      contactPerson: r["Contact Person"] || "",
      email,
      phone: r["Phone"] || "",
      city: r["City"] || "",
      galleryUrl: r["Gallery URL"] || r["Gallery / Photo Album URL"] || "",
      activities,
    });
  }
  return [...dedup.values()];
}

async function loadBlackouts(): Promise<Blackout[]> {
  if (!SHEET_BLACKOUTS_ID) return [];
  try {
    const rows = await readRows(SHEET_BLACKOUTS_ID, BLACKOUTS_RANGE);
    return rows
      .map((r) => ({
        operatorName: (r["Operator Name"] || "").trim(),
        start: (r["Unavailable Start Date"] || "").trim(),
        end: (r["Unavailable End Date"] || "").trim(),
        reason: (r["Reason"] || "").trim(),
      }))
      .filter((b) => b.operatorName && b.start && b.end);
  } catch {
    return [];
  }
}

function findRequestedDate(text: string): Date | null {
  const iso = text.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  if (iso) {
    const d = new Date(`${iso[1]}-${iso[2]}-${iso[3]}T00:00:00`);
    return isNaN(d.getTime()) ? null : d;
  }
  const dmy = text.match(/\b(\d{1,2})[./](\d{1,2})[./](\d{4})\b/);
  if (dmy) {
    const d = new Date(Number(dmy[3]), Number(dmy[2]) - 1, Number(dmy[1]));
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function matchActivity(text: string, ops: Operator[]): { activity: string; ops: Operator[] } | null {
  const explicit = text.match(/I want to book:\s*(.+)/i);
  let target = "";
  if (explicit) {
    target = explicit[1].trim().toLowerCase();
  } else {
    // fuzzy: scan known activity names
    const known = new Set<string>();
    for (const op of ops) for (const a of op.activities) known.add(a.name.toLowerCase());
    const lower = text.toLowerCase();
    for (const a of known) {
      if (a.length > 3 && lower.includes(a)) {
        target = a;
        break;
      }
    }
  }
  if (!target) return null;

  const matched: Operator[] = [];
  for (const op of ops) {
    const has = op.activities.some((a) => {
      const lower = a.name.toLowerCase();
      const core = lower.replace(/^\d+\s*-\s*/, "").replace(/\s*\(.*?\)\s*$/, "").trim();
      return lower === target || core === target || lower.includes(target) || target.includes(core);
    });
    if (has) matched.push(op);
  }
  return { activity: target, ops: matched };
}

function buildEnrichedInput(opts: {
  chatInput: string;
  operators: Operator[];
  blackouts: Blackout[];
  landlordId?: string;
  location?: string;
}): string {
  const { chatInput, operators, blackouts, landlordId, location } = opts;
  const now = new Date();
  const blocks: string[] = [chatInput];

  // CURRENT DATE block
  const pad = (n: number) => String(n).padStart(2, "0");
  const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const time = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  blocks.push(`=== [CURRENT DATE] === Today: ${today} | Time (Europe/Zagreb local server): ${time} === [END CURRENT DATE] ===`);

  if (landlordId) blocks.push(`=== [LANDLORD CONTEXT] === Landlord ID: ${landlordId} === [END LANDLORD CONTEXT] ===`);
  if (location) blocks.push(`=== [LOCATION CONTEXT] === Tourist is located in: ${location} === [END LOCATION CONTEXT] ===`);

  const matched = matchActivity(chatInput, operators);
  if (matched) {
    const requestedDate = findRequestedDate(chatInput);
    if (matched.ops.length === 0) {
      blocks.push(`=== [OPERATOR DATA: No operators found for ${matched.activity}] ===`);
    } else {
      const lines: string[] = [`=== [OPERATOR DATA for ${matched.activity}] ===`];
      for (const op of matched.ops) {
        const relevant = op.activities.filter((a) => {
          const lower = a.name.toLowerCase();
          const core = lower.replace(/^\d+\s*-\s*/, "").replace(/\s*\(.*?\)\s*$/, "").trim();
          return lower === matched.activity || core === matched.activity || lower.includes(matched.activity) || matched.activity.includes(core);
        });
        const prices = [...new Set(relevant.map((a) => a.price).filter(Boolean))].join(", ");
        const commission = relevant[0]?.commission || "";
        let availability = "AVAILABLE";
        if (requestedDate) {
          const bo = blackouts.find(
            (b) =>
              b.operatorName.toLowerCase() === op.companyName.toLowerCase() &&
              requestedDate >= new Date(`${b.start}T00:00:00`) &&
              requestedDate <= new Date(`${b.end}T00:00:00`)
          );
          if (bo) availability = `UNAVAILABLE (${bo.start} to ${bo.end}, ${bo.reason})`;
        }
        const gallery = op.galleryUrl ? ` | Gallery: ${op.galleryUrl}` : "";
        lines.push(
          `- ${op.companyName} | ${op.city} | Prices: ${prices} EUR | Commission: ${commission} | Contact: ${op.contactPerson} <${op.email}> ${op.phone}${gallery} | ${availability}`
        );
      }
      lines.push(`=== [END OPERATOR DATA] ===`);
      blocks.push(lines.join("\n"));
    }
  }

  return blocks.join("\n\n");
}

// ────────────────────────────────────────────────────────────────────────────
// Booking persistence & emails
// ────────────────────────────────────────────────────────────────────────────

function parseBookingBlock(text: string): BookingData | null {
  const m = text.match(/\[BOOKING_DATA\]([\s\S]*?)\[\/BOOKING_DATA\]/);
  if (!m) return null;
  try {
    const json = JSON.parse(m[1].trim());
    return {
      touristName: String(json.touristName || ""),
      touristEmail: String(json.touristEmail || ""),
      touristPhone: String(json.touristPhone || ""),
      activity: String(json.activity || ""),
      operator: String(json.operator || ""),
      operatorEmail: String(json.operatorEmail || ""),
      date: String(json.date || ""),
      adults: Number(json.adults || 0),
      children: Number(json.children || 0),
      pricePerPerson: Number(json.pricePerPerson || 0),
      totalPrice: Number(json.totalPrice || 0),
      commissionPercent: Number(json.commissionPercent || 0),
      commissionEur: Number(json.commissionEur || 0),
      landlordId: String(json.landlordId || ""),
    };
  } catch {
    return null;
  }
}

async function persistBooking(b: BookingData, sessionId: string) {
  if (!SHEET_BOOKINGS_ID) return;
  const row = [
    new Date().toISOString(),
    sessionId,
    b.touristName,
    b.touristEmail,
    b.touristPhone,
    b.activity,
    b.operator,
    b.operatorEmail,
    b.date,
    b.adults,
    b.children,
    b.pricePerPerson,
    b.totalPrice,
    b.commissionPercent,
    b.commissionEur,
    b.landlordId,
    "Confirmed",
  ];
  await appendRows(SHEET_BOOKINGS_ID, BOOKINGS_RANGE, [row]);
}

function bookingHtml(b: BookingData): string {
  const rows = [
    ["Activity", b.activity],
    ["Tourist", b.touristName],
    ["Tourist Email", b.touristEmail],
    ["Tourist Phone", b.touristPhone],
    ["Date", b.date],
    ["Adults", String(b.adults)],
    ["Children", String(b.children)],
    ["Total", `${b.totalPrice} EUR`],
    ["Operator", b.operator],
  ];
  return `<h2>Opsis Dalmatia Booking Confirmation</h2><table style="border-collapse:collapse;font-family:Arial,sans-serif;">${rows
    .map(([k, v]) => `<tr><td style="padding:4px 12px;font-weight:bold;">${k}:</td><td style="padding:4px 12px;">${v}</td></tr>`)
    .join("")}</table>`;
}

async function findLandlord(landlordId: string): Promise<{ email: string; name: string; propertyName: string } | null> {
  if (!landlordId || !SHEET_LANDLORDS_ID) return null;
  try {
    const rows = await readRows(SHEET_LANDLORDS_ID, LANDLORDS_RANGE);
    const hit = rows.find((r) => (r["Landlord ID"] || r["landlordId"] || "") === landlordId);
    if (!hit) return null;
    return {
      email: hit["Email"] || hit["email"] || "",
      name: hit["Full Name"] || hit["fullName"] || "",
      propertyName: hit["Property Name"] || hit["propertyName"] || "",
    };
  } catch {
    return null;
  }
}

async function sendBookingEmails(b: BookingData) {
  const html = bookingHtml(b);
  const tasks: Promise<unknown>[] = [];

  if (b.operatorEmail) {
    tasks.push(
      sendMail({
        to: b.operatorEmail,
        subject: `New booking: ${b.activity} on ${b.date}`,
        html,
      })
    );
  }

  if (b.touristEmail) {
    tasks.push(
      sendMail({
        to: b.touristEmail,
        subject: `Your Opsis Dalmatia booking is confirmed`,
        html: `${html}<p>Thank you for booking with Opsis Dalmatia. The operator will contact you shortly. Check your spam folder if you don't see further messages.</p>`,
      })
    );
  }

  if (ADMIN_EMAIL) {
    tasks.push(
      sendMail({
        to: ADMIN_EMAIL,
        subject: `[Opsis] New booking: ${b.activity} | ${b.operator} | ${b.totalPrice} EUR`,
        html: `${html}<p>Commission: ${b.commissionEur} EUR (${b.commissionPercent}%)<br>Landlord ID: ${b.landlordId || "(none)"}</p>`,
      })
    );
  }

  if (b.landlordId) {
    const landlord = await findLandlord(b.landlordId);
    if (landlord?.email) {
      tasks.push(
        sendMail({
          to: landlord.email,
          subject: `Your guest just booked an activity through Opsis Dalmatia`,
          html: `<p>Hi ${landlord.name},</p><p>A guest from your property (${landlord.propertyName}) just booked an activity through Opsis Dalmatia:</p>${html}<p>Your commission: ${b.commissionEur} EUR.</p>`,
        })
      );
    }
  }

  await Promise.allSettled(tasks);
}

// ────────────────────────────────────────────────────────────────────────────
// Output cleanup (strip system tags before showing to user)
// ────────────────────────────────────────────────────────────────────────────

const TAG_PATTERNS: RegExp[] = [
  /\[BOOKING_DATA\][\s\S]*?\[\/BOOKING_DATA\]/g,
  /\[BOOKING_DATA\][\s\S]*$/g,
  /===\s*\[OPERATOR DATA[\s\S]*?===\s*\[END OPERATOR DATA\]\s*===/g,
  /===\s*\[OPERATOR DATA:[\s\S]*?===/g,
  /===\s*\[BLACKOUT DATES[\s\S]*?===\s*\[END BLACKOUT DATES\]\s*===/g,
  /===\s*\[CURRENT DATE\][\s\S]*?===\s*\[END CURRENT DATE\]\s*===/g,
  /===\s*\[LANDLORD CONTEXT\][\s\S]*?===\s*\[END LANDLORD CONTEXT\]\s*===/g,
  /===\s*\[LOCATION CONTEXT\][\s\S]*?===\s*\[END LOCATION CONTEXT\]\s*===/g,
];

function stripSystemTags(text: string): string {
  let out = text;
  for (const p of TAG_PATTERNS) out = out.replace(p, "");
  return out.trim();
}

// ────────────────────────────────────────────────────────────────────────────
// Public entry: handle one chat turn
// ────────────────────────────────────────────────────────────────────────────

export interface ChatTurnInput {
  sessionId: string;
  chatInput: string;
  landlordId?: string;
  location?: string;
}

export interface ChatTurnResult {
  output: string;
  booked: boolean;
}

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?previous\s+instructions/i,
  /you\s+are\s+now/i,
  /\[system\]/i,
  /pretend\s+you\s+are/i,
  /override\s+your/i,
  /forget\s+(all\s+)?your\s+rules/i,
  /disregard\s+(all\s+)?previous/i,
];

export async function handleChatTurn(input: ChatTurnInput): Promise<ChatTurnResult> {
  let chatInput = (input.chatInput || "").slice(0, 2000);
  if (INJECTION_PATTERNS.some((p) => p.test(chatInput))) {
    chatInput = "I have a question about activities in Split.";
  }

  const [operators, blackouts] = await Promise.all([loadOperators(), loadBlackouts()]);

  const enriched = buildEnrichedInput({
    chatInput,
    operators,
    blackouts,
    landlordId: input.landlordId,
    location: input.location,
  });

  const history = getHistory(input.sessionId);
  const messages: GroqMessage[] = [
    { role: "system", content: CONCIERGE_SYSTEM_PROMPT },
    ...history,
    { role: "user", content: enriched },
  ];

  const raw = await chatCompletion(messages, { temperature: 0.6, maxTokens: 1500 });
  const booking = parseBookingBlock(raw);
  const visible = stripSystemTags(raw);

  pushHistory(input.sessionId, chatInput, visible);

  if (booking && booking.touristEmail && booking.operatorEmail) {
    try {
      await persistBooking(booking, input.sessionId);
      await sendBookingEmails(booking);
    } catch (e) {
      console.error("[chat] booking persist/email failed", e);
    }
    return { output: visible, booked: true };
  }

  return { output: visible, booked: false };
}
