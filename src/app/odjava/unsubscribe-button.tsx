"use client";

import { useEffect, useRef, useState } from "react";
import { CircleCheck, Loader2, TriangleAlert } from "lucide-react";
import { postJson } from "@/lib/client";
import type { Lang } from "@/lib/types";

const COPY = {
  hr: {
    button: "Odjavi me",
    busy: "Odjavljujem…",
    doneTitle: "Odjavljeni ste",
    done: (m: string) => `Adresa ${m} više neće primati naše poslovne ponude.`,
    changed: "Predomislili ste se ili imate pitanje? Pišite na",
    invalid: "Poveznica za odjavu nije valjana ili je istekla. Pišite nam na",
    invalidTail: "i uklonit ćemo vašu adresu.",
    error: "Odjava trenutno nije uspjela. Pokušajte ponovno za minutu ili pišite na",
    rateLimited: "Previše pokušaja. Pokušajte ponovno za nekoliko minuta ili pišite na",
    subject: "Odjava",
  },
  en: {
    button: "Unsubscribe",
    busy: "Unsubscribing…",
    doneTitle: "You're unsubscribed",
    done: (m: string) => `${m} won't receive our business e-mails any more.`,
    changed: "Changed your mind or have a question? Write to",
    invalid: "This unsubscribe link is invalid or has expired. Write to",
    invalidTail: "and we'll remove your address.",
    error: "Unsubscribing didn't work just now. Please try again in a minute or write to",
    rateLimited: "Too many attempts. Please try again in a few minutes or write to",
    subject: "Unsubscribe",
  },
} as const;

type State = "idle" | "busy" | "done" | "invalid" | "error" | "rate_limited";

/** Confirms the unsubscribe with a POST, so link scanners opening the page change nothing. */
export function UnsubscribeButton({ token, lang, masked, contactEmail }: { token: string; lang: Lang; masked: string; contactEmail: string }) {
  const t = COPY[lang];
  const [state, setState] = useState<State>("idle");
  const doneRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (state === "done") doneRef.current?.focus();
  }, [state]);

  async function unsubscribe() {
    setState("busy");
    const res = await postJson<{ already?: boolean }>("/api/unsubscribe", { t: token });
    if (res.data?.ok) setState("done");
    else if (res.data?.code === "invalid_token") setState("invalid");
    else if (res.status === 429) setState("rate_limited");
    else setState("error");
  }

  const mail = (
    <a
      className="font-semibold text-sea-deep underline underline-offset-2 hover:no-underline"
      href={`mailto:${contactEmail}?subject=${encodeURIComponent(t.subject)}`}
    >
      {contactEmail}
    </a>
  );
  const failed = state === "invalid" || state === "error" || state === "rate_limited";

  return (
    <div className="mt-6">
      {state !== "done" && (
        <button type="button" onClick={unsubscribe} disabled={state === "busy"} className="btn-dark w-full sm:w-auto sm:min-w-56">
          {state === "busy" ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
          {state === "busy" ? t.busy : t.button}
        </button>
      )}
      <div aria-live="polite">
        {state === "done" && (
          <div className="rounded-2xl border border-sea-deep/30 bg-white p-5">
            <p ref={doneRef} tabIndex={-1} className="flex items-center gap-2 text-[18px] font-semibold text-ink focus:outline-none">
              <CircleCheck className="size-5 shrink-0 text-sea-deep" aria-hidden /> {t.doneTitle}
            </p>
            <p className="mt-2 text-[16px] leading-relaxed text-body">{t.done(masked)}</p>
            <p className="mt-3 text-[15px] leading-relaxed text-body">
              {t.changed} {mail}.
            </p>
          </div>
        )}
        {failed && (
          <p className="mt-4 flex items-start gap-2 rounded-2xl border border-sun/50 bg-sun/10 p-4 text-[15px] leading-relaxed text-ink">
            <TriangleAlert className="mt-1 size-4 shrink-0 text-sun" aria-hidden />
            <span>
              {state === "invalid" ? t.invalid : state === "rate_limited" ? t.rateLimited : t.error} {mail}
              {state === "invalid" ? ` ${t.invalidTail}` : "."}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
