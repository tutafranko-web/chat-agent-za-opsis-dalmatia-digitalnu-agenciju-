import { beforeEach, describe, expect, it } from "vitest";
import { availability, dayOverride } from "@/lib/booking-rules";
import { normalizeCalendarUrl, parseCalendar } from "@/lib/ical";
import { smtpFrom } from "@/lib/mail";
import { saveDayChanges, saveDaysWithToken, calendarData } from "@/lib/availability";
import { confirm, quote, respond } from "@/lib/bookings";
import { findOperator, latestDays, loadCatalogData } from "@/lib/repo";
import { dayKey, type Booking, type DayStatus } from "@/lib/schema";
import { __resetMemoryStore, store } from "@/lib/store";
import { signToken } from "@/lib/tokens";

const day = (p: Partial<DayStatus>): DayStatus => {
  const d = { operator_id: "OP-1", activity_id: "", date: "2026-08-05", status: "full" as const, seats: null, note: "", source: "kalendar", updated_at: "2026-08-01T10:00:00.000Z", ...p };
  return { key: dayKey(d.operator_id, d.activity_id, d.date), ...d };
};
const bk = (p: Partial<Booking>): Booking => ({
  ref: "OPS-1", created_at: "2026-08-02T10:00:00.000Z", status: "pending", activity_id: "A-1", activity_title: "", type_key: "", operator_id: "OP-1", operator_name: "",
  date: "2026-08-05", adults: 2, children: 0, price_adult: 0, price_child: 0, total_eur: 0, commission_pct: 0, commission_eur: 0, landlord_id: "",
  landlord_share_eur: null, area: "", tourist_name: "", tourist_email: "", tourist_phone: "", language: "en", notes: "", draft_id: "", source: "",
  trial: true, responded_at: "", response_note: "", ...p,
});
const base = { blackouts: [], bookings: [] as Booking[], operatorId: "OP-1", activityId: "A-1", maxPerDay: null, capacityScope: "activity" as const };

describe("operator day settings", () => {
  it("full / closed stop requests; nothing set = free", () => {
    expect(availability({ ...base, days: [day({ status: "full" })] }, "2026-08-05", 2)).toMatchObject({ ok: false, code: "full" });
    expect(availability({ ...base, days: [day({ status: "closed" })] }, "2026-08-05", 2)).toMatchObject({ ok: false, code: "blackout" });
    expect(availability({ ...base, days: [] }, "2026-08-05", 2)).toEqual({ ok: true, spotsLeft: null });
  });

  it("a per-tour setting beats an all-tours one", () => {
    const days = [day({ status: "full" }), day({ activity_id: "A-1", status: "open" })];
    expect(dayOverride(days, "OP-1", "A-1", "2026-08-05")?.status).toBe("open");
    expect(dayOverride(days, "OP-1", "A-2", "2026-08-05")?.status).toBe("full");
  });

  it("'N seats left' counts only requests made after the setting", () => {
    const days = [day({ activity_id: "A-1", status: "open", seats: 4, updated_at: "2026-08-02T09:00:00.000Z" })];
    const before = bk({ ref: "OPS-0", created_at: "2026-08-01T12:00:00.000Z", adults: 6 });
    const after = bk({ ref: "OPS-2", created_at: "2026-08-02T12:00:00.000Z", adults: 3 });
    expect(availability({ ...base, days, bookings: [before] }, "2026-08-05", 4)).toEqual({ ok: true, spotsLeft: 4 });
    expect(availability({ ...base, days, bookings: [before, after] }, "2026-08-05", 2)).toMatchObject({ ok: false, code: "full", spotsLeft: 1 });
  });

  it("'open' overrides an old day-off range for that day", () => {
    const blackouts = [{ operator_id: "OP-1", activity_id: "", start_date: "2026-08-01", end_date: "2026-08-10", reason: "season", notes: "", created_at: "" }];
    expect(availability({ ...base, blackouts }, "2026-08-05", 2)).toMatchObject({ ok: false, code: "blackout" });
    expect(availability({ ...base, blackouts, days: [day({ status: "open" })] }, "2026-08-05", 2)).toMatchObject({ ok: true });
  });

  it("latest row per key wins and cleared rows disappear", () => {
    const rows = [day({ status: "full", updated_at: "2026-08-01T00:00:00Z" }), day({ status: "", updated_at: "2026-08-02T00:00:00Z" })];
    expect(latestDays(rows)).toEqual([]);
  });
});

