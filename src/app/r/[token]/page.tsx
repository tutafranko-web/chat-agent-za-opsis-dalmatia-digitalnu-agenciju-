import type { Metadata } from "next";
import { getRespondView } from "@/lib/bookings";
import { formatDate } from "@/lib/zagreb-time";
import { RespondButtons } from "./respond-buttons";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Zahtjev za rezervaciju", robots: { index: false, follow: false }, referrer: "no-referrer" };

const STATUS: Record<string, string> = {
  pending: "Čeka vaš odgovor · Awaiting your reply",
  confirmed: "Potvrđeno · Confirmed",
  declined: "Odbijeno · Declined",
  cancelled: "Otkazano · Cancelled",
};

/** Opened from the operator's e-mail. GET only shows the request; buttons POST. */
export default async function RespondPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const view = await getRespondView(token);
  if (!view) {
    return (
      <main className="min-h-dvh bg-stone px-4 py-16 text-ink">
        <div className="mx-auto max-w-xl rounded-2xl border border-sand bg-white p-6">
          <h1 className="font-display text-[24px] font-semibold">Poveznica nije valjana ili je istekla</h1>
          <p className="mt-2 text-[15px] text-body">This link is invalid or has expired. Odgovorite na mail ili nam pišite na opsisdalmatia@gmail.com.</p>
        </div>
      </main>
    );
  }
  const b = view.booking;
  const rows: [string, string][] = [
    ["Oznaka · Ref", b.ref],
    ["Aktivnost · Activity", b.activity_title],
    ["Datum · Date", formatDate(b.date, "hr")],
    ["Osobe · Guests", `${b.adults} odr.${b.children ? ` + ${b.children} djece` : ""}`],
    ["Ukupno · Total", `${b.total_eur} €`],
    ["Gost · Guest", b.tourist_name],
    ["E-mail", b.tourist_email],
    ["Telefon · Phone", b.tourist_phone],
  ];
  if (b.notes) rows.push(["Napomena · Notes", b.notes]);
  if (view.meeting_point) rows.push(["Polazak · Meeting point", view.meeting_point]);

  return (
    <main className="min-h-dvh bg-stone px-4 py-8 text-ink">
      <div className="mx-auto max-w-xl space-y-5">
        <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-sea-deep">Opsis Dalmatia · AI Concierge</p>
        <h1 className="font-display text-[30px] font-semibold leading-tight">Zahtjev za rezervaciju</h1>
        {b.trial && <p className="rounded-xl bg-sun/20 px-3 py-2 text-[13px]">PILOT / PROBA: ovo je testni zahtjev. · This is a pilot test request.</p>}
        <p className="inline-block rounded-full bg-white px-3 py-1 text-[13px] font-semibold">{STATUS[b.status] ?? b.status}</p>
        <dl className="divide-y divide-sand rounded-2xl border border-sand bg-white">
          {rows.map(([k, v]) => (
            <div key={k} className="grid grid-cols-[minmax(0,40%)_1fr] gap-3 px-4 py-2.5 text-[15px]">
              <dt className="text-body">{k}</dt>
              <dd className="break-words font-semibold">{v}</dd>
            </div>
          ))}
        </dl>
        {b.status === "pending" ? (
          <RespondButtons token={token} />
        ) : (
          <p className="text-[15px] text-body">Na ovaj zahtjev je već odgovoreno. · This request has already been answered.</p>
        )}
      </div>
    </main>
  );
}
