"use client";

import { useMemo, useState } from "react";
import { CalendarCheck, ChevronLeft, ChevronRight, Link2, Loader2, MessageSquareText, Minus, Plus, RotateCcw } from "lucide-react";
import { postJson } from "@/lib/client";
import { cn } from "@/lib/utils";

type DayState = "open" | "full" | "closed" | "";
interface DayRow { activity_id: string; date: string; status: DayState; seats: number | null; source: string }
interface Range { activity_id: string; start_date: string; end_date: string; reason: string }
interface Calendar {
  today: string;
  earliest: string;
  last: string;
  days: DayRow[];
  ranges: Range[];
  booked: { activity_id: string; date: string; people: number }[];
  ical: { url: string; synced_at: string; status: string };
}
interface Activity { activity_id: string; title: string; max_per_day: number | null }
interface Preview { activity_id: string; dates: string[]; status: "open" | "full" | "closed" | "clear"; seats: number | null; label: string }

const WEEK = ["Pon", "Uto", "Sri", "Čet", "Pet", "Sub", "Ned"];
const MONTHS = ["siječanj", "veljača", "ožujak", "travanj", "svibanj", "lipanj", "srpanj", "kolovoz", "rujan", "listopad", "studeni", "prosinac"];

const cmp = (a: string, b: string) => a.localeCompare(b);

