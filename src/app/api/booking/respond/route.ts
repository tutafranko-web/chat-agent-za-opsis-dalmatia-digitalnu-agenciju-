import type { NextRequest } from "next/server";
import { respond } from "@/lib/bookings";
import { fail, ok } from "@/lib/http";
import { LIMITS } from "@/lib/rate-limit";
import { guardPost } from "@/lib/request-guards";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

/** Operator confirms or declines a request (POST only; the e-mail link opens a page first). */
export async function POST(req: NextRequest) {
  const g = await guardPost(req, { limit: LIMITS.respond, maxBytes: 8000 });
  if (!g.ok) return g.response;
  try {
    const res = await respond({ token: g.body.token, action: g.body.action, note: g.body.note, day: g.body.day });
    if (!res.ok) return fail(res.code === "not_found" ? 404 : 400, res.code);
    return ok({ status: res.status, already: !!res.already, dayMarked: "dayMarked" in res ? res.dayMarked ?? null : null });
  } catch (err) {
    console.error("[respond]", (err as Error).message);
    return fail(503, "unavailable");
  }
}
