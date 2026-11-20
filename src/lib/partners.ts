import "server-only";
import { z } from "zod";
import { TERMS_VERSION } from "@/config/company";
import { env } from "./env";
import { ACTIVITY_ID_RE, newActivityId, newLandlordId, newOperatorId, uniqueId } from "./ids";
import { sendMail } from "./mail";
import * as T from "./mail-templates";
import { qrPngBuffer, qrDataUrl } from "./qr";
import {
  appendActivity, appendBlackout, appendLandlord, appendOperator, findOperator, listLandlords, listOperators,
  loadCatalogData, logEvent, updateActivity, updateOperator,
} from "./repo";
import { cleanPhone, cleanText, isEmail, isPhone, normalizeEmail, parseNumber, safeHttpsUrl } from "./sanitize";
import type { Activity, Landlord, Operator } from "./schema";
import { normalizeArea, TYPE_KEYS } from "./taxonomy";
import { signToken, verifyToken } from "./tokens";
import { addDays, daysBetween, isIsoDate, zagrebNow } from "./zagreb-time";

type Lang = "en" | "hr";
const text = (max: number, min = 0) => z.string().transform((s) => cleanText(s, max)).pipe(z.string().min(min));
const email = z.string().transform(normalizeEmail).refine(isEmail, "email");
const phone = z.string().transform(cleanPhone).refine(isPhone, "phone");
const intIn = (min: number, max: number) =>
  z.union([z.number(), z.string()]).transform((v) => parseNumber(v)).refine((v) => v !== null && Number.isInteger(v) && v >= min && v <= max, "number").transform((v) => v as number);
const priceIn = z.union([z.number(), z.string()]).transform((v) => parseNumber(v)).refine((v) => v !== null && v >= 0 && v <= 5000, "price").transform((v) => v as number);
const optPrice = z.union([z.number(), z.string(), z.null()]).optional().transform((v) => (v === null || v === undefined || v === "" ? null : parseNumber(v))).refine((v) => v === null || (v >= 0 && v <= 5000), "price");

// ── Landlords ──────────────────────────────────────────────────────────────

export const LandlordInput = z.object({
  full_name: text(80, 2),
  property_name: text(100, 2),
  email,
  phone,
  address: text(150, 3),
  city: text(60, 2),
  units: intIn(1, 500),
  avg_guests_summer: intIn(0, 20000),
  booking_platform: z.enum(["booking", "airbnb", "both", "direct", "agency", "other"]),
  consent: z.literal(true),
});

export function landlordLinks(id: string) {
  const base = env.baseUrl();
  return {
    chat: `${base}/?landlord=${id}`,
    quiz: `${base}/quiz?landlord=${id}`,
    poster: `${base}/partneri/plakat/${id}`,
  };
}

