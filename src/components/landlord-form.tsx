"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Download, Loader2, Printer } from "lucide-react";
import { PARTNER } from "@/i18n/partner";
import { getJson, postJson } from "@/lib/client";
import type { Lang } from "@/lib/types";
import { Field, PartnerShell } from "./partner-shell";

interface Done {
  landlord_id: string;
  links: { chat: string; quiz: string; poster: string };
  qr: { chat: string; quiz: string };
  existing: boolean;
  email: string;
}

const EMPTY = { full_name: "", property_name: "", email: "", phone: "", address: "", city: "", units: "", avg_guests_summer: "", booking_platform: "booking", consent: false, website_url: "" };

export function LandlordForm({ initialLang }: { initialLang: Lang }) {
  const [lang, setLang] = useState<Lang>(initialLang);
  const d = PARTNER[lang];
  const L = d.landlord;
  const [f, setF] = useState(EMPTY);
  const [ft, setFt] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [badField, setBadField] = useState("");
  const [done, setDone] = useState<Done | null>(null);

  useEffect(() => {
    getJson<{ ft: string }>("/api/form-token").then((r) => setFt((r.data as unknown as { ft?: string })?.ft ?? ""));
  }, []);

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });

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
    const res = await postJson<Omit<Done, "email"> & { field?: string }>("/api/landlord/register", { ...f, units: Number(f.units), avg_guests_summer: Number(f.avg_guests_summer || 0), ft, lang });
    setBusy(false);
    if (res.data?.ok) {
      setDone({ ...(res.data as unknown as Done), email: f.email });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const code = res.data?.code ?? "generic";
    if (code === "validation") setBadField(res.data?.field ?? "");
    setErr(code === "try_again" ? d.errors.try_again : code === "rate_limited" || res.status === 429 ? d.errors.rate_limited : code === "validation" ? d.errors.validation : d.errors.generic);
  }

  const input = (k: keyof typeof EMPTY, type = "text", ac?: string, optional = false, extra: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <Field id={`ll-${k}`} label={(L as unknown as Record<string, string>)[k]} errorText={badField === k ? d.errors.validation : undefined} optional={optional} optionalLabel={d.optional}>
      <input id={`ll-${k}`} type={type} autoComplete={ac} className="light-field" value={f[k] as string} onChange={set(k)} required={!optional} aria-invalid={badField === k} {...extra} />
    </Field>
  );

  return (
    <PartnerShell lang={lang} d={d} onSwitch={() => setLang(lang === "hr" ? "en" : "hr")} eyebrow={L.eyebrow} title={L.title} lead={L.lead} points={L.points} image="/activities/island-aerial.jpg">
      {done ? (
        <section className="space-y-6" aria-live="polite">
          <div>
            <h2 className="font-display text-[28px] font-semibold">{L.doneTitle}</h2>
            <p className="mt-2 text-[16px] leading-relaxed text-body">{done.existing ? L.existing : L.doneText(done.email)}</p>
            <p className="mt-3 text-[14px] text-body">
              {L.idLabel}: <code className="rounded bg-white px-2 py-1 font-semibold text-ink">{done.landlord_id}</code>
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {([["chat", L.chatQr], ["quiz", L.quizQr]] as const).map(([k, label]) => (
              <figure key={k} className="rounded-2xl border border-sand bg-white p-4 text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={done.qr[k]} alt={`QR: ${label}`} className="mx-auto size-56" />
                <figcaption className="mt-2 font-semibold">{label}</figcaption>
                <p className="mt-1 break-all text-[12px] text-body">{done.links[k]}</p>
                <a href={done.qr[k]} download={`opsis-${k}-${done.landlord_id}.png`} className="btn-dark mt-3 w-full">
                  <Download className="size-4" aria-hidden /> {L.download}
                </a>
              </figure>
            ))}
          </div>
          <Link href={done.links.poster.replace(/^https?:\/\/[^/]+/, "")} className="btn-dark w-full sm:w-auto">
            <Printer className="size-4" aria-hidden /> {L.poster}
          </Link>
        </section>
      ) : (
        <form className="space-y-5" onSubmit={submit} noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            {input("full_name", "text", "name")}
            {input("property_name", "text", "organization")}
            {input("email", "email", "email", false, { inputMode: "email" })}
            {input("phone", "tel", "tel", false, { inputMode: "tel" })}
            {input("address", "text", "street-address")}
            {input("city", "text", "address-level2")}
            {input("units", "number", "off", false, { inputMode: "numeric", min: 1, max: 500 })}
            {input("avg_guests_summer", "number", "off", true, { inputMode: "numeric", min: 0 })}
          </div>
          <Field id="ll-platform" label={L.booking_platform}>
            <select id="ll-platform" className="light-field" value={f.booking_platform} onChange={set("booking_platform")}>
              {Object.entries(L.platforms).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </Field>
          <input type="text" name="website_url" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" value={f.website_url} onChange={set("website_url")} />
          <label className={`flex items-start gap-3 text-[14px] leading-relaxed ${badField === "consent" ? "text-danger" : "text-body"}`}>
            <input type="checkbox" className="mt-0.5 size-5 shrink-0 accent-[#0b6e6d]" checked={f.consent} onChange={(e) => setF({ ...f, consent: e.target.checked })} />
            <span>
              {d.consent} <Link href={`/uvjeti?lang=${lang}`} target="_blank" className="font-semibold text-sea-deep underline">{d.terms}</Link> {d.and}{" "}
              <Link href={`/privacy?lang=${lang}`} target="_blank" className="font-semibold text-sea-deep underline">{d.privacy}</Link>.
            </span>
          </label>
          {err && <p className="rounded-xl border border-danger/40 bg-danger/10 p-3 text-[14px] text-ink" role="alert">{err}</p>}
          <button type="submit" className="btn-dark w-full" disabled={busy}>
            {busy && <Loader2 className="size-4 animate-spin" aria-hidden />}
            {busy ? d.sending : L.submit}
          </button>
        </form>
      )}
    </PartnerShell>
  );
}
