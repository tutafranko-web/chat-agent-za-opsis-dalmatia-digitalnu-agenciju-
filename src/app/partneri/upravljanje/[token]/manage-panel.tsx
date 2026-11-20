"use client";

import { useState } from "react";
import { postJson } from "@/lib/client";

interface Props {
  token: string;
  activities: { activity_id: string; title: string; status: string; image_url: string; gallery_url: string }[];
}

/** Photos per activity (the calendar lives in availability-panel.tsx). */
export function ManagePanel({ token, activities }: Props) {
  const [photo, setPhoto] = useState<Record<string, { image_url: string; gallery_url: string }>>(
    Object.fromEntries(activities.map((a) => [a.activity_id, { image_url: a.image_url, gallery_url: a.gallery_url }])),
  );
  const [photoMsg, setPhotoMsg] = useState<Record<string, string>>({});

  async function savePhotos(id: string) {
    setPhotoMsg({ ...photoMsg, [id]: "…" });
    const res = await postJson("/api/partner/photos", { token, activity_id: id, ...photo[id] });
    setPhotoMsg({ ...photoMsg, [id]: res.data?.ok ? "Spremljeno · Saved" : "Poveznica mora počinjati s https://, a fotografija završavati s .jpg/.png/.webp" });
  }

  return (
    <section className="space-y-4 rounded-2xl border border-sand bg-white p-4 sm:p-5">
      <h2 className="font-display text-[22px] font-semibold">Fotografije · Photos</h2>
      <p className="text-[14px] text-body">Zalijepite javnu poveznicu na fotografiju (https://…jpg/png/webp) i, po želji, na galeriju. Ako vam je lakše, pošaljite nam fotografije mailom. · Paste a public https image link and, optionally, a gallery link.</p>
      {activities.map((a) => (
        <div key={a.activity_id} className="space-y-2 border-t border-sand pt-4">
          <p className="font-semibold">{a.title} <span className="text-[12px] font-normal text-body">({a.status})</span></p>
          <input className="light-field" type="url" placeholder="https://…/fotografija.jpg" value={photo[a.activity_id]?.image_url ?? ""} onChange={(e) => setPhoto({ ...photo, [a.activity_id]: { ...photo[a.activity_id], image_url: e.target.value } })} aria-label={`Fotografija: ${a.title}`} />
          <input className="light-field" type="url" placeholder="https://… (galerija · gallery)" value={photo[a.activity_id]?.gallery_url ?? ""} onChange={(e) => setPhoto({ ...photo, [a.activity_id]: { ...photo[a.activity_id], gallery_url: e.target.value } })} aria-label={`Galerija: ${a.title}`} />
          <div className="flex items-center gap-3">
            <button type="button" className="btn-dark min-h-11 px-4 text-[14px]" onClick={() => savePhotos(a.activity_id)}>Spremi · Save</button>
            {photoMsg[a.activity_id] && <span className="text-[13px] text-body" role="status">{photoMsg[a.activity_id]}</span>}
          </div>
        </div>
      ))}
    </section>
  );
}
