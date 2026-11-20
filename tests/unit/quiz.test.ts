import { describe, expect, it } from "vitest";
import { normalizeAnswers, rankTypes, scoreType } from "@/lib/quiz-scoring";
import { getType, TYPES } from "@/lib/taxonomy";

const allPrices = Object.fromEntries(TYPES.map((t) => [t.key, 50]));

describe("quiz scoring", () => {
  it("normalizes answers and enforces the exclusive 'none'", () => {
    const a = normalizeAnswers({ ideal: "adventure", interests: ["adrenaline", "boat_islands", "x", "history", "nightlife"], avoid: ["water", "none"], budget: "zzz" });
    expect(a.ideal).toBe("adventure");
    expect(a.interests).toEqual(["adrenaline", "boat_islands", "history"]);
    expect(a.avoid).toEqual(["none"]);
    expect(a.budget).toBeUndefined();
  });
  it("hard filters: avoid water / heights, families, utilities", () => {
    expect(scoreType(getType("sea_kayaking")!, { avoid: ["water"] })).toBeLessThan(-100);
    expect(scoreType(getType("zipline")!, { avoid: ["heights"] })).toBeLessThan(-100);
    expect(scoreType(getType("pub_crawl")!, { group: "family" })).toBeLessThan(-100);
    expect(scoreType(getType("car_rental")!, {})).toBeLessThan(-100);
  });
  it("an adrenaline profile ranks adrenaline above relaxing options", () => {
    const ranked = rankTypes({ ideal: "adventure", comfort: "full", fitness: "athletic", interests: ["adrenaline"] }, allPrices, 5).map((r) => r.key);
    expect(ranked.length).toBe(5);
    expect(ranked.some((k) => ["canyoning", "rafting", "zipline", "bungee", "skydiving"].includes(k))).toBe(true);
    expect(ranked).not.toContain("open_air_cinema");
  });
  it("a relaxed family profile avoids extreme activities", () => {
    const ranked = rankTypes({ ideal: "relax_sea", comfort: "dry", group: "family", fitness: "relaxed", interests: ["boat_islands", "relax"] }, allPrices, 5).map((r) => r.key);
    for (const k of ranked) {
      const t = getType(k)!;
      expect(t.kids).toBe(true);
      expect(t.intensity).toBeLessThan(3);
    }
  });
  it("budget drops types far above it and skips types without offers", () => {
    const prices = { ...allPrices, skydiving: 290, canyoning: 75 };
    const ranked = rankTypes({ ideal: "adventure", comfort: "full", budget: "b1", interests: ["adrenaline"] }, prices, 10).map((r) => r.key);
    expect(ranked).not.toContain("skydiving");
    const sparse = rankTypes({ ideal: "adventure" }, { rafting: 50 }, 5).map((r) => r.key);
    expect(sparse).toEqual(["rafting"]);
  });
});
