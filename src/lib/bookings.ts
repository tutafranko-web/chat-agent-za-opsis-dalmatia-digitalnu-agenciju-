import "server-only";
import { z } from "zod";
import { readAttribution } from "./attribution";
import {
  availability, checkDate, checkParty, commissionOf, computePrice, earliestDate, landlordShareOf, latestDate,
  nextAvailableDates,
} from "./booking-rules";
import { getOffer, toPublic, type OfferInternal } from "./catalog";
import type { DraftView, Lang, PublicOffer, QuoteError } from "./types";
import { env } from "./env";
import { newBookingRef, newNonce, uniqueId } from "./ids";
import { routeRecipients, sendMail } from "./mail";
import * as T from "./mail-templates";
import { appendBooking, findBooking, listBookings, loadCatalogData, logEvent, updateBooking } from "./repo";
import { cleanPhone, cleanText, isEmail, isPhone, normalizeEmail } from "./sanitize";
import type { Booking } from "./schema";
import { signToken, verifyToken } from "./tokens";
import { addDays, daysBetween, zagrebNow } from "./zagreb-time";

export type { DraftView, Lang, QuoteError };

export function now(): Date {
  const fake = env.fakeNow();
  return fake ? new Date(fake) : new Date();
}

// ── Drafts ─────────────────────────────────────────────────────────────────

interface DraftData {
  did: string; // nonce → idempotency key
  aid: string; // activity id
  date: string;
  a: number;
  c: number;
  pa: number;
  pc: number;
  total: number;
  lang: Lang;
}

const DRAFT_TTL = 30 * 60;

async function evaluate(
  offer: OfferInternal,
  date: string,
  adults: number,
  children: number,
  at: Date,
  fresh: boolean,
): Promise<{ ok: true } | { ok: false; error: QuoteError }> {
  const dc = checkDate(date, at);
  if (!dc.ok) return { ok: false, error: { code: dc.code, earliest: dc.earliest, latest: dc.latest } };
  const pc = checkParty(adults, children, offer.child_policy === "adults_only");
  if (!pc.ok) return { ok: false, error: { code: pc.code } };
  const [{ blackouts }, bookings] = await Promise.all([loadCatalogData(fresh), listBookings(fresh)]);
  const opts = {
    blackouts,
    bookings,
    operatorId: offer.operator_id,
    activityId: offer.id,
    maxPerDay: offer.max_per_day,
    capacityScope: (offer.activity.max_per_day ? "activity" : "operator") as "activity" | "operator",
  };
  const av = availability(opts, date, adults + children);
  if (!av.ok) {
    const from = daysBetween(earliestDate(at), addDays(date, 1)) > 0 ? addDays(date, 1) : earliestDate(at);
    const alternatives = nextAvailableDates(from, 3, (d) => availability(opts, d, adults + children).ok, latestDate(at));
    return { ok: false, error: { code: av.code, alternatives, spotsLeft: "spotsLeft" in av ? av.spotsLeft : undefined } };
  }
  return { ok: true };
}

export async function quote(
  input: { activityId: string; date: string; adults: number; children: number; lang: Lang },
  at: Date = now(),
): Promise<{ ok: true; draft: DraftView } | { ok: false; error: QuoteError }> {
  const offer = await getOffer(input.activityId);
  if (!offer) return { ok: false, error: { code: "not_found" } };
  const ev = await evaluate(offer, input.date, input.adults, input.children, at, false);
  if (!ev.ok) return ev;
  const price = computePrice(offer, input.adults, input.children);
  const data: DraftData = {
    did: newNonce(),
    aid: offer.id,
    date: input.date,
    a: input.adults,
    c: input.children,
    pa: price.price_adult,
    pc: price.price_child,
    total: price.total,
    lang: input.lang,
  };
  const token = signToken("draft", data, DRAFT_TTL, at.getTime());
  return { ok: true, draft: draftView(token, data, toPublic(offer), at) };
}

function draftView(token: string, d: DraftData, o: PublicOffer, at: Date): DraftView {
  return {
    token,
    offer: {
      id: o.id, title: o.title, operator_name: o.operator_name, city: o.city, meeting_point: o.meeting_point,
      duration: o.duration, demo: o.demo, image: o.image, type_key: o.type_key, child_policy: o.child_policy,
    },
    date: d.date,
    adults: d.a,
    children: d.c,
    price_adult: d.pa,
    price_child: d.pc,
    total: d.total,
    expires_at: at.getTime() + DRAFT_TTL * 1000,
  };
}

