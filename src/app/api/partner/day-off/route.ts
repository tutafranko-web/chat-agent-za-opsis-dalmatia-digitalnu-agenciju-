import type { NextRequest } from "next/server";
import { fail, ok } from "@/lib/http";
import { addDayOff } from "@/lib/partners";
import { LIMITS } from "@/lib/rate-limit";
import { guardPost } from "@/lib/request-guards";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const g = await guardPost(req, { limit: LIMITS.partner, maxBytes: 4000 });
  if (!g.ok) return g.response;
  try {
    const res = await addDayOff(g.body.token, g.body);
    if (!res.ok) return fail(res.code === "invalid_token" ? 403 : 400, res.code, { field: "field" in res ? res.field : undefined });
    return ok();
  } catch (err) {
    console.error("[day-off]", (err as Error).message);
    return fail(503, "unavailable");
  }
}