export async function registerLandlord(raw: unknown, lang: Lang) {
  const p = LandlordInput.safeParse(raw);
  if (!p.success) return { ok: false as const, code: "validation", field: String(p.error.issues[0]?.path[0] ?? "") };
  const d = p.data;
  const existing = await listLandlords(true);
  const dup = existing.find((l) => l.email === d.email && l.property_name.toLowerCase() === d.property_name.toLowerCase());
  const id = dup?.landlord_id ?? uniqueId(newLandlordId, new Set(existing.map((l) => l.landlord_id)));
  const now = new Date().toISOString();
  const landlord: Landlord = {
    landlord_id: id,
    status: "active",
    full_name: d.full_name,
    property_name: d.property_name,
    email: d.email,
    phone: d.phone,
    address: d.address,
    city: d.city,
    area: normalizeArea(d.city) ?? "other",
    units: d.units,
    avg_guests_summer: d.avg_guests_summer,
    booking_platform: d.booking_platform,
    consent_at: now,
    terms_version: TERMS_VERSION,
    created_at: now,
    source: "form",
  };
  if (!dup) {
    await appendLandlord(landlord);
    await logEvent("info", "landlord_registered", id, landlord.area);
  }
  const links = landlordLinks(id);
  const [chatPng, quizPng, chatQr, quizQr] = await Promise.all([
    qrPngBuffer(links.chat), qrPngBuffer(links.quiz), qrDataUrl(links.chat), qrDataUrl(links.quiz),
  ]);
  await Promise.allSettled([
    sendMail({
      to: landlord.email,
      audience: "requester",
      tag: "landlord_welcome",
      idempotencyKey: `landlord-welcome-${id}-${dup ? Date.now() : "new"}`,
      attachments: [
        { filename: `opsis-chat-${id}.png`, content: chatPng },
        { filename: `opsis-kviz-${id}.png`, content: quizPng },
      ],
      ...T.landlordWelcome(landlord, links.chat, links.quiz, links.poster, lang),
    }),
    dup ? Promise.resolve() : sendMail({ to: env.adminEmails(), audience: "admin", tag: "landlord_admin", ...T.adminLandlordRegistered(landlord) }),
  ]);
  return { ok: true as const, landlord_id: id, links, qr: { chat: chatQr, quiz: quizQr }, existing: !!dup };
}

// ── Operators ──────────────────────────────────────────────────────────────

const ActivityInput = z.object({
  type_key: z.string().refine((k) => TYPE_KEYS.includes(k), "type_key"),
  title: text(90, 3),
  description: text(600, 0).optional().default(""),
  duration: text(40, 0).optional().default(""),
  meeting_point: text(120, 0).optional().default(""),
  price_adult: priceIn,
  price_child: optPrice,
  commission_pct: z.union([z.number(), z.string()]).transform((v) => parseNumber(v)).refine((v) => v !== null && v >= 5 && v <= 50, "commission").transform((v) => v as number),
});

export const OperatorInput = z.object({
  company: text(100, 2),
  contact_person: text(80, 2),
  email,
  phone,
  city: text(60, 2),
  website: z.string().optional().default("").transform((s) => cleanText(s, 200)),
  address: text(150, 0).optional().default(""),
  business_model: z.enum(["direct", "agency", "other"]).default("direct"),
  max_per_day: z.union([z.number(), z.string(), z.null()]).optional().transform((v) => (v === null || v === undefined || v === "" ? null : parseNumber(v))).refine((v) => v === null || (Number.isInteger(v) && v >= 1 && v <= 5000), "max_per_day"),
  notes: z.string().optional().default("").transform((s) => cleanText(s, 600, true)),
  activities: z.array(ActivityInput).min(1).max(8),
  consent: z.literal(true),
});

function approveUrl(operatorId: string): string {
  return `${env.baseUrl()}/admin/odobri/${signToken("approve", { op: operatorId }, 30 * 86400)}`;
}

export function manageUrl(o: Operator): string {
  return `${env.baseUrl()}/partneri/upravljanje/${signToken("manage", { op: o.operator_id, v: o.manage_version }, 365 * 86400)}`;
}

