"use client";

import { useState } from "react";

const EMPTY_ACTIVITY = { category: "", name: "", pricePerPerson: "", childPrice: "", commissionPercent: "" };

export default function OperatorRegisterPage() {
  const [form, setForm] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    city: "",
    website: "",
    address: "",
    activities: [{ ...EMPTY_ACTIVITY }],
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "ok" | "error">("idle");
  const [error, setError] = useState("");

  const setField = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const setActivity = (i: number, k: keyof typeof EMPTY_ACTIVITY, v: string) =>
    setForm((f) => {
      const next = [...f.activities];
      next[i] = { ...next[i], [k]: v };
      return { ...f, activities: next };
    });
  const addActivity = () =>
    setForm((f) => (f.activities.length < 5 ? { ...f, activities: [...f.activities, { ...EMPTY_ACTIVITY }] } : f));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setError("");
    try {
      const res = await fetch("/api/operator/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed");
      setStatus("ok");
    } catch (err: unknown) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Failed");
    }
  }

  if (status === "ok") {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16 text-white">
        <h1 className="mb-4 text-3xl font-bold">Thank you! 🎉</h1>
        <p>Your registration has been received. We&apos;ll email {form.email} shortly with next steps.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12 text-white">
      <h1 className="mb-2 text-3xl font-bold">Become an Opsis Operator</h1>
      <p className="mb-8 text-zinc-400">Register your tourism business to join our Split &amp; Dalmatia booking platform.</p>
      <form onSubmit={onSubmit} className="space-y-4">
        <Input label="Company name" value={form.companyName} onChange={(v) => setField("companyName", v)} required />
        <Input label="Contact person" value={form.contactPerson} onChange={(v) => setField("contactPerson", v)} required />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Email" type="email" value={form.email} onChange={(v) => setField("email", v)} required />
          <Input label="Phone" value={form.phone} onChange={(v) => setField("phone", v)} required />
        </div>
        <Input label="City" value={form.city} onChange={(v) => setField("city", v)} required />
        <Input label="Website (optional)" value={form.website} onChange={(v) => setField("website", v)} />
        <Input label="Business address" value={form.address} onChange={(v) => setField("address", v)} />

        <div className="mt-8">
          <h2 className="mb-3 text-xl font-semibold">Activities you offer</h2>
          {form.activities.map((a, i) => (
            <div key={i} className="mb-4 rounded border border-zinc-700 p-4">
              <div className="mb-2 text-sm font-medium text-zinc-300">Activity {i + 1}</div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Category" value={a.category} onChange={(v) => setActivity(i, "category", v)} />
                <Input label="Activity name" value={a.name} onChange={(v) => setActivity(i, "name", v)} />
                <Input label="Price per adult (EUR)" value={String(a.pricePerPerson)} onChange={(v) => setActivity(i, "pricePerPerson", v)} />
                <Input label="Price per child (EUR)" value={String(a.childPrice)} onChange={(v) => setActivity(i, "childPrice", v)} />
                <Input label="Commission %" value={String(a.commissionPercent)} onChange={(v) => setActivity(i, "commissionPercent", v)} />
              </div>
            </div>
          ))}
          {form.activities.length < 5 && (
            <button type="button" onClick={addActivity} className="text-sm text-cyan-400 hover:underline">
              + Add another activity
            </button>
          )}
        </div>

        {error && <p className="text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={status === "submitting"}
          className="rounded bg-cyan-500 px-6 py-3 font-semibold text-black hover:bg-cyan-400 disabled:opacity-50"
        >
          {status === "submitting" ? "Submitting…" : "Register"}
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
