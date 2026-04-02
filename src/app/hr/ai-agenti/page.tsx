import type { Metadata } from "next";
import { HeroSection } from "@/components/hr/hero-section";
import { FAQSection } from "@/components/hr/faq-section";
import { CTASection } from "@/components/hr/cta-section";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { generateServiceSchema } from "@/lib/structured-data";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AI Agenti — Automatizacija Poslovanja u Turizmu",
  description:
    "AI agenti za turističke agencije automatiziraju rezervacije, obradu upita, analizu podataka i personalizirane preporuke. Smanjite ručni rad i povećajte prihod.",
  keywords: [
    "AI agenti",
    "automatizacija turizma",
    "AI agent za agencije",
    "automatizacija poslovanja",
    "inteligentni agenti",
    "AI automatizacija Split",
  ],
  alternates: {
    canonical: "https://opsisdalmatia.com/hr/ai-agenti",
    languages: { hr: "/hr/ai-agenti", en: "/en/ai-agents" },
  },
  openGraph: {
    title: "AI Agenti za Turizam — Opsis Dalmatia",
    description:
      "Automatizacija turističkog poslovanja pomoću inteligentnih AI agenata. Manje ručnog rada, više zadovoljnih gostiju.",
    url: "https://opsisdalmatia.com/hr/ai-agenti",
    locale: "hr_HR",
  },
};

const faqs = [
  {
    question: "Što su AI agenti?",
    answer:
      "AI agenti su inteligentni softverski sustavi koji samostalno obavljaju složene zadatke bez stalne ljudske supervizije. Za razliku od običnih chatbotova koji samo odgovaraju na pitanja, AI agenti mogu aktivno donositi odluke, pristupati vanjskim sustavima, obrađivati podatke i izvršavati višekoračne procese. Na primjer, AI agent može primiti upit turista, provjeriti dostupnost u sustavu za bukiranje, poslati personaliziranu ponudu e-mailom i ažurirati CRM — sve automatski.",
  },
  {
    question: "Kako AI agenti rade?",
    answer:
      "AI agenti koriste kombinaciju velikih jezičnih modela (LLM), alata i pristupa vanjskim sustavima. Kada prime zadatak, agent ga rastavlja na korake, koristi dostupne alate (API pozivi, baze podataka, e-mail sustavi) za izvršavanje svakog koraka i na kraju isporučuje rezultat. Agenti mogu učiti iz prethodnih interakcija i poboljšavati se s vremenom, postajući sve efikasniji u obradi specifičnih zahtjeva vaše agencije.",
  },
  {
    question: "Trebam li AI agenta?",
    answer:
      "Ako vaša agencija troši značajno vrijeme na ponavljajuće zadatke — odgovaranje na iste upite, ručno unošenje podataka u tablice, slanje potvrda rezervacija, izradu izvještaja — tada AI agent može dramatično smanjiti to opterećenje. Posebno je korisno za agencije s više od 50 upita dnevno, koje rade na više platformi (Booking, Airbnb, vlastita stranica) ili koje žele skalirati bez zapošljavanja dodatnog osoblja.",
  },
  {
    question: "Koliko košta AI agent?",
    answer:
      "Cijena ovisi o složenosti procesa koje automatizirate i broju integracija. Jednostavan agent za obradu e-mail upita razlikuje se od kompleksnog sustava koji upravlja cijelim booking procesom. Opsis Dalmatia nudi transparentne pakete i besplatnu inicijalnu konzultaciju gdje analiziramo vaše procese i predlažemo optimalna rješenja s jasnim ROI kalkulacijama.",
  },
  {
    question: "Koja je razlika između chatbota i AI agenta?",
    answer:
      "Chatbot komunicira s korisnicima putem teksta ili glasa — to je sučelje za razgovor. AI agent je širi pojam koji uključuje chatbot kao jedno od mogućih sučelja, ali i mnoge druge sposobnosti. Agent može raditi u pozadini bez izravne komunikacije s korisnikom — na primjer, automatski obrađivati pristigle rezervacije, generirati izvještaje ili ažurirati inventar. Chatbot je lice prema gostu, agent je mozak iza kulisa. Često se koriste zajedno za maksimalnu efikasnost.",
  },
];

