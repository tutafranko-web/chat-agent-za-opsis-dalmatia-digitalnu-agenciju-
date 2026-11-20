import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { Resend } from "resend";
import { env, type MailMode } from "./env";
import { escapeHtml, isEmail, normalizeEmail } from "./sanitize";

/**
 * Outgoing e-mail. Transport: SMTP when SMTP_USER/SMTP_PASS are set (Gmail
 * with an app password works out of the box, no DNS needed), otherwise Resend.
 *
 * Mode-based routing (MAIL_MODE):
 *  - log:     nothing is sent; a one-line summary goes to the server log.
 *  - sandbox: everything goes to SANDBOX_TO (Resend delivers only to the
 *             account owner until the sending domain is verified).
 *  - trial:   people who asked for the mail (tourists, registrants) get it;
 *             partner notifications (operators, landlords) go to the admin
 *             inbox with a [PROBA] banner, unless the partner is allowlisted.
 *  - live:    normal delivery; demo plus-addresses still go to the admin.
 */
export type Audience = "requester" | "partner" | "admin";

export interface MailMessage {
  to: string | string[];
  audience: Audience;
  subject: string;
  html: string;
  text: string;
  tag: string;
  attachments?: { filename: string; content: Buffer }[];
  idempotencyKey?: string;
  headers?: Record<string, string>;
}

export interface MailResult {
  ok: boolean;
  mode: MailMode;
  to: string[];
  rerouted: boolean;
  id?: string;
  error?: string;
}

function allowlisted(addr: string): boolean {
  const list = env.mailAllowlist();
  const a = addr.toLowerCase();
  return list.some((x) => (x.startsWith("@") ? a.endsWith(x) : a === x));
}

function isDemoAddress(addr: string): boolean {
  return /\+demo-/i.test(addr);
}

export function routeRecipients(
  mode: MailMode,
  audience: Audience,
  to: string[],
): { to: string[]; rerouted: boolean } {
  const admins = env.adminEmails();
  if (audience === "admin") return { to: admins, rerouted: false };
  if (mode === "sandbox") {
    const sb = env.sandboxTo();
    return { to: sb ? [sb] : [], rerouted: true };
  }
  if (audience === "partner") {
    const blocked = to.filter((t) => isDemoAddress(t) || (mode === "trial" && !allowlisted(t)));
    if (blocked.length) return { to: admins, rerouted: true };
  }
  return { to, rerouted: false };
}

function banner(original: string[]): string {
  return `<div style="background:#F2994A;color:#14232B;padding:10px 14px;border-radius:8px;font:600 13px/1.4 Arial,sans-serif;margin:0 0 16px">[PROBA] Ova poruka bi u pravom radu išla na: ${escapeHtml(original.join(", "))}</div>`;
}

let resend: Resend | null = null;
let smtp: Transporter | null = null;

