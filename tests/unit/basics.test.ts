import { describe, expect, it } from "vitest";
import { cleanPhone, cleanText, escapeHtml, isEmail, isPhone, parseNumber, safeHttpsUrl, sheetSafe, unsheet } from "@/lib/sanitize";
import { safeEqual, signToken, verifyToken } from "@/lib/tokens";
import { normalizeDate, formatDate } from "@/lib/zagreb-time";
import { TOURIST } from "@/i18n/tourist";
import { PARTNER } from "@/i18n/partner";
import { guessTypeKey, TYPES, TYPE_KEYS, normalizeArea } from "@/lib/taxonomy";
import { buildDemoData } from "@/data/demo-catalog";
import { LANDLORD_ID_RE, newBookingRef, newLandlordId, BOOKING_REF_RE } from "@/lib/ids";

describe("sanitize", () => {
  it("prefixes formula-like values for Sheets and strips the prefix on read", () => {
    expect(sheetSafe("=IMPORTXML(1)")).toBe("'=IMPORTXML(1)");
    expect(sheetSafe("+385 91 123")).toBe("'+385 91 123");
    expect(sheetSafe("-5")).toBe("'-5");
    expect(sheetSafe("@sum")).toBe("'@sum");
    expect(sheetSafe("Hvar")).toBe("Hvar");
    expect(sheetSafe(42)).toBe(42);
    expect(unsheet("'+385 91 123")).toBe("+385 91 123");
  });
  it("escapes HTML", () => {
    expect(escapeHtml(`<img src=x onerror="a">&'`)).toBe("&lt;img src=x onerror=&quot;a&quot;&gt;&amp;&#39;");
  });
  it("cleans text, numbers, e-mails, phones and URLs", () => {
    expect(cleanText("  a\u0000b \n c  ", 10)).toBe("a b c");
    expect(parseNumber("12,5")).toBe(12.5);
    expect(parseNumber("1,250.50")).toBe(1250.5);
    expect(parseNumber("40 €")).toBe(40);
    expect(parseNumber("abc")).toBeNull();
    expect(isEmail("ana@primjer.hr")).toBe(true);
    expect(isEmail("ana@primjer")).toBe(false);
    expect(isEmail("a b@c.hr")).toBe(false);
    expect(cleanPhone("+385 (91) 123-4567<script>")).toBe("+385 (91) 123-4567");
    expect(isPhone("+385 91 123 4567")).toBe(true);
    expect(isPhone("123")).toBe(false);
    expect(safeHttpsUrl("javascript:alert(1)")).toBeNull();
    expect(safeHttpsUrl("http://x.hr/a.jpg")).toBeNull();
    expect(safeHttpsUrl("https://x.hr/a.jpg")).toBe("https://x.hr/a.jpg");
  });
});

describe("tokens", () => {
  it("round-trips and rejects tampering, wrong purpose and expiry", () => {
    const t = signToken("draft", { a: 1 }, 60);
    expect(verifyToken<{ a: number }>("draft", t)?.data).toEqual({ a: 1 });
    expect(verifyToken("respond", t)).toBeNull();
    const [p, s] = t.split(".");
    const forged = Buffer.from(JSON.stringify({ d: { a: 2 }, iat: 0, exp: 9_999_999_999 })).toString("base64url");
    expect(verifyToken("draft", `${forged}.${s}`)).toBeNull();
    expect(verifyToken("draft", `${p}.${s}x`)).toBeNull();
    expect(verifyToken("draft", t, Date.now() + 120_000)).toBeNull();
    expect(verifyToken("draft", 123)).toBeNull();
  });
  it("safeEqual", () => {
    expect(safeEqual("abc", "abc")).toBe(true);
    expect(safeEqual("abc", "abd")).toBe(false);
    expect(safeEqual("abc", "abcd")).toBe(false);
  });
});

