import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-zinc-950">
      <div className="mx-auto max-w-md px-4 text-center">
        <p className="text-6xl font-bold text-blue-500">404</p>
        <h1 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
          Stranica Nije Pronađena
        </h1>
        <p className="mt-4 text-zinc-400 leading-relaxed">
          Stranica koju tražite ne postoji ili je premještena. Provjerite URL
          adresu ili se vratite na početnu stranicu.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/hr"
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors"
          >
            Početna Stranica
          </Link>
          <Link
            href="/hr/kontakt"
            className="inline-flex items-center justify-center px-6 py-3 border border-zinc-700 hover:border-zinc-500 text-zinc-300 font-semibold rounded-lg transition-colors"
          >
            Kontaktirajte Nas
          </Link>
        </div>
      </div>
    </div>
  );
}
