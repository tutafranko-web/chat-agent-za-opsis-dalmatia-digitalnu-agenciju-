import type { NextRequest } from "next/server";
import { saveDaysWithToken } from "@/lib/availability";
import { fail, ok } from "@/lib/http";
import { LIMITS } from "@/lib/rate-limit";
import { guardPost } from "@/lib/request-guards";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Operator marks days (calendar taps or a confirmed message preview). */
export async function POST(req: NextRequest) {
  const g = await guardPost(req, { limit: LIMITS.partner, maxBytes: 20_000 });
  if (!g.ok) return g.response;
  try {
    const res = await saveDaysWithToken(g.body.token, g.body.changes);
    if (!res.ok) return fail(res.code === "invalid_token" ? 403 : 400, res.code, { field: "field" in res ? res.field : undefined });
    return ok({ saved: res.saved });
  } catch (err) {
    console.error("[partner/days]", (err as Error).message);
    return fail(503, "unavailable");
  }
}
