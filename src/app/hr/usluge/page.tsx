import type { Metadata } from "next";
import { HeroSection } from "@/components/hr/hero-section";
import { ServiceCard } from "@/components/hr/service-card";
import { CTASection } from "@/components/hr/cta-section";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Naše Usluge — AI Rješenja za Turizam",
  description:
    "Opsis Dalmatia nudi AI chatbotove, glasovne agente, automatizaciju procesa, web razvoj i digitalni marketing za turističke agencije u Dalmaciji.",
  keywords: [
    "usluge",
    "AI usluge turizam",
    "chatbot usluga",
    "web razvoj turizam",
    "digitalni marketing turizam",
    "automatizacija agencije",
  ],
  alternates: {
    canonical: "https://opsisdalmatia.com/hr/usluge",
    languages: { hr: "/hr/usluge", en: "/en/services" },
  },
  openGraph: {
    title: "Usluge — Opsis Dalmatia",
    description:
      "Kompletna ponuda digitalnih usluga za turističke agencije: chatbotovi, AI agenti, glasovni agenti, web i marketing.",
    url: "https://opsisdalmatia.com/hr/usluge",
    locale: "hr_HR",
  },
};

export default function UslugePage() {
  return (
    <>
      <Breadcrumbs
        locale="hr"
        items={[
          { name: "Početna", href: "/hr" },
          { name: "Usluge", href: "/hr/usluge" },
        ]}
      />

      <HeroSection
        title="Naše Usluge"
        subtitle="Kompletna ponuda AI-pogonjenih digitalnih usluga za turističke agencije, iznajmljivače i operatere aktivnosti u Dalmaciji."
      />

      {/* Main Services */}
      <section className="py-16 bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white mb-8 sm:text-3xl text-center">
            AI Rješenja za Turizam
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <ServiceCard
              title="AI Chatbotovi"
              description="Virtualni concierge koji razgovara s turistima 24/7 na svim jezicima. Preporučuje aktivnosti, daje informacije o destinaciji i obrađuje rezervacije automatski. Integrira se s vašom web stranicom i društvenim mrežama."
              href="/hr/chatbotovi"
              icon="💬"
            />
            <ServiceCard
              title="AI Agenti"
              description="Inteligentni sustavi koji automatiziraju cijele poslovne procese — od obrade dolaznih upita i rezervacija do generiranja izvještaja i analize podataka. Rade u pozadini bez potrebe za stalnom supervizijom."
              href="/hr/ai-agenti"
              icon="🤖"
            />
            <ServiceCard
              title="Glasovni Agenti"
              description="Voice AI tehnologija koja odgovara na vaše telefonske pozive profesionalno i na jeziku pozivatelja. Potvrđuje rezervacije, daje informacije i nikad ne propušta poziv — čak ni usred noći ili vikendima."
              href="/hr/glasovni-agenti"
              icon="🎙️"
            />
          </div>
        </div>
      </section>

      {/* Additional Services */}
      <section className="py-16 bg-zinc-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white mb-8 sm:text-3xl text-center">
            Dodatne Usluge
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-600 transition-colors">
              <div className="text-4xl mb-4">🌐</div>
              <h3 className="text-lg font-semibold text-white mb-2">Web Razvoj</h3>
              <p className="text-sm text-zinc-400 mb-4 leading-relaxed">
                Izrada brzih, SEO-optimiziranih web stranica za turističke agencije i
                operatere aktivnosti. Responzivni dizajn, višejezičnost, integracija s
                booking sustavima i AI chatbot. Koristimo najnovije tehnologije — Next.js,
                React, Tailwind CSS — za stranice koje se učitavaju brzo i rangiraju visoko
                na Google-u.
              </p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-600 transition-colors">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-lg font-semibold text-white mb-2">Digitalni Marketing</h3>
              <p className="text-sm text-zinc-400 mb-4 leading-relaxed">
                Strategija digitalnog marketinga prilagođena turističkom sektoru. SEO
                optimizacija za lokalne i međunarodne pretrage, Google Ads kampanje,
                upravljanje društvenim mrežama i sadržajni marketing. Pomažemo vam da
                dođete do pravih turista u pravom trenutku — kada planiraju putovanje
                u Dalmaciju.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-zinc-950">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white mb-6 sm:text-3xl">
            Zašto Odabrati Opsis Dalmatia?
          </h2>
          <div className="space-y-4 text-zinc-300 leading-relaxed">
            <p>
              Mi nismo klasična web agencija ili IT firma koja nudi generičke usluge. Opsis
              Dalmatia je specijalizirana digitalna turistička agencija koja razumije specifične
              izazove i prilike turističkog sektora u Dalmaciji. Svako naše rješenje je
              dizajnirano s turizmom na umu — od chatbotova koji poznaju lokalne aktivnosti
              i znamenitosti do AI agenata koji razumiju proces bukinga i sezonske fluktuacije.
            </p>
            <p>
              Naš tim kombinira duboko tehničko znanje u području umjetne inteligencije s
              praktičnim iskustvom u turističkoj industriji. Znamo da mala agencija u Omišu
              ima drugačije potrebe od velikog turoperatera u Splitu, i prilagođavamo svaku
              implementaciju specifičnim zahtjevima klijenta. Rezultat: rješenja koja stvarno
              funkcioniraju u praksi, a ne samo u prezentacijama.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              href="/hr/o-nama"
              className="text-blue-400 hover:text-blue-300 text-sm font-medium underline"
            >
              Više o nama
            </Link>
            <Link
              href="/hr/kontakt"
              className="text-blue-400 hover:text-blue-300 text-sm font-medium underline"
            >
              Kontaktirajte nas
            </Link>
            <Link
              href="/hr/digitalna-turisticka-agencija"
              className="text-blue-400 hover:text-blue-300 text-sm font-medium underline"
            >
              O digitalnoj turističkoj agenciji
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <CTASection
        title="Započnite digitalnu transformaciju"
        description="Kontaktirajte nas za besplatnu konzultaciju i saznajte koje usluge najbolje odgovaraju vašem poslovanju."
        buttonText="Kontaktirajte Nas"
        buttonHref="/hr/kontakt"
      />
    </>
  );
}