export default function AiAgentiPage() {
  return (
    <>
      <JsonLd
        data={generateServiceSchema(
          "AI Agenti za Automatizaciju Turizma",
          "Inteligentni AI agenti koji automatiziraju poslovne procese turističkih agencija — rezervacije, komunikaciju, analizu podataka i personalizirane preporuke.",
          ["AI agenti", "automatizacija turizma", "inteligentni agenti", "AI agent Split"]
        )}
      />

      <Breadcrumbs
        locale="hr"
        items={[
          { name: "Početna", href: "/hr" },
          { name: "Usluge", href: "/hr/usluge" },
          { name: "AI Agenti", href: "/hr/ai-agenti" },
        ]}
      />

      <HeroSection
        title="AI Agenti — Automatizacija Poslovanja u Turizmu"
        subtitle="Inteligentni sustavi koji preuzimaju ponavljajuće zadatke, obrađuju rezervacije i analiziraju podatke — dok se vi bavite onim što je važno."
        ctaText="Zatražite Konzultaciju"
        ctaHref="/hr/kontakt"
      />

      {/* What Are AI Agents */}
      <section className="py-16 bg-zinc-950">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white mb-6 sm:text-3xl">
            Što Su AI Agenti i Zašto Su Važni za Turizam?
          </h2>
          <div className="space-y-4 text-zinc-300 leading-relaxed">
            <p>
              AI agenti predstavljaju sljedeću evoluciju automatizacije u turizmu. Dok su klasični
              chatbotovi ograničeni na odgovaranje na pitanja, AI agenti mogu samostalno izvršavati
              kompleksne višekoračne procese bez ljudske intervencije. To znači da agent može
              primiti upit turista putem e-maila, provjeriti raspoloživost u vašem sustavu,
              izračunati cijenu s popustom za grupu, poslati personaliziranu ponudu, i — ako
              turist prihvati — automatski kreirati rezervaciju i poslati potvrdu.
            </p>
            <p>
              Za turističke agencije u Dalmaciji koje rade s desecima operatera, stotinama aktivnosti
              i tisućama gostiju godišnje, AI agenti znače razliku između kaotičnog ručnog rada i
              glatkog, skalabilnog poslovanja. Zamislite da svaki upit koji stigne na vašu adresu
              bude obrađen u roku od minute — bez obzira je li stigao u 3 ujutro ili usred
              najnapetijeg dijela sezone. To je moć AI agenata.
            </p>
            <p>
              Opsis Dalmatia razvija AI agente specifično za turističku industriju, koristeći
              najnovije jezične modele i n8n workflow automatizaciju. Naši agenti se integriraju
              s vašim postojećim sustavima — od Google Sheets-a i booking platformi do CRM
              rješenja i sustava za upravljanje inventarom.
            </p>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-16 bg-zinc-900/50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white mb-8 sm:text-3xl">
            Primjeri Korištenja AI Agenata
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              {
                title: "Automatske Rezervacije",
                desc: "Agent prima upit, provjerava dostupnost, šalje ponudu i procesira plaćanje — bez ručnog rada.",
              },
              {
                title: "Korisnička Podrška",
                desc: "Obrada svih dolaznih upita s weba, e-maila i društvenih mreža. Složene upite prosljeđuje timu.",
              },
              {
                title: "Analiza Podataka",
                desc: "Automatski generira dnevne, tjedne i mjesečne izvještaje o popunjenosti, prihodu i trendovima.",
              },
              {
                title: "Personalizirane Preporuke",
                desc: "Na temelju profila gosta, povijesti i preferencija kreira prilagođene ponude aktivnosti.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
              >
                <h3 className="text-lg font-semibold text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 bg-zinc-950">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white mb-8 sm:text-3xl">
            Ručni Rad vs. AI Agent
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-zinc-700">
                  <th className="py-3 px-4 text-zinc-400 font-medium">Zadatak</th>
                  <th className="py-3 px-4 text-red-400 font-medium">Ručni Rad</th>
                  <th className="py-3 px-4 text-green-400 font-medium">AI Agent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {[
                  ["Odgovor na upit", "15-60 minuta", "Pod 10 sekundi"],
                  ["Dostupnost", "Radno vrijeme (8h)", "24/7/365"],
                  ["Obrada rezervacije", "5-10 minuta po bukiranju", "Automatski, u sekundi"],
                  ["Jezična podrška", "1-2 jezika", "50+ jezika"],
                  ["Tjedni izvještaj", "2-3 sata pripreme", "Automatski generiran"],
                  ["Skalabilnost", "Novo osoblje = novi trošak", "Isti trošak, neograničeni upiti"],
                ].map(([task, manual, ai]) => (
                  <tr key={task} className="text-zinc-300">
                    <td className="py-3 px-4 font-medium text-white">{task}</td>
                    <td className="py-3 px-4">{manual}</td>
                    <td className="py-3 px-4">{ai}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-6 text-sm text-zinc-400">
            Kombinacija AI agenata s{" "}
            <Link
              href="/hr/chatbotovi"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              chatbot sučeljem
            </Link>{" "}
            i{" "}
            <Link
              href="/hr/glasovni-agenti"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              glasovnim agentima
            </Link>{" "}
            pruža kompletno rješenje za automatizaciju turističke agencije.
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-zinc-900/50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white mb-6 sm:text-3xl">
            Prednosti AI Agenata za Vaše Poslovanje
          </h2>
          <ul className="space-y-3 text-zinc-300">
            {[
              "Smanjenje operativnih troškova do 60% automatizacijom ponavljajućih procesa",
              "Povećanje stope konverzije upita u rezervacije zahvaljujući brzini odgovora",
              "Eliminacija ljudskih grešaka u obradi podataka i komunikaciji",
              "Slobodno osoblje za zadatke koji zahtijevaju ljudski dodir i kreativnost",
              "Skaliranje poslovanja bez proporcionalno rastućih troškova osoblja",
              "Detaljni podaci o svakoj interakciji za donošenje informiranih poslovnih odluka",
            ].map((benefit) => (
              <li key={benefit} className="flex items-start gap-3">
                <span className="text-blue-400 mt-1 flex-shrink-0">&#10003;</span>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <FAQSection faqs={faqs} title="Često Postavljana Pitanja o AI Agentima" />

      {/* CTA */}
      <CTASection
        title="Automatizirajte svoje poslovanje"
        description="Besplatna konzultacija o tome kako AI agenti mogu transformirati vašu turističku agenciju. Bez obveza, bez rizika."
        buttonText="Kontaktirajte Nas"
        buttonHref="/hr/kontakt"
      />
    </>
  );
}
