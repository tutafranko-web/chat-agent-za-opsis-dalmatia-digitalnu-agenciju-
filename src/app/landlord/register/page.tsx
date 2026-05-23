"use client";

import Image from "next/image";
import { useState } from "react";

export default function LandlordRegisterPage() {
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", propertyName: "", address: "", city: "" });
  const [status, setStatus] = useState<"idle" | "submitting" | "ok" | "error">("idle");
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ landlordId: string; trackingUrl: string; qrDataUrl: string } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setError("");
    try {
      const res = await fetch("/api/landlord/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed");
      setResult({ landlordId: data.landlordId, trackingUrl: data.trackingUrl, qrDataUrl: data.qrDataUrl });
      setStatus("ok");
    } catch (err: unknown) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Failed");
    }
  }

  if (status === "ok" && result) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16 text-white">
        <h1 className="mb-4 text-3xl font-bold">You&apos;re in! 🎉</h1>
        <p className="mb-6">Your landlord ID: <code className="rounded bg-zinc-800 px-2 py-1">{result.landlordId}</code></p>
        <p className="mb-2">Print and display this QR code in your property:</p>
        {result.qrDataUrl && (
          <Image src={result.qrDataUrl} alt="Your QR code" width={256} height={256} className="rounded bg-white p-3" unoptimized />
        )}
        <p className="mt-4 text-sm text-zinc-400">Direct link: <a className="text-cyan-400 underline" href={result.trackingUrl}>{result.trackingUrl}</a></p>
        <p className="mt-2 text-sm text-zinc-400">A copy has also been sent to your email.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12 text-white">
      <h1 className="mb-2 text-3xl font-bold">Earn commission from your apartment guests</h1>
      <p className="mb-8 text-zinc-400">Register your apartment / villa. We&apos;ll give you a QR code that earns you commission whenever your guests book an activity through it.</p>
      <form onSubmit={onSubmit} className="space-y-4">
        <Input label="Full name" value={form.fullName} onChange={(v) => setForm({ ...form, fullName: v })} required />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
          <Input label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} required />
        </div>
        <Input label="Property name" value={form.propertyName} onChange={(v) => setForm({ ...form, propertyName: v })} required />
        <Input label="Address" value={form.address} onChange={(v) => setForm({ ...form, address: v })} required />
        <Input label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} required />

        {error && <p className="text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={status === "submitting"}
          className="rounded bg-cyan-500 px-6 py-3 font-semibold text-black hover:bg-cyan-400 disabled:opacity-50"
        >
          {status === "submitting" ? "Generating QR…" : "Register & get my QR"}
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
