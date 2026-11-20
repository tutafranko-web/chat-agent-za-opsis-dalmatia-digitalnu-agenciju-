import { NextResponse, type NextRequest } from "next/server";
import { fail, ok } from "@/lib/http";
import { rateLimit, type Limit } from "@/lib/rate-limit";
import { logEvent } from "@/lib/repo";
import { clientIp } from "@/lib/request-guards";
import { emailFromUnsubToken, maskEmail, suppressEmail } from "@/lib/unsubscribe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LIMIT: Limit = { name: "unsubscribe", max: 30, windowMs: 10 * 60_000 };
const MAX_BYTES = 8000;

/**
 * Unsubscribe from B2B outreach. Accepts:
 *  1. JSON `{ t }` from the /odjava page;
 *  2. RFC 8058 one-click: form POST (urlencoded or multipart) with body
 *     "List-Unsubscribe=One-Click" and the token in the query string `?t=`.
 * The signed token is the only authorization, so no same-origin check:
 * mail providers post from their own servers.
 */
export async function POST(req: NextRequest) {
  const rl = rateLimit(LIMIT, clientIp(req));
  if (!rl.ok) {
    return NextResponse.json(
      { ok: false, code: "rate_limited", retryAfter: rl.retryAfter },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter), "Cache-Control": "no-store" } },
    );
  }
  if (Number(req.headers.get("content-length") || "0") > MAX_BYTES) return fail(413, "too_large");

  const ct = (req.headers.get("content-type") || "").toLowerCase();
  let token = req.nextUrl.searchParams.get("t") || "";
  try {
    if (ct.startsWith("application/json")) {
      const text = await req.text();
      if (text.length > MAX_BYTES) return fail(413, "too_large");
      const body: unknown = text ? JSON.parse(text) : null;
      if (body && typeof body === "object" && typeof (body as { t?: unknown }).t === "string") {
        token = (body as { t: string }).t;
      }
    } else if (!token && ct.startsWith("application/x-www-form-urlencoded")) {
      const text = await req.text();
      if (text.length > MAX_BYTES) return fail(413, "too_large");
      token = new URLSearchParams(text).get("t") || "";
    } else if (!token && ct.startsWith("multipart/form-data")) {
      const v = (await req.formData()).get("t");
      token = typeof v === "string" ? v : "";
    }
  } catch {
    return fail(400, "bad_body");
  }

  const email = emailFromUnsubToken(token);
  if (!email) return fail(400, "invalid_token");

  try {
    const { already } = await suppressEmail(email, "unsubscribe");
    await logEvent("info", "unsubscribe", "", already ? `${maskEmail(email)} (already)` : maskEmail(email));
    return ok({ already });
  } catch (err) {
    await logEvent("error", "unsubscribe_failed", "", `${maskEmail(email)}: ${(err as Error).message}`);
    return fail(503, "unavailable");
  }
}

/**
 * Opening the List-Unsubscribe URL in a browser must not unsubscribe by itself
 * (link scanners prefetch URLs), so GET only forwards to the confirmation page.
 */
export function GET(req: NextRequest) {
  const url = req.nextUrl.clone();
  const t = url.searchParams.get("t");
  url.pathname = "/odjava";
  url.search = "";
  if (t) url.searchParams.set("t", t.slice(0, 2000));
  return NextResponse.redirect(url, { status: 303, headers: { "Cache-Control": "no-store" } });
}
