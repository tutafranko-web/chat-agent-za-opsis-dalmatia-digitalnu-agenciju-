/**
 * Spreadsheet schema: tab names, header order and typed row mappers.
 * Rows are always read by header name, so columns can be reordered in the
 * sheet without breaking anything; new rows are written in this order.
 */
import { parseNumber, unsheet } from "./sanitize";
import { normalizeDate } from "./zagreb-time";

export const TABS = {
  operators: {
    name: "Operateri",
    headers: [
      "operator_id", "status", "company", "contact_person", "email", "phone", "city", "website", "address",
      "business_model", "max_per_day", "notes", "created_at", "approved_at", "manage_version", "source",
      "ical_url", "ical_synced_at", "ical_status",
    ],
  },
  activities: {
    name: "Aktivnosti",
    headers: [
      "activity_id", "operator_id", "status", "type_key", "title", "description", "duration", "meeting_point",
      "city", "price_adult", "price_child", "commission_pct", "max_per_day", "image_url", "gallery_url",
      "featured", "created_at",
    ],
  },
  landlords: {
    name: "Iznajmljivaci",
    headers: [
      "landlord_id", "status", "full_name", "property_name", "email", "phone", "address", "city", "area",
      "units", "avg_guests_summer", "booking_platform", "consent_at", "terms_version", "created_at", "source",
    ],
  },
  bookings: {
    name: "Rezervacije",
    headers: [
      "ref", "created_at", "status", "activity_id", "activity_title", "type_key", "operator_id", "operator_name",
      "date", "adults", "children", "price_adult", "price_child", "total_eur", "commission_pct", "commission_eur",
      "landlord_id", "landlord_share_eur", "area", "tourist_name", "tourist_email", "tourist_phone", "language",
      "notes", "draft_id", "source", "trial", "responded_at", "response_note",
    ],
  },
  quiz: {
    name: "Kviz",
    headers: ["quiz_id", "created_at", "language", "landlord_id", "answers_json", "top_types", "recommended_ids", "email", "consent_marketing"],
  },
  days: {
    name: "Dostupnost",
    headers: ["key", "operator_id", "activity_id", "date", "status", "seats", "note", "source", "updated_at"],
  },
  blackouts: {
    name: "Neradni_dani",
    headers: ["operator_id", "activity_id", "start_date", "end_date", "reason", "notes", "created_at"],
  },
  leads: {
    name: "Leadovi",
    headers: ["email", "name", "company", "type", "city", "source", "status", "notes"],
  },
  suppression: {
    name: "Suppression",
    headers: ["email", "reason", "created_at"],
  },
  outreachSent: {
    name: "Outreach_Sent",
    headers: ["sent_at", "email", "name", "type", "status", "message_id"],
  },
  reports: {
    name: "Izvjestaji",
    headers: ["report_date", "sent_at", "bookings", "status"],
  },
  log: {
    name: "Dnevnik",
    headers: ["ts", "level", "event", "ref", "details"],
  },
} as const;

export type TabKey = keyof typeof TABS;
export type Row = Record<string, string>;

const s = (r: Row, k: string) => unsheet(r[k] ?? "").trim();
const n = (r: Row, k: string): number | null => parseNumber(s(r, k));
const b = (r: Row, k: string) => ["true", "1", "yes", "da"].includes(s(r, k).toLowerCase());

