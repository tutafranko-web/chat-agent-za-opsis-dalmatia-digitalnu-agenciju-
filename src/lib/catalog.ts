import "server-only";
import { env } from "./env";
import { loadCatalogData, type CatalogData } from "./repo";
import type { Activity, Operator } from "./schema";
import { AREAS, CATEGORIES, getType, normalizeArea, TYPES } from "./taxonomy";
import type { PublicOffer } from "./types";

/**
 * Public view of the catalogue. Nothing returned from `toPublic` contains
 * operator e-mail, phone or commission — this is what the browser and the AI
 * see.
 */
export type { PublicOffer };

/** Internal view used by the booking engine (server only). */
export interface OfferInternal extends PublicOffer {
  operator_id: string;
  operator: Operator;
  activity: Activity;
  commission_pct: number;
  max_per_day: number | null;
}

function listed(a: Activity, o: Operator | undefined): boolean {
  if (!o) return false;
  if (!getType(a.type_key)) return false;
  if (a.price_adult === null || a.price_adult < 0) return false;
  const showDemo = env.showDemoOffers();
  const opOk = o.status === "active" || (o.status === "demo" && showDemo);
  const acOk = a.status === "active" || (a.status === "demo" && showDemo);
  return opOk && acOk;
}

function toInternal(a: Activity, o: Operator): OfferInternal {
  const type = getType(a.type_key)!;
  const kidsAllowed = type.kids !== false;
  let child_policy: PublicOffer["child_policy"];
  if (!kidsAllowed) child_policy = "adults_only";
  else if (a.price_child === 0) child_policy = "free";
  else if (a.price_child !== null && a.price_child > 0) child_policy = "price";
  else child_policy = "half";
  const image = /^https:\/\//.test(a.image_url) ? a.image_url : type.image ?? null;
  return {
    id: a.activity_id,
    type_key: a.type_key,
    category: type.category,
    title: a.title || type.label.en,
    description: a.description,
    duration: a.duration,
    meeting_point: a.meeting_point,
    city: a.city || o.city,
    operator_name: o.company,
    price_adult: a.price_adult ?? 0,
    price_child: child_policy === "price" ? a.price_child : child_policy === "free" ? 0 : null,
    child_policy,
    image,
    gallery_url: /^https:\/\//.test(a.gallery_url) ? a.gallery_url : null,
    demo: a.status === "demo" || o.status === "demo",
    featured: a.featured,
    operator_id: o.operator_id,
    operator: o,
    activity: a,
    commission_pct: Math.min(50, Math.max(0, a.commission_pct ?? 0)),
    max_per_day: a.max_per_day ?? o.max_per_day ?? null,
  };
}

export function toPublic(o: OfferInternal): PublicOffer {
  return {
    id: o.id, type_key: o.type_key, category: o.category, title: o.title, description: o.description,
    duration: o.duration, meeting_point: o.meeting_point, city: o.city, operator_name: o.operator_name,
    price_adult: o.price_adult, price_child: o.price_child, child_policy: o.child_policy, image: o.image,
    gallery_url: o.gallery_url, demo: o.demo, featured: o.featured,
  };
}

export function buildOffers(data: CatalogData): OfferInternal[] {
  const ops = new Map(data.operators.map((o) => [o.operator_id, o]));
  return data.activities
    .filter((a) => listed(a, ops.get(a.operator_id)))
    .map((a) => toInternal(a, ops.get(a.operator_id)!));
}

export async function getOffers(fresh = false): Promise<OfferInternal[]> {
  return buildOffers(await loadCatalogData(fresh));
}

export async function getOffer(id: string, fresh = false): Promise<OfferInternal | null> {
  return (await getOffers(fresh)).find((o) => o.id === id) ?? null;
}

function inArea(city: string, area: string | null): boolean {
  if (!area || !AREAS[area]) return false;
  const c = city.toLowerCase();
  return AREAS[area].near.some((n) => c.includes(n));
}

export interface SearchParams {
  typeKey?: string | null;
  typeKeys?: string[] | null;
  category?: string | null;
  query?: string | null;
  area?: string | null;
  limit?: number;
}

export function rankOffers(offers: OfferInternal[], p: SearchParams): OfferInternal[] {
  const area = normalizeArea(p.area ?? null);
  let list = offers;
  if (p.typeKey) list = list.filter((o) => o.type_key === p.typeKey);
  if (p.typeKeys?.length) list = list.filter((o) => p.typeKeys!.includes(o.type_key));
  if (p.category) list = list.filter((o) => o.category === p.category);
  const q = (p.query ?? "").toLowerCase().trim();
  const words = q.split(/\s+/).filter((w) => w.length > 2);
  const scored = list.map((o) => {
    let score = 0;
    if (o.featured) score += 2;
    if (inArea(o.city, area)) score += 3;
    if (words.length) {
      const hay = `${o.title} ${o.description} ${o.city} ${getType(o.type_key)?.synonyms.join(" ")}`.toLowerCase();
      const hits = words.filter((w) => hay.includes(w)).length;
      if (hits === 0 && !p.typeKey && !p.category && !p.typeKeys?.length) score -= 100;
      score += hits * 2;
    }
    return { o, score };
  });
  return scored
    .filter((x) => x.score > -50)
    .sort((a, b) => b.score - a.score || a.o.price_adult - b.o.price_adult || a.o.title.localeCompare(b.o.title))
    .slice(0, p.limit ?? 12)
    .map((x) => x.o);
}

export async function searchOffers(p: SearchParams): Promise<OfferInternal[]> {
  return rankOffers(await getOffers(), p);
}

/** Offer counts per type and category, for the menu chips. */
export async function catalogSummary(): Promise<{ types: Record<string, number>; categories: Record<string, number> }> {
  const offers = await getOffers();
  const types: Record<string, number> = {};
  const categories: Record<string, number> = Object.fromEntries(CATEGORIES.map((c) => [c.key, 0]));
  for (const o of offers) {
    types[o.type_key] = (types[o.type_key] ?? 0) + 1;
    categories[o.category] = (categories[o.category] ?? 0) + 1;
  }
  for (const t of TYPES) types[t.key] = types[t.key] ?? 0;
  return { types, categories };
}