// ── Confirm ────────────────────────────────────────────────────────────────

export const ContactSchema = z.object({
  name: z.string().transform((s) => cleanText(s, 80)).pipe(z.string().min(2, "name")),
  email: z.string().transform(normalizeEmail).refine(isEmail, "email"),
  phone: z.string().transform(cleanPhone).refine(isPhone, "phone"),
  notes: z.string().optional().default("").transform((s) => cleanText(s, 500, true)),
});

export type ConfirmResult =
  | { ok: true; ref: string; status: "pending"; duplicate?: boolean }
  | { ok: false; code: "invalid_token" | "validation" | "consent"; field?: string }
  | { ok: false; code: "price_changed"; draft: DraftView }
  | { ok: false; code: "unavailable"; error: QuoteError };

export async function confirm(
  input: { token: unknown; contact: unknown; attr: unknown; consent: unknown; source: string },
  at: Date = now(),
): Promise<ConfirmResult> {
  const v = verifyToken<DraftData>("draft", input.token, at.getTime());
  if (!v) return { ok: false, code: "invalid_token" };
  if (input.consent !== true) return { ok: false, code: "consent" };
  const parsed = ContactSchema.safeParse(input.contact);
  if (!parsed.success) return { ok: false, code: "validation", field: String(parsed.error.issues[0]?.message ?? "") };
  const d = v.data;
  const contact = parsed.data;

  // Idempotency: the same draft confirmed twice returns the same reference.
  const existing = (await listBookings(true)).find((b) => b.draft_id === d.did);
  if (existing) return { ok: true, ref: existing.ref, status: "pending", duplicate: true };

  const offer = await getOffer(d.aid, true);
  if (!offer) return { ok: false, code: "unavailable", error: { code: "not_found" } };
  const ev = await evaluate(offer, d.date, d.a, d.c, at, true);
  if (!ev.ok) return { ok: false, code: "unavailable", error: ev.error };

  const price = computePrice(offer, d.a, d.c);
  if (Math.abs(price.total - d.total) > 0.009) {
    const fresh = await quote({ activityId: d.aid, date: d.date, adults: d.a, children: d.c, lang: d.lang }, at);
    if (fresh.ok) return { ok: false, code: "price_changed", draft: fresh.draft };
    return { ok: false, code: "unavailable", error: fresh.error };
  }

  const attr = readAttribution(input.attr);
  const allRefs = new Set((await listBookings(true)).map((b) => b.ref));
  const ref = uniqueId(newBookingRef, allRefs);
  const commission = commissionOf(price.total, offer.commission_pct);
  const booking: Booking = {
    ref,
    created_at: at.toISOString(),
    status: "pending",
    activity_id: offer.id,
    activity_title: offer.title,
    type_key: offer.type_key,
    operator_id: offer.operator_id,
    operator_name: offer.operator_name,
    date: d.date,
    adults: d.a,
    children: d.c,
    price_adult: price.price_adult,
    price_child: price.price_child,
    total_eur: price.total,
    commission_pct: offer.commission_pct,
    commission_eur: commission,
    landlord_id: attr?.lid ?? "",
    landlord_share_eur: attr?.lid ? landlordShareOf(commission, env.landlordSharePct()) : null,
    area: attr?.area ?? "",
    tourist_name: contact.name,
    tourist_email: contact.email,
    tourist_phone: contact.phone,
    language: d.lang,
    notes: contact.notes,
    draft_id: d.did,
    source: cleanText(input.source, 20) || "card",
    trial: env.pilot() || offer.demo,
    responded_at: "",
    response_note: "",
  };
  await appendBooking(booking);
  await logEvent("info", "booking_created", ref, `${offer.id} ${d.date} ${d.a}+${d.c} ${price.total}EUR${booking.landlord_id ? ` ${booking.landlord_id}` : ""}`);

  await notifyNewBooking(booking, offer, at);
  return { ok: true, ref, status: "pending" };
}

function respondUrl(b: Booking, at: Date): string {
  const days = Math.max(2, daysBetween(zagrebNow(at).date, b.date) + 2);
  const token = signToken("respond", { ref: b.ref, op: b.operator_id }, days * 86400, at.getTime());
  return `${env.baseUrl()}/r/${token}`;
}

