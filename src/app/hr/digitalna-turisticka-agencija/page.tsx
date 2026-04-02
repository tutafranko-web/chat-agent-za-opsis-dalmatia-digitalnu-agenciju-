import type { Metadata } from "next";
import { HeroSection } from "@/components/hr/hero-section";
import { ActivityGrid } from "@/components/hr/activity-grid";
import { CTASection } from "@/components/hr/cta-section";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { generateLocalBusinessSchema } from "@/lib/structured-data";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Digitalna Turistička Agencija Split — Opsis Dalmatia",
  description:
    "Opsis Dalmatia je digitalna turistička agencija u Splitu koja koristi AI za personalizirane turističke usluge. Aktivnosti, izleti i doživljaji u Dalmaciji.",
  keywords: [
    "digitalna turistička agencija",
    "turistička agencija Split",
    "digitalna agencija Dalmacija",
    "turizam Split",
    "aktivnosti Split",
    "izleti Dalmacija",
    "Dioklecijanova palača",
  ],
  alternates: {
    canonical: "https://opsisdalmatia.com/hr/digitalna-turisticka-agencija",
    languages: {
      hr: "/hr/digitalna-turisticka-agencija",
      en: "/en/digital-tourist-agency",
    },
  },
  openGraph: {
    title: "Digitalna Turistička Agencija Split — Opsis Dalmatia",
    description:
      "AI-pogonjene turističke usluge u Splitu i Dalmaciji. Bukiranje aktivnosti, chatbot concierge, personalizirane preporuke.",
    url: "https://opsisdalmatia.com/hr/digitalna-turisticka-agencija",
    locale: "hr_HR",
  },
};

