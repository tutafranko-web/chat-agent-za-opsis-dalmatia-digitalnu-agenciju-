import type { NextRequest } from "next/server";
import { readAvailabilityMessage } from "@/lib/availability";
import { fail, ok } from "@/lib/http";
import { LIMITS } from "@/lib/rate-limit";
import { guardPost } from "@/lib/request-guards";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

/** Reads a sentence like "sutra pun, subota još 4 mjesta" into a preview. Nothing is saved here. */
export async function POST(req: NextRequest) {
  const g = await guardPost(req, { limit: LIMITS.partnerAi, maxBytes: 4000 });
  if (!g.ok) return g.response;
  try {
    const res = await readAvailabilityMessage(g.body.token, g.body.text);
    if (!res.ok) {
      const status = res.code === "invalid_token" ? 403 : res.code === "validation" ? 400 : 503;
      return fail(status, res.code);
    }
    return ok({ preview: res.preview });
  } catch (err) {
    console.error("[partner/days/read]", (err as Error).message);
    return fail(503, "unavailable");
  }
}
