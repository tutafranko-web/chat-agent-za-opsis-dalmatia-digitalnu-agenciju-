import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { COMPANY } from "@/config/company";
import { LANDLORD_ID_RE } from "@/lib/ids";
import { landlordLinks } from "@/lib/partners";
import { qrDataUrl } from "@/lib/qr";
import { findLandlord } from "@/lib/repo";
import { PrintButton } from "./print-button";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Plakat za ispis", robots: { index: false, follow: false } };

export default async function PosterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lid = decodeURIComponent(id).toUpperCase();
  if (!LANDLORD_ID_RE.test(lid)) notFound();
  const landlord = await findLandlord(lid);
  if (!landlord || (landlord.status !== "active" && landlord.status !== "demo")) notFound();
  const links = landlordLinks(lid);
  const [chatQr, quizQr] = await Promise.all([qrDataUrl(links.chat), qrDataUrl(links.quiz)]);

  return (
    <div className="min-h-dvh bg-stone text-ink">
      <style>{`@page { size: A4; margin: 12mm } @media print { .no-print { display: none !important } body { background: #fff } .sheet { box-shadow: none !important; margin: 0 !important; border: 0 !important } }`}</style>
      <div className="no-print mx-auto flex max-w-[210mm] flex-wrap items-center justify-between gap-3 px-4 py-4">
        <Link href="/partneri/iznajmljivaci" className="text-[14px] font-semibold text-sea-deep underline">← Natrag · Back</Link>
        <PrintButton />
      </div>
      <main className="sheet mx-auto mb-8 flex min-h-[270mm] max-w-[210mm] flex-col rounded-2xl border border-sand bg-white p-[12mm] shadow-sm">
        <p className="text-[12px] font-bold uppercase tracking-[0.25em] text-sea-deep">Opsis Dalmatia · AI Concierge</p>
        <p className="mt-1 text-[14px] text-body">{landlord.property_name}</p>
        <h1 className="mt-6 font-display text-[40px] font-semibold leading-[1.05]">Plan your days in Dalmatia</h1>
        <div className="mt-3 space-y-0.5 text-[16px] text-body">
          <p lang="de">Ihre Tage in Dalmatien planen</p>
          <p lang="it">Organizza le tue giornate in Dalmazia</p>
          <p lang="hr">Isplanirajte dane u Dalmaciji</p>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-6">
          {[
            { qr: chatQr, title: "Chat with our concierge", sub: ["Mit unserem Concierge chatten", "Chatta con il nostro concierge", "Razgovarajte s conciergeom"] },
            { qr: quizQr, title: "2-minute quiz: what suits you?", sub: ["2-Minuten-Quiz: Was passt zu Ihnen?", "Quiz di 2 minuti: cosa fa per te?", "Kviz od 2 minute: što vama odgovara?"] },
          ].map((b) => (
            <figure key={b.title} className="rounded-2xl border border-sand p-4 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={b.qr} alt={`QR: ${b.title}`} className="mx-auto w-full max-w-[60mm]" />
              <figcaption className="mt-3 font-display text-[19px] font-semibold leading-snug">{b.title}</figcaption>
              {b.sub.map((s) => (
                <p key={s} className="text-[12px] text-body">{s}</p>
              ))}
            </figure>
          ))}
        </div>

        <ul className="mt-8 space-y-2 text-[16px]">
          <li>⛵ Boat tours, the Blue Cave &amp; island hopping</li>
          <li>🌊 Rafting, kayaking, zipline &amp; adventures</li>
          <li>🍷 Wine &amp; food tours, transfers and nights out</li>
        </ul>
        <p className="mt-6 rounded-xl bg-stone px-4 py-3 text-[13px] text-body">
          Bookings are requests confirmed by the organiser. No payment in the app. · Rezervacije su zahtjevi koje potvrđuje organizator.
        </p>
        <p className="mt-auto pt-8 text-[11px] text-body/80">
          {COMPANY.brand} · {lid}
        </p>
      </main>
    </div>
  );
}
