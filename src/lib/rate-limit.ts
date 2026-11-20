/**
 * Best-effort in-memory rate limiter (per server instance). Combined with the
 * per-conversation turn cap in the signed chat state and the Anthropic
 * workspace spend limit, this is enough for the pilot without an extra
 * database. Old entries are cleaned lazily (no timers).
 */
export interface Limit {
  name: string;
  max: number;
  windowMs: number;
}

export const LIMITS = {
  chat: { name: "chat", max: 30, windowMs: 10 * 60_000 },
  chatDaily: { name: "chat-day", max: 200, windowMs: 24 * 3600_000 },
  catalog: { name: "catalog", max: 240, windowMs: 10 * 60_000 },
  quote: { name: "quote", max: 60, windowMs: 10 * 60_000 },
  confirm: { name: "confirm", max: 8, windowMs: 60 * 60_000 },
  form: { name: "form", max: 6, windowMs: 60 * 60_000 },
  quiz: { name: "quiz", max: 12, windowMs: 60 * 60_000 },
  partner: { name: "partner", max: 30, windowMs: 60 * 60_000 },
  respond: { name: "respond", max: 30, windowMs: 60 * 60_000 },
  admin: { name: "admin", max: 60, windowMs: 10 * 60_000 },
} satisfies Record<string, Limit>;

const buckets = new Map<string, number[]>();
let lastSweep = 0;

function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [k, hits] of buckets) {
    const fresh = hits.filter((t) => now - t < 24 * 3600_000);
    if (fresh.length) buckets.set(k, fresh);
    else buckets.delete(k);
  }
}

export function rateLimit(limit: Limit, key: string, now = Date.now()): { ok: true } | { ok: false; retryAfter: number } {
  sweep(now);
  const id = `${limit.name}:${key}`;
  const hits = (buckets.get(id) ?? []).filter((t) => now - t < limit.windowMs);
  if (hits.length >= limit.max) {
    const retryAfter = Math.max(1, Math.ceil((limit.windowMs - (now - hits[0])) / 1000));
    buckets.set(id, hits);
    return { ok: false, retryAfter };
  }
  hits.push(now);
  buckets.set(id, hits);
  return { ok: true };
}

/** Tests only. */
export function __resetRateLimits() {
  buckets.clear();
}
