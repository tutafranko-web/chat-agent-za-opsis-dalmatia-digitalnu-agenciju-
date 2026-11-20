import { NextResponse, type NextRequest } from "next/server";
import { catalogSummary, getOffers, rankOffers, toPublic } from "@/lib/catalog";
import { fail } from "@/lib/http";
import { LIMITS, rateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request-guards";
import { CATEGORIES, normalizeArea, TYPE_KEYS } from "@/lib/taxonomy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Public catalogue lookups for the menu (no AI involved):
 *   ?view=summary            → offer counts per type/category
 *   ?type=<type_key>[&area=] → offers of one type
 *   ?types=a,b,c             → offers of several types (boat-tour group)
 *   ?id=<activity_id>        → one offer
 *   ?featured=1              → featured offers
 */
export async function GET(req: NextRequest) {
  const rl = rateLimit(LIMITS.catalog, clientIp(req));
  if (!rl.ok) return fail(429, "rate_limited");
  const sp = req.nextUrl.searchParams;
  const headers = { "Cache-Control": "private, max-age=30" };

  try {
    if (sp.get("view") === "summary") {
      return NextResponse.json({ ok: true, ...(await catalogSummary()) }, { headers });
    }
    const offers = await getOffers();
    const area = normalizeArea(sp.get("area"));
    const id = sp.get("id");
    if (id) {
      const o = offers.find((x) => x.id === id);
      return o ? NextResponse.json({ ok: true, offers: [toPublic(o)] }, { headers }) : fail(404, "not_found");
    }
    const type = sp.get("type");
    if (type) {
      if (!TYPE_KEYS.includes(type)) return fail(400, "bad_type");
      return NextResponse.json({ ok: true, offers: rankOffers(offers, { typeKey: type, area, limit: 24 }).map(toPublic) }, { headers });
    }
    const types = (sp.get("types") ?? "").split(",").filter((t) => TYPE_KEYS.includes(t));
    if (types.length) {
      return NextResponse.json({ ok: true, offers: rankOffers(offers, { typeKeys: types, area, limit: 24 }).map(toPublic) }, { headers });
    }
    const category = sp.get("category");
    if (category && CATEGORIES.some((c) => c.key === category)) {
      return NextResponse.json({ ok: true, offers: rankOffers(offers, { category, area, limit: 24 }).map(toPublic) }, { headers });
    }
    if (sp.get("featured")) {
      const featured = rankOffers(offers.filter((o) => o.featured), { area, limit: 8 });
      return NextResponse.json({ ok: true, offers: featured.map(toPublic) }, { headers });
    }
    return fail(400, "missing_query");
  } catch (err) {
    console.error("[catalog]", (err as Error).message);
    return fail(503, "catalog_unavailable");
  }
}
