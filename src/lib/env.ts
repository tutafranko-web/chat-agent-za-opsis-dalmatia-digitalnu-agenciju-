import "server-only";

/**
 * Central, lazily-read server configuration. Nothing here throws at import
 * time, so `next build` works without secrets; callers that need a value use
 * the `require*` helpers and get a clear error.
 */

function str(name: string, fallback = ""): string {
  const v = process.env[name];
  return v === undefined || v === null ? fallback : String(v).trim();
}

function bool(name: string, fallback: boolean): boolean {
  const v = str(name);
  if (!v) return fallback;
  return ["1", "true", "yes", "on"].includes(v.toLowerCase());
}

function num(name: string, fallback: number): number {
  const v = Number(str(name));
  return Number.isFinite(v) && str(name) !== "" ? v : fallback;
}

function list(name: string): string[] {
  return str(name)
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export type MailMode = "log" | "sandbox" | "trial" | "live";

export const env = {
  isProd: () => process.env.NODE_ENV === "production",
  vercelEnv: () => str("VERCEL_ENV", "development"),

  // ── Claude ──────────────────────────────────────────────────────────────
  claudeModel: () => str("CLAUDE_MODEL", "claude-sonnet-5-5"),
  hasAnthropicKey: () => !!str("ANTHROPIC_API_KEY") || !!str("ANTHROPIC_AUTH_TOKEN"),
  chatEnabled: () => bool("CHAT_ENABLED", true),
  chatMaxTurns: () => num("CHAT_MAX_TURNS", 20),

  // ── Storage ─────────────────────────────────────────────────────────────
  sheetId: () => str("SHEET_ID"),
  serviceAccountJson: () => str("GOOGLE_SERVICE_ACCOUNT_JSON"),
  /**
   * "sheets" in production; "memory" (demo seed, not persisted) for local
   * dev/tests. Production never silently falls back to memory: it needs an
   * explicit STORE=memory (e.g. a throwaway preview), otherwise it uses Sheets
   * and fails loudly if credentials are missing.
   */
  store: (): "sheets" | "memory" => {
    const explicit = str("STORE");
    if (explicit === "memory" || explicit === "sheets") return explicit;
    if (process.env.NODE_ENV === "production") return "sheets";
    return str("GOOGLE_SERVICE_ACCOUNT_JSON") && str("SHEET_ID") ? "sheets" : "memory";
  },

  // ── Mail ────────────────────────────────────────────────────────────────
  resendKey: () => str("RESEND_API_KEY"),
  mailMode: (): MailMode => {
    const m = str("MAIL_MODE", "log").toLowerCase();
    return (["log", "sandbox", "trial", "live"].includes(m) ? m : "log") as MailMode;
  },
  mailFrom: () => str("MAIL_FROM", "Opsis Dalmatia <concierge@send.opsisdalmatia.com>"),
  mailReplyTo: () => str("MAIL_REPLY_TO", "opsisdalmatia@gmail.com"),
  /** Resend only delivers to the account owner's address until the domain is verified. */
  sandboxTo: () => str("SANDBOX_TO"),
  adminEmails: () => list("ADMIN_EMAIL").length ? list("ADMIN_EMAIL") : ["opsisdalmatia@gmail.com"],
  /** Partner addresses (or @domains) that may receive partner mail while in trial mode. */
  mailAllowlist: () => list("MAIL_ALLOWLIST"),

  // ── URLs & secrets ──────────────────────────────────────────────────────
  baseUrl: () => str("PUBLIC_BASE_URL", "http://localhost:3000").replace(/\/+$/, ""),
  sessionSecret: () => str("SESSION_SECRET"),
  cronSecret: () => str("CRON_SECRET"),
  adminUser: () => str("ADMIN_USER", "admin"),
  adminPassword: () => str("ADMIN_PASSWORD"),

  // ── Business settings ───────────────────────────────────────────────────
  /** Landlord's share of Opsis' commission, in percent. Empty = not shown (pilot). */
  landlordSharePct: (): number | null => {
    const v = str("LANDLORD_SHARE_PCT");
    if (!v) return null;
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 && n <= 100 ? n : null;
  },
  /** Pilot mode: shows the "Pilot" badge and lists demo offers. */
  pilot: () => bool("PILOT_MODE", true),
  showDemoOffers: () => bool("SHOW_DEMO_OFFERS", true),

  /** Test/dev clock override. Ignored in production. */
  fakeNow: () => (process.env.NODE_ENV === "production" ? "" : str("FAKE_NOW")),
};

export function requireSecret(): string {
  const s = env.sessionSecret();
  if (s.length >= 32) return s;
  if (!env.isProd()) return "dev-only-insecure-session-secret-change-me-0123456789";
  throw new Error("SESSION_SECRET is missing or shorter than 32 characters");
}
