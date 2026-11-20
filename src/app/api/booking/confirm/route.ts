import type { NextRequest } from "next/server";
import { confirm } from "@/lib/bookings";
import { fail, ok, str } from "@/lib/http";
import { logEvent } from "@/lib/repo";
import { LIMITS } from "@/lib/rate-limit";
import { guardPost } from "@/lib/request-guards";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const g = await guardPost(req, { limit: LIMITS.confirm, maxBytes: 6000 });
  if (!g.ok) return g.response;
  const b = g.body;
  if (typeof b.website_url === "string" && b.website_url.trim()) return ok({ ref: "OPS-000000", status: "pending" }); // honeypot
  try {
    const res = await confirm({
      token: b.token,
      contact: { name: str(b.name, 200), email: str(b.email, 300), phone: str(b.phone, 60), notes: str(b.notes, 1000) },
      attr: b.attr,
      consent: b.consent,
      source: str(b.source, 20) || "card",
    });
    if (res.ok) return ok({ ref: res.ref, status: res.status, duplicate: !!res.duplicate });
    if (res.code === "price_changed") return fail(409, "price_changed", { draft: res.draft });
    if (res.code === "unavailable") return fail(422, res.error.code, { error: res.error });
    return fail(400, res.code, { field: "field" in res ? res.field : undefined });
  } catch (err) {
    await logEvent("error", "confirm_failed", "", (err as Error).message);
    return fail(503, "unavailable");
  }
}