describe("iCal import", () => {
  const ics = [
    "BEGIN:VCALENDAR",
    "BEGIN:VEVENT", "DTSTART;VALUE=DATE:20260810", "DTEND;VALUE=DATE:20260812", "SUMMARY:PUN", "END:VEVENT",
    "BEGIN:VEVENT", "DTSTART;VALUE=DATE:20260815", "DTEND;VALUE=DATE:20260816", "SUMMARY:Odmor", "END:VEVENT",
    "BEGIN:VEVENT", "DTSTART:20260820T080000Z", "DTEND:20260820T100000Z", "SUMMARY:Obitelj Horvat 4 osobe", "END:VEVENT",
    "BEGIN:VEVENT", "DTSTART:20260821T080000Z", "DTEND:20260821T100000Z", "SUMMARY:Ne radimo - bura", "END:VEVENT",
    "BEGIN:VEVENT", "DTSTART;VALUE=DATE:20260825", "SUMMARY:Cancelled", "STATUS:CANCELLED", "END:VEVENT",
    "BEGIN:VEVENT", "DTSTART;VALUE=DATE:20260701", "SUMMARY:prošlost", "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  it("all-day events block; timed events only when the title says so", () => {
    const blocks = parseCalendar(ics, "2026-08-01");
    expect(blocks).toEqual([
      { date: "2026-08-10", status: "full", note: "PUN" },
      { date: "2026-08-11", status: "full", note: "PUN" },
      { date: "2026-08-15", status: "closed", note: "Odmor" },
      { date: "2026-08-21", status: "closed", note: "Ne radimo - bura" },
    ]);
  });

  it("only fetches https links from known calendar hosts", () => {
    expect(normalizeCalendarUrl("webcal://p01-caldav.icloud.com/published/2/abc")).toBe("https://p01-caldav.icloud.com/published/2/abc");
    expect(normalizeCalendarUrl("https://calendar.google.com/calendar/ical/x%40gmail.com/private-abc/basic.ics")).toMatch(/^https:\/\/calendar\.google\.com\//);
    expect(normalizeCalendarUrl("http://calendar.google.com/x.ics")).toBeNull();
    expect(normalizeCalendarUrl("https://127.0.0.1/x.ics")).toBeNull();
    expect(normalizeCalendarUrl("https://evil.example.com/calendar.google.com.ics")).toBeNull();
    expect(normalizeCalendarUrl("https://calendar.google.com.evil.com/x.ics")).toBeNull();
    expect(normalizeCalendarUrl("https://user:pw@calendar.google.com/x.ics")).toBeNull();
  });
});

describe("Gmail sender address", () => {
  it("keeps the display name but sends as the signed-in account", () => {
    expect(smtpFrom("Opsis Dalmatia <concierge@send.opsisdalmatia.com>", "opsisdalmatia@gmail.com")).toBe("Opsis Dalmatia <opsisdalmatia@gmail.com>");
    expect(smtpFrom("Opsis <opsisdalmatia@gmail.com>", "opsisdalmatia@gmail.com")).toBe("Opsis <opsisdalmatia@gmail.com>");
    expect(smtpFrom("", "a@b.co")).toBe("Opsis Dalmatia <a@b.co>");
  });
});

