"use client";

import { useId, useState } from "react";
import { CalendarDays, Check, Loader2, Minus, Plus } from "lucide-react";
import type { TouristDict } from "@/i18n/tourist";
import { earliestBookable, eur, fmtDate, postJson, addDaysIso } from "@/lib/client";
import type { DraftView, Lang, PublicOffer, QuoteError } from "@/lib/types";
import { childLine } from "./offer-card";
import { OfferVisual } from "./type-visual";

type OfferLite = Pick<PublicOffer, "id" | "title" | "operator_name" | "city" | "duration" | "demo" | "image" | "type_key" | "child_policy"> &
  Partial<Pick<PublicOffer, "price_adult" | "price_child" | "meeting_point">>;

function Stepper({ label, value, min, max, onChange, disabled }: { label: string; value: number; min: number; max: number; onChange: (n: number) => void; disabled?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[15px] text-stone">{label}</span>
      <div className="flex items-center gap-2">
        <button type="button" className="btn-ghost size-11 p-0" aria-label={`${label} −`} onClick={() => onChange(Math.max(min, value - 1))} disabled={disabled || value <= min}>
          <Minus className="size-4" aria-hidden />
        </button>
        <span className="w-6 text-center text-[17px] font-semibold tabular-nums" aria-live="polite">{value}</span>
        <button type="button" className="btn-ghost size-11 p-0" aria-label={`${label} +`} onClick={() => onChange(Math.min(max, value + 1))} disabled={disabled || value >= max}>
          <Plus className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}

function errorText(t: TouristDict, err: QuoteError | { code: string } | null, lang: Lang): string {
  if (!err) return "";
  switch (err.code) {
    case "too_soon": return t.errors.too_soon(fmtDate((err as { earliest: string }).earliest, lang));
    case "too_far": return t.errors.too_far(fmtDate((err as { latest: string }).latest, lang));
    case "invalid_date": return t.errors.invalid_date;
    case "adults_min": return t.errors.adults_min;
    case "too_many": return t.errors.too_many;
    case "adults_only": return t.errors.adults_only;
    case "blackout": return t.errors.blackout;
    case "full": return t.errors.full;
    case "not_found": return t.errors.not_found;
    case "price_changed": return t.errors.price_changed;
    case "consent": return t.errors.consent;
    case "invalid_token": return t.errors.invalid_token;
    case "validation": return t.errors.validation;
    default: return t.errors.generic;
  }
}

export interface BookingDone {
  ref: string;
  email: string;
}

export function BookingCard({
  offer, initialDraft, lang, t, attr, source, onDone,
}: {
  offer: OfferLite;
  initialDraft?: DraftView | null;
  lang: Lang;
  t: TouristDict;
  attr: string | null;
  source: "card" | "chat" | "quiz";
  onDone?: (d: BookingDone) => void;
}) {
  const uid = useId();
  const earliest = earliestBookable();
  const adultsOnly = offer.child_policy === "adults_only";
  const [date, setDate] = useState(initialDraft?.date ?? "");
  const [adults, setAdults] = useState(initialDraft?.adults ?? 2);
  const [children, setChildren] = useState(initialDraft?.children ?? 0);
  const [draft, setDraft] = useState<DraftView | null>(initialDraft ?? null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<{ code: string; alternatives?: string[]; earliest?: string; latest?: string } | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", notes: "", consent: false, website_url: "" });
  const [fieldErr, setFieldErr] = useState<string | null>(null);
  const [done, setDone] = useState<BookingDone | null>(null);

  async function checkPrice(d = date) {
    if (!d) {
      setErr({ code: "invalid_date" });
      return;
    }
    setBusy(true);
    setErr(null);
    const res = await postJson<{ draft: DraftView; error?: QuoteError }>("/api/booking/quote", { activity_id: offer.id, date: d, adults, children, lang });
    setBusy(false);
    if (res.data?.ok && res.data.draft) {
      setDraft(res.data.draft);
      setDate(d);
    } else if (res.data?.error) setErr(res.data.error as { code: string });
    else setErr({ code: res.status === 429 ? "rate" : "generic" });
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!draft) return;
    if (!form.consent) {
      setErr({ code: "consent" });
      return;
    }
    setBusy(true);
    setErr(null);
    setFieldErr(null);
    const res = await postJson<{ ref: string; draft?: DraftView; field?: string; error?: QuoteError }>("/api/booking/confirm", {
      token: draft.token, ...form, attr, source,
    });
    setBusy(false);
    if (res.data?.ok && res.data.ref) {
      const d = { ref: res.data.ref, email: form.email };
      setDone(d);
      onDone?.(d);
      return;
    }
    const code = res.data?.code ?? "generic";
    if (code === "price_changed" && res.data?.draft) {
      setDraft(res.data.draft);
      setErr({ code });
    } else if (code === "validation") {
      setFieldErr(res.data?.field ?? null);
      setErr({ code });
    } else if (code === "invalid_token") {
      setDraft(null);
      setErr({ code });
    } else if (res.data?.error) {
      setDraft(null);
      setErr(res.data.error as { code: string });
    } else setErr({ code });
  }

  if (done) {
    return (
      <div className="animate-rise rounded-2xl border border-sea/50 bg-ink-2 p-5" role="status">
        <div className="mb-2 flex items-center gap-2 text-sea">
          <Check className="size-5" aria-hidden />
          <h3 className="font-display text-[19px] font-semibold">{t.doneTitle}</h3>
        </div>
        <p className="text-[15px] leading-relaxed text-stone">{t.doneText(done.ref, done.email)}</p>
        <p className="mt-2 text-[13px] text-mist">{t.doneSpam}</p>
      </div>
    );
  }

  return (
    <div className="animate-rise overflow-hidden rounded-2xl border border-line bg-ink-2">
      <div className="flex gap-3 border-b border-line p-4">
        <OfferVisual typeKey={offer.type_key} image={offer.image} className="size-16 shrink-0 rounded-xl" sizes="64px" />
        <div className="min-w-0">
          <p className="text-[12px] font-bold uppercase tracking-wider text-sea">{t.bookTitle}</p>
          <h3 className="font-display text-[17px] font-semibold leading-snug">{offer.title}</h3>
          <p className="text-[13px] text-mist">
            {offer.operator_name} · {offer.city}
            {offer.demo ? ` · ${t.demo}` : ""}
          </p>
        </div>
      </div>

      {!draft ? (
        <div className="space-y-4 p-4">
          <div>
            <label htmlFor={`${uid}-date`} className="label">{t.date}</label>
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-mist" aria-hidden />
              <input
                id={`${uid}-date`} type="date" className="field pl-9 [color-scheme:dark]" min={earliest} max={addDaysIso(earliest, 179)}
                value={date} onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>
          <Stepper label={t.adults} value={adults} min={1} max={30} onChange={setAdults} disabled={busy} />
          {!adultsOnly ? (
            <Stepper label={t.children} value={children} min={0} max={20} onChange={setChildren} disabled={busy} />
          ) : (
            <p className="text-[13px] text-mist">{t.adultsOnly}</p>
          )}
          {err && (
            <div className="rounded-xl border border-sun/40 bg-sun/10 p-3 text-[14px] text-stone" role="alert">
              <p>{errorText(t, err as QuoteError, lang)}</p>
              {!!err.alternatives?.length && (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="text-[13px] text-mist">{t.errors.alternatives}</span>
                  {err.alternatives.map((d) => (
                    <button key={d} type="button" className="chip min-h-9 px-3 text-[14px]" onClick={() => checkPrice(d)}>
                      {fmtDate(d, lang)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          <button type="button" className="btn-primary w-full" onClick={() => checkPrice()} disabled={busy}>
            {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            {busy ? t.checking : t.checkPrice}
          </button>
          {offer.price_adult !== undefined && (
            <p className="text-center text-[12px] text-mist">
              {t.from} {eur(offer.price_adult)} {t.perPerson} · {childLine(offer as PublicOffer, t)}
            </p>
          )}
        </div>
      ) : (
        <form className="space-y-4 p-4" onSubmit={send} noValidate>
          <div className="rounded-xl bg-ink p-3.5">
            <div className="flex items-start justify-between gap-3">
              <div className="text-[14px] text-mist">
                <p className="text-stone">{fmtDate(draft.date, lang)}</p>
                <p>
                  {draft.adults} × {eur(draft.price_adult)}
                  {draft.children ? ` + ${draft.children} × ${eur(draft.price_child)}` : ""}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[12px] text-mist">{t.total}</p>
                <p className="font-display text-[24px] font-semibold leading-none text-sea">{eur(draft.total)}</p>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between gap-2">
              <p className="text-[12px] text-mist">{t.priceNote}</p>
              <button type="button" className="text-[13px] font-semibold text-sea underline underline-offset-2" onClick={() => setDraft(null)}>
                {t.change}
              </button>
            </div>
          </div>

          {(
            [
              ["name", t.name, "text", "name"],
              ["email", t.email, "email", "email"],
              ["phone", t.phone, "tel", "tel"],
            ] as const
          ).map(([key, label, type, ac]) => (
            <div key={key}>
              <label htmlFor={`${uid}-${key}`} className="label">{label}</label>
              <input
                id={`${uid}-${key}`} type={type} autoComplete={ac} className="field" required
                aria-invalid={fieldErr === key}
                value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                inputMode={key === "phone" ? "tel" : key === "email" ? "email" : undefined}
              />
              {fieldErr === key && <p className="mt-1 text-[13px] text-danger">{t.fields[key]}</p>}
            </div>
          ))}
          <div>
            <label htmlFor={`${uid}-notes`} className="label">{t.notes}</label>
            <textarea id={`${uid}-notes`} rows={2} className="field resize-none" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <input type="text" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" value={form.website_url} onChange={(e) => setForm({ ...form, website_url: e.target.value })} name="website_url" />
          <label className="flex items-start gap-3 text-[13px] leading-relaxed text-mist">
            <input type="checkbox" className="mt-0.5 size-5 shrink-0 accent-[#3cc2be]" checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })} />
            <span>
              {t.consent}{" "}
              <a href={`/privacy?lang=${lang}`} target="_blank" className="font-semibold text-sea underline underline-offset-2">{t.consentLink}</a>.
            </span>
          </label>
          {err && (
            <p className="rounded-xl border border-sun/40 bg-sun/10 p-3 text-[14px]" role="alert">
              {errorText(t, err as QuoteError, lang)}
            </p>
          )}
          <button type="submit" className="btn-primary w-full" disabled={busy}>
            {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            {busy ? t.sending : t.sendRequest}
          </button>
        </form>
      )}
    </div>
  );
}
