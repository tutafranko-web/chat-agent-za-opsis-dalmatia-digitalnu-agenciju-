"use client";

import { useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import { postJson } from "@/lib/client";

export function RespondButtons({ token }: { token: string }) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState<"confirm" | "decline" | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [err, setErr] = useState("");

  async function act(action: "confirm" | "decline") {
    setBusy(action);
    setErr("");
    const res = await postJson<{ status: string; already?: boolean }>("/api/booking/respond", { token, action, note });
    setBusy(null);
    if (res.data?.ok) setResult(res.data.status);
    else setErr("Nije uspjelo. Pokušajte ponovno ili odgovorite na mail. / Something went wrong, please try again.");
  }

  if (result) {
    return (
      <div className="rounded-2xl border border-sand bg-white p-5" role="status">
        <p className="font-display text-[22px] font-semibold">{result === "confirmed" ? "✓ Potvrđeno" : "Odbijeno"}</p>
        <p className="mt-1 text-[15px] text-body">
          {result === "confirmed"
            ? "Gost je dobio potvrdu mailom. Hvala! / The guest has been notified."
            : "Gost je obaviješten da termin nije dostupan. / The guest has been notified."}
        </p>
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
      <div className="grid gap-3 sm:grid-cols-2">
        <button type="button" className="btn-dark" onClick={() => act("confirm")} disabled={!!busy}>
          {busy === "confirm" ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Check className="size-4" aria-hidden />} Potvrdi · Confirm
        </button>
        <button type="button" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-danger/60 bg-white px-5 text-[15px] font-semibold text-danger disabled:opacity-60" onClick={() => act("decline")} disabled={!!busy}>
          {busy === "decline" ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <X className="size-4" aria-hidden />} Odbij · Decline
        </button>
      </div>
    </div>
  );
}
