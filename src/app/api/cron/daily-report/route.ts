import { NextRequest, NextResponse } from "next/server";
import { readRows } from "@/lib/sheets";
import { sendMail } from "@/lib/mail";

export const runtime = "nodejs";
export const maxDuration = 300;

const SHEET_BOOKINGS_ID = process.env.SHEET_BOOKINGS_ID || "";
const SHEET_LANDLORDS_ID = process.env.SHEET_LANDLORDS_ID || "";
const SHEET_OPERATORS_ID = process.env.SHEET_OPERATORS_ID || "";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "";
const CRON_SECRET = process.env.CRON_SECRET || "";

const BOOKINGS_RANGE = process.env.SHEET_BOOKINGS_RANGE || "A:Z";
const LANDLORDS_RANGE = process.env.SHEET_LANDLORDS_RANGE || "A:Z";
const OPERATORS_RANGE = process.env.SHEET_OPERATORS_RANGE || "A:Z";

function n(v: string | undefined): number {
  const x = Number(String(v ?? "").replace(/[^\d.-]/g, ""));
  return isNaN(x) ? 0 : x;
}

export async function GET(req: NextRequest) {
  if (CRON_SECRET) {
    const auth = req.headers.get("authorization") || "";
    if (auth !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
  }

  if (!SHEET_BOOKINGS_ID) {
    return NextResponse.json({ ok: false, error: "Bookings sheet not configured" }, { status: 500 });
  }

  const [bookings, landlords, operators] = await Promise.all([
    readRows(SHEET_BOOKINGS_ID, BOOKINGS_RANGE, { ttl: 0 }),
    SHEET_LANDLORDS_ID ? readRows(SHEET_LANDLORDS_ID, LANDLORDS_RANGE, { ttl: 0 }) : Promise.resolve([]),
    SHEET_OPERATORS_ID ? readRows(SHEET_OPERATORS_ID, OPERATORS_RANGE, { ttl: 0 }) : Promise.resolve([]),
  ]);

  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  const recent = bookings.filter((b) => {
    const ts = Date.parse(b["Timestamp"] || "");
    return !isNaN(ts) && ts >= cutoff;
  });

  if (recent.length === 0) {
    if (ADMIN_EMAIL) {
      await sendMail({
        to: ADMIN_EMAIL,
        subject: "[Opsis] Daily report — no bookings in the last 24h",
        html: `<p>No new bookings recorded since ${new Date(cutoff).toISOString()}.</p>`,
      }).catch(() => undefined);
    }
    return NextResponse.json({ ok: true, bookings: 0 });
  }

  const totalRevenue = recent.reduce((s, b) => s + n(b["Total Price"]), 0);
  const totalCommission = recent.reduce((s, b) => s + n(b["Commission EUR"]), 0);

  const byOperator = new Map<string, typeof recent>();
  const byLandlord = new Map<string, typeof recent>();
  for (const b of recent) {
    const op = b["Operator"] || "Unknown";
    byOperator.set(op, [...(byOperator.get(op) || []), b]);
    const ll = b["Landlord ID"];
    if (ll) byLandlord.set(ll, [...(byLandlord.get(ll) || []), b]);
  }

  const adminRows = recent
    .map(
      (b) =>
        `<tr><td>${b["Date"]}</td><td>${b["Activity"]}</td><td>${b["Operator"]}</td><td>${b["Total Price"]} EUR</td><td>${b["Commission EUR"]} EUR</td><td>${b["Landlord ID"] || "—"}</td></tr>`
    )
    .join("");

  const adminHtml = `<h2>Opsis Dalmatia — daily report</h2>
    <p>Bookings (last 24h): <strong>${recent.length}</strong><br>
    Total revenue: <strong>${totalRevenue.toFixed(2)} EUR</strong><br>
    Total commission: <strong>${totalCommission.toFixed(2)} EUR</strong></p>
    <table border="1" cellpadding="6" style="border-collapse:collapse;"><thead><tr><th>Date</th><th>Activity</th><th>Operator</th><th>Total</th><th>Commission</th><th>Landlord</th></tr></thead><tbody>${adminRows}</tbody></table>
    <p>Unique operators with bookings: ${byOperator.size}<br>Unique landlords with bookings: ${byLandlord.size}</p>`;

  const tasks: Promise<unknown>[] = [];

  if (ADMIN_EMAIL) {
    tasks.push(sendMail({ to: ADMIN_EMAIL, subject: `[Opsis] Daily report: ${recent.length} bookings, ${totalRevenue.toFixed(2)} EUR`, html: adminHtml }));
  }

  // Per-operator emails
  for (const [opName, items] of byOperator) {
    const opEmail = items[0]?.["Operator Email"] || operators.find((o) => o["Company Name"] === opName)?.["Email"] || "";
    if (!opEmail) continue;
    const rows = items
      .map((b) => `<tr><td>${b["Date"]}</td><td>${b["Activity"]}</td><td>${b["Tourist Name"]}</td><td>${b["Adults"]}+${b["Children"]}</td><td>${b["Total Price"]} EUR</td></tr>`)
      .join("");
    tasks.push(
      sendMail({
        to: opEmail,
        subject: `Opsis Dalmatia — ${items.length} new booking${items.length > 1 ? "s" : ""} for ${opName}`,
        html: `<h2>Your bookings (last 24h)</h2><table border="1" cellpadding="6" style="border-collapse:collapse;"><thead><tr><th>Date</th><th>Activity</th><th>Guest</th><th>Pax</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table>`,
      })
    );
  }

  // Per-landlord emails
  for (const [landlordId, items] of byLandlord) {
    const ll = landlords.find((l) => (l["Landlord ID"] || l["landlordId"]) === landlordId);
    if (!ll?.["Email"]) continue;
    const commission = items.reduce((s, b) => s + n(b["Commission EUR"]), 0);
    const rows = items
      .map((b) => `<tr><td>${b["Date"]}</td><td>${b["Activity"]}</td><td>${b["Operator"]}</td><td>${b["Total Price"]} EUR</td><td>${b["Commission EUR"]} EUR</td></tr>`)
      .join("");
    tasks.push(
      sendMail({
        to: ll["Email"],
        subject: `Opsis Dalmatia — your guests booked ${items.length} activit${items.length > 1 ? "ies" : "y"} (${commission.toFixed(2)} EUR commission)`,
        html: `<h2>Your bookings (last 24h)</h2><p>Property: ${ll["Property Name"] || ""}</p><table border="1" cellpadding="6" style="border-collapse:collapse;"><thead><tr><th>Date</th><th>Activity</th><th>Operator</th><th>Total</th><th>Your commission</th></tr></thead><tbody>${rows}</tbody></table><p>Total commission earned: <strong>${commission.toFixed(2)} EUR</strong></p>`,
      })
    );
  }

  const results = await Promise.allSettled(tasks);
  const failed = results.filter((r) => r.status === "rejected").length;

  return NextResponse.json({ ok: true, bookings: recent.length, emailsSent: results.length - failed, failed });
}
