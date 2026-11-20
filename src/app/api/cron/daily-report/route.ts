import { NextResponse, type NextRequest } from "next/server";
import { isCronAuthorized } from "@/lib/admin-auth";
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
    const res = await runDailyReport(new Date(), req.nextUrl.searchParams.get("force") === "1");
    return NextResponse.json({ ok: true, ...res });
  } catch (err) {
    console.error("[cron] daily report failed", (err as Error).message);
    return NextResponse.json({ ok: false, code: "failed" }, { status: 500 });
  }
}
