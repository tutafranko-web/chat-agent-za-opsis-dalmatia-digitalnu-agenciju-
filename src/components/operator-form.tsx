"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { PARTNER } from "@/i18n/partner";
import { getJson, postJson } from "@/lib/client";
import { CATEGORIES, typesInCategory } from "@/lib/taxonomy";
import type { Lang } from "@/lib/types";
import { Field, PartnerShell } from "./partner-shell";

const EMPTY_ACT = { type_key: "", title: "", description: "", duration: "", meeting_point: "", price_adult: "", price_child: "", commission_pct: "15" };
type Act = typeof EMPTY_ACT;
const EMPTY = { company: "", contact_person: "", email: "", phone: "", city: "", website: "", address: "", business_model: "direct", max_per_day: "", notes: "", consent: false, website_url: "" };

export function OperatorForm({ initialLang }: { initialLang: Lang }) {
  const [lang, setLang] = useState<Lang>(initialLang);
  const d = PARTNER[lang];
  const O = d.operator;
  const [f, setF] = useState(EMPTY);
  const [acts, setActs] = useState<Act[]>([{ ...EMPTY_ACT }]);
  const [ft, setFt] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [badField, setBadField] = useState("");
  const [done, setDone] = useState<string | null>(null);

  useEffect(() => {
    getJson<{ ft: string }>("/api/form-token").then((r) => setFt((r.data as unknown as { ft?: string })?.ft ?? ""));
  }, []);

  const setAct = (i: number, k: keyof Act, v: string) => setActs(acts.map((a, j) => (j === i ? { ...a, [k]: v } : a)));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setBadField("");
    if (!f.consent) {
      setBadField("consent");
      setErr(d.errors.validation);
      return;
    }
    setBusy(true);
    const res = await postJson<{ operator_id: string; field?: string }>("/api/operator/register", {
      ...f,
      max_per_day: f.max_per_day || null,
      activities: acts.map((a) => ({ ...a, price_child: a.price_child === "" ? null : a.price_child })),
      ft,
      lang,
    });
    setBusy(false);
    if (res.data?.ok) {
      setDone(f.email);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const code = res.data?.code ?? "generic";
    if (code === "validation") setBadField(res.data?.field ?? "");
    setErr(code === "try_again" ? d.errors.try_again : code === "rate_limited" || res.status === 429 ? d.errors.rate_limited : code === "validation" ? d.errors.validation : d.errors.generic);
  }

  const bad = (k: string) => badField === k;
  const text = (k: keyof typeof EMPTY, type = "text", ac?: string, optional = false, extra: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <Field id={`op-${k}`} label={(O as unknown as Record<string, string>)[k]} errorText={bad(k) ? d.errors.validation : undefined} optional={optional} optionalLabel={d.optional}>
      <input id={`op-${k}`} type={type} autoComplete={ac} className="light-field" value={f[k] as string} onChange={(e) => setF({ ...f, [k]: e.target.value })} aria-invalid={bad(k)} {...extra} />
    </Field>
  );

  return (
    <PartnerShell lang={lang} d={d} onSwitch={() => setLang(lang === "hr" ? "en" : "hr")} eyebrow={O.eyebrow} title={O.title} lead={O.lead} points={O.points} image="/activities/rafting.jpg">
      {done ? (
        <section aria-live="polite">
          <h2 className="font-display text-[28px] font-semibold">{O.doneTitle}</h2>
          <p className="mt-2 text-[16px] leading-relaxed text-body">{O.doneText(done)}</p>
        </section>
      ) : (
        <form className="space-y-6" onSubmit={submit} noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            {text("company", "text", "organization")}
            {text("contact_person", "text", "name")}
            {text("email", "email", "email", false, { inputMode: "email" })}
            {text("phone", "tel", "tel", false, { inputMode: "tel" })}
            {text("city", "text", "address-level2")}
            {text("website", "url", "url", true)}
            {text("address", "text", "street-address", true)}
            {text("max_per_day", "number", "off", true, { inputMode: "numeric", min: 1 })}
          </div>
          <Field id="op-model" label={O.business_model}>
            <select id="op-model" className="light-field" value={f.business_model} onChange={(e) => setF({ ...f, business_model: e.target.value })}>
              {Object.entries(O.models).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </Field>

          <fieldset className="space-y-4">
            <legend className="font-display text-[22px] font-semibold">{O.activitiesTitle}</legend>
            {acts.map((a, i) => (
              <div key={i} className="space-y-3 rounded-2xl border border-sand bg-white p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{O.activity(i + 1)}</p>
                  {acts.length > 1 && (
                    <button type="button" className="inline-flex items-center gap-1 text-[13px] text-danger" onClick={() => setActs(acts.filter((_, j) => j !== i))}>
                      <Trash2 className="size-4" aria-hidden /> {O.removeActivity}
                    </button>
                  )}
                </div>
                <Field id={`act-${i}-type`} label={O.type_key} errorText={bad(`activities.${i}.type_key`) ? d.errors.validation : undefined}>
                  <select id={`act-${i}-type`} className="light-field" value={a.type_key} onChange={(e) => setAct(i, "type_key", e.target.value)} aria-invalid={bad(`activities.${i}.type_key`)}>
                    <option value="">{O.chooseType}</option>
                    {CATEGORIES.map((c) => (
                      <optgroup key={c.key} label={c.label[lang]}>
                        {typesInCategory(c.key).map((t) => <option key={t.key} value={t.key}>{t.label[lang]}</option>)}
                      </optgroup>
                    ))}
                  </select>
                </Field>
                {(
                  [
                    ["title", O.title_f, "text", false],
                    ["description", O.description, "text", true],
                    ["duration", O.duration, "text", true],
                    ["meeting_point", O.meeting_point, "text", true],
                    ["price_adult", O.price_adult, "number", false],
                    ["price_child", O.price_child, "number", true],
                    ["commission_pct", O.commission_pct, "number", false],
                  ] as const
                ).map(([k, label, type, optional]) => (
                  <Field key={k} id={`act-${i}-${k}`} label={label} optional={optional} optionalLabel={d.optional} errorText={bad(`activities.${i}.${k}`) ? d.errors.validation : undefined}>
                    {k === "description" ? (
                      <textarea id={`act-${i}-${k}`} rows={2} className="light-field resize-none" value={a[k]} onChange={(e) => setAct(i, k, e.target.value)} maxLength={600} />
                    ) : (
                      <input
                        id={`act-${i}-${k}`} type={type} className="light-field" value={a[k]} onChange={(e) => setAct(i, k, e.target.value)}
                        aria-invalid={bad(`activities.${i}.${k}`)} inputMode={type === "number" ? "decimal" : undefined}
                        {...(k === "commission_pct" ? { min: 5, max: 50 } : {})}
                      />
                    )}
                  </Field>
                ))}
              </div>
            ))}
            {acts.length < 8 && (
              <button type="button" className="inline-flex items-center gap-2 rounded-xl border border-sand bg-white px-4 py-2.5 text-[15px] font-semibold" onClick={() => setActs([...acts, { ...EMPTY_ACT }])}>
                <Plus className="size-4" aria-hidden /> {O.addActivity}
              </button>
            )}
          </fieldset>

          <Field id="op-notes" label={O.notes} optional optionalLabel={d.optional}>
            <textarea id="op-notes" rows={3} className="light-field resize-none" value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} maxLength={600} />
          </Field>
          <input type="text" name="website_url" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" value={f.website_url} onChange={(e) => setF({ ...f, website_url: e.target.value })} />
          <label className={`flex items-start gap-3 text-[14px] leading-relaxed ${bad("consent") ? "text-danger" : "text-body"}`}>
            <input type="checkbox" className="mt-0.5 size-5 shrink-0 accent-[#0b6e6d]" checked={f.consent} onChange={(e) => setF({ ...f, consent: e.target.checked })} />
            <span>
              {d.consent} <Link href={`/uvjeti?lang=${lang}`} target="_blank" className="font-semibold text-sea-deep underline">{d.terms}</Link> {d.and}{" "}
              <Link href={`/privacy?lang=${lang}`} target="_blank" className="font-semibold text-sea-deep underline">{d.privacy}</Link>.
            </span>
          </label>
          {err && <p className="rounded-xl border border-danger/40 bg-danger/10 p-3 text-[14px]" role="alert">{err}</p>}
          <button type="submit" className="btn-dark w-full" disabled={busy}>
            {busy && <Loader2 className="size-4 animate-spin" aria-hidden />}
            {busy ? d.sending : O.submit}
          </button>
        </form>
      )}
    </PartnerShell>
  );
}
