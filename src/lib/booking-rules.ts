/**
 * Pure booking rules (no I/O) — unit-tested. Dates are calendar dates in
 * Europe/Zagreb.
 */
import { round2 } from "./sanitize";
import type { Blackout, Booking, DayStatus } from "./schema";
import { addDays, daysBetween, isIsoDate, zagrebNow } from "./zagreb-time";

export const CUTOFF_HOUR = 15; // requests for tomorrow close at 15:00 Zagreb time
export const MAX_DAYS_AHEAD = 180;
export const MAX_ADULTS = 30;
export const MAX_CHILDREN = 20;
export const MAX_PARTY = 40;

export function earliestDate(at: Date): string {
  const z = zagrebNow(at);
  return addDays(z.date, z.hour < CUTOFF_HOUR ? 1 : 2);
}

export function latestDate(at: Date): string {
  return addDays(zagrebNow(at).date, MAX_DAYS_AHEAD);
}

export type DateCheck =
  | { ok: true }
  | { ok: false; code: "invalid_date" | "too_soon" | "too_far"; earliest: string; latest: string };

export function checkDate(date: string, at: Date): DateCheck {
  const earliest = earliestDate(at);
  const latest = latestDate(at);
  if (!isIsoDate(date)) return { ok: false, code: "invalid_date", earliest, latest };
  if (daysBetween(earliest, date) < 0) return { ok: false, code: "too_soon", earliest, latest };
  if (daysBetween(date, latest) < 0) return { ok: false, code: "too_far", earliest, latest };
  return { ok: true };
}

export type PartyCheck =
  | { ok: true }
  | { ok: false; code: "adults_min" | "too_many" | "adults_only" };

export function checkParty(adults: number, children: number, adultsOnly: boolean): PartyCheck {
  if (!Number.isInteger(adults) || !Number.isInteger(children) || adults < 1) return { ok: false, code: "adults_min" };
  if (children < 0 || adults > MAX_ADULTS || children > MAX_CHILDREN || adults + children > MAX_PARTY) {
    return { ok: false, code: "too_many" };
  }
  if (adultsOnly && children > 0) return { ok: false, code: "adults_only" };
  return { ok: true };
}

export interface PriceInput {
  price_adult: number;
  price_child: number | null; // null → half price; 0 → free
  child_policy: "adults_only" | "free" | "price" | "half";
}

export interface PriceResult {
  price_adult: number;
  price_child: number;
  total: number;
}

export function computePrice(o: PriceInput, adults: number, children: number): PriceResult {
  const pa = round2(o.price_adult);
  const pc =
    o.child_policy === "free" ? 0
    : o.child_policy === "price" && o.price_child !== null ? round2(o.price_child)
    : round2(o.price_adult * 0.5);
  return { price_adult: pa, price_child: pc, total: round2(adults * pa + children * pc) };
}

export function commissionOf(total: number, pct: number): number {
  return round2((total * Math.min(50, Math.max(0, pct))) / 100);
}

export function landlordShareOf(commission: number, sharePct: number | null): number | null {
  if (sharePct === null) return null;
  return round2((commission * sharePct) / 100);
}

/** Returns the reason text if the operator/activity is blocked on `date`. */
export function blackoutFor(blackouts: Blackout[], operatorId: string, activityId: string, date: string): Blackout | null {
  for (const b of blackouts) {
    if (b.operator_id !== operatorId) continue;
    if (b.activity_id && b.activity_id !== activityId) continue;
    if (!isIsoDate(b.start_date)) continue;
    const end = isIsoDate(b.end_date) ? b.end_date : b.start_date;
    if (daysBetween(b.start_date, date) >= 0 && daysBetween(date, end) >= 0) return b;
  }
  return null;
}

/**
 * The operator's own word for that day, if any: an activity-specific row wins
 * over an operator-wide one. `days` must already be de-duplicated (latest row
 * per key) — see repo.loadCatalogData.
 */
export function dayOverride(days: DayStatus[], operatorId: string, activityId: string, date: string): DayStatus | null {
  let operatorWide: DayStatus | null = null;
  for (const d of days) {
    if (d.operator_id !== operatorId || d.date !== date || !d.status) continue;
    if (d.activity_id === activityId) return d;
    if (!d.activity_id) operatorWide = d;
  }
  return operatorWide;
}

/** People already requested/booked for that day (pending + confirmed), optionally only requests made after `since`. */
export function peopleBooked(
  bookings: Booking[],
  scope: { activityId?: string; operatorId?: string },
  date: string,
  since = "",
): number {
  return bookings
    .filter((b) => b.date === date && (b.status === "pending" || b.status === "confirmed"))
    .filter((b) => (scope.activityId ? b.activity_id === scope.activityId : b.operator_id === scope.operatorId))
    .filter((b) => !since || b.created_at > since)
    .reduce((sum, b) => sum + b.adults + b.children, 0);
}

export type Availability =
  | { ok: true; spotsLeft: number | null }
  | { ok: false; code: "blackout" | "full"; reason?: string; spotsLeft?: number };

/**
 * Order: the operator's day setting (closed / full / "N seats left" / open)
 * → day-off ranges → daily capacity. Everything stays a *request* that the
 * operator confirms, so this only stops requests we already know will fail.
 */
export function availability(
  opts: {
    blackouts: Blackout[];
    days?: DayStatus[];
    bookings: Booking[];
    operatorId: string;
    activityId: string;
    maxPerDay: number | null;
    capacityScope: "activity" | "operator";
  },
  date: string,
  people: number,
): Availability {
  const ov = dayOverride(opts.days ?? [], opts.operatorId, opts.activityId, date);
  if (ov?.status === "closed") return { ok: false, code: "blackout", reason: ov.note || "closed" };
  if (ov?.status === "full") return { ok: false, code: "full", spotsLeft: 0 };
  if (ov?.status === "open" && ov.seats !== null) {
    const used = peopleBooked(
      opts.bookings,
      ov.activity_id ? { activityId: opts.activityId } : { operatorId: opts.operatorId },
      date,
      ov.updated_at,
    );
    const left = Math.max(0, ov.seats) - used;
    if (left < people) return { ok: false, code: "full", spotsLeft: Math.max(0, left) };
    return { ok: true, spotsLeft: left };
  }
  if (!ov) {
    const bo = blackoutFor(opts.blackouts, opts.operatorId, opts.activityId, date);
    if (bo) return { ok: false, code: "blackout", reason: bo.reason };
  }
  if (opts.maxPerDay && opts.maxPerDay > 0) {
    const used = peopleBooked(
      opts.bookings,
      opts.capacityScope === "activity" ? { activityId: opts.activityId } : { operatorId: opts.operatorId },
      date,
    );
    const left = opts.maxPerDay - used;
    if (left < people) return { ok: false, code: "full", spotsLeft: Math.max(0, left) };
    return { ok: true, spotsLeft: left };
  }
  return { ok: true, spotsLeft: null };
}

/** Next `count` dates (from `from`, inclusive) that pass `isOk`, searching up to 60 days. */
export function nextAvailableDates(from: string, count: number, isOk: (d: string) => boolean, latest: string): string[] {
  const out: string[] = [];
  let d = from;
  for (let i = 0; i < 60 && out.length < count; i++) {
    if (daysBetween(d, latest) < 0) break;
    if (isOk(d)) out.push(d);
    d = addDays(d, 1);
  }
  return out;
}