/** Monday-first grid; whole weeks that are already over are left out so today's week is at the top. */
function monthGrid(year: number, month: number, today: string): (string | null)[] {
  const first = new Date(Date.UTC(year, month, 1));
  const lead = (first.getUTCDay() + 6) % 7;
  const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const cells: (string | null)[] = Array.from({ length: lead }, () => null);
  for (let d = 1; d <= days; d++) cells.push(new Date(Date.UTC(year, month, d)).toISOString().slice(0, 10));
  while (cells.length % 7) cells.push(null);
  const weeks: (string | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks.filter((w) => w.some((d) => d !== null && cmp(d, today) >= 0)).flat();
}

/** Croatian: 1 mjesto, 2–4 mjesta, 5+ mjesta (21 mjesto…). */
function mjesta(n: number): string {
  return n % 10 === 1 && n % 100 !== 11 ? `${n} mjesto` : `${n} mjesta`;
}
function dana(n: number): string {
  return n % 10 === 1 && n % 100 !== 11 ? `${n} dan` : `${n} dana`;
}

interface Shown { state: "free" | "open" | "full" | "closed"; seats: number | null; booked: number; mixed: boolean; fromCalendar: boolean }

export function AvailabilityPanel({ token, activities, calendar }: { token: string; activities: Activity[]; calendar: Calendar }) {
  const [days, setDays] = useState<DayRow[]>(calendar.days);
  const [scope, setScope] = useState<string>(""); // "" = all tours
  const [selected, setSelected] = useState<string[]>([]);
  const [seats, setSeats] = useState<number | null>(null);
  const [askSeats, setAskSeats] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<{ ok: boolean; text: string } | null>(null);
  const startMonth = useMemo(() => {
    const [y, m] = calendar.today.split("-").map(Number);
    return { y, m: m - 1 };
  }, [calendar.today]);
  const [view, setView] = useState(startMonth);

  const shown = (date: string): Shown => {
    const exact = scope ? days.find((d) => d.activity_id === scope && d.date === date && d.status) : undefined;
    const wide = days.find((d) => !d.activity_id && d.date === date && d.status);
    const ov = exact ?? wide;
    const mixed = !scope && days.some((d) => d.activity_id && d.date === date && d.status);
    const booked = calendar.booked
      .filter((b) => b.date === date && (!scope || b.activity_id === scope))
      .reduce((s, b) => s + b.people, 0);
    if (ov) return { state: ov.status as Shown["state"], seats: ov.seats, booked, mixed, fromCalendar: ov.source === "ical" };
    // Day-off ranges entered earlier (or by Opsis in the sheet): all-tours ranges always apply, per-tour ones only in that tour's view.
    const inRange = calendar.ranges.some(
      (r) => (!r.activity_id || r.activity_id === scope) && cmp(r.start_date, date) <= 0 && cmp(date, r.end_date) <= 0,
    );
    return { state: inRange ? "closed" : "free", seats: null, booked, mixed, fromCalendar: false };
  };

  const toggle = (date: string) => setSelected((s) => (s.includes(date) ? s.filter((d) => d !== date) : [...s, date].sort()));

  async function save(status: "open" | "full" | "closed" | "clear", dates = selected, activity = scope, seatCount = seats) {
    if (!dates.length) return;
    setBusy(status);
    setToast(null);
    const res = await postJson<{ saved: number }>("/api/partner/days", {
      token,
      changes: [{ activity_id: activity, dates, status, seats: status === "open" ? seatCount : null }],
    });
    setBusy(null);
    if (!res.data?.ok) {
      setToast({ ok: false, text: res.status === 403 ? "Poveznica više ne vrijedi. Javite nam se za novu." : "Nije spremljeno. Pokušajte ponovno." });
      return false;
    }
    setDays((prev) => {
      const next = prev.filter((d) => !(dates.includes(d.date) && (d.activity_id === activity || (!activity && d.activity_id))));
      if (status !== "clear") {
        const st: DayState = status === "open" && seatCount === 0 ? "full" : status;
        for (const date of dates) next.push({ activity_id: activity, date, status: st, seats: st === "open" ? seatCount : null, source: "kalendar" });
      }
      return next;
    });
    setSelected([]);
    setSeats(null);
    setAskSeats(false);
    const n = dates.length;
    const what = { open: "ima mjesta", full: "pun", closed: "ne radi", clear: "vraćeno na normalno" }[status];
    setToast({ ok: true, text: `Spremljeno: ${dana(n)} · ${what}${status === "open" && seatCount ? ` (${mjesta(seatCount)})` : ""}. Gosti to vide odmah.` });
    return true;
  }

  const cells = monthGrid(view.y, view.m, calendar.today);
  const canPrev = cmp(`${view.y}-${String(view.m + 1).padStart(2, "0")}-01`, calendar.today) > 0;
  const lastMonth = calendar.last.slice(0, 7);
  const canNext = cmp(`${view.y}-${String(view.m + 1).padStart(2, "0")}`, lastMonth) < 0;
  const move = (delta: number) => setView((v) => {
    const m = v.m + delta;
    return { y: v.y + Math.floor(m / 12), m: ((m % 12) + 12) % 12 };
  });

  return (
    <div className="space-y-6">
      <section className="space-y-4 rounded-2xl border border-sand bg-white p-4 sm:p-5" aria-labelledby="cal-h">
        <div className="flex items-start gap-3">
          <CalendarCheck className="mt-1 size-6 shrink-0 text-sea-deep" aria-hidden />
          <div>
            <h2 id="cal-h" className="font-display text-[22px] font-semibold leading-tight">Kad imaš mjesta?</h2>
            <p className="mt-1 text-[15px] text-body">
              Svi dani su <strong>slobodni</strong> dok ne kažeš drugačije, a svaki zahtjev ionako potvrđuješ ti. Dodirni dane pa odaberi što vrijedi.
            </p>
            <p className="mt-1 text-[13px] text-body/80">All days count as free until you say otherwise. Tap days, then choose.</p>
          </div>
        </div>

        {activities.length > 1 && (
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Za koju turu">
            {[{ activity_id: "", title: "Sve moje ture" }, ...activities].map((a) => (
              <button
                key={a.activity_id || "all"}
                type="button"
                role="radio"
                aria-checked={scope === a.activity_id}
                onClick={() => { setScope(a.activity_id); setSelected([]); }}
                className={cn(
                  "min-h-11 rounded-full border px-4 text-[14px] font-semibold",
                  scope === a.activity_id ? "border-ink bg-ink text-stone" : "border-sand bg-stone-2 text-ink",
                )}
              >
                {a.title}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <button type="button" className="grid size-11 place-items-center rounded-full border border-sand disabled:opacity-30" onClick={() => move(-1)} disabled={!canPrev} aria-label="Prethodni mjesec">
            <ChevronLeft className="size-5" aria-hidden />
          </button>
          <p className="font-display text-[19px] font-semibold capitalize" aria-live="polite">{MONTHS[view.m]} {view.y}</p>
          <button type="button" className="grid size-11 place-items-center rounded-full border border-sand disabled:opacity-30" onClick={() => move(1)} disabled={!canNext} aria-label="Sljedeći mjesec">
            <ChevronRight className="size-5" aria-hidden />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1.5 text-center" role="grid" aria-label="Kalendar">
          {WEEK.map((w) => <div key={w} className="pb-1 text-[12px] font-bold uppercase tracking-wide text-body">{w}</div>)}
          {cells.map((date, i) => {
            if (!date) return <div key={`x${i}`} />;
            const out = cmp(date, calendar.today) < 0 || cmp(date, calendar.last) > 0;
            const s = shown(date);
            const isSel = selected.includes(date);
            const label =
              s.state === "full" ? "pun" : s.state === "closed" ? "ne radi" : s.state === "open" && s.seats !== null ? `${s.seats} mj.` : s.state === "open" ? "radi" : "";
            return (
              <button
                key={date}
                type="button"
                disabled={out}
                onClick={() => toggle(date)}
                aria-pressed={isSel}
                aria-label={`${Number(date.slice(8))}. ${label || "slobodno"}${s.booked ? `, ${s.booked} gostiju na zahtjevima` : ""}`}
                className={cn(
                  "relative flex min-h-[54px] flex-col items-center justify-center rounded-xl border text-[16px] font-semibold transition",
                  out && "border-transparent text-body/30",
                  !out && s.state === "free" && "border-sea/40 bg-sea/5",
                  !out && s.state === "open" && "border-sea bg-sea/20",
                  !out && s.state === "full" && "border-danger/50 bg-danger/15 text-ink",
                  !out && s.state === "closed" && "border-sand bg-sand/70 text-body",
                  isSel && "ring-[3px] ring-ink ring-offset-1",
                  date === calendar.today && "underline decoration-2 underline-offset-4",
                )}
              >
                <span>{Number(date.slice(8))}</span>
                {!out && label && <span className="text-[10.5px] font-bold leading-none">{label}</span>}
                {!out && s.booked > 0 && <span className="absolute right-1 top-1 rounded-full bg-sun px-1 text-[10px] font-bold leading-[14px] text-ink" title="Gosti na zahtjevima">{s.booked}</span>}
                {!out && (s.mixed || s.fromCalendar) && <span className="absolute bottom-1 left-1 size-1.5 rounded-full bg-sea-deep" aria-hidden />}
              </button>
            );
          })}
        </div>

        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-body">
          <li><span className="mr-1 inline-block size-3 rounded border border-sea/40 bg-sea/5 align-middle" />slobodno</li>
          <li><span className="mr-1 inline-block size-3 rounded border border-danger/50 bg-danger/15 align-middle" />pun</li>
          <li><span className="mr-1 inline-block size-3 rounded border border-sand bg-sand/70 align-middle" />ne radi</li>
          <li><span className="mr-1 inline-block rounded-full bg-sun px-1 align-middle text-[10px] font-bold">2</span> gosti na zahtjevima</li>
          <li><span className="mr-1 inline-block size-1.5 rounded-full bg-sea-deep align-middle" /> iz tvog kalendara / različito po turama</li>
        </ul>

        {toast && <p className={cn("rounded-xl p-3 text-[15px]", toast.ok ? "bg-sea/15" : "bg-danger/10")} role="status">{toast.text}</p>}
      </section>

      {selected.length > 0 && (
        <div className="sticky bottom-3 z-10 space-y-2.5 rounded-2xl bg-ink p-3 text-stone shadow-2xl">
          <div className="flex items-center justify-between gap-2 px-1">
            <p className="text-[15px] font-semibold">
              Odabrano: {dana(selected.length)}
              {activities.length > 1 && <span className="font-normal text-mist"> · {scope ? activities.find((a) => a.activity_id === scope)?.title : "sve ture"}</span>}
            </p>
            <button type="button" className="min-h-10 px-2 text-[14px] text-mist underline" onClick={() => { setSelected([]); setAskSeats(false); }}>Poništi</button>
          </div>
          {!askSeats ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <button type="button" disabled={!!busy} onClick={() => save("full")} className="min-h-12 rounded-xl bg-danger px-3 text-[16px] font-bold text-ink disabled:opacity-60">
                {busy === "full" ? <Loader2 className="mx-auto size-5 animate-spin" aria-hidden /> : "Pun sam"}
              </button>
              <button type="button" disabled={!!busy} onClick={() => save("closed")} className="min-h-12 rounded-xl bg-sand px-3 text-[16px] font-bold text-ink disabled:opacity-60">
                {busy === "closed" ? <Loader2 className="mx-auto size-5 animate-spin" aria-hidden /> : "Ne radim"}
              </button>
              <button type="button" disabled={!!busy} onClick={() => setAskSeats(true)} className="min-h-12 rounded-xl bg-sea px-3 text-[16px] font-bold text-ink disabled:opacity-60">
                Ima mjesta
              </button>
              <button type="button" disabled={!!busy} onClick={() => save("clear")} className="inline-flex min-h-12 items-center justify-center gap-1.5 rounded-xl border border-mist/40 px-3 text-[16px] font-semibold disabled:opacity-60">
                {busy === "clear" ? <Loader2 className="size-5 animate-spin" aria-hidden /> : <><RotateCcw className="size-4" aria-hidden /> Vrati</>}
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-3 px-1 text-[15px]">
                <span className="text-mist">Koliko slobodnih mjesta?</span>
                <div className="flex items-center gap-2">
                  <button type="button" className="grid size-11 place-items-center rounded-full bg-ink-3" onClick={() => setSeats((v) => (v === null || v <= 1 ? null : v - 1))} aria-label="Manje"><Minus className="size-4" aria-hidden /></button>
                  <span className="min-w-9 text-center text-[20px] font-bold" aria-live="polite">{seats ?? "?"}</span>
                  <button type="button" className="grid size-11 place-items-center rounded-full bg-ink-3" onClick={() => setSeats((v) => Math.min(500, (v ?? 0) + 1))} aria-label="Više"><Plus className="size-4" aria-hidden /></button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" disabled={!!busy} onClick={() => save("open")} className="min-h-12 rounded-xl bg-sea px-3 text-[16px] font-bold text-ink disabled:opacity-60">
                  {busy === "open" ? <Loader2 className="mx-auto size-5 animate-spin" aria-hidden /> : seats !== null ? `Spremi: ${mjesta(seats)}` : "Spremi (ne znam broj)"}
                </button>
                <button type="button" disabled={!!busy} onClick={() => { setAskSeats(false); setSeats(null); }} className="min-h-12 rounded-xl border border-mist/40 px-3 text-[15px] font-semibold">Natrag</button>
              </div>
            </div>
          )}
        </div>
      )}

      <MessageBox token={token} onSaved={(changes) => {
        setDays((prev) => {
          let next = [...prev];
          for (const c of changes) {
            next = next.filter((d) => !(c.dates.includes(d.date) && (d.activity_id === c.activity_id || (!c.activity_id && d.activity_id))));
            if (c.status !== "clear") {
              const st: DayState = c.status === "open" && c.seats === 0 ? "full" : c.status;
              for (const date of c.dates) next.push({ activity_id: c.activity_id, date, status: st, seats: st === "open" ? c.seats : null, source: "poruka" });
            }
          }
          return next;
        });
      }} />

      <CalendarLink token={token} initial={calendar.ical} />
    </div>
  );
}

function MessageBox({ token, onSaved }: { token: string; onSaved: (c: Preview[]) => void }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<{ changes: Preview[]; not_understood: string | null } | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function read() {
    setBusy(true);
    setMsg(null);
    setPreview(null);
    const res = await postJson<{ preview: { changes: Preview[]; not_understood: string | null } }>("/api/partner/days/read", { token, text });
    setBusy(false);
    if (res.data?.ok) {
      setPreview(res.data.preview);
      if (!res.data.preview.changes.length) setMsg({ ok: false, text: "Nisam našao nijedan datum. Napiši npr. „sutra pun” ili „od 1. do 5. 12. ne radimo”." });
    } else {
      const code = (res.data as { code?: string } | undefined)?.code;
      setMsg({ ok: false, text: code === "ai_unavailable" ? "Ova opcija još nije uključena. Koristi kalendar iznad." : code === "rate_limited" ? "Previše pokušaja. Pričekaj malo ili koristi kalendar." : "Nisam uspio pročitati poruku. Pokušaj ponovno ili koristi kalendar." });
    }
  }

  async function saveAll() {
    if (!preview?.changes.length) return;
    setBusy(true);
    const res = await postJson<{ saved: number }>("/api/partner/days", {
      token,
      changes: preview.changes.map((c) => ({ activity_id: c.activity_id, dates: c.dates, status: c.status, seats: c.seats })),
    });
    setBusy(false);
    if (res.data?.ok) {
      onSaved(preview.changes);
      setPreview(null);
      setText("");
      setMsg({ ok: true, text: "Spremljeno. Kalendar iznad je osvježen." });
    } else {
      setMsg({ ok: false, text: "Nije spremljeno. Pokušaj ponovno." });
    }
  }

  return (
    <section className="space-y-3 rounded-2xl border border-sand bg-white p-4 sm:p-5" aria-labelledby="msg-h">
      <div className="flex items-start gap-3">
        <MessageSquareText className="mt-1 size-6 shrink-0 text-sea-deep" aria-hidden />
        <div>
          <h2 id="msg-h" className="font-display text-[22px] font-semibold leading-tight">Ili napiši kao poruku</h2>
          <p className="mt-1 text-[15px] text-body">Napiši svojim riječima, kao na WhatsAppu. Prije spremanja ti pokažemo što smo razumjeli. Na mobitelu možeš i izgovoriti: dodirni mikrofon na tipkovnici.</p>
          <p className="mt-1 text-[13px] text-body/80">Write it in your own words (Croatian or English). We show you what we understood before saving.</p>
        </div>
      </div>
      <label htmlFor="msg" className="sr-only">Poruka</label>
      <textarea
        id="msg"
        rows={3}
        maxLength={600}
        className="light-field resize-none text-[16px]"
        placeholder="npr. Sutra smo puni. U subotu još 4 mjesta. Od 1. do 10. 12. ne radimo."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button type="button" className="btn-dark w-full sm:w-auto" disabled={busy || text.trim().length < 3} onClick={read}>
        {busy && !preview ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null} Pročitaj poruku
      </button>
      {preview && preview.changes.length > 0 && (
        <div className="space-y-3 rounded-xl border border-sea/40 bg-sea/5 p-3">
          <p className="text-[14px] font-semibold">Ovako smo razumjeli:</p>
          <ul className="space-y-1.5 text-[15px]">
            {preview.changes.map((c, i) => <li key={i} className="flex gap-2"><span aria-hidden>•</span><span>{c.label}</span></li>)}
          </ul>
          {preview.not_understood && <p className="text-[13px] text-body">Nije jasno: {preview.not_understood}</p>}
          <div className="grid gap-2 sm:grid-cols-2">
            <button type="button" className="btn-dark" disabled={busy} onClick={saveAll}>
              {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null} Točno je, spremi
            </button>
            <button type="button" className="min-h-12 rounded-xl border border-sand bg-white px-4 text-[15px] font-semibold" onClick={() => setPreview(null)}>
              Nije, ispravit ću
            </button>
          </div>
        </div>
      )}
      {msg && <p className={cn("rounded-xl p-3 text-[14px]", msg.ok ? "bg-sea/15" : "bg-danger/10")} role="status">{msg.text}</p>}
    </section>
  );
}

function CalendarLink({ token, initial }: { token: string; initial: Calendar["ical"] }) {
  const [url, setUrl] = useState(initial.url);
  const [linked, setLinked] = useState(initial.url);
  const [status, setStatus] = useState(initial.status);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [open, setOpen] = useState(!!initial.url);

  async function submit(value: string) {
    setBusy(true);
    setMsg(null);
    const res = await postJson<{ blocked: number }>("/api/partner/calendar-link", { token, url: value });
    setBusy(false);
    if (res.data?.ok) {
      setLinked(value);
      setStatus(value ? `ok: ${res.data.blocked} zauzetih dana` : "");
      setMsg({ ok: true, text: value ? `Povezano. Iz tvog kalendara smo preuzeli ${res.data.blocked} zauzetih dana i osvježavamo ga svako jutro. Osvježi stranicu da ih vidiš u kalendaru.` : "Kalendar je odspojen." });
    } else {
      const d = res.data as { code?: string; hint?: string } | undefined;
      setMsg({
        ok: false,
        text:
          d?.hint === "google_ical" ? "To je poveznica za pregled, ne za uvoz. U Google kalendaru kopiraj „Tajna adresa u iCal formatu” (završava s .ics)."
          : d?.code === "url_not_allowed" ? "Ovu poveznicu ne možemo koristiti. Treba počinjati s https:// i biti iz Google, Apple ili Outlook kalendara ili sustava za rezervacije. Pošalji nam je mailom pa ćemo pogledati."
          : "Kalendar se ne može pročitati. Provjeri je li to adresa u iCal formatu (.ics).",
      });
    }
  }

  return (
    <section className="space-y-3 rounded-2xl border border-sand bg-white p-4 sm:p-5" aria-labelledby="ical-h">
      <button type="button" className="flex w-full items-start gap-3 text-left" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <Link2 className="mt-1 size-6 shrink-0 text-sea-deep" aria-hidden />
        <span>
          <span id="ical-h" className="block font-display text-[22px] font-semibold leading-tight">Već vodiš kalendar?</span>
          <span className="mt-1 block text-[15px] text-body">Poveži Google kalendar ili svoj sustav za rezervacije (Bókun, FareHarbor…) i ne moraš ništa upisivati dvaput.</span>
        </span>
      </button>
      {open && (
        <div className="space-y-3">
          <ol className="list-decimal space-y-1 pl-5 text-[14px] text-body">
            <li>Google kalendar na računalu → kotačić <strong>Postavke</strong> → lijevo klikni svoj kalendar.</li>
            <li>Na dnu kopiraj <strong>„Tajna adresa u iCal formatu”</strong> i zalijepi je ovdje.</li>
            <li>Kad si pun ili ne radiš, upiši <strong>cjelodnevni događaj</strong> (npr. „PUN” ili „ne radim”). Obični termini s gostima se ne broje.</li>
          </ol>
          <label htmlFor="ical" className="light-label">Adresa kalendara (iCal)</label>
          <input id="ical" type="url" inputMode="url" className="light-field" placeholder="https://calendar.google.com/calendar/ical/…/basic.ics" value={url} onChange={(e) => setUrl(e.target.value)} />
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-dark" disabled={busy || !url.trim()} onClick={() => submit(url.trim())}>
              {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null} {linked ? "Spremi i osvježi" : "Poveži"}
            </button>
            {linked && (
              <button type="button" className="min-h-12 rounded-xl border border-sand bg-white px-4 text-[15px] font-semibold" disabled={busy} onClick={() => { setUrl(""); submit(""); }}>
                Odspoji
              </button>
            )}
          </div>
          {linked && status && <p className="text-[13px] text-body">Stanje: {status}</p>}
          {msg && <p className={cn("rounded-xl p-3 text-[14px]", msg.ok ? "bg-sea/15" : "bg-danger/10")} role="status">{msg.text}</p>}
        </div>
      )}
    </section>
  );
}
