import { NextResponse, type NextRequest } from "next/server";
import { isCronAuthorized } from "@/lib/admin-auth";
import { syncAllCalendars } from "@/lib/availability";
import { runDailyReport } from "@/lib/reports";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

/** Vercel Cron (daily). Fails closed: without CRON_SECRET nobody can trigger it. */
export async function GET(req: NextRequest) {
  if (!isCronAuthorized(req.headers.get("authorization"))) {
    return NextResponse.json({ ok: false, code: "unauthorized" }, { status: 401 });
  }
  try {
    // Refresh operators' linked calendars first so today's availability is current; never blocks the report.
    const calendars = await syncAllCalendars().catch((err) => {
      console.error("[cron] calendar sync failed", (err as Error).message);
      return { synced: 0, failed: -1 };
    });
    const res = await runDailyReport(new Date(), req.nextUrl.searchParams.get("force") === "1");
    return NextResponse.json({ ok: true, ...res, calendars });
  } catch (err) {
    console.error("[cron] daily report failed", (err as Error).message);
    return NextResponse.json({ ok: false, code: "failed" }, { status: 500 });
  }
}
