/** Escape text for safe interpolation into HTML (e-mails, server-rendered strings). */
export function escapeHtml(input: unknown): string {
  return String(input ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Make a value safe to store in Google Sheets. Writes use valueInputOption RAW,
 * so nothing is evaluated, but values starting with = + - @ (or a tab/CR) are
 * still prefixed with an apostrophe so CSV/Excel exports can't execute them.
 */
export function sheetSafe(value: unknown): string | number {
  if (typeof value === "number") return Number.isFinite(value) ? value : "";
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
  const s = String(value ?? "");
  return /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
}

/** Undo `sheetSafe` when reading back. */
export function unsheet(value: unknown): string {
  const s = String(value ?? "");
  return s.startsWith("'") ? s.slice(1) : s;
}

/** Trim, drop control characters, collapse internal whitespace and cap length. */
export function cleanText(input: unknown, max = 200, keepNewlines = false): string {
  let s = String(input ?? "");
  s = s.replace(keepNewlines ? /[\u0000-\u0009\u000B-\u001F\u007F]/g : /[\u0000-\u001F\u007F]/g, " ");
  s = keepNewlines ? s.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n") : s.replace(/\s+/g, " ");
  return s.trim().slice(0, max);
}

export function normalizeEmail(input: unknown): string {
  return String(input ?? "").trim().toLowerCase().slice(0, 254);
}

const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[a-z]{2,}$/i;
export function isEmail(input: string): boolean {
  return EMAIL_RE.test(input) && input.length <= 254;
}

/** Keep digits, a leading +, spaces, dashes, dots, slashes and parentheses. */
export function cleanPhone(input: unknown): string {
  return String(input ?? "")
    .replace(/[^\d+\s\-./()]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 30);
}

export function isPhone(input: string): boolean {
  const digits = input.replace(/\D/g, "");
  return digits.length >= 6 && digits.length <= 16;
}

/** Only allow absolute https URLs (used for operator photo/gallery links). */
export function safeHttpsUrl(input: unknown): string | null {
  const s = String(input ?? "").trim();
  if (!s) return null;
  try {
    const u = new URL(s);
    if (u.protocol !== "https:") return null;
    if (s.length > 500) return null;
    return u.toString();
  } catch {
    return null;
  }
}

/** Parse a number written with either a decimal comma or point. */
export function parseNumber(input: unknown): number | null {
  if (typeof input === "number") return Number.isFinite(input) ? input : null;
  const s = String(input ?? "").trim().replace(/\s/g, "").replace(/[€$]|eur/gi, "");
  if (!s) return null;
  const normalized = s.includes(",") && !s.includes(".") ? s.replace(",", ".") : s.replace(/,/g, "");
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
