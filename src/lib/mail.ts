import "server-only";
import { Resend } from "resend";
import { env, type MailMode } from "./env";
import { escapeHtml, isEmail, normalizeEmail } from "./sanitize";

/**
 * Outgoing e-mail with mode-based routing (MAIL_MODE):
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

  if (mode === "log" || !env.resendKey() || routed.to.length === 0) {
    console.log("[mail:log]", { tag: msg.tag, to: routed.to, original: routed.rerouted ? original : undefined, subject });
    return { ok: true, mode: "log", to: routed.to, rerouted: routed.rerouted };
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
