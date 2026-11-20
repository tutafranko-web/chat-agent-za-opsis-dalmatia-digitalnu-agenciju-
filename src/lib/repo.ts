import "server-only";
import { store } from "./store";
import {
  toActivity, toBlackout, toBooking, toDay, toLandlord, toOperator,
  type Activity, type Blackout, type Booking, type DayStatus, type Landlord, type Operator, type Row,
} from "./schema";
import { cleanText } from "./sanitize";

/** Typed data access on top of the store. */

export interface CatalogData {
  operators: Operator[];
  activities: Activity[];
  blackouts: Blackout[];
  /** Latest setting per operator/activity/date; cleared rows removed. */
  days: DayStatus[];
}

/** Keeps the newest row per key (duplicates can appear if two saves race), then drops cleared ones. */
export function latestDays(rows: DayStatus[]): DayStatus[] {
  const byKey = new Map<string, DayStatus>();
  for (const d of rows) {
    if (!d.operator_id || !d.date) continue;
    const prev = byKey.get(d.key);
    if (!prev || d.updated_at >= prev.updated_at) byKey.set(d.key, d);
  }
  return [...byKey.values()].filter((d) => d.status);
}

export async function loadCatalogData(fresh = false): Promise<CatalogData> {
  const r = await store().read(["operators", "activities", "blackouts", "days"], fresh);
  return {
    operators: (r.operators ?? []).map(toOperator).filter((o) => o.operator_id),
    activities: (r.activities ?? []).map(toActivity).filter((a) => a.activity_id),
    blackouts: (r.blackouts ?? []).map(toBlackout).filter((b) => b.operator_id && b.start_date),
    days: latestDays((r.days ?? []).map(toDay)),
  };
}

/** All day rows incl. cleared ones (for sync bookkeeping). */
export async function listAllDays(fresh = true): Promise<DayStatus[]> {
  const r = await store().read(["days"], fresh);
  return (r.days ?? []).map(toDay).filter((d) => d.operator_id && d.date);
}

/** Insert or overwrite day settings by key, in one round trip. */
export async function upsertDays(rows: DayStatus[]): Promise<void> {
  if (!rows.length) return;
  await store().upsertMany("days", "key", rows as unknown as Record<string, unknown>[]);
}

export async function listBookings(fresh = false): Promise<Booking[]> {
  const r = await store().read(["bookings"], fresh);
  return (r.bookings ?? []).map(toBooking).filter((b) => b.ref);
}

export async function findBooking(ref: string): Promise<Booking | null> {
  return (await listBookings(true)).find((b) => b.ref === ref) ?? null;
}

export async function appendBooking(b: Booking): Promise<void> {
  await store().append("bookings", b as unknown as Record<string, unknown>);
}

export async function updateBooking(ref: string, patch: Partial<Booking>): Promise<boolean> {
  return store().update("bookings", "ref", ref, patch as Record<string, unknown>);
}

export async function listLandlords(fresh = false): Promise<Landlord[]> {
  const r = await store().read(["landlords"], fresh);
  return (r.landlords ?? []).map(toLandlord).filter((l) => l.landlord_id);
}

export async function findLandlord(id: string, fresh = false): Promise<Landlord | null> {
  return (await listLandlords(fresh)).find((l) => l.landlord_id === id) ?? null;
}

export async function appendLandlord(l: Landlord): Promise<void> {
  await store().append("landlords", l as unknown as Record<string, unknown>);
}

export async function listOperators(fresh = false): Promise<Operator[]> {
  return (await loadCatalogData(fresh)).operators;
}

export async function findOperator(id: string, fresh = false): Promise<Operator | null> {
  return (await listOperators(fresh)).find((o) => o.operator_id === id) ?? null;
}

export async function appendOperator(o: Operator): Promise<void> {
  await store().append("operators", o as unknown as Record<string, unknown>);
}

export async function appendActivity(a: Activity): Promise<void> {
  await store().append("activities", a as unknown as Record<string, unknown>);
}

export async function updateOperator(id: string, patch: Partial<Operator>): Promise<boolean> {
  return store().update("operators", "operator_id", id, patch as Record<string, unknown>);
}

export async function updateActivity(id: string, patch: Partial<Activity>): Promise<boolean> {
  return store().update("activities", "activity_id", id, patch as Record<string, unknown>);
}

export async function appendBlackout(b: Blackout): Promise<void> {
  await store().append("blackouts", b as unknown as Record<string, unknown>);
}

export async function appendQuiz(record: Record<string, unknown>): Promise<void> {
  await store().append("quiz", record);
}

export async function readRaw(tab: Parameters<ReturnType<typeof store>["read"]>[0][number], fresh = true): Promise<Row[]> {
  return (await store().read([tab], fresh))[tab] ?? [];
}

export async function appendRaw(tab: Parameters<ReturnType<typeof store>["append"]>[0], record: Record<string, unknown>) {
  await store().append(tab, record);
}

export async function updateRaw(
  tab: Parameters<ReturnType<typeof store>["update"]>[0],
  keyField: string,
  keyValue: string,
  patch: Record<string, unknown>,
) {
  return store().update(tab, keyField, keyValue, patch);
}

/**
 * Best-effort event log ("Dnevnik" tab). Vercel Hobby keeps runtime logs for
 * one hour only, so important events are also written to the sheet. Never
 * throws and never stores message bodies or contact details.
 */
export async function logEvent(level: "info" | "warn" | "error", event: string, ref = "", details = ""): Promise<void> {
  const line = { ts: new Date().toISOString(), level, event, ref, details: cleanText(details, 300) };
  if (level === "error") console.error("[opsis]", line);
  else console.log("[opsis]", line);
  try {
    await store().append("log", line);
  } catch {
    /* ignore */
  }
}
