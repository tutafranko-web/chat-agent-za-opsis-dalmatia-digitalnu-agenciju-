import { NextRequest, NextResponse } from "next/server";
import { readRows, appendRows } from "@/lib/sheets";
import { sendMail } from "@/lib/mail";

export const runtime = "nodejs";
export const maxDuration = 60;

const SHEET_LEADS_ID = process.env.SHEET_LANDLORD_LEADS_ID || "";
const LEADS_RANGE = process.env.SHEET_LANDLORD_LEADS_RANGE || "A:Z";
const SENT_RANGE = process.env.SHEET_LANDLORD_LEADS_SENT_RANGE || "Sent!A:Z";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "";
const BASE_URL = process.env.PUBLIC_BASE_URL || "https://opsisdalmatia.com";

function authOk(req: NextRequest): boolean {
  if (!ADMIN_TOKEN) return false;
  return req.headers.get("authorization") === `Bearer ${ADMIN_TOKEN}`;
}

function template(name: string, propertyName: string): { subject: string; html: string } {
  return {
    subject: `${propertyName ? propertyName + " — " : ""}zaradite proviziju od svojih gostiju`,
    html: `<p>Poštovani ${name || "iznajmljivaču"},</p>
<p>Opsis Dalmatia je nova digitalna agencija u Splitu koja povezuje turiste s aktivnostima u Dalmaciji (boat tours, parasailing, rafting, ATV, …).</p>
<p>Kad postavite naš QR kod u apartmanu, svaka rezervacija vaših gostiju donosi vam proviziju — bez ikakvog dodatnog rada.</p>
<p>Registracija je besplatna i traje 2 minute: <a href="${BASE_URL}/landlord/register">${BASE_URL}/landlord/register</a></p>
<p>Pozdrav,<br>tim Opsis Dalmatia</p>`,
  };
}

export async function POST(req: NextRequest) {
  if (!authOk(req)) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (!SHEET_LEADS_ID) return NextResponse.json({ ok: false, error: "Landlord leads sheet not configured" }, { status: 500 });

  const body = await req.json().catch(() => ({})) as { limit?: number; dryRun?: boolean };
  const limit = Math.max(1, Math.min(50, Number(body.limit || 10)));
  const dryRun = !!body.dryRun;

  const leads = await readRows(SHEET_LEADS_ID, LEADS_RANGE, { ttl: 0 });
  let sentRows: Awaited<ReturnType<typeof readRows>> = [];
  try {
    sentRows = await readRows(SHEET_LEADS_ID, SENT_RANGE, { ttl: 0 });
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
    const t = template(lead["Full Name"] || lead["Name"] || "", lead["Property Name"] || "");
    try {
      await sendMail({ to: lead["Email"], subject: t.subject, html: t.html });
      await appendRows(SHEET_LEADS_ID, SENT_RANGE, [[ts, lead["Email"], lead["Property Name"] || "", "landlord", "sent"]]);
      sent++;
    } catch (e) {
      errors.push(`${lead["Email"]}: ${e instanceof Error ? e.message : "error"}`);
    }
  }

  return NextResponse.json({ ok: true, sent, attempted: targets.length, errors });
}