export async function registerOperator(raw: unknown, lang: Lang) {
  const p = OperatorInput.safeParse(raw);
  if (!p.success) {
    const issue = p.error.issues[0];
    return { ok: false as const, code: "validation", field: issue?.path.join(".") ?? "" };
  }
  const d = p.data;
  const ops = await listOperators(true);
  const operatorId = uniqueId(newOperatorId, new Set(ops.map((o) => o.operator_id)));
  const now = new Date().toISOString();
  const op: Operator = {
    operator_id: operatorId,
    status: "pending",
    company: d.company,
    contact_person: d.contact_person,
    email: d.email,
    phone: d.phone,
    city: d.city,
    website: d.website,
    address: d.address,
    business_model: d.business_model,
    max_per_day: d.max_per_day,
    notes: d.notes,
    created_at: now,
    approved_at: "",
    manage_version: 1,
    source: "form",
  };
  await appendOperator(op);
  const { activities: existing } = await loadCatalogData(true);
  const ids = new Set(existing.map((a) => a.activity_id));
  const acts: Activity[] = [];
  for (const a of d.activities) {
    const id = uniqueId(newActivityId, ids);
    ids.add(id);
    const act: Activity = {
      activity_id: id,
      operator_id: operatorId,
      status: "pending",
      type_key: a.type_key,
      title: a.title,
      description: a.description,
      duration: a.duration,
      meeting_point: a.meeting_point,
      city: d.city,
      price_adult: a.price_adult,
      price_child: a.price_child,
      commission_pct: a.commission_pct,
      max_per_day: null,
      image_url: "",
      gallery_url: "",
      featured: false,
      created_at: now,
    };
    await appendActivity(act);
    acts.push(act);
  }
  await logEvent("info", "operator_registered", operatorId, `${acts.length} activities`);
  await Promise.allSettled([
    sendMail({ to: op.email, audience: "requester", tag: "operator_received", idempotencyKey: `op-received-${operatorId}`, ...T.operatorRegistrationReceived(op, lang) }),
    sendMail({ to: env.adminEmails(), audience: "admin", tag: "operator_admin", idempotencyKey: `op-admin-${operatorId}`, ...T.adminOperatorRegistration(op, acts, approveUrl(operatorId)) }),
  ]);
  return { ok: true as const, operator_id: operatorId };
}

export async function getApprovalView(token: string) {
  const v = verifyToken<{ op: string }>("approve", token);
  if (!v) return null;
  const { operators, activities } = await loadCatalogData(true);
  const op = operators.find((o) => o.operator_id === v.data.op);
  if (!op) return null;
  return { operator: op, activities: activities.filter((a) => a.operator_id === op.operator_id) };
}

export async function decideOperator(token: unknown, decision: unknown) {
  const v = verifyToken<{ op: string }>("approve", token);
  if (!v) return { ok: false as const, code: "invalid_token" };
  if (decision !== "approve" && decision !== "reject") return { ok: false as const, code: "invalid_decision" };
  const { operators, activities } = await loadCatalogData(true);
  const op = operators.find((o) => o.operator_id === v.data.op);
  if (!op) return { ok: false as const, code: "not_found" };
  const status = decision === "approve" ? "active" : "rejected";
  if (op.status === status) return { ok: true as const, status, already: true };
  const now = new Date().toISOString();
  await updateOperator(op.operator_id, { status, approved_at: decision === "approve" ? now : "" });
  for (const a of activities.filter((x) => x.operator_id === op.operator_id && x.status === "pending")) {
    await updateActivity(a.activity_id, { status: decision === "approve" ? "active" : "rejected" });
  }
  await logEvent("info", `operator_${status}`, op.operator_id);
  if (decision === "approve") {
    const updated = { ...op, status: "active" as const };
    await sendMail({ to: op.email, audience: "partner", tag: "operator_approved", idempotencyKey: `op-approved-${op.operator_id}`, ...T.operatorApproved(updated, manageUrl(updated)) });
  }
  return { ok: true as const, status };
}

// ── Operator self-service (manage link) ────────────────────────────────────

export async function getManageView(token: string) {
  const v = verifyToken<{ op: string; v: number }>("manage", token);
  if (!v) return null;
  const { operators, activities, blackouts } = await loadCatalogData(true);
  const op = operators.find((o) => o.operator_id === v.data.op);
  if (!op || op.manage_version !== v.data.v || (op.status !== "active" && op.status !== "demo" && op.status !== "paused")) return null;
  const today = zagrebNow().date;
  return {
    operator: { operator_id: op.operator_id, company: op.company, status: op.status },
    activities: activities
      .filter((a) => a.operator_id === op.operator_id)
      .map((a) => ({ activity_id: a.activity_id, title: a.title, status: a.status, image_url: a.image_url, gallery_url: a.gallery_url })),
    blackouts: blackouts
      .filter((b) => b.operator_id === op.operator_id && daysBetween(today, b.end_date) >= 0)
      .map((b) => ({ start_date: b.start_date, end_date: b.end_date, activity_id: b.activity_id, reason: b.reason })),
  };
}

