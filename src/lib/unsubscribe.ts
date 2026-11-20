import "server-only";
import { COMPANY } from "@/config/company";
import { env } from "./env";
import { appendRaw, readRaw } from "./repo";
import { isEmail, normalizeEmail, unsheet } from "./sanitize";
import { signToken, verifyToken } from "./tokens";

/**
 * Unsubscribe links for B2B outreach e-mails. The token only carries the
 * (normalized) address and is valid for three years, so old e-mails keep
 * working. The page /odjava confirms with a button; /api/unsubscribe also
 * accepts RFC 8058 one-click POSTs from mail providers.
 */
const TTL_SECONDS = 3 * 365 * 86400;

function unsubToken(email: string): string {
  return signToken("unsub", { e: normalizeEmail(email) }, TTL_SECONDS);
}

/** Link for the e-mail footer ("Ne želim više primati poruke"). */
export function unsubscribeUrl(email: string): string {
  return `${env.baseUrl()}/odjava?t=${unsubToken(email)}`;
}

/** List-Unsubscribe headers (RFC 2369 + RFC 8058 one-click) for outreach e-mails. */
export function unsubscribeHeaders(email: string): Record<string, string> {
  const t = unsubToken(email);
  return {
    "List-Unsubscribe": `<${env.baseUrl()}/api/unsubscribe?t=${t}>, <mailto:${COMPANY.email}?subject=unsubscribe>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  };
}

/** The address inside a valid, unexpired unsubscribe token, or null. */
export function emailFromUnsubToken(token: unknown): string | null {
  if (typeof token !== "string" || !token || token.length > 2000) return null;
  const v = verifyToken<{ e?: unknown }>("unsub", token);
  if (!v || typeof v.data?.e !== "string") return null;
  const email = normalizeEmail(v.data.e);
  return isEmail(email) ? email : null;
}

/** "marko@primjer.hr" → "ma***@primjer.hr" (for pages and logs). */
export function maskEmail(email: string): string {
  const at = email.lastIndexOf("@");
  if (at <= 0) return "***";
  const local = email.slice(0, at);
  return `${local.slice(0, local.length <= 2 ? 1 : 2)}***@${email.slice(at + 1)}`;
}

/** True when the address is on the suppression list. Outreach must check this before sending. */
export async function isSuppressed(email: string): Promise<boolean> {
  const target = normalizeEmail(email);
  const rows = await readRaw("suppression");
  return rows.some((r) => normalizeEmail(unsheet(r.email)) === target);
}

/** Add the address to the suppression list unless it is already there. */
export async function suppressEmail(email: string, reason = "unsubscribe"): Promise<{ already: boolean }> {
  const e = normalizeEmail(email);
  if (await isSuppressed(e)) return { already: true };
  await appendRaw("suppression", { email: e, reason, created_at: new Date().toISOString() });
  return { already: false };
}
