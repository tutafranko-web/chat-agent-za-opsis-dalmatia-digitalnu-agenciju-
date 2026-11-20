import type { NextRequest } from "next/server";
import { fail, ok } from "@/lib/http";
import { updatePhotos } from "@/lib/partners";
import { LIMITS } from "@/lib/rate-limit";
import { guardPost } from "@/lib/request-guards";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const g = await guardPost(req, { limit: LIMITS.partner, maxBytes: 4000 });
  if (!g.ok) return g.response;
  try {
    const res = await updatePhotos(g.body.token, g.body);
    if (!res.ok) return fail(res.code === "invalid_token" ? 403 : 400, res.code, { field: "field" in res ? res.field : undefined });
    return ok();
  } catch (err) {
    console.error("[photos]", (err as Error).message);
    return fail(503, "unavailable");
  }
}
