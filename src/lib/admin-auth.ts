import "server-only";
import { env } from "./env";
import { safeEqual } from "./tokens";

/**
 * HTTP Basic auth for /admin and /api/admin. Checked in src/proxy.ts and again
 * inside every admin handler (defence in depth). Fails closed when no
 * ADMIN_PASSWORD is configured.
 */
export function isAdminAuthorized(authorization: string | null): boolean {
  const password = env.adminPassword();
  if (!password || password.length < 12) return false;
  if (!authorization?.startsWith("Basic ")) return false;
  let decoded = "";
  try {
    decoded = Buffer.from(authorization.slice(6), "base64").toString("utf8");
  } catch {
    return false;
  }
  const i = decoded.indexOf(":");
  if (i < 0) return false;
  const user = decoded.slice(0, i);
  const pass = decoded.slice(i + 1);
  return safeEqual(user, env.adminUser()) && safeEqual(pass, password);
}

export function isCronAuthorized(authorization: string | null): boolean {
  const secret = env.cronSecret();
  if (!secret || secret.length < 16) return false;
  return safeEqual(authorization ?? "", `Bearer ${secret}`);
}
