import "server-only";
import { env } from "./env";
import { sendMail } from "./mail";
import { adminDailyReport, partnerDailyReport } from "./mail-templates";
import { appendRaw, listBookings, listLandlords, listOperators, logEvent, readRaw } from "./repo";
import type { Booking } from "./schema";
import { addDays, zagrebNow } from "./zagreb-time";

/**
 * Daily report for the previous Zagreb calendar day. Idempotent: a row in the
 * "Izvjestaji" tab marks the day as sent, so a second call is skipped.
 */
export async function runDailyReport(at: Date = new Date(), force = false) {
  const reportDate = addDays(zagrebNow(at).date, -1);
  const done = (await readRaw("reports", true)).some((r) => (r.report_date ?? "").replace(/^'/, "") === reportDate);
  if (done && !force) return { skipped: true, reportDate };

  const all = await listBookings(true);
  const dayOf = (iso: string) => (iso ? zagrebNow(new Date(iso)).date : "");
  const created = all.filter((b) => dayOf(b.created_at) === reportDate);
  const stale = all.filter((b) => b.status === "pending" && b.created_at && at.getTime() - new Date(b.created_at).getTime() > 12 * 3600_000);

  const mails: Promise<{ ok: boolean }>[] = [];
  mails.push(sendMail({ to: env.adminEmails(), audience: "admin", tag: "report_admin", idempotencyKey: `report-admin-${reportDate}`, ...adminDailyReport(reportDate, created, stale) }));

  if (created.length) {
    const [operators, landlords] = await Promise.all([listOperators(true), listLandlords(true)]);
    const byOp = new Map<string, Booking[]>();
    const byLl = new Map<string, Booking[]>();
    for (const b of created) {
      byOp.set(b.operator_id, [...(byOp.get(b.operator_id) ?? []), b]);
      if (b.landlord_id) byLl.set(b.landlord_id, [...(byLl.get(b.landlord_id) ?? []), b]);
    }
    for (const [opId, list] of byOp) {
      const op = operators.find((o) => o.operator_id === opId);
      if (!op?.email) continue;
      mails.push(sendMail({ to: op.email, audience: "partner", tag: "report_operator", idempotencyKey: `report-op-${opId}-${reportDate}`, ...partnerDailyReport("operator", op.company, reportDate, list, null) }));
    }
    for (const [llId, list] of byLl) {
      const ll = landlords.find((l) => l.landlord_id === llId);
      if (!ll?.email) continue;
      const share = env.landlordSharePct() === null ? null : list.reduce((s, b) => s + (b.landlord_share_eur ?? 0), 0);
      mails.push(sendMail({ to: ll.email, audience: "partner", tag: "report_landlord", idempotencyKey: `report-ll-${llId}-${reportDate}`, ...partnerDailyReport("landlord", ll.property_name, reportDate, list, share) }));
    }
  }

  const results = await Promise.allSettled(mails);
  const failed = results.filter((r) => r.status === "rejected" || !r.value.ok).length;
  await appendRaw("reports", { report_date: reportDate, sent_at: at.toISOString(), bookings: created.length, status: failed ? `partial (${failed} failed)` : "sent" });
  await logEvent(failed ? "warn" : "info", "daily_report", reportDate, `${created.length} bookings, ${failed} mail failures`);
  return { skipped: false, reportDate, bookings: created.length, emails: mails.length, failed };
}
