"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Loader2, MessageCircle, RotateCcw, Sparkles } from "lucide-react";
import { TOURIST } from "@/i18n/tourist";
import { getJson, postJson, syncAttribution, useLang, type StoredAttr } from "@/lib/client";
import { QUIZ, type QuizAnswers } from "@/lib/quiz-data";
import type { PublicOffer } from "@/lib/types";
import { BookingCard } from "./booking-card";
import { childLine } from "./offer-card";
import { OfferVisual } from "./type-visual";
import { SiteFooter } from "./site-footer";
import { eur } from "@/lib/client";

interface Result {
  quiz_id: string;
  intro: string;
  tip: string;
  items: { offer: PublicOffer; reason: string }[];
}

export function Quiz() {
  const [lang, setLang] = useLang();
  const t = TOURIST[lang];
  const [attr, setAttr] = useState<StoredAttr | null>(null);
  const [ft, setFt] = useState<string>("");
  const [step, setStep] = useState(-1); // -1 intro, 0..8 questions, 9 e-mail
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [email, setEmail] = useState("");
  const [emailConsent, setEmailConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [booking, setBooking] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    syncAttribution().then(setAttr);
    getJson<{ ft: string }>("/api/form-token").then((r) => setFt((r.data as unknown as { ft?: string })?.ft ?? ""));
  }, []);

  const q = step >= 0 && step < QUIZ.length ? QUIZ[step] : null;
  const total = QUIZ.length;

  const choose = (key: string) => {
    if (!q) return;
    if (q.multi) {
      const cur = Array.isArray(answers[q.id]) ? (answers[q.id] as string[]) : [];
      let next = cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key];
      if (q.multi.exclusive) next = key === q.multi.exclusive ? (cur.includes(key) ? [] : [key]) : next.filter((k) => k !== q.multi!.exclusive);
      if (next.length > q.multi.max) next = next.slice(next.length - q.multi.max);
      setAnswers({ ...answers, [q.id]: next });
    } else {
      setAnswers({ ...answers, [q.id]: key });
      window.setTimeout(() => setStep((s) => s + 1), 180);
    }
  };

  const submit = async () => {
    setBusy(true);
    setError("");
    const res = await postJson<{ result: Result }>("/api/quiz", {
      answers, lang, attr: attr?.token ?? null, email: emailConsent ? email : "", email_consent: emailConsent, ft, website_url: "",
    });
    setBusy(false);
    if (res.data?.ok && res.data.result) {
      setResult(res.data.result);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else setError(res.status === 429 ? t.rateLimited : t.errors.generic);
  };

  const restart = () => {
    setResult(null);
    setAnswers({});
    setStep(-1);
    setBooking(null);
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <Link href={`/?lang=${lang}`} className="flex items-center gap-2 text-[15px]">
          <ArrowLeft className="size-4" aria-hidden />
          <span className="font-display text-[18px] font-semibold">Opsis</span>
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-sea">{t.brandTag}</span>
        </Link>
        <button type="button" className="btn-ghost min-h-10 px-3 text-[13px] font-bold" onClick={() => setLang(lang === "en" ? "hr" : "en")}>
          {t.switchTo}
        </button>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
        {!result && step === -1 && (
          <section className="space-y-5 animate-rise">
            <div className="relative overflow-hidden rounded-3xl border border-line">
              <OfferVisual typeKey="speedboat_tours" image="/activities/island-aerial.jpg" className="h-48 w-full sm:h-60" priority sizes="(max-width: 768px) 100vw, 672px" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
              <h1 className="absolute bottom-4 left-5 right-5 font-display text-[30px] font-semibold leading-tight">{t.quizTitle}</h1>
            </div>
            <p className="text-[17px] leading-relaxed text-mist">{t.quizIntro}</p>
            <button type="button" className="btn-primary w-full sm:w-auto" onClick={() => setStep(0)}>
              <Sparkles className="size-4" aria-hidden /> {t.quizNext}
            </button>
          </section>
        )}

        {!result && q && (
          <section className="space-y-5" aria-labelledby={`q-${q.id}`}>
            <div>
              <div className="mb-3 flex items-center justify-between text-[13px] text-mist">
                <span>{t.quizStep(step + 1, total)}</span>
                {q.multi && <span>{t.quizPickUpTo(q.multi.max)}</span>}
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-3" aria-hidden>
                <div className="h-full rounded-full bg-sea transition-all" style={{ width: `${((step + 1) / (total + 1)) * 100}%` }} />
              </div>
            </div>
            <h2 id={`q-${q.id}`} className="font-display text-[26px] font-semibold leading-tight">{q.label[lang]}</h2>
            <div className="grid gap-2.5 sm:grid-cols-2" role={q.multi ? "group" : "radiogroup"}>
              {q.options.map((o) => {
                const selected = q.multi ? (Array.isArray(answers[q.id]) && (answers[q.id] as string[]).includes(o.key)) : answers[q.id] === o.key;
                return (
                  <button
                    key={o.key}
                    type="button"
                    role={q.multi ? "checkbox" : "radio"}
                    aria-checked={selected}
                    onClick={() => choose(o.key)}
                    className={`flex min-h-14 items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left text-[16px] transition ${selected ? "border-sea bg-sea/15 text-stone" : "border-line bg-ink-2 hover:border-sea/60"}`}
                  >
                    <span>{o.label[lang]}</span>
                    {selected && <Check className="size-5 shrink-0 text-sea" aria-hidden />}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center justify-between gap-3 pt-2">
              <button type="button" className="btn-ghost" onClick={() => setStep((s) => s - 1)}>
                <ArrowLeft className="size-4" aria-hidden /> {t.quizBack}
              </button>
              <button type="button" className={q.multi ? "btn-primary" : "text-[14px] text-mist underline underline-offset-4"} onClick={() => setStep((s) => s + 1)}>
                {q.multi ? t.quizNext : t.skip}
              </button>
            </div>
          </section>
        )}

        {!result && step === total && (
          <section className="space-y-5 animate-rise">
            <h2 className="font-display text-[26px] font-semibold leading-tight">{t.quizSeeResults}</h2>
            <div className="space-y-3 rounded-2xl border border-line bg-ink-2 p-4">
              <label className="flex items-start gap-3 text-[14px] leading-relaxed text-mist">
                <input type="checkbox" className="mt-0.5 size-5 shrink-0 accent-[#3cc2be]" checked={emailConsent} onChange={(e) => setEmailConsent(e.target.checked)} />
                <span>{t.quizEmailConsent}</span>
              </label>
              {emailConsent && (
                <div>
                  <label htmlFor="quiz-email" className="label">{t.quizEmailLabel}</label>
                  <input id="quiz-email" type="email" autoComplete="email" inputMode="email" className="field" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              )}
            </div>
            {error && <p className="rounded-xl border border-sun/40 bg-sun/10 p-3 text-[14px]" role="alert">{error}</p>}
            <div className="flex items-center justify-between gap-3">
              <button type="button" className="btn-ghost" onClick={() => setStep((s) => s - 1)} disabled={busy}>
                <ArrowLeft className="size-4" aria-hidden /> {t.quizBack}
              </button>
              <button type="button" className="btn-primary" onClick={submit} disabled={busy}>
                {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Sparkles className="size-4" aria-hidden />}
                {busy ? t.quizWorking : t.quizSeeResults}
              </button>
            </div>
          </section>
        )}

        {result && (
          <section className="space-y-5 animate-rise" aria-live="polite">
            <h1 className="font-display text-[30px] font-semibold leading-tight">{t.quizResultsTitle}</h1>
            <p className="text-[17px] leading-relaxed text-mist">{result.intro}</p>
            {emailConsent && email && <p className="text-[14px] text-sea">{t.quizEmailSent(email)}</p>}
            <ol className="space-y-4">
              {result.items.map((it, i) => (
                <li key={it.offer.id} className="overflow-hidden rounded-2xl border border-line bg-ink-2">
                  <div className="flex gap-4 p-4">
                    <OfferVisual typeKey={it.offer.type_key} image={it.offer.image} className="size-20 shrink-0 rounded-xl sm:size-24" sizes="96px" />
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="text-[12px] font-bold uppercase tracking-wider text-sea">
                        #{i + 1} {it.offer.demo ? `· ${t.demo}` : ""}
                      </p>
                      <h2 className="font-display text-[18px] font-semibold leading-snug">{it.offer.title}</h2>
                      <p className="text-[14px] leading-relaxed text-mist">{it.reason}</p>
                      <p className="text-[13px] text-mist">
                        {it.offer.city} · {it.offer.duration} · {t.from} <span className="font-semibold text-stone">{eur(it.offer.price_adult)}</span> · {childLine(it.offer, t)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 border-t border-line p-3">
                    <button type="button" className="btn-primary flex-1" onClick={() => setBooking(booking === it.offer.id ? null : it.offer.id)}>
                      {t.book}
                    </button>
                    <Link href={`/?lang=${lang}`} className="btn-ghost px-3" aria-label={t.quizToChat} title={t.quizToChat}>
                      <MessageCircle className="size-5" aria-hidden />
                    </Link>
                  </div>
                  {booking === it.offer.id && (
                    <div className="border-t border-line p-3">
                      <BookingCard offer={it.offer} lang={lang} t={t} attr={attr?.token ?? null} source="quiz" />
                    </div>
                  )}
                </li>
              ))}
            </ol>
            {result.tip && <p className="rounded-2xl border border-sun/40 bg-sun/10 p-4 text-[15px] leading-relaxed">💡 {result.tip}</p>}
            <div className="flex flex-wrap gap-3">
              <button type="button" className="btn-ghost" onClick={restart}>
                <RotateCcw className="size-4" aria-hidden /> {t.quizRestart}
              </button>
              <Link href={`/?lang=${lang}`} className="btn-primary">
                <MessageCircle className="size-4" aria-hidden /> {t.quizToChat}
              </Link>
            </div>
          </section>
        )}
      </main>
      <SiteFooter lang={lang} />
    </div>
  );
}
