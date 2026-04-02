import type { Metadata } from "next";
import { HeroSection } from "@/components/hr/hero-section";
import { ServiceCard } from "@/components/hr/service-card";
import { ActivityGrid } from "@/components/hr/activity-grid";
import { CTASection } from "@/components/hr/cta-section";
import { JsonLd } from "@/components/seo/json-ld";
import {
  generateOrganizationSchema,
  generateLocalBusinessSchema,
  generateWebSiteSchema,
} from "@/lib/structured-data";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Digitalna Turistička Agencija u Splitu — AI Rješenja za Turizam",
  description:
    "Opsis Dalmatia je digitalna turistička agencija u Splitu koja koristi AI chatbotove, glasovne agente i automatizaciju za turističke usluge u Dalmaciji. Bukiranje aktivnosti, 24/7 podrška, višejezičnost.",
  keywords: [
    "digitalna turistička agencija",
    "turistička agencija Split",
    "AI turizam",
    "chatbot za turizam",
    "glasovni agent turizam",
    "aktivnosti Dalmacija",
    "izleti Split",
    "bukiranje aktivnosti",
  ],
  alternates: {
    canonical: "https://opsisdalmatia.com/hr",
    languages: { hr: "/hr", en: "/en" },
  },
  openGraph: {
    title: "Opsis Dalmatia — Digitalna Turistička Agencija u Splitu",
    description:
      "AI chatbotovi, glasovni agenti i automatizacija za turizam u Dalmaciji.",
    url: "https://opsisdalmatia.com/hr",
    locale: "hr_HR",
  },
};

export default function HrHomePage() {
  return (
    <>
      <JsonLd data={generateOrganizationSchema()} />
      <JsonLd data={generateLocalBusinessSchema()} />
      <JsonLd data={generateWebSiteSchema()} />

      {/* Hero */}
      <HeroSection
        title="Digitalna Turistička Agencija u Splitu — AI Rješenja za Turizam"
        subtitle="Automatiziramo turističko poslovanje pomoću AI chatbotova, glasovnih agenata i pametnih sustava. Dostupni 24/7, na svim jezicima, za svaku agenciju u Dalmaciji."
        ctaText="Isprobajte Chatbot"
        ctaHref="/"
      />

      {/* Services */}
      <section className="py-16 bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white mb-8 sm:text-3xl text-center">
            Naše Usluge
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <ServiceCard
              title="AI Chatbotovi"
              description="Virtualni concierge koji odgovara turistima 24/7 na bilo kojem jeziku. Preporučuje aktivnosti, rezervira izlete i pruža informacije o destinaciji u realnom vremenu."
              href="/hr/chatbotovi"
              icon="💬"
            />
            <ServiceCard
              title="AI Agenti"
              description="Inteligentni sustavi koji automatiziraju poslovne procese — od obrade rezervacija do analize podataka i personaliziranih preporuka za goste."
              href="/hr/ai-agenti"
              icon="🤖"
            />
            <ServiceCard
              title="Glasovni Agenti"
              description="Voice AI tehnologija koja odgovara na telefonske pozive, potvrđuje rezervacije i pruža informacije na više jezika — bez čekanja na liniji."
              href="/hr/glasovni-agenti"
              icon="🎙️"
            />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-zinc-900/50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white mb-6 sm:text-3xl">
            Zašto Opsis Dalmatia?
          </h2>
          <div className="space-y-4 text-zinc-300 leading-relaxed">
            <p>
              Opsis Dalmatia je digitalna turistička agencija sa sjedištem u Splitu koja
              mijenja način na koji turističke agencije, iznajmljivači i operateri aktivnosti
              komuniciraju s gostima. Koristimo najnovije AI tehnologije — od naprednih
              chatbot sustava temeljenih na velikim jezičnim modelima do glasovnih agenata
              koji razumiju prirodni govor — kako bismo automatizirali procese koji
              tradicionalno oduzimaju sate svaki dan. Naša misija je jednostavna: pomoći
              turističkom sektoru Dalmacije da iskoristi potencijal umjetne inteligencije
              i ponudi gostima iskustvo kakvo zaslužuju.
            </p>
            <p>
              U srcu naše ponude nalazi se AI chatbot concierge koji radi 24 sata dnevno,
              7 dana u tjednu, 365 dana u godini. Zamislite da turist iz Njemačke u 23:00
              navečer pita na svojem jeziku koje aktivnosti su dostupne sutra ujutro u
              Splitu — i da u roku od sekunde dobije personaliziranu preporuku s mogućnošću
              direktne rezervacije. To nije budućnost — to je ono što Opsis Dalmatia već
              danas nudi. Naši chatbotovi govore više od 50 jezika, integriraju se s
              postojećim sustavima za bukiranje i povećavaju stopu konverzije do 40% u
              odnosu na klasične kontakt forme.
            </p>
            <p>
              Osim chatbot rješenja, razvijamo AI agente koji preuzimaju cijele poslovne
              procese — od automatskog odgovaranja na upite s{" "}
              <Link href="/hr/ai-agenti" className="text-blue-400 hover:text-blue-300 underline">
                Booking.com-a i Airbnb-a
              </Link>{" "}
              do generiranja tjednih izvještaja o popunjenosti i prihodu. Za agencije koje
              primaju desetke poziva dnevno, naši{" "}
              <Link href="/hr/glasovni-agenti" className="text-blue-400 hover:text-blue-300 underline">
                glasovni agenti
              </Link>{" "}
              odgovaraju na telefonske pozive profesionalno i na jeziku pozivatelja, bez
              ikakvih troškova osoblja ili propuštenih poziva. Rezultat? Više zadovoljnih
              gostiju, manje stresa za vaš tim i veći prihod po gostu.
            </p>
            <p>
              Dalmacija je jedna od najljepših turističkih regija na svijetu — s više od 300
              sunčanih dana godišnje, kristalno čistim morem i bogatom kulturnom baštinom
              koja seže tisućljećima unatrag. Od Dioklecijanove palače u Splitu, preko otoka
              Hvara, Brača i Visa, do nacionalnih parkova Krka i Plitvice — ova regija
              zaslužuje digitalne alate koji odgovaraju njezinoj ljepoti. Opsis Dalmatia
              gradi te alate. Pridružite nam se i saznajte kako AI može transformirati vaše
              turističko poslovanje.
            </p>
          </div>
          <div className="mt-8 flex gap-4">
            <Link
              href="/hr/o-nama"
              className="text-blue-400 hover:text-blue-300 text-sm font-medium underline"
            >
              Više o nama
            </Link>
            <Link
              href="/hr/digitalna-turisticka-agencija"
              className="text-blue-400 hover:text-blue-300 text-sm font-medium underline"
            >
              Što je digitalna turistička agencija?
            </Link>
          </div>
        </div>
      </section>

      {/* Activities */}
      <section className="bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16">
          <h2 className="text-2xl font-bold text-white mb-2 sm:text-3xl text-center">
            Aktivnosti u Dalmaciji
          </h2>
          <p className="text-center text-zinc-400 mb-8">
            Preko 48 aktivnosti koje naš chatbot može preporučiti i rezervirati za vaše goste
          </p>
        </div>
        <ActivityGrid locale="hr" />
      </section>

      {/* CTA */}
      <CTASection
        title="Spremni za digitalizaciju?"
        description="Isprobajte našeg AI chatbot concierge-a besplatno i uvjerite se kako može transformirati vaše turističko poslovanje."
        buttonText="Isprobajte Chatbot Besplatno"
        buttonHref="/"
      />
    </>
  );
}
