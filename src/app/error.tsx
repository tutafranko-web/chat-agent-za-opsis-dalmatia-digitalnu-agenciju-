"use client";

import Link from "next/link";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-ink px-6 text-center text-stone">
      <p className="text-[12px] font-bold uppercase tracking-[0.25em] text-sea">Opsis · AI Concierge</p>
      <h1 className="font-display text-[28px] font-semibold">Something went wrong</h1>
      <p className="max-w-md text-[15px] text-mist" lang="hr">Nešto je pošlo po zlu. Pokušajte ponovno.</p>
      <div className="flex gap-3">
        <button type="button" onClick={reset} className="btn-primary">Try again · Pokušaj ponovno</button>
        <Link href="/" className="btn-ghost">Home</Link>
      </div>
    </main>
  );
}