async function notifyNewBooking(b: Booking, offer: OfferInternal, at: Date) {
  const lang = (b.language === "hr" ? "hr" : "en") as Lang;
  const url = respondUrl(b, at);
  const results = await Promise.allSettled([
    sendMail({ to: b.tourist_email, audience: "requester", tag: "booking_received", idempotencyKey: `received-${b.ref}`, ...T.touristRequestReceived(b, lang) }),
    (async () => {
      const route = routeRecipients(env.mailMode(), "partner", [offer.operator.email]);
      const partnerToAdmin = route.rerouted || route.to.join() === env.adminEmails().join();
      const note = partnerToAdmin
        ? `Pilot/demo: operater ${offer.operator_name} (${offer.operator.email}) ne prima mail. Potvrdi ili odbij ti, gumbom ispod.`
        : `Operater ${offer.operator_name} je dobio zahtjev na ${offer.operator.email}.`;
      const admin = sendMail({ to: env.adminEmails(), audience: "admin", tag: "booking_admin", idempotencyKey: `admin-${b.ref}`, ...T.adminNewRequest(b, url, note) });
      if (partnerToAdmin) return admin;
      const op = sendMail({ to: offer.operator.email, audience: "partner", tag: "booking_operator", idempotencyKey: `operator-${b.ref}`, ...T.operatorNewRequest(b, url) });
      return Promise.all([admin, op]);
    })(),
  ]);
  const flat: { ok: boolean }[] = [];
  for (const r of results) {
    if (r.status === "rejected") flat.push({ ok: false });
    else if (Array.isArray(r.value)) flat.push(...r.value);
    else flat.push(r.value);
  }
  const failed = flat.filter((x) => !x.ok).length;
  if (failed) await logEvent("warn", "booking_mail_partial", b.ref, `${failed} mail(s) failed`);
}

// ── Operator response ──────────────────────────────────────────────────────

export interface RespondView {
  booking: Booking;
  meeting_point: string;
  expired: boolean;
}

export async function getRespondView(token: string): Promise<RespondView | null> {
  const v = verifyToken<{ ref: string; op: string }>("respond", token);
  if (!v) return null;
  const b = await findBooking(v.data.ref);
  if (!b || b.operator_id !== v.data.op) return null;
  const offer = await getOffer(b.activity_id);
  return { booking: b, meeting_point: offer?.meeting_point ?? "", expired: false };
}

export async function respond(
  input: { token: unknown; action: unknown; note: unknown },
  at: Date = now(),
): Promise<{ ok: true; status: Booking["status"]; already?: boolean } | { ok: false; code: "invalid_token" | "not_found" | "invalid_action" }> {
  const v = verifyToken<{ ref: string; op: string }>("respond", input.token, at.getTime());
  if (!v) return { ok: false, code: "invalid_token" };
  if (input.action !== "confirm" && input.action !== "decline") return { ok: false, code: "invalid_action" };
  const b = await findBooking(v.data.ref);
  if (!b || b.operator_id !== v.data.op) return { ok: false, code: "not_found" };
  if (b.status !== "pending") return { ok: true, status: b.status, already: true };

  const status = input.action === "confirm" ? "confirmed" : "declined";
  const note = cleanText(input.note, 400, true);
  await updateBooking(b.ref, { status, responded_at: at.toISOString(), response_note: note });
  const updated: Booking = { ...b, status, responded_at: at.toISOString(), response_note: note };
  await logEvent("info", `booking_${status}`, b.ref, note ? "with note" : "");

  const lang = (b.language === "hr" ? "hr" : "en") as Lang;
  const offer = await getOffer(b.activity_id);
  const chatUrl = `${env.baseUrl()}/?lang=${lang}`;
  await Promise.allSettled([
    sendMail({
      to: b.tourist_email,
      audience: "requester",
      tag: `booking_${status}`,
      idempotencyKey: `${status}-${b.ref}`,
      ...(status === "confirmed" ? T.touristConfirmed(updated, lang, offer?.meeting_point ?? "", note) : T.touristDeclined(updated, lang, note, chatUrl)),
    }),
    sendMail({ to: env.adminEmails(), audience: "admin", tag: "booking_responded", idempotencyKey: `admin-${status}-${b.ref}`, ...T.adminBookingResponded(updated) }),
  ]);
  return { ok: true, status };
}
