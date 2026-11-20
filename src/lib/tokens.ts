import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { requireSecret } from "./env";

/**
 * Small signed-token helper (HMAC-SHA256). Each purpose gets its own derived
 * key, so a token minted for one purpose can never be replayed as another.
 * Tokens are signed, not encrypted: never put secrets (commission, e-mails)
 * inside them.
 */
export type TokenPurpose =
  | "chat"
  | "attr"
  | "draft"
  | "respond"
  | "approve"
  | "manage"
  | "form"
  | "unsub";

interface Envelope<T> {
  d: T;
  iat: number;
  exp: number;
}

function b64url(buf: Buffer | string): string {
  return Buffer.from(buf).toString("base64url");
}

function keyFor(purpose: TokenPurpose): Buffer {
  return createHmac("sha256", requireSecret()).update(`opsis:v1:${purpose}`).digest();
}

function mac(purpose: TokenPurpose, payload: string): string {
  return createHmac("sha256", keyFor(purpose)).update(payload).digest("base64url");
}

export function signToken<T>(purpose: TokenPurpose, data: T, ttlSeconds: number, nowMs = Date.now()): string {
  const iat = Math.floor(nowMs / 1000);
  const env: Envelope<T> = { d: data, iat, exp: iat + Math.max(1, Math.floor(ttlSeconds)) };
  const payload = b64url(JSON.stringify(env));
  return `${payload}.${mac(purpose, payload)}`;
}

export interface VerifiedToken<T> {
  data: T;
  iat: number;
  exp: number;
}

export function verifyToken<T>(purpose: TokenPurpose, token: unknown, nowMs = Date.now()): VerifiedToken<T> | null {
  if (typeof token !== "string" || token.length > 600_000) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = mac(purpose, payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const env = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Envelope<T>;
    if (typeof env.exp !== "number" || env.exp * 1000 < nowMs) return null;
    return { data: env.d, iat: env.iat, exp: env.exp };
  } catch {
    return null;
  }
}

/** Constant-time string comparison for secrets (admin password, cron secret). */
export function safeEqual(a: string, b: string): boolean {
  const ha = createHmac("sha256", "opsis-compare").update(a).digest();
  const hb = createHmac("sha256", "opsis-compare").update(b).digest();
  return timingSafeEqual(ha, hb) && a.length === b.length;
}