export default function DigitalnaTuristickaAgencijaPage() {
  return (
    <>
      <JsonLd data={generateLocalBusinessSchema()} />

      <Breadcrumbs
        locale="hr"
        items={[
          { name: "Početna", href: "/hr" },
          { name: "Digitalna Turistička Agencija", href: "/hr/digitalna-turisticka-agencija" },
        ]}
      />

      <HeroSection
        title="Digitalna Turistička Agencija Split — Opsis Dalmatia"
        subtitle="Nova generacija turističke agencije koja koristi umjetnu inteligenciju za savršeno iskustvo vaših gostiju u Dalmaciji."
        ctaText="Isprobajte Chatbot"
        ctaHref="/"
      />

      {/* What Is a Digital Tourist Agency */}
      <section className="py-16 bg-zinc-950">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white mb-6 sm:text-3xl">
            Što Je Digitalna Turistička Agencija?
          </h2>
          <div className="space-y-4 text-zinc-300 leading-relaxed">
            <p>
              Digitalna turistička agencija predstavlja evoluciju klasičnog turističkog
              poslovanja. Umjesto fizičke poslovnice s ograničenim radnim vremenom i osobljem
              koje ručno obrađuje svaki upit, digitalna agencija koristi AI tehnologiju,
              automatizaciju i digitalne kanale kako bi pružila brže, preciznije i
              personaliziranije usluge turistima. To ne znači da nestaje ljudski element — naprotiv,
              tehnologija oslobađa ljude za ono u čemu su najbolji: stvaranje nezaboravnih
              iskustava i izgradnju autentičnih odnosa s gostima.
            </p>
            <p>
              Opsis Dalmatia je prva potpuno digitalna turistička agencija u Splitu. Naša
              platforma kombinira{" "}
              <Link href="/hr/chatbotovi" className="text-blue-400 hover:text-blue-300 underline">
                AI chatbot concierge
              </Link>{" "}
              koji komunicira s turistima 24/7 na svim jezicima,{" "}
              <Link href="/hr/ai-agenti" className="text-blue-400 hover:text-blue-300 underline">
                inteligentne AI agente
              </Link>{" "}
              koji automatiziraju poslovne procese, te{" "}
              <Link href="/hr/glasovni-agenti" className="text-blue-400 hover:text-blue-300 underline">
                glasovne agente
              </Link>{" "}
              koji odgovaraju na telefonske pozive. Sve to podržano bogatom bazom podataka o
              aktivnostima, izletima i doživljajima u Dalmaciji.
            </p>
          </div>
        </div>
      </section>

      {/* Why Digital vs Traditional */}
      <section className="py-16 bg-zinc-900/50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white mb-6 sm:text-3xl">
            Zašto Digitalno Umjesto Tradicionalno?
          </h2>
          <div className="space-y-4 text-zinc-300 leading-relaxed">
            <p>
              Tradicionalne turističke agencije rade po modelu koji se nije značajnije promijenio
              desetljećima: turist dolazi u poslovnicu ili šalje e-mail, zaposlenik ručno traži
              informacije, provjerava dostupnost telefonom kod operatera, sastavlja ponudu i
              čeka odgovor. Cijeli proces može trajati satima ili danima. U međuvremenu,
              turist je možda već rezervirao kod konkurencije.
            </p>
            <p>
              Digitalna agencija taj proces svodi na sekunde. Turist postavlja pitanje putem
              chata, telefona ili weba — AI sustav odmah provjerava dostupnost u realnom
              vremenu, generira personaliziranu preporuku i nudi direktnu rezervaciju. Nema
              čekanja, nema prepreka, nema jezičnih barijera. Turist dobiva ono što želi
              kada to želi, a agencija ostvaruje veći obrtaj i manje operativne troškove.
            </p>
            <p>
              Ključna prednost digitalnog pristupa je skalabilnost. Tradicionalna agencija
              koja želi udvostručiti kapacitet mora zaposliti dvostruko više ljudi, proširiti
              poslovnicu i povećati infrastrukturu. Digitalna agencija može opsluživati
              dvostruko više gostiju bez ikakvog povećanja fiksnih troškova — AI sustav
              jednako dobro radi s 10 ili 10.000 upita dnevno.
            </p>
          </div>
        </div>
      </section>

      {/* Split & Dalmatia Content */}
      <section className="py-16 bg-zinc-950">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white mb-6 sm:text-3xl">
            Split i Dalmacija — Destinacija Koja Zaslužuje Digitalni Pristup
          </h2>
          <div className="space-y-4 text-zinc-300 leading-relaxed">
            <p>
              Split je drugi po veličini grad u Hrvatskoj i jedna od najbrže rastućih turističkih
              destinacija u Europi. U srcu grada nalazi se Dioklecijanova palača — UNESCO-ova
              svjetska baština iz 4. stoljeća koja i danas služi kao živi centar grada s
              trgovinama, restoranima i stanovima unutar drevnih zidina. Ova jedinstvena
              kombinacija antičke povijesti i modernog života čini Split magnetom za putnike
              iz cijelog svijeta.
            </p>
            <p>
              Dalmatinska obala pruža se od Zadra na sjeveru do Dubrovnika na jugu, obuhvaćajući
              tisuće otoka, uvala i plaža. Otoci Hvar, Brač, Vis, Korčula i Šolta nude raznolike
              doživljaje — od mondenog noćnog života na Hvaru, preko zlatnog roga Bola na Braču,
              do netaknute prirode Visa i Modre špilje na Biševu. Nacionalni parkovi Krka i
              Plitvice privlače milijune posjetitelja godišnje svojim spektakularnim slapovima
              i smaragdnim jezerima.
            </p>
            <p>
              S više od 300 sunčanih dana godišnje, bogatom gastronomijom — od svježih morskih
              plodova i dalmatinskog pršuta do vrhunskih autohtonih vina poput Plavca Malog i
              Pošipa — Dalmacija nudi iskustva koja zaslužuju digitalne alate na razini
              svjetskih turističkih sila. Opsis Dalmatia gradi te alate, prilagođene specifičnim
              potrebama dalmatinskog turizma.
            </p>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-16 bg-zinc-900/50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white mb-6 sm:text-3xl">
            Naše Digitalne Usluge
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              {
                title: "AI Chatbot Concierge",
                desc: "Virtualni asistent na vašoj web stranici i društvenim mrežama koji odgovara turistima u realnom vremenu.",
                link: "/hr/chatbotovi",
              },
              {
                title: "Automatizacija Procesa",
                desc: "AI agenti koji obrađuju rezervacije, generiraju izvještaje i upravljaju komunikacijom s gostima.",
                link: "/hr/ai-agenti",
              },
              {
                title: "Glasovna AI Podrška",
                desc: "Telefonski agenti koji odgovaraju na pozive, potvrđuju bukiranja i pružaju informacije glasom.",
                link: "/hr/glasovni-agenti",
              },
              {
                title: "Web Razvoj za Turizam",
                desc: "Brze, SEO-optimizirane web stranice dizajnirane za konverziju turističkih posjetitelja u kupce.",
                link: "/hr/usluge",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
              >
                <h3 className="text-lg font-semibold text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed mb-3">
                  {item.desc}
                </p>
                <Link
                  href={item.link}
                  className="text-sm text-blue-400 hover:text-blue-300 underline"
                >
                  Saznajte više
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Activity Catalog */}
      <section className="bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16">
          <h2 className="text-2xl font-bold text-white mb-2 sm:text-3xl text-center">
            Katalog Aktivnosti u Dalmaciji
          </h2>
          <p className="text-center text-zinc-400 mb-8">
            Preko 48 aktivnosti koje naš sustav poznaje i može preporučiti vašim gostima
          </p>
        </div>
        <ActivityGrid locale="hr" />
      </section>

      {/* CTA */}
      <CTASection
        title="Digitalizirajte svoju agenciju"
        description="Pridružite se novoj generaciji turističkih agencija u Dalmaciji. Isprobajte AI chatbot ili nas kontaktirajte za konzultaciju."
        buttonText="Isprobajte Chatbot"
        buttonHref="/"
      />
    </>
  );
}
