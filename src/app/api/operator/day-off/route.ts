import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { appendRows } from "@/lib/sheets";
import { sendMail } from "@/lib/mail";

export const runtime = "nodejs";

const REASONS = ["Weather", "Maintenance", "Equipment", "Holiday", "Private Event", "Other"] as const;

const Schema = z.object({
  companyName: z.string().min(2),
  email: z.string().email(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.enum(REASONS),
  notes: z.string().optional().default(""),
});

const SHEET_ID = process.env.SHEET_BLACKOUTS_ID || "";
const RANGE = process.env.SHEET_BLACKOUTS_RANGE || "A:Z";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "";

function expandRange(start: string, end: string): string[] {
  const out: string[] = [];
  const s = new Date(`${start}T00:00:00`);
  const e = new Date(`${end}T00:00:00`);
  if (isNaN(s.getTime()) || isNaN(e.getTime()) || e < s) return out;
  const cur = new Date(s);
  const MAX = 90;
  let i = 0;
  while (cur <= e && i < MAX) {
    out.push(cur.toISOString().slice(0, 10));
    cur.setDate(cur.getDate() + 1);
    i++;
  }
  return out;
}

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null);
  const parsed = Schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
  }
  const d = parsed.data;
  if (!SHEET_ID) return NextResponse.json({ ok: false, error: "Server not configured" }, { status: 500 });

  const dates = expandRange(d.startDate, d.endDate);
  if (dates.length === 0) {
    return NextResponse.json({ ok: false, error: "Invalid date range (max 90 days)" }, { status: 400 });
  }

  // Columns: Timestamp | Operator Name | Operator Email | Unavailable Start Date | Unavailable End Date | Date | Reason | Notes
  const ts = new Date().toISOString();
  const rows = dates.map((date) => [ts, d.companyName, d.email, d.startDate, d.endDate, date, d.reason, d.notes]);

  try {
    await appendRows(SHEET_ID, RANGE, rows);
  } catch (e) {
    console.error("[day-off] sheet append failed", e);
    return NextResponse.json({ ok: false, error: "Could not save day-off" }, { status: 500 });
  }

  if (ADMIN_EMAIL) {
    await sendMail({
      to: ADMIN_EMAIL,
      subject: `[Opsis] Day-off: ${d.companyName} | ${d.startDate} → ${d.endDate}`,
      html: `<p>Operator: <strong>${d.companyName}</strong> (${d.email})<br>Range: ${d.startDate} → ${d.endDate} (${dates.length} days)<br>Reason: ${d.reason}<br>Notes: ${d.notes || "—"}</p>`,
    }).catch((e) => console.error("[day-off] admin email failed", e));
  }

  return NextResponse.json({ ok: true, daysBlocked: dates.length });
}
