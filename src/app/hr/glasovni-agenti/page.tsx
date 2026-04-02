import type { Metadata } from "next";
import { HeroSection } from "@/components/hr/hero-section";
import { FAQSection } from "@/components/hr/faq-section";
import { CTASection } from "@/components/hr/cta-section";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { generateServiceSchema } from "@/lib/structured-data";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Glasovni Agenti — Voice AI za Turističke Agencije",
  description:
    "Glasovni AI agenti za turističke agencije u Dalmaciji. Automatski odgovaraju na pozive, potvrđuju rezervacije i pružaju informacije na više jezika.",
  keywords: [
    "glasovni agenti",
    "voice agent",
    "Voice AI",
    "glasovni AI",
    "telefonski agent",
    "automatski pozivi turizam",
    "voice bot Split",
  ],
  alternates: {
    canonical: "https://opsisdalmatia.com/hr/glasovni-agenti",
    languages: { hr: "/hr/glasovni-agenti", en: "/en/voice-agents" },
  },
  openGraph: {
    title: "Glasovni Agenti za Turizam — Voice AI | Opsis Dalmatia",
    description:
      "AI koji odgovara na vaše pozive, govori sve jezike i nikad ne propušta telefonski poziv. Za turističke agencije u Dalmaciji.",
    url: "https://opsisdalmatia.com/hr/glasovni-agenti",
    locale: "hr_HR",
  },
};

const faqs = [
  {
    question: "Što su glasovni agenti?",
    answer:
      "Glasovni agenti (voice agents) su AI sustavi koji mogu voditi telefonske razgovore s ljudima na prirodan način. Koriste tehnologije prepoznavanja govora (speech-to-text), velikih jezičnih modela za razumijevanje i generiranje odgovora, te sintezu govora (text-to-speech) za pretvaranje teksta u prirodan govor. Za turističke agencije to znači da svaki poziv bude odgovoren — automatski, profesionalno i na jeziku pozivatelja.",
  },
  {
    question: "Kako voice agenti odgovaraju na pozive?",
    answer:
      "Kada turist nazove vaš broj, glasovni agent se javlja u roku od jedne sekunde. Sluša pitanje turista, razumije ga koristeći AI, pristupa vašim podacima o ponudi i dostupnosti, te odgovara prirodnim glasom. Može obraditi rezervacije, dati informacije o cijenama i rasporedima, te proslijediti složenije upite vašem osoblju. Cijeli razgovor se transkribira i sprema za vašu evidenciju.",
  },
  {
    question: "Mogu li glasovni agenti govoriti hrvatski?",
    answer:
      "Da, naši glasovni agenti podržavaju hrvatski jezik uz još više od 30 drugih jezika uključujući engleski, njemački, talijanski, francuski, španjolski i nizozemski. Agent automatski prepoznaje jezik pozivatelja i prelazi na taj jezik. To je posebno vrijedno za Dalmaciju gdje se turistička komunikacija odvija na mnoštvu različitih jezika — glasovni agent pokriva sve bez potrebe za višejezičnim osobljem.",
  },
  {
    question: "Koliko košta glasovni agent?",
    answer:
      "Cijena glasovnog agenta ovisi o volumenu poziva i složenosti integracija. Nudi se kao mjesečna usluga s transparentnim cijenama — plaćate fiksnu mjesečnu naknadu plus mali dodatak po minuti razgovora. Za većinu turističkih agencija cijena je znatno niža od troška jednog zaposlenika koji bi obavljao isti posao. Kontaktirajte nas za detaljnu ponudu prilagođenu vašem obujmu poziva.",
  },
];

