import type { Metadata, Viewport } from "next";
import { COMPANY } from "@/config/company";
import { getManageView } from "@/lib/partners";
import { AvailabilityPanel } from "./availability-panel";
import { ManagePanel } from "./manage-panel";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Moj kalendar · Opsis",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
  appleWebApp: { capable: true, title: "Opsis kalendar", statusBarStyle: "default" },
};
export const viewport: Viewport = { themeColor: "#f3efe7" };

export default async function ManagePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const view = await getManageView(token);
  return (
    <main className="min-h-dvh bg-stone px-4 pb-24 pt-6 text-ink">
      <div className="mx-auto max-w-2xl space-y-5">
        <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-sea-deep">Opsis Dalmatia · AI Concierge</p>
        {!view ? (
          <div className="rounded-2xl border border-sand bg-white p-6">
            <h1 className="font-display text-[24px] font-semibold">Poveznica nije valjana</h1>
            <p className="mt-2 text-[15px] text-body">This link is invalid or was replaced. Pišite nam na {COMPANY.email} za novu poveznicu.</p>
          </div>
        ) : (
          <>
            <div>
              <h1 className="font-display text-[30px] font-semibold leading-tight">{view.operator.company}</h1>
              <p className="mt-1 text-[14px] text-body">
                Osobna poveznica, nemojte je prosljeđivati. Savjet: spremite je na početni zaslon mobitela (Dijeli → <em>Dodaj na početni zaslon</em>) pa je otvarate kao aplikaciju.
              </p>
            </div>
            <AvailabilityPanel token={token} activities={view.activities} calendar={view.calendar} />
            <ManagePanel token={token} activities={view.activities} />
          </>
        )}
      </div>
    </main>
  );
}
