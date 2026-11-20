import type { NextRequest } from "next/server";
import { quote } from "@/lib/bookings";
import { fail, int, ok, parseLang, str } from "@/lib/http";
import { LIMITS } from "@/lib/rate-limit";
import { guardPost } from "@/lib/request-guards";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const g = await guardPost(req, { limit: LIMITS.quote, maxBytes: 2000 });
  if (!g.ok) return g.response;
  const b = g.body;
  try {
    const res = await quote({
      activityId: str(b.activity_id, 20),
      date: str(b.date, 10),
      adults: int(b.adults, 0),
      children: int(b.children, 0),
      lang: parseLang(b.lang),
    });
    if (!res.ok) return fail(422, res.error.code, { error: res.error });
    return ok({ draft: res.draft });
  } catch (err) {
    console.error("[quote]", (err as Error).message);
    return fail(503, "unavailable");
  }
}
