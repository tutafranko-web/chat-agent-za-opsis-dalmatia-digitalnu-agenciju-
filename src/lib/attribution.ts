import "server-only";
import { LANDLORD_ID_RE } from "./ids";
import { findLandlord } from "./repo";
import { signToken, verifyToken } from "./tokens";
import { normalizeArea } from "./taxonomy";

/**
 * Landlord attribution. The `?landlord=` value from a QR link is checked on
 * the server (format + exists + active) and turned into a signed token the
 * browser keeps for 30 days. It never passes through the AI.
 */
export interface Attribution {
  lid: string | null; // landlord id
  area: string | null; // normalized area key
  pn: string | null; // property name (for the welcome banner)
}

const TTL = 30 * 24 * 3600;

export async function createAttribution(landlordParam: unknown, locationParam: unknown): Promise<{ token: string | null; attribution: Attribution }> {
  let lid: string | null = null;
  let pn: string | null = null;
  let area: string | null = null;
  const raw = typeof landlordParam === "string" ? landlordParam.trim().toUpperCase() : "";
  if (raw && LANDLORD_ID_RE.test(raw)) {
    const l = await findLandlord(raw);
    if (l && (l.status === "active" || l.status === "demo")) {
      lid = l.landlord_id;
      pn = l.property_name || null;
      area = normalizeArea(l.area || l.city);
    }
  }
  const locArea = normalizeArea(typeof locationParam === "string" ? locationParam.slice(0, 40) : null);
  if (locArea) area = locArea;
  const attribution = { lid, area, pn };
  if (!lid && !area) return { token: null, attribution };
  return { token: signToken("attr", attribution, TTL), attribution };
}

export function readAttribution(token: unknown): Attribution | null {
  const v = verifyToken<Attribution>("attr", token);
  return v ? v.data : null;
}
