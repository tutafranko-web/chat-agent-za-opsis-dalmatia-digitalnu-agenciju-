"use client";

import { useState } from "react";

const REASONS = ["Weather", "Maintenance", "Equipment", "Holiday", "Private Event", "Other"];

export default function DayOffPage() {
  const [form, setForm] = useState({ companyName: "", email: "", startDate: "", endDate: "", reason: REASONS[0], notes: "" });
  const [status, setStatus] = useState<"idle" | "submitting" | "ok" | "error">("idle");
  const [error, setError] = useState("");
  const [days, setDays] = useState(0);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setError("");
    try {
      const res = await fetch("/api/operator/day-off", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed");
      setDays(data.daysBlocked);
      setStatus("ok");
    } catch (err: unknown) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Failed");
    }
  }

  if (status === "ok") {
    return (
      <main className="mx-auto max-w-xl px-6 py-16 text-white">
        <h1 className="mb-4 text-3xl font-bold">Got it ✅</h1>
        <p>We&apos;ve blocked {days} {days === 1 ? "day" : "days"} for <strong>{form.companyName}</strong>. The concierge will not propose your business for bookings in that range.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-12 text-white">
      <h1 className="mb-2 text-3xl font-bold">Mark days off</h1>
      <p className="mb-8 text-zinc-400">Block a date range when your business is unavailable.</p>
      <form onSubmit={onSubmit} className="space-y-4">
        <Input label="Company name" value={form.companyName} onChange={(v) => setForm({ ...form, companyName: v })} required />
        <Input label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Start date" type="date" value={form.startDate} onChange={(v) => setForm({ ...form, startDate: v })} required />
          <Input label="End date" type="date" value={form.endDate} onChange={(v) => setForm({ ...form, endDate: v })} required />
        </div>
        <label className="block">
          <span className="mb-1 block text-sm text-zinc-300">Reason</span>
          <select
            className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
          >
            {REASONS.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-zinc-300">Notes (optional)</span>
          <textarea
            className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
            rows={3}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </label>

        {error && <p className="text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={status === "submitting"}
          className="rounded bg-cyan-500 px-6 py-3 font-semibold text-black hover:bg-cyan-400 disabled:opacity-50"
        >
          {status === "submitting" ? "Saving…" : "Block these dates"}
        </button>
      </form>
    </main>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-zinc-300">{label}</span>
      <input
        className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
    </label>
  );
}