describe("dates", () => {
  it("normalizes hand-typed sheet dates", () => {
    expect(normalizeDate("2026-07-15")).toBe("2026-07-15");
    expect(normalizeDate("15.7.2026.")).toBe("2026-07-15");
    expect(normalizeDate("15/07/2026")).toBe("2026-07-15");
    expect(normalizeDate("46218")).toBe("2026-07-15");
    expect(normalizeDate("2026-02-30")).toBe("");
    expect(normalizeDate("")).toBe("");
  });
  it("formats in both languages", () => {
    expect(formatDate("2026-07-15", "en")).toMatch(/15 Jul 2026/);
    expect(formatDate("2026-07-15", "hr")).toMatch(/15/);
  });
});

function keysDeep(o: unknown, prefix = ""): string[] {
  if (!o || typeof o !== "object") return [prefix];
  return Object.entries(o as Record<string, unknown>).flatMap(([k, v]) => (typeof v === "object" && v !== null ? keysDeep(v, `${prefix}${k}.`) : [`${prefix}${k}`]));
}

describe("i18n", () => {
  it("EN and HR dictionaries have the same keys", () => {
    expect(keysDeep(TOURIST.hr).sort()).toEqual(keysDeep(TOURIST.en).sort());
    expect(keysDeep(PARTNER.hr).sort()).toEqual(keysDeep(PARTNER.en).sort());
  });
});

describe("taxonomy and demo data", () => {
  it("maps legacy activity names to types", () => {
    expect(guessTypeKey("Blue Cave Tour")).toBe("speedboat_tours");
    expect(guessTypeKey("White Water Rafting")).toBe("rafting");
    expect(guessTypeKey("Wine Tasting Tours")).toBe("wine_tasting");
    expect(guessTypeKey("Boat Rental - No License")).toBe("boat_rental_no_license");
    expect(guessTypeKey("")).toBeNull();
  });
  it("demo catalogue covers every type, uses valid keys and safe e-mails", () => {
    const { operators, activities, landlords } = buildDemoData();
    const used = new Set(activities.map((a) => a.type_key));
    for (const a of activities) expect(TYPE_KEYS).toContain(a.type_key);
    for (const t of TYPES) expect(used.has(t.key), t.key).toBe(true);
    for (const o of operators) expect(o.email).toMatch(/^opsisdalmatia\+demo-/);
    expect(landlords[0].landlord_id).toMatch(LANDLORD_ID_RE);
  });
  it("normalizes areas", () => {
    expect(normalizeArea("Trogir")).toBe("trogir");
    expect(normalizeArea("Kaštel Stari")).toBe("kastela");
    expect(normalizeArea("split")).toBe("split");
    expect(normalizeArea("Zagreb")).toBeNull();
  });
  it("ids use the readable alphabet", () => {
    for (let i = 0; i < 50; i++) {
      expect(newBookingRef()).toMatch(BOOKING_REF_RE);
      expect(newLandlordId()).toMatch(LANDLORD_ID_RE);
    }
  });
});

describe("mail templates", () => {
  it("keeps the HTML part escaped and the text part readable", async () => {
    const { touristRequestReceived } = await import("@/lib/mail-templates");
    const b = {
      ref: "OPS-TEST01", activity_title: "Sea kayak & caves", operator_name: "Kayak <Split>", tourist_name: "Ana O'Brien",
      date: "2026-12-03", adults: 2, children: 0, total_eur: 90,
    } as unknown as import("@/lib/schema").Booking;
    const m = touristRequestReceived(b, "hr");
    expect(m.html).toContain("Sea kayak &amp; caves");
    expect(m.html).not.toContain("Kayak <Split>");
    expect(m.text).toContain("Aktivnost: Sea kayak & caves");
    expect(m.text).toContain("Organizator: Kayak <Split>");
    expect(m.text).toContain("Hvala, Ana O'Brien!");
    expect(m.text).not.toMatch(/&amp;|&#39;|&lt;/);
  });
});
