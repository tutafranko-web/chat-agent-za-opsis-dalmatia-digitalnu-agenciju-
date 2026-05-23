"use client";

import { useState } from "react";

export default function PhotosPage() {
  const [form, setForm] = useState({ companyName: "", email: "", galleryUrl: "", photoUrls: "" });
  const [status, setStatus] = useState<"idle" | "submitting" | "ok" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setError("");
    const photoUrls = form.photoUrls
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    try {
      const res = await fetch("/api/operator/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, photoUrls }),
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
      <main className="mx-auto max-w-xl px-6 py-16 text-white">
        <h1 className="mb-4 text-3xl font-bold">Photos received 📸</h1>
        <p>Thanks! We&apos;ll attach them to your operator profile shortly.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-12 text-white">
      <h1 className="mb-2 text-3xl font-bold">Submit activity photos</h1>
      <p className="mb-8 text-zinc-400">
        Host your photos on Google Drive, iCloud Photos, Dropbox or your own website, then paste the public links here.
      </p>
      <form onSubmit={onSubmit} className="space-y-4">
        <Input label="Company name" value={form.companyName} onChange={(v) => setForm({ ...form, companyName: v })} required />
        <Input label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
        <Input label="Public gallery URL (Drive/iCloud folder, optional)" value={form.galleryUrl} onChange={(v) => setForm({ ...form, galleryUrl: v })} />
        <label className="block">
          <span className="mb-1 block text-sm text-zinc-300">Individual photo URLs (one per line)</span>
          <textarea
            className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
            rows={6}
            value={form.photoUrls}
            onChange={(e) => setForm({ ...form, photoUrls: e.target.value })}
            placeholder={"https://drive.google.com/...\nhttps://photos.app.goo.gl/..."}
          />
        </label>

        {error && <p className="text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={status === "submitting"}
          className="rounded bg-cyan-500 px-6 py-3 font-semibold text-black hover:bg-cyan-400 disabled:opacity-50"
        >
          {status === "submitting" ? "Submitting…" : "Submit photos"}
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
