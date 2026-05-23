import { NextRequest, NextResponse } from "next/server";
import { readRows, appendRows } from "@/lib/sheets";
import { sendMail } from "@/lib/mail";

export const runtime = "nodejs";
export const maxDuration = 60;

const SHEET_LEADS_ID = process.env.SHEET_OPERATOR_LEADS_ID || "";
const LEADS_RANGE = process.env.SHEET_OPERATOR_LEADS_RANGE || "A:Z";
const SHEET_SENT_ID = process.env.SHEET_OPERATOR_LEADS_ID || "";
const SENT_RANGE = process.env.SHEET_OPERATOR_LEADS_SENT_RANGE || "Sent!A:Z";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "";
const BASE_URL = process.env.PUBLIC_BASE_URL || "https://opsisdalmatia.com";

function authOk(req: NextRequest): boolean {
  if (!ADMIN_TOKEN) return false;
  return req.headers.get("authorization") === `Bearer ${ADMIN_TOKEN}`;
}

function template(name: string, company: string): { subject: string; html: string } {
  return {
    subject: `${company || "Pozdrav"} — povećajte rezervacije s Opsis Dalmatia`,
    html: `<p>Poštovani ${name || "kolega"},</p>
<p>Opsis Dalmatia je nova digitalna turistička agencija u Splitu — povezujemo turiste s lokalnim operaterima poput vas (parasailing, ATV, ronjenje, boat tours, …).</p>
<p>Bez fiksnih troškova, isključivo provizija po rezervaciji. Vlasnici apartmana također zarađuju kad njihovi gosti rezerviraju kod nas — zato dolazimo s pripremljenim kanalom turista.</p>
<p>Registracija traje 3 minute: <a href="${BASE_URL}/operator/register">${BASE_URL}/operator/register</a></p>
<p>Pozdrav,<br>tim Opsis Dalmatia</p>`,
  };
}

export async function POST(req: NextRequest) {
  if (!authOk(req)) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (!SHEET_LEADS_ID) return NextResponse.json({ ok: false, error: "Operator leads sheet not configured" }, { status: 500 });

  const body = await req.json().catch(() => ({})) as { limit?: number; dryRun?: boolean };
  const limit = Math.max(1, Math.min(50, Number(body.limit || 10)));
  const dryRun = !!body.dryRun;

  const leads = await readRows(SHEET_LEADS_ID, LEADS_RANGE, { ttl: 0 });
  let sentRows: Awaited<ReturnType<typeof readRows>> = [];
  try {
    sentRows = await readRows(SHEET_SENT_ID, SENT_RANGE, { ttl: 0 });
  } catch {
    sentRows = [];
  }
  const alreadySent = new Set(sentRows.map((r) => (r["Email"] || "").toLowerCase().trim()));

  const targets = leads
    .filter((l) => l["Email"] && !alreadySent.has(l["Email"].toLowerCase().trim()))
    .slice(0, limit);

  if (dryRun) return NextResponse.json({ ok: true, dryRun: true, wouldSendTo: targets.length });

  const ts = new Date().toISOString();
  let sent = 0;
  const errors: string[] = [];
  for (const lead of targets) {
    const t = template(lead["Contact Person"] || lead["Name"] || "", lead["Company Name"] || lead["Company"] || "");
    try {
      await sendMail({ to: lead["Email"], subject: t.subject, html: t.html });
      await appendRows(SHEET_SENT_ID, SENT_RANGE, [[ts, lead["Email"], lead["Company Name"] || lead["Company"] || "", "operator", "sent"]]);
      sent++;
    } catch (e) {
      errors.push(`${lead["Email"]}: ${e instanceof Error ? e.message : "error"}`);
    }
  }

  return NextResponse.json({ ok: true, sent, attempted: targets.length, errors });
}