// ── Operators ──────────────────────────────────────────────────────────────
export type OperatorStatus = "pending" | "active" | "paused" | "rejected" | "demo";
export interface Operator {
  operator_id: string;
  status: OperatorStatus;
  company: string;
  contact_person: string;
  email: string;
  phone: string;
  city: string;
  website: string;
  address: string;
  business_model: string;
  max_per_day: number | null;
  notes: string;
  created_at: string;
  approved_at: string;
  manage_version: number;
  source: string;
  ical_url: string;
  ical_synced_at: string;
  ical_status: string;
}
export function toOperator(r: Row): Operator {
  return {
    operator_id: s(r, "operator_id"),
    status: (s(r, "status").toLowerCase() || "pending") as OperatorStatus,
    company: s(r, "company"),
    contact_person: s(r, "contact_person"),
    email: s(r, "email").toLowerCase(),
    phone: s(r, "phone"),
    city: s(r, "city"),
    website: s(r, "website"),
    address: s(r, "address"),
    business_model: s(r, "business_model"),
    max_per_day: n(r, "max_per_day"),
    notes: s(r, "notes"),
    created_at: s(r, "created_at"),
    approved_at: s(r, "approved_at"),
    manage_version: n(r, "manage_version") ?? 1,
    source: s(r, "source"),
    ical_url: s(r, "ical_url"),
    ical_synced_at: s(r, "ical_synced_at"),
    ical_status: s(r, "ical_status"),
  };
}

// ── Activities ─────────────────────────────────────────────────────────────
export type ActivityStatus = "pending" | "active" | "paused" | "rejected" | "demo";
export interface Activity {
  activity_id: string;
  operator_id: string;
  status: ActivityStatus;
  type_key: string;
  title: string;
  description: string;
  duration: string;
  meeting_point: string;
  city: string;
  price_adult: number | null;
  price_child: number | null;
  commission_pct: number | null;
  max_per_day: number | null;
  image_url: string;
  gallery_url: string;
  featured: boolean;
  created_at: string;
}
export function toActivity(r: Row): Activity {
  return {
    activity_id: s(r, "activity_id"),
    operator_id: s(r, "operator_id"),
    status: (s(r, "status").toLowerCase() || "pending") as ActivityStatus,
    type_key: s(r, "type_key"),
    title: s(r, "title"),
    description: s(r, "description"),
    duration: s(r, "duration"),
    meeting_point: s(r, "meeting_point"),
    city: s(r, "city"),
    price_adult: n(r, "price_adult"),
    price_child: n(r, "price_child"),
    commission_pct: n(r, "commission_pct"),
    max_per_day: n(r, "max_per_day"),
    image_url: s(r, "image_url"),
    gallery_url: s(r, "gallery_url"),
    featured: b(r, "featured"),
    created_at: s(r, "created_at"),
  };
}

// ── Landlords ──────────────────────────────────────────────────────────────
export interface Landlord {
  landlord_id: string;
  status: string;
  full_name: string;
  property_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  area: string;
  units: number | null;
  avg_guests_summer: number | null;
  booking_platform: string;
  consent_at: string;
  terms_version: string;
  created_at: string;
  source: string;
}
export function toLandlord(r: Row): Landlord {
  return {
    landlord_id: s(r, "landlord_id"),
    status: s(r, "status").toLowerCase() || "active",
    full_name: s(r, "full_name"),
    property_name: s(r, "property_name"),
    email: s(r, "email").toLowerCase(),
    phone: s(r, "phone"),
    address: s(r, "address"),
    city: s(r, "city"),
    area: s(r, "area"),
    units: n(r, "units"),
    avg_guests_summer: n(r, "avg_guests_summer"),
    booking_platform: s(r, "booking_platform"),
    consent_at: s(r, "consent_at"),
    terms_version: s(r, "terms_version"),
    created_at: s(r, "created_at"),
    source: s(r, "source"),
  };
}

