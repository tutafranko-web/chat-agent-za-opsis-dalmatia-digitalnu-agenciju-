import { beforeEach, describe, expect, it } from "vitest";
import { confirm, quote, respond } from "@/lib/bookings";
import { createAttribution } from "@/lib/attribution";
import { routeRecipients } from "@/lib/mail";
import { appendBlackout, listBookings, findBooking, updateActivity } from "@/lib/repo";
import { __resetMemoryStore, store } from "@/lib/store";
import { getOffers } from "@/lib/catalog";
import { signToken } from "@/lib/tokens";
import { registerLandlord, registerOperator, decideOperator, addDayOff, getManageView } from "@/lib/partners";
import { verifyToken } from "@/lib/tokens";

const AT = new Date("2026-07-15T08:00:00Z"); // 10:00 in Zagreb → earliest 2026-07-16
const contact = { name: "Ana Gost", email: "ana@example.com", phone: "+385 91 123 4567", notes: "=HYPERLINK(\"x\")" };

beforeEach(() => {
  store();
  __resetMemoryStore();
});

describe("booking flow (memory store)", () => {
  it("quote → confirm → duplicate confirm → operator confirms", async () => {
    const q = await quote({ activityId: "A-DEM001", date: "2026-07-20", adults: 2, children: 1, lang: "en" }, AT);
    expect(q.ok).toBe(true);
    if (!q.ok) return;
    expect(q.draft.total).toBe(345);
    expect(JSON.stringify(q.draft)).not.toMatch(/commission|@/);

    const attr = await createAttribution("L-DEM00001", null);
    expect(attr.attribution.pn).toBe("Villa Demo Marjan");

    const c1 = await confirm({ token: q.draft.token, contact, attr: attr.token, consent: true, source: "card" }, AT);
    expect(c1).toMatchObject({ ok: true, status: "pending" });
    const c2 = await confirm({ token: q.draft.token, contact, attr: attr.token, consent: true, source: "card" }, AT);
    expect(c2).toMatchObject({ ok: true, duplicate: true });
    if (!c1.ok || !c2.ok) return;
    expect(c2.ref).toBe(c1.ref);

    const b = await findBooking(c1.ref);
    expect(b).toMatchObject({ status: "pending", landlord_id: "L-DEM00001", total_eur: 345, commission_pct: 12, commission_eur: 41.4, tourist_phone: "+385 91 123 4567", trial: true });
    expect(b?.notes.startsWith("=")).toBe(true); // stored raw; the sheet layer prefixes it
    const raw = (await store().read(["bookings"]))["bookings"][0];
    expect(raw.notes.startsWith("'=")).toBe(true);

    const rt = signToken("respond", { ref: c1.ref, op: b!.operator_id }, 3600);
    expect(await respond({ token: rt, action: "confirm", note: "Polazak 9:00" }, AT)).toMatchObject({ ok: true, status: "confirmed" });
    expect(await respond({ token: rt, action: "decline", note: "" }, AT)).toMatchObject({ ok: true, already: true, status: "confirmed" });
    expect(await respond({ token: signToken("respond", { ref: c1.ref, op: "OP-OTHER1" }, 3600), action: "confirm", note: "" }, AT)).toMatchObject({ ok: false });
  });

  it("requires consent and valid contact details", async () => {
    const q = await quote({ activityId: "A-DEM001", date: "2026-07-20", adults: 1, children: 0, lang: "hr" }, AT);
    if (!q.ok) throw new Error("quote failed");
    expect(await confirm({ token: q.draft.token, contact, attr: null, consent: false, source: "card" }, AT)).toMatchObject({ ok: false, code: "consent" });
    expect(await confirm({ token: q.draft.token, contact: { ...contact, email: "nope" }, attr: null, consent: true, source: "card" }, AT)).toMatchObject({ ok: false, code: "validation", field: "email" });
    expect(await confirm({ token: "garbage", contact, attr: null, consent: true, source: "card" }, AT)).toMatchObject({ ok: false, code: "invalid_token" });
  });

  it("detects price changes between quote and confirm", async () => {
    const q = await quote({ activityId: "A-DEM010", date: "2026-07-20", adults: 2, children: 0, lang: "en" }, AT);
    if (!q.ok) throw new Error("quote failed");
    await updateActivity("A-DEM010", { price_adult: 55 });
    const c = await confirm({ token: q.draft.token, contact, attr: null, consent: true, source: "card" }, AT);
    expect(c).toMatchObject({ ok: false, code: "price_changed" });
    if (!c.ok && c.code === "price_changed") expect(c.draft.total).toBe(110);
  });

  it("enforces blackouts and capacity with alternatives", async () => {
    await appendBlackout({ operator_id: "OP-DEM001", activity_id: "", start_date: "2026-07-20", end_date: "2026-07-21", reason: "weather", notes: "", created_at: "" });
    const q = await quote({ activityId: "A-DEM001", date: "2026-07-20", adults: 2, children: 0, lang: "en" }, AT);
    expect(q).toMatchObject({ ok: false, error: { code: "blackout", alternatives: ["2026-07-22", "2026-07-23", "2026-07-24"] } });

    // A-DEM021 (tandem skydive) allows 10 people per day
    const big = await quote({ activityId: "A-DEM021", date: "2026-07-25", adults: 8, children: 0, lang: "en" }, AT);
    if (!big.ok) throw new Error("quote failed");
    await confirm({ token: big.draft.token, contact, attr: null, consent: true, source: "card" }, AT);
    const more = await quote({ activityId: "A-DEM021", date: "2026-07-25", adults: 3, children: 0, lang: "en" }, AT);
    expect(more).toMatchObject({ ok: false, error: { code: "full", spotsLeft: 2 } });
    expect((await listBookings()).length).toBe(1);
  });

  it("adults-only activities refuse children", async () => {
    const q = await quote({ activityId: "A-DEM037", date: "2026-07-20", adults: 2, children: 1, lang: "en" }, AT);
    expect(q).toMatchObject({ ok: false, error: { code: "adults_only" } });
  });
});

