import type { NextRequest } from "next/server";
import { saveCalendarLink } from "@/lib/availability";
import { fail, ok } from "@/lib/http";
import { LIMITS } from "@/lib/rate-limit";
import { guardPost } from "@/lib/request-guards";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

/** Link (or unlink, with an empty url) the operator's existing iCal calendar and sync it once. */
export async function POST(req: NextRequest) {
  const g = await guardPost(req, { limit: LIMITS.partner, maxBytes: 4000 });
  if (!g.ok) return g.response;
  try {
    const res = await saveCalendarLink(g.body.token, g.body.url);
    if (!res.ok) {
      if (res.error === "invalid_token") return fail(403, "invalid_token");
      return fail(400, res.error === "url_not_allowed" ? "url_not_allowed" : "calendar_unreadable", { hint: "hint" in res ? res.hint : undefined });
    }
    return ok({ blocked: res.blocked });
  } catch (err) {
    console.error("[partner/calendar-link]", (err as Error).message);
    return fail(503, "unavailable");
  }
}
