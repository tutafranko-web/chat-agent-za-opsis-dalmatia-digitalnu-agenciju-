import "server-only";
import { z } from "zod";
import type Anthropic from "@anthropic-ai/sdk";
import { quote } from "../bookings";
import { getOffer, getOffers, rankOffers, toPublic, type OfferInternal } from "../catalog";
import { availability as availabilityRule, checkDate, checkParty, earliestDate, latestDate } from "../booking-rules";
import { listBookings, loadCatalogData } from "../repo";
import { getType, TYPE_KEYS } from "../taxonomy";
import type { Lang, UIBlock } from "../types";
import { isIsoDate } from "../zagreb-time";

/**
 * Tools exposed to Claude. Inputs are validated with zod (strict mode does not
 * enforce numeric ranges). Outputs are compact JSON with no e-mail, phone or
 * commission. Some tools also emit UI blocks (cards, booking card) that the
 * browser renders.
 */

const nullableString = { type: ["string", "null"] } as const;
const nullableInt = { type: ["integer", "null"] } as const;

export const TOOLS: Anthropic.Beta.BetaTool[] = [
  {
    name: "search_activities",
    description:
      "Search the live catalogue of bookable offers in Split & Dalmatia. Use type_key when the guest's wish matches one activity type; otherwise pass a few keywords in query (e.g. 'blue cave', 'wine', 'kids'). If date and party size are known, each result includes availability for that date. Returns at most 6 offers; the guest sees them as cards.",
    strict: true,
    input_schema: {
      type: "object",
      properties: {
        type_key: { ...nullableString, description: "One activity type key from the system prompt, or null." },
        query: { ...nullableString, description: "Free-text keywords, or null." },
        date: { ...nullableString, description: "YYYY-MM-DD, or null if unknown." },
        adults: { ...nullableInt, description: "Number of adults, or null." },
        children: { ...nullableInt, description: "Number of children, or null." },
      },
      required: ["type_key", "query", "date", "adults", "children"],
      additionalProperties: false,
    },
  },
  {
    name: "get_activity",
    description: "Full details of one offer (description, duration, meeting point, child policy, price).",
    strict: true,
    input_schema: {
      type: "object",
      properties: { activity_id: { type: "string", description: "The activity_id from search results." } },
      required: ["activity_id"],
      additionalProperties: false,
    },
  },
  {
    name: "check_availability",
    description: "Check whether an offer can be requested for a date and party size. Returns alternatives when not.",
    strict: true,
    input_schema: {
      type: "object",
      properties: {
        activity_id: { type: "string" },
        date: { type: "string", description: "YYYY-MM-DD" },
        adults: { type: "integer" },
        children: { type: "integer" },
      },
      required: ["activity_id", "date", "adults", "children"],
      additionalProperties: false,
    },
  },
  {
    name: "prepare_booking",
    description:
      "Show the guest a booking card for this offer, date and party size, with the exact price. The guest enters contact details and sends the request on the card. Call it once offer, date, adults and children are known.",
    strict: true,
    input_schema: {
      type: "object",
      properties: {
        activity_id: { type: "string" },
        date: { type: "string", description: "YYYY-MM-DD" },
        adults: { type: "integer" },
        children: { type: "integer" },
      },
      required: ["activity_id", "date", "adults", "children"],
      additionalProperties: false,
    },
  },
];

const SearchInput = z.object({
  type_key: z.string().nullable(),
  query: z.string().max(120).nullable(),
  date: z.string().nullable(),
  adults: z.number().int().nullable(),
  children: z.number().int().nullable(),
});
const IdInput = z.object({ activity_id: z.string().max(20) });
const BookingInput = z.object({
  activity_id: z.string().max(20),
  date: z.string().max(10),
  adults: z.number().int(),
  children: z.number().int(),
});

export interface ToolContext {
  lang: Lang;
  area: string | null;
  at: Date;
}

export interface ToolOutcome {
  content: string;
  isError?: boolean;
  ui?: UIBlock;
}

function childPolicyText(o: OfferInternal): string | number {
  switch (o.child_policy) {
    case "adults_only": return "adults only";
    case "free": return "free";
    case "price": return o.price_child ?? "50% of adult";
    default: return "50% of adult";
  }
}

function brief(o: OfferInternal) {
  return {
    activity_id: o.id,
    title: o.title,
    type: o.type_key,
    city: o.city,
    organiser: o.operator_name,
    duration: o.duration,
    price_adult_eur: o.price_adult,
    child_price: childPolicyText(o),
    demo: o.demo,
  };
}

const json = (v: unknown) => JSON.stringify(v);

