import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { isAdminAuthorized } from "@/lib/admin-auth";
import { env } from "@/lib/env";
import { healthChecks } from "@/lib/health";
import { outreachCandidates, sendOutreach, type Audience } from "@/lib/outreach";
import { listBookings, listLandlords, loadCatalogData } from "@/lib/repo";
import { signToken } from "@/lib/tokens";
import { formatDate, daysBetween, zagrebNow } from "@/lib/zagreb-time";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

async function assertAdmin() {
  const h = await headers();
  if (!isAdminAuthorized(h.get("authorization"))) throw new Error("unauthorized");
}

async function previewAction(formData: FormData) {
  "use server";
  await assertAdmin();
  const audience = (formData.get("audience") === "landlord" ? "landlord" : "operator") as Audience;
  const limit = Number(formData.get("limit") || 10);
  const { leads, totalEligible } = await outreachCandidates(audience, limit);
  globalThis.__opsisOutreachPreview = { audience, totalEligible, emails: leads.map((l) => `${l.email}${l.company ? ` (${l.company})` : ""}`), at: Date.now() };
  revalidatePath("/admin");
}

async function sendAction(formData: FormData) {
  "use server";
  await assertAdmin();
  if (process.env.OUTREACH_ENABLED !== "true") return;
  const audience = (formData.get("audience") === "landlord" ? "landlord" : "operator") as Audience;
  const res = await sendOutreach(audience, Number(formData.get("limit") || 10));
  globalThis.__opsisOutreachResult = { ...res, audience, at: Date.now() };
  revalidatePath("/admin");
}

declare global {
  var __opsisOutreachPreview: { audience: string; totalEligible: number; emails: string[]; at: number } | undefined;
  var __opsisOutreachResult: { audience: string; sent: number; failed: number; reroutedToAdmin: boolean; at: number } | undefined;
}

