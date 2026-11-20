/**
 * Deterministic quiz scoring (pure, unit-tested): answers → ranked activity
 * types. Hard filters (things to avoid, kids) remove types; soft signals add
 * or subtract points. Budget is applied against the real offers' prices.
 */
import { QUIZ, type QuizAnswers } from "./quiz-data";
import { TYPES, type ActivityType } from "./taxonomy";

export function normalizeAnswers(raw: unknown): QuizAnswers {
  const out: QuizAnswers = {};
  if (!raw || typeof raw !== "object") return out;
  const r = raw as Record<string, unknown>;
  for (const q of QUIZ) {
    const valid = new Set(q.options.map((x) => x.key));
    const v = r[q.id];
    if (q.multi) {
      const arr = (Array.isArray(v) ? v : typeof v === "string" ? [v] : []).filter((x): x is string => typeof x === "string" && valid.has(x));
      let uniq = [...new Set(arr)];
      if (q.multi.exclusive && uniq.includes(q.multi.exclusive)) uniq = [q.multi.exclusive];
      if (uniq.length) out[q.id] = uniq.slice(0, q.multi.max);
    } else if (typeof v === "string" && valid.has(v)) {
      out[q.id] = v;
    }
  }
  return out;
}

const one = (a: QuizAnswers, k: keyof QuizAnswers) => (typeof a[k] === "string" ? (a[k] as string) : undefined);
const many = (a: QuizAnswers, k: keyof QuizAnswers) => (Array.isArray(a[k]) ? (a[k] as string[]) : []);

export const BUDGET_MAX: Record<string, number> = { b1: 30, b2: 80, b3: 150, b4: Infinity };

export function scoreType(t: ActivityType, a: QuizAnswers): number {
  if (t.utility) return -1000;
  const avoid = many(a, "avoid");
  if (avoid.includes("water") && t.water) return -1000;
  if (avoid.includes("heights") && t.heights) return -1000;
  if (avoid.includes("speed") && t.speed) return -1000;
  if (one(a, "group") === "family" && !t.kids) return -1000;

  let s = 0;
  for (const i of many(a, "interests")) if ((t.interests as string[]).includes(i)) s += 3;
  const ideal = one(a, "ideal");
  if (ideal && (t.ideals as string[]).includes(ideal)) s += 3;

  switch (one(a, "comfort")) {
    case "dry":
      if (t.water) s -= 3;
      if (t.intensity >= 2) s -= 4;
      break;
    case "moderate":
      if (t.intensity === 3) s -= 2;
      break;
    case "full":
      if (t.intensity >= 2) s += 2;
      if (t.intensity === 0) s -= 1;
      break;
  }
  switch (one(a, "fitness")) {
    case "relaxed":
      if (t.intensity === 3) s -= 3;
      else if (t.intensity === 2) s -= 1;
      break;
    case "athletic":
      if (t.intensity >= 2) s += 1;
      break;
  }
  switch (one(a, "group")) {
    case "friends":
      if (t.intensity >= 1 || (t.interests as string[]).includes("nightlife")) s += 1;
      break;
    case "couple":
      if ((t.interests as string[]).some((x) => x === "relax" || x === "food_wine")) s += 1;
      break;
    case "family":
      if (t.intensity <= 1) s += 1;
      break;
  }
  switch (one(a, "time")) {
    case "evening":
      if (t.evening) s += 2;
      break;
    case "morning":
      if (t.morning) s += 1;
      if (t.evening) s -= 1;
      break;
    case "afternoon":
      if (t.evening) s -= 1;
      break;
  }
  return s;
}

export interface ScoredType {
  key: string;
  score: number;
}

/**
 * Rank types. `minPriceByType` = cheapest adult price among live offers of
 * each type; types without offers are skipped. Budget lowers the score of
 * types whose cheapest offer exceeds it (and drops ones far above it).
 */
export function rankTypes(a: QuizAnswers, minPriceByType: Record<string, number>, limit = 5): ScoredType[] {
  const budget = BUDGET_MAX[one(a, "budget") ?? "b4"] ?? Infinity;
  const out: ScoredType[] = [];
  for (const t of TYPES) {
    const min = minPriceByType[t.key];
    if (min === undefined) continue;
    let s = scoreType(t, a);
    if (s <= -100) continue;
    if (Number.isFinite(budget) && min > budget) {
      if (min > budget * 2) continue;
      s -= 3;
    }
    out.push({ key: t.key, score: s });
  }
  return out.sort((x, y) => y.score - x.score || x.key.localeCompare(y.key)).slice(0, limit);
}
