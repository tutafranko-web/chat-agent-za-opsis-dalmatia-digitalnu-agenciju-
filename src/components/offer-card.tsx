"use client";

import { Clock, MapPin, MessageCircle } from "lucide-react";
import type { TouristDict } from "@/i18n/tourist";
import { eur } from "@/lib/client";
import type { PublicOffer } from "@/lib/types";
import { OfferVisual } from "./type-visual";

export function childLine(o: PublicOffer, t: TouristDict): string {
  switch (o.child_policy) {
    case "adults_only": return t.adultsOnly;
    case "free": return t.kidsFree;
    case "price": return t.kidsPrice(eur(o.price_child ?? 0));
    default: return t.kidsHalf;
  }
}

export function OfferCard({
  offer, t, onBook, onAsk,
}: { offer: PublicOffer; t: TouristDict; onBook: (o: PublicOffer) => void; onAsk?: (o: PublicOffer) => void }) {
  return (
    <article className="flex w-[78vw] max-w-[300px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-line bg-ink-2 sm:w-[280px]">
      <div className="relative">
        <OfferVisual typeKey={offer.type_key} image={offer.image} className="h-36 w-full" />
        {offer.demo && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-ink/80 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-sun backdrop-blur">
            {t.demo}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-display text-[17px] font-semibold leading-snug text-stone">{offer.title}</h3>
        <p className="text-[13px] text-mist">{offer.operator_name}</p>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[13px] text-mist">
          <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" aria-hidden />{offer.city}</span>
          {offer.duration && <span className="inline-flex items-center gap-1"><Clock className="size-3.5" aria-hidden />{offer.duration}</span>}
        </div>
        {offer.description && <p className="line-clamp-3 text-[14px] leading-relaxed text-mist/90">{offer.description}</p>}
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div>
            <p className="text-[12px] text-mist">{t.from}</p>
            <p className="font-display text-[22px] font-semibold leading-none text-sea">
              {eur(offer.price_adult)} <span className="font-sans text-[12px] font-normal text-mist">{t.perPerson}</span>
            </p>
            <p className="mt-1 text-[12px] text-mist">{childLine(offer, t)}</p>
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <button type="button" className="btn-primary flex-1" onClick={() => onBook(offer)}>
            {t.book}
          </button>
          {onAsk && (
            <button type="button" className="btn-ghost px-3" onClick={() => onAsk(offer)} aria-label={t.askAbout} title={t.askAbout}>
              <MessageCircle className="size-5" aria-hidden />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export function OfferStrip({ offers, t, onBook, onAsk }: { offers: PublicOffer[]; t: TouristDict; onBook: (o: PublicOffer) => void; onAsk?: (o: PublicOffer) => void }) {
  return (
    <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:thin]">
      {offers.map((o) => (
        <OfferCard key={o.id} offer={o} t={t} onBook={onBook} onAsk={onAsk} />
      ))}
    </div>
  );
}
