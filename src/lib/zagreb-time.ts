/**
 * Date helpers pinned to Europe/Zagreb. Booking dates are plain calendar dates
 * ("YYYY-MM-DD"); "now" is converted to Zagreb wall-clock time so the 15:00
 * cutoff and "today" are correct on Vercel (which runs in UTC).
 */

export const TZ = "Europe/Zagreb";

export interface ZagrebNow {
  date: string; // YYYY-MM-DD
  hour: number;
  minute: number;
  weekday: string; // English weekday name
}

export function zagrebNow(at: Date = new Date()): ZagrebNow {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    weekday: "long",
  }).formatToParts(at);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    hour: Number(get("hour")),
    minute: Number(get("minute")),
    weekday: get("weekday"),
  };
}

export const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoDate(s: unknown): boolean {
  if (typeof s !== "string" || !ISO_DATE_RE.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

/**
 * Accept dates typed by hand into the sheet as well: 2026-07-15, 15.7.2026.,
 * 15/07/2026 (day first, Croatian convention) or a Sheets serial number.
 */
export function normalizeDate(input: unknown): string {
  const s = String(input ?? "").trim().replace(/\.$/, "");
  if (!s) return "";
  if (isIsoDate(s)) return s;
  const iso = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (iso) {
    const v = `${iso[1]}-${iso[2].padStart(2, "0")}-${iso[3].padStart(2, "0")}`;
    return isIsoDate(v) ? v : "";
  }
  const dmy = s.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})$/);
  if (dmy) {
    const v = `${dmy[3]}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`;
    return isIsoDate(v) ? v : "";
  }
  if (/^\d{5}(\.\d+)?$/.test(s)) {
    // Google Sheets serial date (days since 1899-12-30)
    const d = new Date(Date.UTC(1899, 11, 30) + Math.floor(Number(s)) * 86_400_000);
    return d.toISOString().slice(0, 10);
  }
  return "";
}

export function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Whole days from a to b (b - a). */
export function daysBetween(a: string, b: string): number {
  const ms = new Date(`${b}T00:00:00Z`).getTime() - new Date(`${a}T00:00:00Z`).getTime();
  return Math.round(ms / 86_400_000);
}

export function weekdayOf(iso: string, locale = "en-GB"): string {
  return new Intl.DateTimeFormat(locale, { weekday: "long", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));
}

/** Human date for UI/e-mails, e.g. "Fri, 21 Nov 2026" / "pet, 21. stu 2026.". */
export function formatDate(iso: string, lang: "en" | "hr" = "en"): string {
  if (!isIsoDate(iso)) return iso;
  return new Intl.DateTimeFormat(lang === "hr" ? "hr-HR" : "en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
}

export function nowIso(at: Date = new Date()): string {
  return at.toISOString();
}
