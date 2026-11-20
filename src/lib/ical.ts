import "server-only";
import { addDays, daysBetween, isIsoDate, zagrebNow } from "./zagreb-time";

/**
 * Read-only import of an operator's existing calendar (Google Calendar "secret
 * address in iCal format", Apple, Outlook, or a booking system's iCal feed).
 *
 * Rules, explained to the operator on the manage page:
 *  - an all-day event blocks that day ("PUN"/"full" → full, anything else → closed);
 *  - a timed event blocks the day only if its title says so (PUN, FULL, ZATVORENO,
 *    CLOSED, NE RADIM, BLOK) — ordinary bookings in the calendar are ignored.
 *
 * Only https URLs on known calendar hosts are fetched (no server-side request
 * to arbitrary addresses).
 */

const ALLOWED_HOSTS = [
  "calendar.google.com",
  "icloud.com",
  "outlook.live.com",
  "outlook.office365.com",
  "outlook.office.com",
  "bokun.io",
  "bokun.is",
  "fareharbor.com",
  "trekksoft.com",
  "turitop.com",
  "rezdy.com",
  "checkfront.com",
  "airbnb.com",
  "booking.com",
  "beds24.com",
  "smoobu.com",
  "regiondo.com",
  "zaui.net",
];

export function normalizeCalendarUrl(input: unknown): string | null {
  if (typeof input !== "string") return null;
  let s = input.trim();
  if (!s || s.length > 1000) return null;
  if (/^webcals?:\/\//i.test(s)) s = s.replace(/^webcals?:\/\//i, "https://");
  let u: URL;
  try {
    u = new URL(s);
  } catch {
    return null;
  }
  if (u.protocol !== "https:" || u.username || u.password || (u.port && u.port !== "443")) return null;
  const host = u.hostname.toLowerCase();
  if (!ALLOWED_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))) return null;
  return u.toString();
}

export function isGoogleEmbedLink(input: string): boolean {
  // People often paste the public "embed" or settings link instead of the iCal address.
  return /calendar\.google\.com\/calendar\/(embed|u\/\d+\/r|r)\b/i.test(input) && !/\.ics(\?|$)/i.test(input);
}

const MAX_BYTES = 2_000_000;

export async function fetchCalendar(url: string): Promise<string> {
  const safe = normalizeCalendarUrl(url);
  if (!safe) throw new Error("url_not_allowed");
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    let res = await fetch(safe, { redirect: "manual", signal: ctrl.signal, headers: { Accept: "text/calendar, text/plain;q=0.8" } });
    if (res.status >= 300 && res.status < 400) {
      const next = normalizeCalendarUrl(new URL(res.headers.get("location") ?? "", safe).toString());
      if (!next) throw new Error("redirect_not_allowed");
      res = await fetch(next, { redirect: "manual", signal: ctrl.signal, headers: { Accept: "text/calendar" } });
    }
    if (!res.ok) throw new Error(`http_${res.status}`);
    const len = Number(res.headers.get("content-length") ?? 0);
    if (len > MAX_BYTES) throw new Error("too_large");
    const reader = res.body?.getReader();
    if (!reader) return await res.text();
    const chunks: Uint8Array[] = [];
    let total = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_BYTES) {
        await reader.cancel();
        throw new Error("too_large");
      }
      chunks.push(value);
    }
    const text = new TextDecoder().decode(Buffer.concat(chunks));
    if (!/BEGIN:VCALENDAR/i.test(text)) throw new Error("not_ical");
    return text;
  } finally {
    clearTimeout(timer);
  }
}

export interface CalendarBlock {
  date: string;
  status: "full" | "closed";
  note: string;
}

const BLOCK_WORDS = /\b(pun[ao]?|popunjen[ao]?|full|sold\s*out|booked\s*out|zatvoren[ao]?|closed|ne\s*radi(m|mo)?|blok(irano)?|block(ed)?|odmor|holiday)\b/i;
const FULL_WORDS = /\b(pun[ao]?|popunjen[ao]?|full|sold\s*out|booked\s*out)\b/i;

function unfold(text: string): string[] {
  return text.replace(/\r\n/g, "\n").replace(/\n[ \t]/g, "").split("\n");
}

function unescapeText(s: string): string {
  return s.replace(/\\n/gi, " ").replace(/\\([,;\\])/g, "$1").trim();
}

/** "20261121" or "20261121T080000Z" / local time → { date, allDay } in Zagreb. */
function parseIcalDate(value: string, params: string): { date: string; allDay: boolean } | null {
  const v = value.trim();
  const m = v.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?$/);
  if (!m) return null;
  const [, y, mo, d, hh, mi, ss, z] = m;
  const allDay = /VALUE=DATE(?!-)/i.test(params) || hh === undefined;
  if (allDay) return { date: `${y}-${mo}-${d}`, allDay: true };
  if (z) {
    const at = new Date(Date.UTC(+y, +mo - 1, +d, +hh, +mi, +ss));
    return { date: zagrebNow(at).date, allDay: false };
  }
  return { date: `${y}-${mo}-${d}`, allDay: false }; // TZID/floating: date part is close enough for a whole-day decision
}

/** Blocked days from an iCal feed, limited to [today, today + 180]. */
export function parseCalendar(text: string, today: string, horizonDays = 180): CalendarBlock[] {
  const lines = unfold(text);
  const last = addDays(today, horizonDays);
  const out = new Map<string, CalendarBlock>();
  let ev: Record<string, { value: string; params: string }> | null = null;
  let events = 0;
  for (const line of lines) {
    if (/^BEGIN:VEVENT/i.test(line)) {
      ev = {};
      continue;
    }
    if (/^END:VEVENT/i.test(line)) {
      if (ev && ++events <= 5000) addEvent(ev);
      ev = null;
      continue;
    }
    if (!ev) continue;
    const idx = line.indexOf(":");
    if (idx < 0) continue;
    const head = line.slice(0, idx);
    const [name, ...params] = head.split(";");
    ev[name.toUpperCase()] = { value: line.slice(idx + 1), params: params.join(";") };
  }
  return [...out.values()].sort((a, b) => a.date.localeCompare(b.date));

  function addEvent(e: Record<string, { value: string; params: string }>) {
    if ((e.STATUS?.value ?? "").toUpperCase() === "CANCELLED") return;
    const start = e.DTSTART ? parseIcalDate(e.DTSTART.value, e.DTSTART.params) : null;
    if (!start) return;
    const summary = unescapeText(e.SUMMARY?.value ?? "").slice(0, 120);
    const blocksByTitle = BLOCK_WORDS.test(summary);
    if (!start.allDay && !blocksByTitle) return;
    const status: CalendarBlock["status"] = FULL_WORDS.test(summary) ? "full" : "closed";
    let endInclusive = start.date;
    if (e.DTEND) {
      const end = parseIcalDate(e.DTEND.value, e.DTEND.params);
      if (end) endInclusive = end.allDay ? addDays(end.date, -1) : end.date;
    }
    if (!isIsoDate(endInclusive) || daysBetween(start.date, endInclusive) < 0) endInclusive = start.date;
    let d = daysBetween(today, start.date) < 0 ? today : start.date;
    for (let i = 0; i < 400 && daysBetween(d, endInclusive) >= 0 && daysBetween(d, last) >= 0; i++) {
      const prev = out.get(d);
      // "closed" beats "full" when two events cover the same day.
      if (!prev || (prev.status === "full" && status === "closed")) out.set(d, { date: d, status, note: summary });
      d = addDays(d, 1);
    }
  }
}
