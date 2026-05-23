"use client";

import Link from "next/link";
import { useState } from "react";

const QUESTIONS = [
  { id: "pace", q: "What's your ideal pace?", opts: ["Relaxed", "Balanced", "Adrenaline"] },
  { id: "scene", q: "Where do you prefer to spend time?", opts: ["On the water", "In the mountains", "In the city", "Inland nature"] },
  { id: "group", q: "Travelling as…", opts: ["Solo", "Couple", "Family with kids", "Group of friends"] },
  { id: "budget", q: "Budget per person per activity?", opts: ["Under 30 EUR", "30–80 EUR", "80–150 EUR", "150+ EUR"] },
  { id: "interests", q: "Pick what excites you (any)", opts: ["History", "Wine & food", "Boats", "Cliffs & speed", "Nightlife"] },
] as const;

export default function QuizPage() {
  const [form, setForm] = useState({ name: "", email: "", answers: {} as Record<string, string> });
  const [status, setStatus] = useState<"idle" | "submitting" | "ok" | "error">("idle");
  const [error, setError] = useState("");
  const [recommendation, setRecommendation] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setError("");
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed");
      setRecommendation(data.recommendation || "");
      setStatus("ok");
    } catch (err: unknown) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Failed");
    }
  }

  if (status === "ok") {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16 text-white">
        <h1 className="mb-4 text-3xl font-bold">Your recommendations 🎯</h1>
        <pre className="whitespace-pre-wrap rounded border border-zinc-700 bg-zinc-900 p-4 font-sans text-zinc-100">{recommendation}</pre>
        <p className="mt-6 text-sm text-zinc-400">A copy has been emailed to {form.email}.</p>
        <Link href="/" className="mt-4 inline-block rounded bg-cyan-500 px-4 py-2 font-semibold text-black hover:bg-cyan-400">
          Open the concierge
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12 text-white">
      <h1 className="mb-2 text-3xl font-bold">Discover your Dalmatia 🌊</h1>
      <p className="mb-8 text-zinc-400">Answer 5 quick questions and we&apos;ll recommend activities tailored to you.</p>
      <form onSubmit={onSubmit} className="space-y-6">
        {QUESTIONS.map((q) => (
          <fieldset key={q.id}>
            <legend className="mb-2 font-medium">{q.q}</legend>
            <div className="flex flex-wrap gap-2">
              {q.opts.map((opt) => {
                const active = form.answers[q.id] === opt;
                return (
                  <button
                    type="button"
                    key={opt}
                    onClick={() => setForm((f) => ({ ...f, answers: { ...f.answers, [q.id]: opt } }))}
                    className={`rounded border px-3 py-1.5 text-sm ${
                      active ? "border-cyan-500 bg-cyan-500/20 text-cyan-300" : "border-zinc-700 bg-zinc-900 text-zinc-300"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}

        <div className="grid grid-cols-2 gap-4 border-t border-zinc-800 pt-6">
          <Input label="Your name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <Input label="Email (for results)" type="email" required value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
        </div>

        {error && <p className="text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={status === "submitting"}
          className="rounded bg-cyan-500 px-6 py-3 font-semibold text-black hover:bg-cyan-400 disabled:opacity-50"
        >
          {status === "submitting" ? "Generating…" : "Show my recommendations"}
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