export async function runTool(name: string, rawInput: unknown, ctx: ToolContext): Promise<ToolOutcome> {
  try {
    switch (name) {
      case "search_activities": {
        const p = SearchInput.safeParse(rawInput);
        if (!p.success) return { content: json({ error: "invalid_input" }), isError: true };
        const typeKey = p.data.type_key && TYPE_KEYS.includes(p.data.type_key) ? p.data.type_key : null;
        const results = rankOffers(await getOffers(), {
          typeKey,
          query: typeKey ? null : p.data.query,
          area: ctx.area,
          limit: 6,
        });
        if (!results.length) {
          return { content: json({ count: 0, note: typeKey ? `No offers for ${typeKey} yet.` : "No matching offers." }) };
        }
        const withDate = p.data.date && isIsoDate(p.data.date) && p.data.adults ? p.data.date : null;
        let availabilityById: Record<string, unknown> = {};
        if (withDate) {
          const dc = checkDate(withDate, ctx.at);
          if (!dc.ok) {
            availabilityById = { all: { available: false, reason: dc.code, earliest: dc.earliest, latest: dc.latest } };
          } else {
            const [{ blackouts }, bookings] = await Promise.all([loadCatalogData(), listBookings()]);
            const people = (p.data.adults ?? 1) + Math.max(0, p.data.children ?? 0);
            availabilityById = Object.fromEntries(
              results.map((o) => {
                const av = availabilityRule(
                  { blackouts, bookings, operatorId: o.operator_id, activityId: o.id, maxPerDay: o.max_per_day, capacityScope: o.activity.max_per_day ? "activity" : "operator" },
                  withDate,
                  people,
                );
                return [o.id, av.ok ? { available: true } : { available: false, reason: av.code }];
              }),
            );
          }
        }
        const payload = {
          count: results.length,
          shown_to_guest_as_cards: true,
          results: results.map((o) => ({ ...brief(o), ...(withDate ? { availability: availabilityById[o.id] ?? availabilityById.all } : {}) })),
        };
        return { content: json(payload), ui: { type: "cards", offers: results.map(toPublic) } };
      }

      case "get_activity": {
        const p = IdInput.safeParse(rawInput);
        if (!p.success) return { content: json({ error: "invalid_input" }), isError: true };
        const o = await getOffer(p.data.activity_id);
        if (!o) return { content: json({ error: "not_found" }), isError: true };
        return {
          content: json({
            ...brief(o),
            description: o.description,
            meeting_point: o.meeting_point,
            type_label: getType(o.type_key)?.label.en,
            photos_link: o.gallery_url ?? null,
          }),
        };
      }

      case "check_availability": {
        const p = BookingInput.safeParse(rawInput);
        if (!p.success) return { content: json({ error: "invalid_input" }), isError: true };
        const o = await getOffer(p.data.activity_id);
        if (!o) return { content: json({ error: "not_found" }), isError: true };
        const dc = checkDate(p.data.date, ctx.at);
        if (!dc.ok) return { content: json({ available: false, reason: dc.code, earliest: dc.earliest, latest: dc.latest }) };
        const pc = checkParty(p.data.adults, p.data.children, o.child_policy === "adults_only");
        if (!pc.ok) return { content: json({ available: false, reason: pc.code }) };
        const res = await quote({ activityId: o.id, date: p.data.date, adults: p.data.adults, children: p.data.children, lang: ctx.lang }, ctx.at);
        if (res.ok) return { content: json({ available: true, total_eur: res.draft.total }) };
        return { content: json({ available: false, ...res.error }) };
      }

      case "prepare_booking": {
        const p = BookingInput.safeParse(rawInput);
        if (!p.success) return { content: json({ error: "invalid_input" }), isError: true };
        const res = await quote({ activityId: p.data.activity_id, date: p.data.date, adults: p.data.adults, children: p.data.children, lang: ctx.lang }, ctx.at);
        if (!res.ok) {
          return {
            content: json({
              card_shown: false,
              ...res.error,
              earliest_bookable: earliestDate(ctx.at),
              latest_bookable: latestDate(ctx.at),
            }),
          };
        }
        return {
          content: json({
            card_shown: true,
            title: res.draft.offer.title,
            date: res.draft.date,
            adults: res.draft.adults,
            children: res.draft.children,
            total_eur: res.draft.total,
            next_step: "Guest enters name, e-mail and phone on the card and sends the request.",
          }),
          ui: { type: "booking", draft: res.draft },
        };
      }

      default:
        return { content: json({ error: `unknown tool ${name}` }), isError: true };
    }
  } catch (err) {
    console.error("[tool] failed", name, (err as Error).message);
    return { content: json({ error: "temporarily_unavailable" }), isError: true };
  }
}
