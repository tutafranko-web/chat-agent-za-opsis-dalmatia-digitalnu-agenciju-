import type { NextRequest } from "next/server";
import { fail, ok, parseLang } from "@/lib/http";
import { registerLandlord } from "@/lib/partners";
import { LIMITS } from "@/lib/rate-limit";
import { logEvent } from "@/lib/repo";
import { guardPost, looksHuman } from "@/lib/request-guards";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const g = await guardPost(req, { limit: LIMITS.form, maxBytes: 8000 });
  if (!g.ok) return g.response;
  if (!looksHuman(g.body)) return fail(400, "try_again");
  try {
    const res = await registerLandlord(g.body, parseLang(g.body.lang));
    if (!res.ok) return fail(400, res.code, { field: res.field });
    return ok({ landlord_id: res.landlord_id, links: res.links, qr: res.qr, existing: res.existing });
  } catch (err) {
    await logEvent("error", "landlord_register_failed", "", (err as Error).message);
    return fail(503, "unavailable");
  }
}
