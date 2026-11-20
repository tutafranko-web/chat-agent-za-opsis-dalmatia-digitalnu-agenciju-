import { describe, expect, it } from "vitest";
import {
  availability, blackoutFor, checkDate, checkParty, commissionOf, computePrice, earliestDate, landlordShareOf, latestDate, nextAvailableDates,
} from "@/lib/booking-rules";
import type { Blackout, Booking } from "@/lib/schema";

// 2026-07-15 is in summer time (UTC+2): 12:59 UTC = 14:59 Zagreb, 13:00 UTC = 15:00 Zagreb.
const at1459 = new Date("2026-07-15T12:59:00Z");
const at1500 = new Date("2026-07-15T13:00:00Z");

describe("cutoff and date window (Europe/Zagreb)", () => {
  it("before 15:00 the earliest date is tomorrow", () => {
    expect(earliestDate(at1459)).toBe("2026-07-16");
  });
  it("from 15:00 the earliest date is the day after tomorrow", () => {
    expect(earliestDate(at1500)).toBe("2026-07-17");
  });
  it("uses Zagreb, not UTC, around midnight", () => {
    // 22:30 UTC on 15 July = 00:30 on 16 July in Zagreb → earliest is 17 July
    expect(earliestDate(new Date("2026-07-15T22:30:00Z"))).toBe("2026-07-17");
  });
  it("winter time offset (UTC+1)", () => {
    // 13:59 UTC on 20 Nov = 14:59 Zagreb → tomorrow
    expect(earliestDate(new Date("2026-11-20T13:59:00Z"))).toBe("2026-11-21");
    expect(earliestDate(new Date("2026-11-20T14:00:00Z"))).toBe("2026-11-22");
  });
  it("rejects too soon, too far and invalid dates", () => {
    expect(checkDate("2026-07-15", at1459)).toMatchObject({ ok: false, code: "too_soon", earliest: "2026-07-16" });
    expect(checkDate("2026-07-16", at1459)).toEqual({ ok: true });
    expect(checkDate("2026-07-16", at1500)).toMatchObject({ ok: false, code: "too_soon" });
    expect(checkDate(latestDate(at1459), at1459)).toEqual({ ok: true });
    expect(checkDate("2027-07-15", at1459)).toMatchObject({ ok: false, code: "too_far" });
    expect(checkDate("2026-02-30", at1459)).toMatchObject({ ok: false, code: "invalid_date" });
    expect(checkDate("15.7.2026", at1459)).toMatchObject({ ok: false, code: "invalid_date" });
  });
});

describe("party checks", () => {
  it("needs at least one adult and caps the group", () => {
    expect(checkParty(0, 2, false)).toMatchObject({ ok: false, code: "adults_min" });
    expect(checkParty(31, 0, false)).toMatchObject({ ok: false, code: "too_many" });
    expect(checkParty(25, 16, false)).toMatchObject({ ok: false, code: "too_many" });
    expect(checkParty(2, 1, true)).toMatchObject({ ok: false, code: "adults_only" });
    expect(checkParty(2, 0, true)).toEqual({ ok: true });
    expect(checkParty(1.5 as number, 0, false)).toMatchObject({ ok: false });
  });
});

describe("pricing", () => {
  it("half price for children when no child price is set", () => {
    expect(computePrice({ price_adult: 125, price_child: null, child_policy: "half" }, 2, 1)).toEqual({ price_adult: 125, price_child: 62.5, total: 312.5 });
  });
  it("explicit child price and free children", () => {
    expect(computePrice({ price_adult: 125, price_child: 95, child_policy: "price" }, 2, 1).total).toBe(345);
    expect(computePrice({ price_adult: 25, price_child: 0, child_policy: "free" }, 2, 3).total).toBe(50);
  });
  it("commission is capped at 50% and the landlord share is optional", () => {
    expect(commissionOf(345, 12)).toBe(41.4);
    expect(commissionOf(100, 80)).toBe(50);
    expect(landlordShareOf(41.4, null)).toBeNull();
    expect(landlordShareOf(41.4, 50)).toBe(20.7);
  });
});

const bo = (p: Partial<Blackout>): Blackout => ({ operator_id: "OP-1", activity_id: "", start_date: "2026-08-01", end_date: "2026-08-03", reason: "weather", notes: "", created_at: "", ...p });
const bk = (p: Partial<Booking>): Booking => ({
  ref: "OPS-1", created_at: "", status: "pending", activity_id: "A-1", activity_title: "", type_key: "", operator_id: "OP-1", operator_name: "",
  date: "2026-08-05", adults: 2, children: 0, price_adult: 0, price_child: 0, total_eur: 0, commission_pct: 0, commission_eur: 0, landlord_id: "",
  landlord_share_eur: null, area: "", tourist_name: "", tourist_email: "", tourist_phone: "", language: "en", notes: "", draft_id: "", source: "",
  trial: true, responded_at: "", response_note: "", ...p,
});

describe("availability", () => {
  it("blackout ranges are inclusive and can target one activity", () => {
    expect(blackoutFor([bo({})], "OP-1", "A-1", "2026-08-01")).not.toBeNull();
    expect(blackoutFor([bo({})], "OP-1", "A-1", "2026-08-03")).not.toBeNull();
    expect(blackoutFor([bo({})], "OP-1", "A-1", "2026-08-04")).toBeNull();
    expect(blackoutFor([bo({ activity_id: "A-2" })], "OP-1", "A-1", "2026-08-02")).toBeNull();
    expect(blackoutFor([bo({ operator_id: "OP-2" })], "OP-1", "A-1", "2026-08-02")).toBeNull();
  });
  it("capacity counts pending and confirmed, not declined", () => {
    const opts = { blackouts: [], operatorId: "OP-1", activityId: "A-1", maxPerDay: 10, capacityScope: "activity" as const };
    const bookings = [bk({ adults: 4, children: 2 }), bk({ ref: "OPS-2", status: "confirmed", adults: 2 }), bk({ ref: "OPS-3", status: "declined", adults: 9 })];
    expect(availability({ ...opts, bookings }, "2026-08-05", 2)).toEqual({ ok: true, spotsLeft: 2 });
    expect(availability({ ...opts, bookings }, "2026-08-05", 3)).toMatchObject({ ok: false, code: "full", spotsLeft: 2 });
    expect(availability({ ...opts, bookings }, "2026-08-06", 10)).toMatchObject({ ok: true });
  });
  it("suggests the next available dates", () => {
    const opts = { blackouts: [bo({})], bookings: [], operatorId: "OP-1", activityId: "A-1", maxPerDay: null, capacityScope: "activity" as const };
    const alt = nextAvailableDates("2026-08-01", 3, (d) => availability(opts, d, 2).ok, "2026-12-31");
    expect(alt).toEqual(["2026-08-04", "2026-08-05", "2026-08-06"]);
  });
});