describe("attribution", () => {
  it("accepts only existing landlords and known areas", async () => {
    expect((await createAttribution("L-DEM00001", "trogir")).attribution).toEqual({ lid: "L-DEM00001", area: "trogir", pn: "Villa Demo Marjan" });
    expect((await createAttribution("L-ZZZZZZZZ", null)).token).toBeNull();
    expect((await createAttribution("<script>", "<b>")).token).toBeNull();
  });
});

describe("mail routing", () => {
  it("routes partner mail to admin in trial and for demo addresses", () => {
    expect(routeRecipients("trial", "partner", ["real@operator.hr"])).toEqual({ to: ["admin@test.hr"], rerouted: true });
    expect(routeRecipients("live", "partner", ["opsisdalmatia+demo-op-dem001@gmail.com"])).toEqual({ to: ["admin@test.hr"], rerouted: true });
    expect(routeRecipients("live", "partner", ["real@operator.hr"])).toEqual({ to: ["real@operator.hr"], rerouted: false });
    expect(routeRecipients("trial", "requester", ["guest@example.com"])).toEqual({ to: ["guest@example.com"], rerouted: false });
    expect(routeRecipients("trial", "admin", [])).toEqual({ to: ["admin@test.hr"], rerouted: false });
  });
});

describe("partners", () => {
  it("landlord registration creates an id and QR links; re-registration is idempotent", async () => {
    const input = { full_name: "Marko Marić", property_name: "Apartmani Riva", email: "marko@example.com", phone: "+385 98 111 2222", address: "Riva 1", city: "Trogir", units: "3", avg_guests_summer: "40", booking_platform: "booking", consent: true };
    const r1 = await registerLandlord(input, "hr");
    expect(r1.ok).toBe(true);
    if (!r1.ok) return;
    expect(r1.links.chat).toBe(`https://concierge.test/?landlord=${r1.landlord_id}`);
    expect(r1.qr.chat.startsWith("data:image/png;base64,")).toBe(true);
    const r2 = await registerLandlord(input, "hr");
    expect(r2.ok && r2.landlord_id).toBe(r1.landlord_id);
    expect((await registerLandlord({ ...input, consent: false }, "hr")).ok).toBe(false);
  });

  it("operator registration is pending until approved; manage link blocks days", async () => {
    const reg = await registerOperator({
      company: "Kayak Test d.o.o.", contact_person: "Iva", email: "iva@example.com", phone: "+385 91 222 3333", city: "Split",
      activities: [{ type_key: "sea_kayaking", title: "Sunset kayak", price_adult: "40", price_child: "", commission_pct: "15" }], consent: true,
    }, "hr");
    expect(reg.ok).toBe(true);
    if (!reg.ok) return;
    expect((await getOffers(true)).some((o) => o.operator_id === reg.operator_id)).toBe(false);
    const approveToken = signToken("approve", { op: reg.operator_id }, 3600);
    expect(await decideOperator(approveToken, "approve")).toMatchObject({ ok: true, status: "active" });
    const live = (await getOffers(true)).find((o) => o.operator_id === reg.operator_id);
    expect(live?.title).toBe("Sunset kayak");

    const manage = signToken("manage", { op: reg.operator_id, v: 1 }, 3600);
    expect(await getManageView(manage)).not.toBeNull();
    const today = new Date().toISOString().slice(0, 10);
    expect(await addDayOff(manage, { start_date: today, end_date: today, reason: "weather" })).toMatchObject({ ok: true });
    expect(await addDayOff(signToken("manage", { op: reg.operator_id, v: 2 }, 3600), { start_date: today, end_date: today, reason: "weather" })).toMatchObject({ ok: false, code: "invalid_token" });
    expect(verifyToken("manage", approveToken)).toBeNull();
  });

  it("rejects invalid operator input", async () => {
    const bad = await registerOperator({ company: "X", contact_person: "Y", email: "bad", phone: "1", city: "S", activities: [], consent: true }, "en");
    expect(bad.ok).toBe(false);
    const badCommission = await registerOperator({
      company: "Firma", contact_person: "Ana", email: "a@b.hr", phone: "+385 91 000 0000", city: "Split",
      activities: [{ type_key: "sea_kayaking", title: "Kayak", price_adult: "40", commission_pct: "90" }], consent: true,
    }, "en");
    expect(badCommission).toMatchObject({ ok: false, field: "activities.0.commission_pct" });
  });
});