const DayOffInput = z.object({
  start_date: z.string().refine(isIsoDate, "start_date"),
  end_date: z.string().refine(isIsoDate, "end_date"),
  activity_id: z.string().optional().default("").refine((s) => s === "" || ACTIVITY_ID_RE.test(s) || /^A-DEM\d{3}$/.test(s), "activity_id"),
  reason: z.enum(["weather", "maintenance", "full", "holiday", "private", "other"]),
  notes: z.string().optional().default("").transform((s) => cleanText(s, 300)),
});

export async function addDayOff(token: unknown, raw: unknown) {
  const v = verifyToken<{ op: string; v: number }>("manage", token);
  if (!v) return { ok: false as const, code: "invalid_token" };
  const op = await findOperator(v.data.op, true);
  if (!op || op.manage_version !== v.data.v) return { ok: false as const, code: "invalid_token" };
  const p = DayOffInput.safeParse(raw);
  if (!p.success) return { ok: false as const, code: "validation", field: String(p.error.issues[0]?.message ?? "") };
  const d = p.data;
  const today = zagrebNow().date;
  if (daysBetween(d.start_date, d.end_date) < 0) return { ok: false as const, code: "validation", field: "end_before_start" };
  if (daysBetween(today, d.end_date) < 0) return { ok: false as const, code: "validation", field: "in_past" };
  if (daysBetween(d.start_date, d.end_date) > 180 || daysBetween(today, d.start_date) > 400) return { ok: false as const, code: "validation", field: "too_long" };
  if (d.activity_id) {
    const { activities } = await loadCatalogData(true);
    if (!activities.some((a) => a.activity_id === d.activity_id && a.operator_id === op.operator_id)) {
      return { ok: false as const, code: "validation", field: "activity_id" };
    }
  }
  await appendBlackout({
    operator_id: op.operator_id,
    activity_id: d.activity_id,
    start_date: d.start_date,
    end_date: d.end_date,
    reason: d.reason,
    notes: d.notes,
    created_at: new Date().toISOString(),
  });
  await logEvent("info", "dayoff_added", op.operator_id, `${d.start_date}..${d.end_date}`);
  return { ok: true as const };
}

export async function updatePhotos(token: unknown, raw: unknown) {
  const v = verifyToken<{ op: string; v: number }>("manage", token);
  if (!v) return { ok: false as const, code: "invalid_token" };
  const op = await findOperator(v.data.op, true);
  if (!op || op.manage_version !== v.data.v) return { ok: false as const, code: "invalid_token" };
  const r = (raw ?? {}) as Record<string, unknown>;
  const activityId = typeof r.activity_id === "string" ? r.activity_id : "";
  const { activities } = await loadCatalogData(true);
  const act = activities.find((a) => a.activity_id === activityId && a.operator_id === op.operator_id);
  if (!act) return { ok: false as const, code: "validation", field: "activity_id" };
  const image = r.image_url ? safeHttpsUrl(r.image_url) : "";
  const gallery = r.gallery_url ? safeHttpsUrl(r.gallery_url) : "";
  if (image === null || gallery === null) return { ok: false as const, code: "validation", field: "url" };
  if (image && !/\.(jpe?g|png|webp|avif)(\?.*)?$/i.test(image)) return { ok: false as const, code: "validation", field: "image_url" };
  await updateActivity(act.activity_id, { image_url: image ?? "", gallery_url: gallery ?? "" });
  await logEvent("info", "photos_updated", act.activity_id);
  return { ok: true as const };
}

/** Earliest/latest dates for the day-off form. */
export function dayOffBounds() {
  const today = zagrebNow().date;
  return { min: today, max: addDays(today, 400) };
}
