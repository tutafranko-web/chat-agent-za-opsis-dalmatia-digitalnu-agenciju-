import type { Metadata } from "next";
import Link from "next/link";
import { CircleCheck, MailX, TriangleAlert } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { COMPANY } from "@/config/company";
import type { Lang } from "@/lib/types";
import { emailFromUnsubToken, isSuppressed, maskEmail } from "@/lib/unsubscribe";
import { UnsubscribeButton } from "./unsubscribe-button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Odjava · Unsubscribe",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

const COPY = {
  hr: {
    title: "Odjava od poslovnih poruka",
    intro: "Odjavit ćemo adresu",
    introTail: `s popisa za poslovne poruke ${COMPANY.brand}. Nakon toga vam više nećemo slati poslovne ponude e-mailom.`,
    already: (m: string) => `Adresa ${m} već je odjavljena. Ne trebate ništa poduzeti.`,
    invalidTitle: "Poveznica za odjavu nije valjana ili je istekla.",
    invalid: "Pišite nam na",
    invalidTail: "(predmet: Odjava) i uklonit ćemo vašu adresu.",
    subject: "Odjava",
    whyTitle: "Zašto ste dobili naš mail?",
    why: `${COMPANY.brand} poslovnim adresama organizatora izleta i iznajmljivača u Dalmaciji šalje kratke ponude suradnje. Adrese pronalazimo na javnim stranicama i poslovnim profilima. Više o tome u`,
    privacy: "izjavi o privatnosti",
    langLabel: "Jezik",
  },
  en: {
    title: "Unsubscribe from business e-mails",
    intro: "We'll remove",
    introTail: `from the ${COMPANY.brand} business mailing list. After that we won't send you business offers by e-mail again.`,
    already: (m: string) => `${m} is already unsubscribed. There's nothing else you need to do.`,
    invalidTitle: "This unsubscribe link is invalid or has expired.",
    invalid: "Write to us at",
    invalidTail: "(subject: Unsubscribe) and we'll remove your address.",
    subject: "Unsubscribe",
    whyTitle: "Why did you get our e-mail?",
    why: `${COMPANY.brand} sends short partnership offers to the business addresses of tour operators and accommodation hosts in Dalmatia. We find these addresses on public websites and business profiles. Read more in our`,
    privacy: "privacy notice",
    langLabel: "Language",
  },
} as const;

const linkClass = "font-semibold text-sea-deep underline underline-offset-2 hover:no-underline";

export default async function OdjavaPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const lang: Lang = first(sp.lang) === "en" ? "en" : "hr";
  const t = COPY[lang];
  const token = (first(sp.t) ?? "").trim();
  const email = emailFromUnsubToken(token);
  let already = false;
  if (email) {
    try {
      already = await isSuppressed(email);
    } catch {
      already = false; // storage hiccup: still let the visitor press the button
    }
  }
  const masked = email ? maskEmail(email) : "";
  const hrefFor = (l: Lang) => {
    const q = new URLSearchParams();
    if (token) q.set("t", token);
    q.set("lang", l);
    return `/odjava?${q.toString()}`;
  };

  return (
    <div lang={lang} className="flex min-h-dvh flex-col bg-stone text-ink">
      <header className="bg-ink text-stone">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <Link href={`/?lang=${lang}`} className="flex min-h-10 items-center gap-2">
            <span className="font-display text-[18px] font-semibold">{COMPANY.brand}</span>
            <span className="hidden text-[11px] font-bold uppercase tracking-[0.2em] text-sea sm:inline">AI Concierge</span>
          </Link>
          <nav aria-label={t.langLabel} className="flex items-center gap-1 rounded-full border border-line p-1 text-[13px] font-bold">
            {(["hr", "en"] as const).map((l) => (
              <Link
                key={l}
                href={hrefFor(l)}
                hrefLang={l}
                lang={l}
                aria-current={l === lang ? "true" : undefined}
                aria-label={l === "hr" ? "Hrvatski" : "English"}
                className={`inline-flex min-h-9 min-w-11 items-center justify-center rounded-full px-3 ${l === lang ? "bg-sea text-ink" : "text-stone hover:text-sea"}`}
              >
                {l.toUpperCase()}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-10 sm:py-16">
        <div className="rounded-3xl border border-sand bg-stone-2 p-6 shadow-sm sm:p-8">
          <span className="inline-flex size-12 items-center justify-center rounded-full bg-sea-deep/10 text-sea-deep">
            <MailX className="size-6" aria-hidden />
          </span>
          <h1 className="mt-4 font-display text-[28px] font-semibold leading-tight text-ink sm:text-[32px]">{t.title}</h1>

          {email && !already && (
            <>
              <p className="mt-4 text-[16px] leading-relaxed text-body">
                {t.intro} <strong className="font-semibold text-ink">{masked}</strong> {t.introTail}
              </p>
              <UnsubscribeButton token={token} lang={lang} masked={masked} contactEmail={COMPANY.email} />
            </>
          )}

          {email && already && (
            <p className="mt-5 flex items-start gap-2 rounded-2xl border border-sea-deep/30 bg-white p-4 text-[16px] leading-relaxed text-ink">
              <CircleCheck className="mt-1 size-5 shrink-0 text-sea-deep" aria-hidden />
              <span>{t.already(masked)}</span>
            </p>
          )}

          {!email && (
            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-sun/50 bg-sun/10 p-4 text-[16px] leading-relaxed text-ink">
              <TriangleAlert className="mt-1 size-5 shrink-0 text-sun" aria-hidden />
              <div>
                <p className="font-semibold">{t.invalidTitle}</p>
                <p className="mt-1">
                  {t.invalid}{" "}
                  <a className={linkClass} href={`mailto:${COMPANY.email}?subject=${encodeURIComponent(t.subject)}`}>
                    {COMPANY.email}
                  </a>{" "}
                  {t.invalidTail}
                </p>
              </div>
            </div>
          )}
        </div>

        <section aria-labelledby="why" className="mt-8 px-1">
          <h2 id="why" className="text-[16px] font-semibold text-ink">{t.whyTitle}</h2>
          <p className="mt-2 text-[16px] leading-relaxed text-body">
            {t.why}{" "}
            <Link className={linkClass} href={`/privacy?lang=${lang}#outreach`}>
              {t.privacy}
            </Link>
            .
          </p>
        </section>
      </main>

      <SiteFooter lang={lang} light />
    </div>
  );
}
