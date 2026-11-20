import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "./env";
import { rateLimit, type Limit } from "./rate-limit";
import { signToken, verifyToken } from "./tokens";

/**
 * Guards for every public POST endpoint:
 *  - JSON only (blocks cross-site form posts with text/plain bodies),
 *  - same-origin check (Origin / Sec-Fetch-Site),
 *  - per-IP rate limit,
 *  - body size cap.
 * Forms additionally carry a honeypot field and a signed "form started"
 * token so bots that submit instantly are ignored.
 */

export function clientIp(req: NextRequest): string {
  return (
    req.headers.get("x-real-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

function sameOrigin(req: NextRequest): boolean {
  const site = req.headers.get("sec-fetch-site");
  if (site && site !== "same-origin" && site !== "none") return false;
  const origin = req.headers.get("origin");
  if (!origin) return true; // non-browser clients (curl, smoke tests) send no Origin
  try {
    const o = new URL(origin);
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
    if (o.host === host) return true;
    return o.origin === new URL(env.baseUrl()).origin;
  } catch {
    return false;
  }
}

export function jsonError(status: number, code: string, extra: Record<string, unknown> = {}) {
  return NextResponse.json({ ok: false, code, ...extra }, { status, headers: { "Cache-Control": "no-store" } });
}

export type GuardOk = { ok: true; body: Record<string, unknown>; ip: string };
export type GuardFail = { ok: false; response: NextResponse };

export async function guardPost(
  req: NextRequest,
  opts: { limit: Limit; maxBytes?: number },
): Promise<GuardOk | GuardFail> {
  const ct = req.headers.get("content-type") || "";
  if (!ct.toLowerCase().startsWith("application/json")) return { ok: false, response: jsonError(415, "json_required") };
  if (!sameOrigin(req)) return { ok: false, response: jsonError(403, "bad_origin") };
  const ip = clientIp(req);
  const rl = rateLimit(opts.limit, ip);
  if (!rl.ok) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, code: "rate_limited", retryAfter: rl.retryAfter },
        { status: 429, headers: { "Retry-After": String(rl.retryAfter), "Cache-Control": "no-store" } },
      ),
    };
  }
  const maxBytes = opts.maxBytes ?? 32_000;
  const len = Number(req.headers.get("content-length") || "0");
  if (len > maxBytes) return { ok: false, response: jsonError(413, "too_large") };
  let text: string;
  try {
    text = await req.text();
  } catch {
    return { ok: false, response: jsonError(400, "bad_body") };
  }
  if (text.length > maxBytes) return { ok: false, response: jsonError(413, "too_large") };
  try {
    const body = JSON.parse(text);
    if (!body || typeof body !== "object" || Array.isArray(body)) return { ok: false, response: jsonError(400, "bad_body") };
    return { ok: true, body: body as Record<string, unknown>, ip };
  } catch {
    return { ok: false, response: jsonError(400, "bad_json") };
  }
}

// ── Form anti-bot ──────────────────────────────────────────────────────────

const MIN_FILL_MS = 2500;

export function newFormToken(nowMs = Date.now()): string {
  return signToken("form", { t: nowMs }, 6 * 3600, nowMs);
}

/** True when the submission looks human: honeypot empty and form open ≥ 2.5 s. */
export function looksHuman(body: Record<string, unknown>, nowMs = Date.now()): boolean {
  if (typeof body.website_url === "string" && body.website_url.trim() !== "") return false; // honeypot
  const v = verifyToken<{ t: number }>("form", body.ft, nowMs);
  if (!v) return false;
  return nowMs - v.data.t >= MIN_FILL_MS;
}
