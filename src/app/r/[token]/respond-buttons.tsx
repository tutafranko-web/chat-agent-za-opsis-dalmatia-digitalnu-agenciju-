"use client";

import { useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import { postJson } from "@/lib/client";
import { cn } from "@/lib/utils";

type Day = "full" | "closed" | "";

export function RespondButtons({ token }: { token: string }) {
  const [note, setNote] = useState("");
  const [fullAfter, setFullAfter] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [result, setResult] = useState<{ status: string; dayMarked: Day | null } | null>(null);
  const [err, setErr] = useState("");

  async function act(action: "confirm" | "decline", day: Day, key: string) {
    setBusy(key);
    setErr("");
    const res = await postJson<{ status: string; already?: boolean; dayMarked: Day | null }>("/api/booking/respond", { token, action, note, day });
    setBusy(null);
    if (res.data?.ok) setResult({ status: res.data.status, dayMarked: res.data.dayMarked });
    else setErr("Nije uspjelo. Pokušajte ponovno ili odgovorite na mail. / Something went wrong, please try again.");
  }

  if (result) {
    return (
      <div className="rounded-2xl border border-sand bg-white p-5" role="status">
        <p className="font-display text-[22px] font-semibold">{result.status === "confirmed" ? "✓ Potvrđeno" : "Odbijeno"}</p>
        <p className="mt-1 text-[15px] text-body">
          {result.status === "confirmed"
            ? "Gost je dobio potvrdu mailom. Hvala! / The guest has been notified."
            : "Gost je obaviješten da termin nije dostupan. / The guest has been notified."}
        </p>
        {result.dayMarked && (
          <p className="mt-2 rounded-xl bg-sea/15 p-3 text-[15px]">
            {result.dayMarked === "full" ? "Taj dan je označen kao pun" : "Taj dan je označen kao neradni"}: drugi gosti ga više ne mogu tražiti. Promjena je moguća u vašem kalendaru (link je u mailu).
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="note" className="light-label">
          Poruka gostu <span className="font-normal text-body/70">(neobavezno · optional message to the guest)</span>
        </label>
        <textarea id="note" rows={3} maxLength={400} className="light-field resize-none" value={note} onChange={(e) => setNote(e.target.value)} placeholder="npr. Polazak u 9:00 s Rive, ponesite kupaći. / e.g. Departure 9:00 from the Riva." />
      </div>
      {err && <p className="rounded-xl border border-danger/40 bg-danger/10 p-3 text-[14px]" role="alert">{err}</p>}

      {!declining ? (
        <div className="space-y-3">
          <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-sand bg-white px-3 text-[15px]">
            <input type="checkbox" className="size-5 accent-[var(--color-sea-deep)]" checked={fullAfter} onChange={(e) => setFullAfter(e.target.checked)} />
            Nakon ovoga sam taj dan pun <span className="text-[13px] text-body">(ne šalji mi više zahtjeva za taj dan)</span>
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <button type="button" className="btn-dark" onClick={() => act("confirm", fullAfter ? "full" : "", "confirm")} disabled={!!busy}>
              {busy === "confirm" ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Check className="size-4" aria-hidden />} Potvrdi · Confirm
            </button>
            <button type="button" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-danger/60 bg-white px-5 text-[15px] font-semibold text-danger disabled:opacity-60" onClick={() => setDeclining(true)} disabled={!!busy}>
              <X className="size-4" aria-hidden /> Odbij · Decline
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2 rounded-2xl border border-danger/30 bg-white p-4">
          <p className="text-[15px] font-semibold">Zašto odbijate? · Why?</p>
          {([
            ["full", "Pun sam taj dan", "taj dan se više ne nudi gostima"],
            ["closed", "Ne radim taj dan", "vrijeme, servis, odmor…"],
            ["", "Drugi razlog", "dan ostaje otvoren za druge goste"],
          ] as [Day, string, string][]).map(([day, label, hint]) => (
            <button
              key={label}
              type="button"
              disabled={!!busy}
              onClick={() => act("decline", day, `decline-${day || "other"}`)}
              className={cn("flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border border-sand px-4 py-2 text-left text-[15px] font-semibold disabled:opacity-60", day === "full" && "border-danger/50")}
            >
              <span>{label} <span className="block text-[13px] font-normal text-body">{hint}</span></span>
              {busy === `decline-${day || "other"}` && <Loader2 className="size-4 animate-spin" aria-hidden />}
            </button>
          ))}
          <button type="button" className="min-h-10 text-[14px] text-body underline" onClick={() => setDeclining(false)} disabled={!!busy}>Natrag</button>
        </div>
      )}
    </div>
  );
}