describe("saving days (memory store)", () => {
  const AT = new Date("2026-07-15T08:00:00Z");
  beforeEach(() => {
    store();
    __resetMemoryStore();
  });

  it("calendar taps block requests; 'all tours' replaces per-tour settings; bad input is refused", async () => {
    const op = await findOperator("OP-DEM001", true);
    expect(op).not.toBeNull();
    if (!op) return;
    const manage = signToken("manage", { op: op.operator_id, v: op.manage_version }, 3600);
    // The token route uses the real clock: past dates are refused, near-future ones saved.
    expect(await saveDaysWithToken(manage, [{ activity_id: "A-DEM001", dates: ["2020-01-01"], status: "full" }])).toMatchObject({ ok: false, code: "validation" });
    const soon = new Date(Date.now() + 3 * 86400_000).toISOString().slice(0, 10);
    expect(await saveDaysWithToken(manage, [{ activity_id: "A-DEM001", dates: [soon], status: "closed" }])).toEqual({ ok: true, saved: 1 });
    const ok = await saveDayChanges(op, [{ activity_id: "A-DEM001", dates: ["2026-07-20", "2026-07-21"], status: "full" }], "kalendar", AT);
    expect(ok).toEqual({ ok: true, saved: 2 });
    const q = await quote({ activityId: "A-DEM001", date: "2026-07-20", adults: 2, children: 0, lang: "en" }, AT);
    expect(q).toMatchObject({ ok: false, error: { code: "full" } });
    expect(q.ok ? [] : "alternatives" in q.error ? q.error.alternatives : []).toContain("2026-07-22");

    await saveDayChanges(op, [{ activity_id: "", dates: ["2026-07-20"], status: "open", seats: 3 }], "kalendar", AT);
    const { days } = await loadCatalogData(true);
    expect(days.filter((d) => d.operator_id === op.operator_id && d.date === "2026-07-20")).toHaveLength(1);
    const q2 = await quote({ activityId: "A-DEM001", date: "2026-07-20", adults: 4, children: 0, lang: "en" }, AT);
    expect(q2).toMatchObject({ ok: false, error: { code: "full", spotsLeft: 3 } });

    expect(await saveDayChanges(op, [{ activity_id: "A-DEM999", dates: ["2026-07-20"], status: "full" }], "kalendar", AT)).toMatchObject({ ok: false, field: "activity_id" });
    expect(await saveDayChanges(op, [{ activity_id: "", dates: ["2026-07-01"], status: "full" }], "kalendar", AT)).toMatchObject({ ok: false, field: "date" });
    expect(await saveDayChanges(op, [{ dates: ["2026-07-20"], status: "maybe" }], "kalendar", AT)).toMatchObject({ ok: false, code: "validation" });
    expect(await saveDaysWithToken(signToken("manage", { op: op.operator_id, v: 99 }, 3600), [])).toMatchObject({ ok: false, code: "invalid_token" });

    const cal = await calendarData(op, AT);
    expect(cal.days.some((d) => d.date === "2026-07-21" && d.status === "full")).toBe(true);
  });

  it("declining with 'pun sam taj dan' closes the day for other guests", async () => {
    const q = await quote({ activityId: "A-DEM010", date: "2026-07-25", adults: 2, children: 0, lang: "hr" }, AT);
    expect(q.ok).toBe(true);
    if (!q.ok) return;
    const c = await confirm({ token: q.draft.token, contact: { name: "Ana", email: "ana@example.com", phone: "+385 91 123 4567" }, attr: null, consent: true, source: "card" }, AT);
    if (!c.ok) throw new Error("confirm failed");
    const offer = (await loadCatalogData(true)).activities.find((a) => a.activity_id === "A-DEM010");
    const token = signToken("respond", { ref: c.ref, op: offer?.operator_id }, 3600, AT.getTime());
    expect(await respond({ token, action: "decline", note: "", day: "maybe" }, AT)).toMatchObject({ ok: false, code: "invalid_action" });
    expect(await respond({ token, action: "decline", note: "", day: "full" }, AT)).toMatchObject({ ok: true, status: "declined", dayMarked: "full" });
    const again = await quote({ activityId: "A-DEM010", date: "2026-07-25", adults: 1, children: 0, lang: "hr" }, AT);
    expect(again).toMatchObject({ ok: false, error: { code: "full" } });
  });
});