export default function GlasovniAgentiPage() {
  return (
    <>
      <JsonLd
        data={generateServiceSchema(
          "Glasovni AI Agenti za Turizam",
          "Voice AI sustav koji automatski odgovara na telefonske pozive turističkih agencija, potvrđuje rezervacije i pruža informacije na svim jezicima.",
          ["glasovni agenti", "voice AI", "telefonski agent", "voice bot", "glasovni bot"]
        )}
      />

      <Breadcrumbs
        locale="hr"
        items={[
          { name: "Početna", href: "/hr" },
          { name: "Usluge", href: "/hr/usluge" },
          { name: "Glasovni Agenti", href: "/hr/glasovni-agenti" },
        ]}
      />

      <HeroSection
        title="Glasovni Agenti — Voice AI za Turističke Agencije"
        subtitle="Nikad više ne propustite poziv. Naš glasovni AI agent odgovara na telefon umjesto vas — profesionalno, na svim jezicima, 24 sata dnevno."
        ctaText="Zatražite Demo Poziv"
        ctaHref="/hr/kontakt"
      />

      {/* Voice Agent Explanation */}
      <section className="py-16 bg-zinc-950">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white mb-6 sm:text-3xl">
            Kako Funkcionira Voice AI Tehnologija?
          </h2>
          <div className="space-y-4 text-zinc-300 leading-relaxed">
            <p>
              Glasovni agenti koriste tri ključne AI tehnologije u harmoničnom spletu. Prvo,
              sustav za prepoznavanje govora (Automatic Speech Recognition — ASR) pretvara glas
              pozivatelja u tekst s visokom točnošću, čak i kada turist govori s akcentom ili u
              bučnom okruženju. Zatim, veliki jezični model (LLM) analizira tekst, razumije
              namjeru pozivatelja i generira primjeren odgovor na temelju vaše baze podataka o
              ponudi, cijenama i rasporedima. Na kraju, sustav za sintezu govora (Text-to-Speech)
              pretvara taj odgovor u prirodan ljudski glas i isporučuje ga pozivatelju.
            </p>
            <p>
              Rezultat je telefonski razgovor koji zvuči gotovo nerazlučivo od razgovora sa
              stvarnom osobom. Glasovni agent se javlja istog trenutka kada zazvoni telefon,
              nikad nije neraspoložen, nikad ne zaboravi informaciju i može voditi neograničen
              broj simultanih poziva. Za turističku agenciju u Splitu koja prima desetke poziva
              dnevno tijekom ljetne sezone, to znači da nijedan turist neće čuti signal
              zauzeto ili poruku &ldquo;Trenutno smo nedostupni&rdquo;.
            </p>
            <p>
              Naš sustav se integrira s vašim telefonskim brojem — ne trebate mijenjati broj
              koji turisti već poznaju. Glasovni agent može raditi kao prva linija podrške
              (odgovara na sve pozive), kao pomoć izvan radnog vremena, ili kao podrška za
              jezike koje vaše osoblje ne govori. Vi odlučujete kako i kada ga koristite.
            </p>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-16 bg-zinc-900/50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white mb-8 sm:text-3xl">
            Primjeri Korištenja Glasovnih Agenata
          </h2>
          <div className="space-y-6">
            {[
              {
                title: "Odgovaranje na Telefonske Pozive",
                desc: "Glasovni agent se javlja na svaki poziv, bez iznimke. Pruža informacije o vašoj ponudi, radnom vremenu, lokaciji i cijenama. Složenije upite bilježi i prosljeđuje vašem timu s transkriptom razgovora.",
              },
              {
                title: "Potvrda Rezervacija",
                desc: "Automatski naziva goste dan prije rezervirane aktivnosti radi potvrde. Pruža informacije o mjestu okupljanja, što ponijeti i vremenskim uvjetima. Ako gost želi otkazati ili promijeniti termin, agent to obrađuje samostalno.",
              },
              {
                title: "Višejezična Glasovna Podrška",
                desc: "Turist iz Italije zove i govori talijanski? Agent odgovara na talijanskom. Sljedeći poziv je na njemačkom? Agent se prebacuje bez problema. Nema potrebe za višejezičnim osobljem ili skupim prevoditeljskim službama.",
              },
              {
                title: "Krizna Komunikacija",
                desc: "U slučaju otkazivanja aktivnosti zbog vremenskih uvjeta, agent automatski kontaktira sve goste s rezervacijama, nudi alternativne termine ili aktivnosti i obrađuje zahtjeve za povrat novca.",
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

      {/* Benefits vs Traditional */}
      <section className="py-16 bg-zinc-950">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white mb-6 sm:text-3xl">
            Prednosti Pred Tradicionalnim Pozivnim Centrima
          </h2>
          <div className="space-y-4 text-zinc-300 leading-relaxed">
            <p>
              Tradicionalni pozivni centri za turističke agencije znače visoke troškove osoblja,
              ograničeno radno vrijeme i neizbježne propuštene pozive tijekom vršnih opterećenja.
              U sezoni, kada dolazi 5 poziva istovremeno, 4 turista čuju zauzet ton. Svaki od
              tih propuštenih poziva je potencijalno izgubljena rezervacija vrijedna stotine eura.
            </p>
            <p>
              Glasovni AI agent eliminira sve te probleme. Ne postoji ograničenje broja
              simultanih poziva, nema radnog vremena (radi 0-24), nema bolesnih dana ili
              godišnjih odmora, i cijena je predvidiva bez obzira na sezonu. Agent ne treba
              trening za nove proizvode — jednostavno ažurirate bazu podataka i on odmah
              koristi najnovije informacije.
            </p>
            <p>
              Naravno, glasovni agent ne zamjenjuje ljudski kontakt u potpunosti. Složeni
              zahtjevi, reklamacije ili VIP gosti uvijek mogu biti preusmjereni na vaše osoblje.
              Agent služi kao inteligentni filter koji obrađuje 70-80% rutinskih poziva i
              oslobađa vaš tim za ono u čemu su ljudi nezamjenjivi — empatiju, kreativnost i
              izgradnju odnosa s gostima. Kombinacija glasovnog agenta s našim{" "}
              <Link
                href="/hr/chatbotovi"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                chatbot sustavom
              </Link>{" "}
              i{" "}
              <Link
                href="/hr/ai-agenti"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                AI agentima
              </Link>{" "}
              pruža potpunu pokrivenost svih komunikacijskih kanala.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQSection faqs={faqs} title="Često Postavljana Pitanja o Glasovnim Agentima" />

      {/* CTA */}
      <CTASection
        title="Želite čuti svojeg glasovnog agenta?"
        description="Zakažite besplatni demo poziv i uvjerite se koliko prirodno naš Voice AI komunicira s turistima."
        buttonText="Kontaktirajte Nas"
        buttonHref="/hr/kontakt"
      />
    </>
  );
}
