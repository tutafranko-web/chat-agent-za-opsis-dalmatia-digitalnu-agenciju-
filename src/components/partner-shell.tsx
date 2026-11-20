"use client";

import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import type { PartnerDict } from "@/i18n/partner";
import type { Lang } from "@/lib/types";
import { SiteFooter } from "./site-footer";

/** Light page shell for partner-facing pages (hosts, operators). */
export function PartnerShell({
  lang, d, onSwitch, eyebrow, title, lead, points, children, image,
}: {
  lang: Lang;
  d: PartnerDict;
  onSwitch: () => void;
  eyebrow: string;
  title: string;
  lead: string;
  points: string[];
  children: React.ReactNode;
  image?: string;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-stone text-ink">
      <header className="bg-ink text-stone">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <Link href={`/?lang=${lang}`} className="flex items-center gap-2 text-[14px]">
            <ArrowLeft className="size-4" aria-hidden />
            <span className="font-display text-[18px] font-semibold">Opsis</span>
            <span className="hidden text-[11px] font-bold uppercase tracking-[0.2em] text-sea sm:inline">AI Concierge</span>
          </Link>
          <button type="button" onClick={onSwitch} className="rounded-xl border border-line px-3 py-2 text-[13px] font-bold">
            {d.switchTo}
          </button>
        </div>
        <div className="relative overflow-hidden">
          {image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/40" />
          <div className="relative mx-auto max-w-5xl px-4 pb-10 pt-8 sm:pb-14 sm:pt-12">
            <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-sea">{eyebrow}</p>
            <h1 className="mt-2 max-w-2xl font-display text-[32px] font-semibold leading-[1.08] sm:text-[44px]">{title}</h1>
            <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-mist">{lead}</p>
            <ul className="mt-5 grid gap-2 sm:grid-cols-3">
              {points.map((p) => (
                <li key={p} className="flex items-start gap-2 text-[15px] text-stone">
                  <Check className="mt-0.5 size-4 shrink-0 text-sea" aria-hidden /> {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">{children}</main>
      <SiteFooter lang={lang} light />
    </div>
  );
}

export function Field({
  id, label, errorText, hint, children, optional, optionalLabel,
}: { id: string; label: string; errorText?: string; hint?: string; children: React.ReactNode; optional?: boolean; optionalLabel?: string }) {
  return (
    <div>
      <label htmlFor={id} className="light-label">
        {label} {optional && <span className="font-normal text-body/70">({optionalLabel})</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-[13px] text-body/80">{hint}</p>}
      {errorText && <p className="mt-1 text-[13px] font-semibold text-danger" role="alert">{errorText}</p>}
    </div>
  );
}
