import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-ink px-6 text-center text-stone">
      <p className="text-[12px] font-bold uppercase tracking-[0.25em] text-sea">Opsis · AI Concierge</p>
      <h1 className="font-display text-[28px] font-semibold">Page not found</h1>
      <p className="max-w-md text-[15px] text-mist" lang="hr">Stranica ne postoji ili je premještena.</p>
      <Link href="/" className="btn-primary">Open the concierge · Otvori concierge</Link>
    </main>
  );
}
