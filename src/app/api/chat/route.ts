import { NextResponse, type NextRequest } from "next/server";
import { readAttribution } from "@/lib/attribution";
import { now } from "@/lib/bookings";
import { runTurn } from "@/lib/concierge/engine";
import { fail, parseLang } from "@/lib/http";
import { LIMITS, rateLimit } from "@/lib/rate-limit";
import { guardPost } from "@/lib/request-guards";
import { cleanText } from "@/lib/sanitize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const g = await guardPost(req, { limit: LIMITS.chat, maxBytes: 420_000 });
  if (!g.ok) return g.response;
  const daily = rateLimit(LIMITS.chatDaily, g.ip);
  if (!daily.ok) return fail(429, "rate_limited", { retryAfter: daily.retryAfter });

  const message = cleanText(g.body.message, 1500, true);
  if (!message) return fail(400, "empty_message");
  const lang = parseLang(g.body.lang);
  const attr = readAttribution(g.body.attr);

  const out = await runTurn({ stateToken: g.body.state, message, lang, area: attr?.area ?? null, at: now() });
  return NextResponse.json({ ok: !out.code || out.code === "limit", ...out }, { headers: { "Cache-Control": "no-store" } });
}
