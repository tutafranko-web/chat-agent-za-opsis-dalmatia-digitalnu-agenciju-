import "server-only";
import { env } from "./env";
import { sendMail } from "./mail";
import { outreachLandlord, outreachOperator } from "./mail-templates";
import { appendRaw, logEvent, readRaw } from "./repo";
import { isEmail, normalizeEmail, unsheet } from "./sanitize";
import { unsubscribeHeaders, unsubscribeUrl } from "./unsubscribe";

/**
 * Admin-triggered B2B outreach to the "Leadovi" tab (email, name, company,
 * type operator|landlord, …). Skips suppressed/unsubscribed and already
 * contacted addresses. Every mail carries sender identity and one-click
 * unsubscribe. In pilot/trial mail mode, partner mail is routed to the admin.
 */
export type Audience = "operator" | "landlord";

export interface Lead {
  email: string;
  name: string;
  company: string;
}

export async function outreachCandidates(audience: Audience, limit: number): Promise<{ leads: Lead[]; totalEligible: number }> {
  const [leads, suppressed, sent] = await Promise.all([readRaw("leads"), readRaw("suppression"), readRaw("outreachSent")]);
  const blocked = new Set([...suppressed, ...sent].map((r) => normalizeEmail(unsheet(r.email))));
  const eligible: Lead[] = [];
  const seen = new Set<string>();
  for (const r of leads) {
    const email = normalizeEmail(unsheet(r.email));
    const type = unsheet(r.type).toLowerCase();
    const status = unsheet(r.status).toLowerCase();
    if (!isEmail(email) || seen.has(email) || blocked.has(email)) continue;
    if (type && type !== audience) continue;
    if (["unsubscribed", "bounced", "registered", "do_not_contact"].includes(status) || status.startsWith("contacted")) continue;
    seen.add(email);
    eligible.push({ email, name: unsheet(r.name), company: unsheet(r.company) });
  }
  return { leads: eligible.slice(0, Math.max(1, Math.min(20, limit))), totalEligible: eligible.length };
}

export async function sendOutreach(audience: Audience, limit: number): Promise<{ sent: number; failed: number; reroutedToAdmin: boolean }> {
  const { leads } = await outreachCandidates(audience, limit);
  const base = env.baseUrl();
  let sent = 0;
  let failed = 0;
  let rerouted = false;
  for (const l of leads) {
    const mail =
      audience === "operator"
        ? outreachOperator(l.name, l.company, `${base}/partneri/organizatori`, unsubscribeUrl(l.email))
        : outreachLandlord(l.name, l.company, `${base}/partneri/iznajmljivaci`, unsubscribeUrl(l.email));
    const res = await sendMail({ to: l.email, audience: "partner", tag: `outreach_${audience}`, headers: unsubscribeHeaders(l.email), idempotencyKey: `outreach-${audience}-${l.email}`, ...mail });
    rerouted ||= res.rerouted;
    if (res.ok) {
      sent++;
      await appendRaw("outreachSent", { sent_at: new Date().toISOString(), email: l.email, name: l.name, type: audience, status: res.rerouted ? "rerouted_to_admin" : "sent", message_id: res.id ?? "" });
    } else failed++;
  }
  await logEvent("info", "outreach", audience, `${sent} sent, ${failed} failed${rerouted ? ", rerouted to admin (pilot)" : ""}`);
  return { sent, failed, reroutedToAdmin: rerouted };
}
