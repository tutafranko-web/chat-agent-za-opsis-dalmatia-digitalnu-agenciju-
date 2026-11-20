"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { postJson } from "@/lib/client";

interface Props {
  token: string;
  activities: { activity_id: string; title: string; status: string; image_url: string; gallery_url: string }[];
  blackouts: { start_date: string; end_date: string; activity_id: string; reason: string }[];
  min: string;
  max: string;
}

const REASONS: [string, string][] = [
  ["weather", "Vrijeme · Weather"],
  ["maintenance", "Održavanje · Maintenance"],
  ["full", "Popunjeno · Fully booked"],
  ["holiday", "Odmor · Holiday"],
  ["private", "Privatni događaj · Private event"],
  ["other", "Ostalo · Other"],
];

export function ManagePanel({ token, activities, blackouts, min, max }: Props) {
  const [blocks, setBlocks] = useState(blackouts);
  const [form, setForm] = useState({ start_date: "", end_date: "", activity_id: "", reason: "weather", notes: "" });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [photo, setPhoto] = useState<Record<string, { image_url: string; gallery_url: string }>>(
    Object.fromEntries(activities.map((a) => [a.activity_id, { image_url: a.image_url, gallery_url: a.gallery_url }])),
  );
  const [photoMsg, setPhotoMsg] = useState<Record<string, string>>({});

  async function addBlock(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const res = await postJson("/api/partner/day-off", { token, ...form, end_date: form.end_date || form.start_date });
    setBusy(false);
    if (res.data?.ok) {
      setBlocks([...blocks, { ...form, end_date: form.end_date || form.start_date }]);
      setMsg({ ok: true, text: "Spremljeno. Ti dani se gostima više ne nude. · Saved." });
      setForm({ ...form, start_date: "", end_date: "", notes: "" });
    } else {
      setMsg({ ok: false, text: "Provjerite datume (početak ≤ kraj, ne u prošlosti). · Please check the dates." });
    }
  }

  async function savePhotos(id: string) {
    setPhotoMsg({ ...photoMsg, [id]: "…" });
    const res = await postJson("/api/partner/photos", { token, activity_id: id, ...photo[id] });
    setPhotoMsg({ ...photoMsg, [id]: res.data?.ok ? "Spremljeno · Saved" : "Poveznica mora počinjati s https://, a fotografija završavati s .jpg/.png/.webp" });
  }

  return (
    <div className="space-y-8">
      <section className="space-y-4 rounded-2xl border border-sand bg-white p-5">
        <h2 className="font-display text-[22px] font-semibold">Neradni dani · Days off</h2>
        <form className="grid gap-3 sm:grid-cols-2" onSubmit={addBlock}>
          <div>
            <label className="light-label" htmlFor="s">Od · From</label>
            <input id="s" type="date" className="light-field" min={min} max={max} required value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
          </div>
          <div>
            <label className="light-label" htmlFor="e">Do · To</label>
            <input id="e" type="date" className="light-field" min={form.start_date || min} max={max} value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
          </div>
          <div>
            <label className="light-label" htmlFor="a">Aktivnost · Activity</label>
            <select id="a" className="light-field" value={form.activity_id} onChange={(e) => setForm({ ...form, activity_id: e.target.value })}>
              <option value="">Sve aktivnosti · All activities</option>
              {activities.map((a) => <option key={a.activity_id} value={a.activity_id}>{a.title}</option>)}
            </select>
          </div>
          <div>
            <label className="light-label" htmlFor="r">Razlog · Reason</label>
            <select id="r" className="light-field" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })}>
              {REASONS.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="btn-dark w-full sm:w-auto" disabled={busy}>
              {busy && <Loader2 className="size-4 animate-spin" aria-hidden />} Blokiraj datume · Block dates
            </button>
          </div>
        </form>
        {msg && <p className={`rounded-xl p-3 text-[14px] ${msg.ok ? "bg-sea/15" : "bg-danger/10"}`} role="status">{msg.text}</p>}
        {blocks.length > 0 && (
          <ul className="divide-y divide-sand text-[14px]">
            {blocks.map((b, i) => (
              <li key={i} className="flex flex-wrap justify-between gap-2 py-2">
                <span className="font-semibold">{b.start_date}{b.end_date !== b.start_date ? ` → ${b.end_date}` : ""}</span>
                <span className="text-body">{activities.find((a) => a.activity_id === b.activity_id)?.title ?? "Sve · All"} · {b.reason}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="text-[13px] text-body">Za uklanjanje bloka javite se na opsisdalmatia@gmail.com. · To remove a block, e-mail us.</p>
      </section>

      <section className="space-y-4 rounded-2xl border border-sand bg-white p-5">
        <h2 className="font-display text-[22px] font-semibold">Fotografije · Photos</h2>
        <p className="text-[14px] text-body">Zalijepite javnu poveznicu na fotografiju (https://…jpg/png/webp) i, po želji, na galeriju. · Paste a public https image link and, optionally, a gallery link.</p>
        {activities.map((a) => (
          <div key={a.activity_id} className="space-y-2 border-t border-sand pt-4">
            <p className="font-semibold">{a.title} <span className="text-[12px] font-normal text-body">({a.status})</span></p>
            <input className="light-field" type="url" placeholder="https://…/fotografija.jpg" value={photo[a.activity_id]?.image_url ?? ""} onChange={(e) => setPhoto({ ...photo, [a.activity_id]: { ...photo[a.activity_id], image_url: e.target.value } })} aria-label="Image URL" />
            <input className="light-field" type="url" placeholder="https://… (galerija · gallery)" value={photo[a.activity_id]?.gallery_url ?? ""} onChange={(e) => setPhoto({ ...photo, [a.activity_id]: { ...photo[a.activity_id], gallery_url: e.target.value } })} aria-label="Gallery URL" />
            <div className="flex items-center gap-3">
              <button type="button" className="btn-dark min-h-10 px-4 text-[14px]" onClick={() => savePhotos(a.activity_id)}>Spremi · Save</button>
              {photoMsg[a.activity_id] && <span className="text-[13px] text-body" role="status">{photoMsg[a.activity_id]}</span>}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
