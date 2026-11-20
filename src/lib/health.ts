import "server-only";
import { Resend } from "resend";
import { anthropic, model } from "./claude";
import { getOffers } from "./catalog";
import { env } from "./env";
import { TABS } from "./schema";
import { inspectSpreadsheet, serviceAccountEmail } from "./sheets";
import { store } from "./store";

export interface Check {
  name: string;
  ok: boolean;
  detail: string;
}

/** Runtime self-check shown on /admin and returned by /api/admin/health. */
export async function healthChecks(): Promise<Check[]> {
  const checks: Check[] = [];
  const add = (name: string, ok: boolean, detail: string) => checks.push({ name, ok, detail });

  add("SESSION_SECRET", env.sessionSecret().length >= 32, env.sessionSecret().length >= 32 ? "set" : "missing or < 32 chars");
  add("CRON_SECRET", env.cronSecret().length >= 16, env.cronSecret() ? "set" : "missing");
  add("ADMIN_PASSWORD", env.adminPassword().length >= 12, env.adminPassword() ? "set" : "missing");
  add("PUBLIC_BASE_URL", env.baseUrl().startsWith("https://") || !env.isProd(), env.baseUrl());
  add("Pilot mode", true, env.pilot() ? "on (Pilot badge, demo offers listed)" : "off");

  // Storage
  add("Storage", store().kind === "sheets" || !env.isProd(), store().kind === "sheets" ? `Google Sheets (${serviceAccountEmail() ?? "?"})` : "in-memory demo data (not persisted!)");
  if (store().kind === "sheets") {
    try {
      const info = await inspectSpreadsheet();
      const missing = Object.values(TABS).filter((t) => !(t.name in info.tabs)).map((t) => t.name);
      const badHeaders = Object.values(TABS)
        .filter((t) => t.name in info.tabs && t.headers.some((h) => !info.tabs[t.name].includes(h)))
        .map((t) => t.name);
      add("Spreadsheet", !missing.length && !badHeaders.length, `"${info.title}"${missing.length ? ` · missing tabs: ${missing.join(", ")}` : ""}${badHeaders.length ? ` · header mismatch: ${badHeaders.join(", ")}` : ""}`);
    } catch (err) {
      add("Spreadsheet", false, (err as Error).message.slice(0, 160));
    }
  }
  try {
    const offers = await getOffers(true);
    const real = offers.filter((o) => !o.demo).length;
    add("Catalogue", offers.length > 0, `${offers.length} offers listed (${real} real, ${offers.length - real} demo)`);
  } catch (err) {
    add("Catalogue", false, (err as Error).message.slice(0, 160));
  }

  // Claude
  if (!env.hasAnthropicKey()) add("Claude API", false, "ANTHROPIC_API_KEY missing");
  else {
    try {
      const r = await anthropic().messages.countTokens({ model: model(), messages: [{ role: "user", content: "ping" }] });
      add("Claude API", true, `${model()} reachable (count_tokens ${r.input_tokens})`);
    } catch (err) {
      add("Claude API", false, `${model()}: ${(err as Error).message.slice(0, 160)}`);
    }
  }
  add("Chat", env.chatEnabled(), env.chatEnabled() ? `enabled, ${env.chatMaxTurns()} AI messages per chat` : "CHAT_ENABLED=false");

  // Mail
  const mode = env.mailMode();
  if (!env.resendKey()) add("E-mail", mode === "log", `RESEND_API_KEY missing (mode ${mode})`);
  else {
    try {
      const resend = new Resend(env.resendKey());
      const { data, error } = await resend.domains.list();
      if (error) throw new Error(error.message);
      const from = env.mailFrom().match(/@([^>\s]+)/)?.[1] ?? "";
      const dom = data?.data?.find((d) => d.name === from);
      const verified = dom?.status === "verified";
      const okMode = mode === "sandbox" ? !!env.sandboxTo() : mode === "log" ? true : verified;
      add("E-mail", okMode, `mode ${mode} · sender domain ${from || "?"}: ${dom ? dom.status : "not added in Resend"}${mode === "sandbox" ? ` · sandbox to ${env.sandboxTo() || "(SANDBOX_TO missing)"}` : ""}`);
    } catch (err) {
      add("E-mail", false, `Resend: ${(err as Error).message.slice(0, 160)}`);
    }
  }
  add("Admin e-mail", env.adminEmails().length > 0, env.adminEmails().join(", "));
  return checks;
}
