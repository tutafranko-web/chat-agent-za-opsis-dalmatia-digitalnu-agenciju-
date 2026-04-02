import type { Metadata } from "next";
import { HeroSection } from "@/components/hr/hero-section";
import { CTASection } from "@/components/hr/cta-section";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { generateLocalBusinessSchema } from "@/lib/structured-data";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Kontaktirajte Nas",
  description:
    "Kontaktirajte Opsis Dalmatia — digitalnu turističku agenciju u Splitu. E-mail, telefon, adresa i kontakt forma za sve vaše upite o AI rješenjima za turizam.",
  keywords: [
    "kontakt",
    "kontakt Opsis Dalmatia",
    "kontakt Split",
    "turistička agencija kontakt",
  ],
  alternates: {
    canonical: "https://opsisdalmatia.com/hr/kontakt",
    languages: { hr: "/hr/kontakt", en: "/en/contact" },
  },
  openGraph: {
    title: "Kontakt — Opsis Dalmatia",
    description:
      "Kontaktirajte nas za besplatnu konzultaciju o AI rješenjima za vašu turističku agenciju.",
    url: "https://opsisdalmatia.com/hr/kontakt",
    locale: "hr_HR",
  },
};

export default function KontaktPage() {
  return (
    <>
      <JsonLd data={generateLocalBusinessSchema()} />

      <Breadcrumbs
        locale="hr"
        items={[
          { name: "Početna", href: "/hr" },
          { name: "Kontakt", href: "/hr/kontakt" },
        ]}
      />

      <HeroSection
        title="Kontaktirajte Nas"
        subtitle="Imate pitanje o našim uslugama? Želite besplatnu konzultaciju? Javite nam se — odgovaramo u roku od 24 sata."
      />

      {/* Contact Info + Form */}
      <section className="py-16 bg-zinc-950">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 sm:text-3xl">
                Kontakt Informacije
              </h2>
              <div className="space-y-6">
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Adresa</h3>
                  <p className="text-zinc-400 text-sm">
                    Opsis Dalmatia<br />
                    Split 21000<br />
                    Splitsko-dalmatinska županija<br />
                    Hrvatska
                  </p>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-3">E-mail</h3>
                  <a
                    href="mailto:info@opsisdalmatia.com"
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    info@opsisdalmatia.com
                  </a>
                  <p className="text-zinc-500 text-xs mt-1">
                    Odgovaramo na sve upite u roku od 24 sata.
                  </p>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Telefon</h3>
                  <a
                    href="tel:+38521000000"
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    +385 21 000 000
                  </a>
                  <p className="text-zinc-500 text-xs mt-1">
                    Ili isprobajte našeg glasovnog AI agenta koji je dostupan 24/7.
                  </p>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Radno Vrijeme</h3>
                  <div className="text-sm text-zinc-400 space-y-1">
                    <p>Ponedjeljak — Petak: 09:00 — 17:00</p>
                    <p>Subota: 09:00 — 13:00</p>
                    <p>Nedjelja: Zatvoreno</p>
                    <p className="text-zinc-500 text-xs mt-2">
                      Naš AI chatbot i glasovni agent dostupni su 24/7, uključujući
                      vikende i praznike.
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-white mb-3">
                  Pratite Nas
                </h3>
                <div className="flex gap-4">
                  <a
                    href="https://instagram.com/opsisdalmatia"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-400 hover:text-white text-sm transition-colors"
                  >
                    Instagram
                  </a>
                  <a
                    href="https://facebook.com/opsisdalmatia"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-400 hover:text-white text-sm transition-colors"
                  >
                    Facebook
                  </a>
                  <a
                    href="https://linkedin.com/company/opsisdalmatia"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-400 hover:text-white text-sm transition-colors"
                  >
                    LinkedIn
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form (visual placeholder) */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 sm:text-3xl">
                Pošaljite Upit
              </h2>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                    Ime i prezime
                  </label>
                  <div className="w-full h-10 bg-zinc-800 border border-zinc-700 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                    E-mail adresa
                  </label>
                  <div className="w-full h-10 bg-zinc-800 border border-zinc-700 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                    Naziv tvrtke / agencije
                  </label>
                  <div className="w-full h-10 bg-zinc-800 border border-zinc-700 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                    Usluga koja vas zanima
                  </label>
                  <div className="w-full h-10 bg-zinc-800 border border-zinc-700 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                    Vaša poruka
                  </label>
                  <div className="w-full h-28 bg-zinc-800 border border-zinc-700 rounded-lg" />
                </div>
                <div className="w-full h-11 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    Pošaljite Poruku
                  </span>
                </div>
                <p className="text-xs text-zinc-500">
                  Vaši podaci su sigurni. Koristimo ih isključivo za odgovor na vaš upit.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Help */}
      <section className="py-16 bg-zinc-900/50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white mb-6 sm:text-3xl text-center">
            Ne Želite Čekati? Razgovarajte s Chatbotom
          </h2>
          <p className="text-center text-zinc-300 leading-relaxed max-w-2xl mx-auto">
            Naš AI chatbot može odmah odgovoriti na vaša pitanja o našim{" "}
            <Link
              href="/hr/usluge"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              uslugama
            </Link>
            , cijenama i procesu implementacije. Dostupan je 24/7 i govori
            hrvatski, engleski i mnoge druge jezike. Isprobajte ga odmah — bez
            registracije, bez obveza.
          </p>
          <p className="text-center mt-4 text-zinc-400 text-sm">
            Ili saznajte više o{" "}
            <Link
              href="/hr/o-nama"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              našem timu
            </Link>{" "}
            i{" "}
            <Link
              href="/hr/digitalna-turisticka-agencija"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              što je digitalna turistička agencija
            </Link>
            .
          </p>
        </div>
      </section>

      {/* CTA */}
      <CTASection
        title="Isprobajte AI chatbot odmah"
        description="Brži od kontakt forme, dostupniji od telefona. Naš chatbot zna sve o našim uslugama i može vam pomoći odmah."
        buttonText="Isprobajte Chatbot"
        buttonHref="/"
      />
    </>
  );
}