// ── Bookings ───────────────────────────────────────────────────────────────
export type BookingStatus = "pending" | "confirmed" | "declined" | "cancelled";
export interface Booking {
  ref: string;
  created_at: string;
  status: BookingStatus;
  activity_id: string;
  activity_title: string;
  type_key: string;
  operator_id: string;
  operator_name: string;
  date: string;
  adults: number;
  children: number;
  price_adult: number;
  price_child: number;
  total_eur: number;
  commission_pct: number;
  commission_eur: number;
  landlord_id: string;
  landlord_share_eur: number | null;
  area: string;
  tourist_name: string;
  tourist_email: string;
  tourist_phone: string;
  language: string;
  notes: string;
  draft_id: string;
  source: string;
  trial: boolean;
  responded_at: string;
  response_note: string;
}
export function toBooking(r: Row): Booking {
  return {
    ref: s(r, "ref"),
    created_at: s(r, "created_at"),
    status: (s(r, "status").toLowerCase() || "pending") as BookingStatus,
    activity_id: s(r, "activity_id"),
    activity_title: s(r, "activity_title"),
    type_key: s(r, "type_key"),
    operator_id: s(r, "operator_id"),
    operator_name: s(r, "operator_name"),
    date: normalizeDate(s(r, "date")),
    adults: n(r, "adults") ?? 0,
    children: n(r, "children") ?? 0,
    price_adult: n(r, "price_adult") ?? 0,
    price_child: n(r, "price_child") ?? 0,
    total_eur: n(r, "total_eur") ?? 0,
    commission_pct: n(r, "commission_pct") ?? 0,
    commission_eur: n(r, "commission_eur") ?? 0,
    landlord_id: s(r, "landlord_id"),
    landlord_share_eur: n(r, "landlord_share_eur"),
    area: s(r, "area"),
    tourist_name: s(r, "tourist_name"),
    tourist_email: s(r, "tourist_email"),
    tourist_phone: s(r, "tourist_phone"),
    language: s(r, "language") || "en",
    notes: s(r, "notes"),
    draft_id: s(r, "draft_id"),
    source: s(r, "source"),
    trial: b(r, "trial"),
    responded_at: s(r, "responded_at"),
    response_note: s(r, "response_note"),
  };
}

// ── Blackouts ──────────────────────────────────────────────────────────────
export interface Blackout {
  operator_id: string;
  activity_id: string;
  start_date: string;
  end_date: string;
  reason: string;
  notes: string;
  created_at: string;
}
export function toBlackout(r: Row): Blackout {
  return {
    operator_id: s(r, "operator_id"),
    activity_id: s(r, "activity_id"),
    start_date: normalizeDate(s(r, "start_date")),
    end_date: normalizeDate(s(r, "end_date") || s(r, "start_date")),
    reason: s(r, "reason"),
    notes: s(r, "notes"),
    created_at: s(r, "created_at"),
  };
}

// ── Day availability (one row per operator/activity/date) ───────────────────
/**
 * Per-day overrides set by the operator (calendar, booking e-mail, message,
 * synced calendar). "open" with seats = that many places left from
 * `updated_at` on; "open" without seats = explicitly working (overrides a
 * day-off range); "full"/"closed" = no requests; "" = cleared.
 */
export type DayState = "open" | "full" | "closed" | "";
export type DaySource = "kalendar" | "mail" | "poruka" | "admin" | "ical";
export interface DayStatus {
  key: string;
  operator_id: string;
  activity_id: string; // "" = all of the operator's activities
  date: string;
  status: DayState;
  seats: number | null;
  note: string;
  source: string;
  updated_at: string;
}
export function dayKey(operatorId: string, activityId: string, date: string): string {
  return `${operatorId}|${activityId || "*"}|${date}`;
}
export function toDay(r: Row): DayStatus {
  const st = s(r, "status").toLowerCase();
  const operator_id = s(r, "operator_id");
  const activity_id = s(r, "activity_id");
  const date = normalizeDate(s(r, "date"));
  return {
    key: s(r, "key") || dayKey(operator_id, activity_id, date),
    operator_id,
    activity_id,
    date,
    status: (["open", "full", "closed"].includes(st) ? st : "") as DayState,
    seats: n(r, "seats"),
    note: s(r, "note"),
    source: s(r, "source"),
    updated_at: s(r, "updated_at"),
  };
}

export function readString(r: Row, key: string): string {
  return s(r, key);
}
