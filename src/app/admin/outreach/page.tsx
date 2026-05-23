"use client";

import { useState } from "react";

type Audience = "operators" | "landlords";

export default function AdminOutreachPage() {
  const [token, setToken] = useState("");
  const [audience, setAudience] = useState<Audience>("operators");
  const [limit, setLimit] = useState(10);
  const [dryRun, setDryRun] = useState(true);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string>("");

  async function run() {
    if (!token) {
      setResult("Enter your admin token.");
      return;
    }
    setBusy(true);
    setResult("");
    try {
      const res = await fetch(`/api/outreach/${audience}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ limit, dryRun }),
      });
      const data = await res.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (e) {
      setResult(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-12 text-white">
      <h1 className="mb-2 text-3xl font-bold">Outreach (admin)</h1>
      <p className="mb-8 text-zinc-400">Send outreach emails to operator or landlord leads. Always dry-run first.</p>

      <div className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm text-zinc-300">Admin token</span>
          <input
            className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-zinc-300">Audience</span>
          <select
            className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
            value={audience}
            onChange={(e) => setAudience(e.target.value as Audience)}
          >
            <option value="operators">Operators (WF1)</option>
            <option value="landlords">Landlords (WF3)</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-zinc-300">Limit (max 50)</span>
          <input
            type="number"
            min={1}
            max={50}
            className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
          />
        </label>

        <label className="flex items-center gap-2 text-sm text-zinc-300">
          <input type="checkbox" checked={dryRun} onChange={(e) => setDryRun(e.target.checked)} />
          Dry run (don&apos;t actually send)
        </label>

        <button
          onClick={run}
          disabled={busy}
          className="rounded bg-cyan-500 px-6 py-3 font-semibold text-black hover:bg-cyan-400 disabled:opacity-50"
        >
          {busy ? "Running…" : dryRun ? "Preview" : "Send"}
        </button>

        {result && <pre className="whitespace-pre-wrap rounded border border-zinc-700 bg-zinc-900 p-4 text-sm text-zinc-100">{result}</pre>}
      </div>
    </main>
  );
}
