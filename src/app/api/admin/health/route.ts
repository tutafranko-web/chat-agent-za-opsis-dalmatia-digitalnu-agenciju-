import { NextResponse, type NextRequest } from "next/server";
import { isAdminAuthorized } from "@/lib/admin-auth";
import { healthChecks } from "@/lib/health";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req.headers.get("authorization"))) {
    return NextResponse.json({ ok: false, code: "unauthorized" }, { status: 401 });
  }
  const checks = await healthChecks();
  return NextResponse.json({ ok: checks.every((c) => c.ok), checks }, { headers: { "Cache-Control": "no-store" } });
}
