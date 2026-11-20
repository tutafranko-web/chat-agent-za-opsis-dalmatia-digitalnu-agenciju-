import type { NextRequest } from "next/server";
import { createAttribution, readAttribution } from "@/lib/attribution";
import { ok } from "@/lib/http";
import { LIMITS } from "@/lib/rate-limit";
import { guardPost } from "@/lib/request-guards";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Validate a landlord QR link (or an existing attribution token) and return a signed token. */
export async function POST(req: NextRequest) {
  const g = await guardPost(req, { limit: LIMITS.catalog, maxBytes: 4000 });
  if (!g.ok) return g.response;
  const { landlord, location, attr } = g.body;
  if (landlord || location) {
    const { token, attribution } = await createAttribution(landlord, location);
    return ok({ attr: token, property_name: attribution.pn, area: attribution.area });
  }
  const existing = readAttribution(attr);
  return ok({ attr: existing ? attr : null, property_name: existing?.pn ?? null, area: existing?.area ?? null });
}
