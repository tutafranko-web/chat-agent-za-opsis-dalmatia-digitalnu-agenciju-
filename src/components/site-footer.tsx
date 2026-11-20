import Link from "next/link";
import { COMPANY } from "@/config/company";
import type { Lang } from "@/lib/types";

export function SiteFooter({ lang, compact = false, light = false }: { lang: Lang; compact?: boolean; light?: boolean }) {
  const muted = light ? "text-body/80" : "text-mist/80";
  const links = (
    <span className="flex flex-wrap gap-x-3 gap-y-1">
      <Link className="underline-offset-2 hover:underline" href={`/privacy?lang=${lang}`}>{lang === "hr" ? "Privatnost" : "Privacy"}</Link>
      <Link className="underline-offset-2 hover:underline" href={`/uvjeti?lang=${lang}`}>{lang === "hr" ? "Uvjeti" : "Terms"}</Link>
      <Link className="underline-offset-2 hover:underline" href="/partneri/iznajmljivaci">{lang === "hr" ? "Za iznajmljivače" : "For hosts"}</Link>
      <Link className="underline-offset-2 hover:underline" href="/partneri/organizatori">{lang === "hr" ? "Za organizatore" : "For operators"}</Link>
    </span>
  );
  if (compact) {
    return (
      <div className={`mx-auto flex w-full max-w-2xl flex-wrap items-center justify-between gap-x-3 gap-y-1 pb-1 text-[11px] ${muted}`}>
        {links}
        <span>© {COMPANY.brand}</span>
      </div>
    );
  }
  return (
    <footer className={`border-t ${light ? "border-sand" : "border-line"} px-4 py-6 text-[12px] ${muted}`}>
      <div className="mx-auto flex max-w-5xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <span>
          {COMPANY.legalName} · OIB {COMPANY.oib} · {COMPANY.address}
        </span>
        {links}
      </div>
    </footer>
  );
}
