import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isAdminAuthorized } from "@/lib/admin-auth";
import { decideOperator, getApprovalView } from "@/lib/partners";
import { typeLabel } from "@/lib/taxonomy";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Odobrenje operatera", robots: { index: false, follow: false }, referrer: "no-referrer" };

async function decide(formData: FormData) {
  "use server";
  const h = await headers();
  if (!isAdminAuthorized(h.get("authorization"))) throw new Error("unauthorized");
  const token = String(formData.get("token") ?? "");
  const decision = String(formData.get("decision") ?? "");
  await decideOperator(token, decision);
  redirect(`/admin/odobri/${token}?done=${decision}`);
}

export default async function ApprovePage({ params, searchParams }: { params: Promise<{ token: string }>; searchParams: Promise<{ done?: string }> }) {
  const h = await headers();
  if (!isAdminAuthorized(h.get("authorization"))) throw new Error("unauthorized");
  const { token } = await params;
  const { done } = await searchParams;
  const view = await getApprovalView(token);
  return (
    <main className="min-h-dvh bg-stone px-4 py-8 text-ink">
      <div className="mx-auto max-w-2xl space-y-5">
        <Link href="/admin" className="text-[14px] font-semibold text-sea-deep underline">← Admin</Link>
        {!view ? (
          <p className="rounded-2xl border border-sand bg-white p-5">Poveznica nije valjana ili je istekla.</p>
        ) : (
          <>
            <h1 className="font-display text-[30px] font-semibold">{view.operator.company}</h1>
            <p className="text-[14px] text-body">
              Status: <strong>{view.operator.status}</strong>
              {done ? ` · spremljeno (${done === "approve" ? "odobreno" : "odbijeno"})` : ""}
            </p>
            <dl className="divide-y divide-sand rounded-2xl border border-sand bg-white text-[15px]">
              {[
                ["Kontakt", view.operator.contact_person],
                ["E-mail", view.operator.email],
                ["Telefon", view.operator.phone],
                ["Grad", view.operator.city],
                ["Web", view.operator.website],
                ["Adresa", view.operator.address],
                ["Max gostiju/dan", String(view.operator.max_per_day ?? "")],
                ["Napomena", view.operator.notes],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-[40%_1fr] gap-3 px-4 py-2">
                  <dt className="text-body">{k}</dt>
                  <dd className="break-words font-semibold">{v || "—"}</dd>
                </div>
              ))}
            </dl>
            <h2 className="font-display text-[22px] font-semibold">Aktivnosti</h2>
            <ul className="space-y-3">
              {view.activities.map((a) => (
                <li key={a.activity_id} className="rounded-2xl border border-sand bg-white p-4 text-[14px]">
                  <p className="font-semibold">{a.title} <span className="font-normal text-body">({typeLabel(a.type_key, "hr")} · {a.status})</span></p>
                  <p className="text-body">{a.description || "—"}</p>
                  <p className="mt-1">
                    {a.price_adult} € odrasli · {a.price_child === null ? "djeca 50 %" : `${a.price_child} € djeca`} · provizija {a.commission_pct}% · {a.duration || "?"} · {a.meeting_point || "?"}
                  </p>
                </li>
              ))}
            </ul>
            {view.operator.status === "pending" && (
              <form action={decide} className="grid gap-3 sm:grid-cols-2">
                <input type="hidden" name="token" value={token} />
                <button name="decision" value="approve" className="btn-dark">Odobri i objavi</button>
                <button name="decision" value="reject" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-danger/60 bg-white px-5 font-semibold text-danger">Odbij</button>
              </form>
            )}
          </>
        )}
      </div>
    </main>
  );
}