/** Gmail (and most SMTP hosts) only send as the signed-in address, so keep the display name and swap the address. */
export function smtpFrom(mailFrom: string, user: string): string {
  const addr = mailFrom.match(/<([^>]+)>/)?.[1] ?? (isEmail(mailFrom) ? mailFrom : "");
  if (addr.toLowerCase() === user.toLowerCase()) return mailFrom;
  const name = mailFrom.replace(/<[^>]*>/, "").replace(/"/g, "").trim() || "Opsis Dalmatia";
  return `${name} <${user}>`;
}

// SMTP has no idempotency keys; remember recent keys per server instance so a retried request doesn't send twice.
const recentKeys = new Map<string, number>();
function seenRecently(key: string | undefined): boolean {
  if (!key) return false;
  const now = Date.now();
  for (const [k, t] of recentKeys) if (now - t > 24 * 3600_000) recentKeys.delete(k);
  if (recentKeys.has(key)) return true;
  recentKeys.set(key, now);
  return false;
}

async function sendViaSmtp(msg: MailMessage, to: string[], subject: string, html: string): Promise<{ id?: string }> {
  const cfg = env.smtp();
  if (!cfg) throw new Error("SMTP not configured");
  smtp ??= nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: { user: cfg.user, pass: cfg.pass },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
  const info = await smtp.sendMail({
    from: smtpFrom(env.mailFrom(), cfg.user),
    to,
    replyTo: env.mailReplyTo(),
    subject,
    html,
    text: msg.text,
    headers: msg.headers,
    attachments: msg.attachments?.map((a) => ({ filename: a.filename, content: a.content })),
  });
  return { id: info.messageId };
}

/** Health check: log in to the SMTP server without sending anything. */
export async function verifySmtp(): Promise<{ ok: boolean; detail: string }> {
  const cfg = env.smtp();
  if (!cfg) return { ok: false, detail: "SMTP_USER / SMTP_PASS missing" };
  try {
    const t = nodemailer.createTransport({ host: cfg.host, port: cfg.port, secure: cfg.secure, auth: { user: cfg.user, pass: cfg.pass }, connectionTimeout: 8000, greetingTimeout: 8000 });
    await t.verify();
    t.close();
    return { ok: true, detail: `${cfg.user} via ${cfg.host} (login OK)` };
  } catch (err) {
    return { ok: false, detail: `${cfg.user} via ${cfg.host}: ${(err as Error).message.slice(0, 140)}` };
  }
}

export async function sendMail(msg: MailMessage): Promise<MailResult> {
  const mode = env.mailMode();
  const original = (Array.isArray(msg.to) ? msg.to : [msg.to]).map(normalizeEmail).filter(isEmail);
  if (!original.length && msg.audience !== "admin") {
    return { ok: false, mode, to: [], rerouted: false, error: "no valid recipient" };
  }
  const routed = routeRecipients(mode, msg.audience, original);
  const subjectPrefix = routed.rerouted ? (mode === "sandbox" ? "[SANDBOX] " : "[PROBA] ") : "";
  const html = routed.rerouted && msg.audience !== "admin" ? msg.html.replace("<!--BANNER-->", banner(original)) : msg.html;
  const subject = subjectPrefix + msg.subject;
  const transport = env.mailTransport();

  if (mode === "log" || transport === "none" || routed.to.length === 0) {
    console.log("[mail:log]", { tag: msg.tag, to: routed.to, original: routed.rerouted ? original : undefined, subject });
    return { ok: true, mode: "log", to: routed.to, rerouted: routed.rerouted };
  }

  if (transport === "smtp") {
    if (seenRecently(msg.idempotencyKey)) return { ok: true, mode, to: routed.to, rerouted: routed.rerouted };
    try {
      const { id } = await sendViaSmtp(msg, routed.to, subject, html);
      return { ok: true, mode, to: routed.to, rerouted: routed.rerouted, id };
    } catch (err) {
      if (msg.idempotencyKey) recentKeys.delete(msg.idempotencyKey);
      smtp = null; // reconnect next time
      console.error("[mail] smtp send failed", msg.tag, (err as Error).message);
      return { ok: false, mode, to: routed.to, rerouted: routed.rerouted, error: (err as Error).message };
    }
  }

  try {
    resend ??= new Resend(env.resendKey());
    const { data, error } = await resend.emails.send(
      {
        from: env.mailFrom(),
        to: routed.to,
        replyTo: env.mailReplyTo(),
        subject,
        html,
        text: msg.text,
        headers: msg.headers,
        tags: [{ name: "type", value: msg.tag.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 40) }],
        attachments: msg.attachments?.map((a) => ({ filename: a.filename, content: a.content })),
      },
      msg.idempotencyKey ? { idempotencyKey: msg.idempotencyKey.slice(0, 256) } : undefined,
    );
    if (error) {
      console.error("[mail] send failed", msg.tag, error.name, error.message);
      return { ok: false, mode, to: routed.to, rerouted: routed.rerouted, error: error.message };
    }
    return { ok: true, mode, to: routed.to, rerouted: routed.rerouted, id: data?.id };
  } catch (err) {
    console.error("[mail] send threw", msg.tag, (err as Error).message);
    return { ok: false, mode, to: routed.to, rerouted: routed.rerouted, error: (err as Error).message };
  }
}