export default async function AdminPage() {
  await assertAdmin();
  const [checks, catalog, bookings, landlords] = await Promise.all([healthChecks(), loadCatalogData(true), listBookings(true), listLandlords(true)]);
  const pending = catalog.operators.filter((o) => o.status === "pending");
  const today = zagrebNow().date;
  const recent = [...bookings].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 25);
  const counts = {
    active: catalog.operators.filter((o) => o.status === "active").length,
    demo: catalog.operators.filter((o) => o.status === "demo").length,
    pending: pending.length,
    landlords: landlords.filter((l) => l.status === "active").length,
    bookingsPending: bookings.filter((b) => b.status === "pending").length,
    bookingsConfirmed: bookings.filter((b) => b.status === "confirmed").length,
  };
  const respondHref = (ref: string, op: string, date: string) =>
    `/r/${signToken("respond", { ref, op }, Math.max(2, daysBetween(today, date) + 2) * 86400)}`;
  const preview = globalThis.__opsisOutreachPreview;
  const result = globalThis.__opsisOutreachResult;

  return (
    <main className="min-h-dvh bg-stone px-4 py-8 text-ink">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-sea-deep">Opsis Concierge · Admin</p>
            <h1 className="font-display text-[32px] font-semibold">Pregled</h1>
          </div>
          <Link href="/" className="text-[14px] font-semibold text-sea-deep underline">Otvori concierge →</Link>
        </header>

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            ["Operateri (aktivni)", counts.active],
            ["Demo operateri", counts.demo],
            ["Čekaju odobrenje", counts.pending],
            ["Iznajmljivači", counts.landlords],
            ["Zahtjevi na čekanju", counts.bookingsPending],
            ["Potvrđeno", counts.bookingsConfirmed],
          ].map(([k, v]) => (
            <div key={k} className="rounded-2xl border border-sand bg-white p-4">
              <p className="text-[12px] text-body">{k}</p>
              <p className="font-display text-[28px] font-semibold">{v}</p>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-sand bg-white p-5">
          <h2 className="mb-3 font-display text-[22px] font-semibold">Ispravnost sustava</h2>
          <ul className="divide-y divide-sand text-[14px]">
            {checks.map((c) => (
              <li key={c.name} className="flex flex-wrap items-start justify-between gap-2 py-2">
                <span className="font-semibold">{c.ok ? "✅" : "⚠️"} {c.name}</span>
                <span className="max-w-[70%] break-words text-right text-body">{c.detail}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-sand bg-white p-5">
          <h2 className="mb-3 font-display text-[22px] font-semibold">Prijave operatera</h2>
          {pending.length === 0 ? (
            <p className="text-[14px] text-body">Nema prijava na čekanju.</p>
          ) : (
            <ul className="divide-y divide-sand text-[14px]">
              {pending.map((o) => (
                <li key={o.operator_id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                  <span><strong>{o.company}</strong> · {o.city} · {o.email}</span>
                  <Link className="font-semibold text-sea-deep underline" href={`/admin/odobri/${signToken("approve", { op: o.operator_id }, 7 * 86400)}`}>Pregledaj</Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-sand bg-white p-5">
          <h2 className="mb-3 font-display text-[22px] font-semibold">Zadnji zahtjevi</h2>
          {recent.length === 0 ? (
            <p className="text-[14px] text-body">Još nema zahtjeva.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-[14px]">
                <thead className="text-body">
                  <tr>
                    <th className="py-2 pr-3 font-semibold">Oznaka</th>
                    <th className="py-2 pr-3 font-semibold">Aktivnost</th>
                    <th className="py-2 pr-3 font-semibold">Datum</th>
                    <th className="py-2 pr-3 font-semibold">Osobe</th>
                    <th className="py-2 pr-3 font-semibold">Ukupno</th>
                    <th className="py-2 pr-3 font-semibold">Iznajmljivač</th>
                    <th className="py-2 pr-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand">
                  {recent.map((b) => (
                    <tr key={b.ref}>
                      <td className="py-2 pr-3 font-mono">{b.status === "pending" ? <Link className="text-sea-deep underline" href={respondHref(b.ref, b.operator_id, b.date)}>{b.ref}</Link> : b.ref}</td>
                      <td className="py-2 pr-3">{b.activity_title}</td>
                      <td className="py-2 pr-3">{formatDate(b.date, "hr")}</td>
                      <td className="py-2 pr-3">{b.adults}{b.children ? `+${b.children}` : ""}</td>
                      <td className="py-2 pr-3">{b.total_eur} €</td>
                      <td className="py-2 pr-3">{b.landlord_id || "—"}</td>
                      <td className="py-2 pr-3">{b.status}{b.trial ? " · proba" : ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="mt-3 text-[13px] text-body">Klik na oznaku zahtjeva na čekanju otvara stranicu za potvrdu ili odbijanje (u pilotu potvrđuješ ti umjesto demo operatera).</p>
        </section>

        <section className="space-y-3 rounded-2xl border border-sand bg-white p-5">
          <h2 className="font-display text-[22px] font-semibold">Outreach</h2>
          <p className="text-[14px] text-body">
            Leadovi se čitaju iz kartice „Leadovi” (stupci email, name, company, type = operator ili landlord). Preskaču se odjavljeni i već kontaktirani.
            Slanje je {process.env.OUTREACH_ENABLED === "true" ? <strong>uključeno</strong> : <strong>isključeno (OUTREACH_ENABLED)</strong>}; u načinu pošte „{env.mailMode()}” partnerski mailovi {env.mailMode() === "live" ? "idu primateljima" : "idu tebi, ne primateljima"}.
          </p>
          <form className="flex flex-wrap items-end gap-3">
            <label className="text-[14px]">
              <span className="light-label">Publika</span>
              <select name="audience" className="light-field">
                <option value="operator">Organizatori</option>
                <option value="landlord">Iznajmljivači</option>
              </select>
            </label>
            <label className="text-[14px]">
              <span className="light-label">Koliko (max 20)</span>
              <input name="limit" type="number" min={1} max={20} defaultValue={10} className="light-field w-28" />
            </label>
            <button formAction={previewAction} className="btn-dark">Pregled primatelja</button>
            <button formAction={sendAction} className="inline-flex min-h-12 items-center rounded-xl border border-sea-deep px-5 font-semibold text-sea-deep disabled:opacity-50" disabled={process.env.OUTREACH_ENABLED !== "true"}>
              Pošalji
            </button>
          </form>
          {preview && (
            <div className="rounded-xl bg-stone p-3 text-[13px]">
              <p className="font-semibold">{preview.audience}: {preview.totalEligible} dostupnih, prvih {preview.emails.length}:</p>
              <p className="mt-1 break-words text-body">{preview.emails.join(", ") || "—"}</p>
            </div>
          )}
          {result && (
            <p className="rounded-xl bg-sea/15 p-3 text-[13px]">
              Poslano {result.sent}, neuspjelo {result.failed}{result.reroutedToAdmin ? " (pilot: preusmjereno tebi)" : ""}.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
