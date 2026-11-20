import type { Metadata } from "next";
import { dayOffBounds, getManageView } from "@/lib/partners";
import { ManagePanel } from "./manage-panel";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Upravljanje ponudom", robots: { index: false, follow: false }, referrer: "no-referrer" };

export default async function ManagePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const view = await getManageView(token);
  return (
    <main className="min-h-dvh bg-stone px-4 py-8 text-ink">
      <div className="mx-auto max-w-2xl space-y-6">
        <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-sea-deep">Opsis Dalmatia · AI Concierge</p>
        {!view ? (
          <div className="rounded-2xl border border-sand bg-white p-6">
            <h1 className="font-display text-[24px] font-semibold">Poveznica nije valjana</h1>
            <p className="mt-2 text-[15px] text-body">This link is invalid or was replaced. Pišite nam na opsisdalmatia@gmail.com za novu poveznicu.</p>
          </div>
        ) : (
          <>
            <div>
              <h1 className="font-display text-[30px] font-semibold leading-tight">{view.operator.company}</h1>
              <p className="mt-1 text-[14px] text-body">Osobna poveznica: nemojte je prosljeđivati. · Personal link: please don&apos;t share it.</p>
            </div>
            <ManagePanel token={token} activities={view.activities} blackouts={view.blackouts} {...dayOffBounds()} />
          </>
        )}
      </div>
    </main>
  );
}
