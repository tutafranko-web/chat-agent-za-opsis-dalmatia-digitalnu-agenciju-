import type { Metadata } from "next";
import { HeroSection } from "@/components/hr/hero-section";
import { CTASection } from "@/components/hr/cta-section";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { generateOrganizationSchema } from "@/lib/structured-data";
import Link from "next/link";

export const metadata: Metadata = {
  title: "O Nama — Opsis Dalmatia",
  description:
    "Opsis Dalmatia je digitalna turistička agencija iz Splita specijalizirana za AI rješenja u turizmu. Naša misija, tim i pristup koji nas razlikuje.",
  keywords: [
    "o nama",
    "Opsis Dalmatia",
    "tim",
    "misija",
    "digitalna agencija Split",
    "AI turizam Hrvatska",
  ],
  alternates: {
    canonical: "https://opsisdalmatia.com/hr/o-nama",
    languages: { hr: "/hr/o-nama", en: "/en/about" },
  },
  openGraph: {
    title: "O Nama — Opsis Dalmatia",
    description:
      "Upoznajte tim iza Opsis Dalmatia — digitalne turističke agencije koja koristi AI za transformaciju turizma u Dalmaciji.",
    url: "https://opsisdalmatia.com/hr/o-nama",
    locale: "hr_HR",
  },
};

export default function ONamaPage() {
  return (
    <>
      <JsonLd data={generateOrganizationSchema()} />

      <Breadcrumbs
        locale="hr"
        items={[
          { name: "Početna", href: "/hr" },
          { name: "O Nama", href: "/hr/o-nama" },
        ]}
      />

      <HeroSection
        title="O Nama — Opsis Dalmatia"
        subtitle="Digitalna turistička agencija iz Splita koja gradi budućnost turizma pomoću umjetne inteligencije."
      />

      {/* Our Story */}
      <section className="py-16 bg-zinc-950">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white mb-6 sm:text-3xl">
            Naša Priča
          </h2>
          <div className="space-y-4 text-zinc-300 leading-relaxed">
            <p>
              Opsis Dalmatia je nastala iz jednostavnog opažanja: turistički sektor u Dalmaciji
              — jedan od najvažnijih stupova hrvatskog gospodarstva — koristi tehnologiju koja
              zaostaje desetljećima za onim što je danas moguće. Dok globalne turističke
              platforme ulažu milijarde u AI i automatizaciju, lokalne agencije i iznajmljivači
              još uvijek ručno odgovaraju na e-mailove, vodi telefonske razgovore na jednom
              jeziku i gube rezervacije jer ne mogu odgovoriti dovoljno brzo.
            </p>
            <p>
              Osnovali smo Opsis Dalmatia sa sjedištem u Splitu s jasnom misijom: demokratizirati
              pristup naprednim AI tehnologijama za turističke poslovne subjekte svih veličina
              u Dalmaciji. Vjerujemo da mala obiteljska agencija u Kaštelima zaslužuje iste
              digitalne alate kao i veliki međunarodni turoperateri. Naš AI chatbot concierge,
              glasovni agenti i sustavi za automatizaciju dostupni su po cijenama koje imaju
              smisla za lokalno tržište, s podrškom na hrvatskom jeziku i dubokim razumijevanjem
              dalmatinskog turističkog ekosustava.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 bg-zinc-900/50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white mb-6 sm:text-3xl">
            Naša Misija
          </h2>
          <div className="space-y-4 text-zinc-300 leading-relaxed">
            <p>
              Naša misija je pomoći turističkom sektoru Dalmacije da iskoristi potencijal
              umjetne inteligencije — ne kao apstraktnu futurističku ideju, već kao praktičan
              alat koji danas smanjuje troškove, povećava prihod i poboljšava iskustvo gostiju.
              Želimo da svaki turist koji posjeti Dalmaciju dobije personaliziranu, brzu i
              profesionalnu uslugu, neovisno o tome koliko je velika agencija s kojom komunicira
              ili na kojem jeziku govori.
            </p>
            <p>
              To postižemo razvojem AI rješenja koja su specifično dizajnirana za turizam:
              chatbotovi koji poznaju lokalne aktivnosti i znamenitosti, glasovni agenti koji
              govore jezike naših gostiju, i sustavi za automatizaciju koji eliminiraju
              ponavljajuće zadatke. Svako naše rješenje je testirano u stvarnim turističkim
              uvjetima, s pravim gostima i pravim agencijama u Dalmaciji.
            </p>
          </div>
        </div>
      </section>

      {/* Expertise (E-E-A-T) */}
      <section className="py-16 bg-zinc-950">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white mb-6 sm:text-3xl">
            Naša Ekspertiza
          </h2>
          <div className="space-y-4 text-zinc-300 leading-relaxed">
            <p>
              Naš tim donosi kombinaciju tehničke ekspertize i turističkog iskustva koja je
              rijetka na tržištu. S jedne strane, posjedujemo duboko znanje u području
              umjetne inteligencije — od velikih jezičnih modela (LLM) i obrade prirodnog
              jezika (NLP) do glasovne AI tehnologije i sustava za automatizaciju toka rada.
              S druge strane, razumijemo specifičnosti turističkog poslovanja u Dalmaciji:
              sezonalnost, višejezičnu komunikaciju, kompleksnost bukinga s više operatera i
              očekivanja modernog turista.
            </p>
            <p>
              Koristimo provjerene tehnologije koje koriste i najveće svjetske kompanije —
              napredne jezične modele za razumijevanje i generiranje teksta, Google Cloud
              Speech-to-Text za prepoznavanje govora, n8n za automatizaciju poslovnih procesa,
              Next.js za izradu brzih web stranica i strukturirane podatke za SEO optimizaciju.
              Svaki sustav koji isporučimo prolazi kroz rigorozno testiranje u stvarnim uvjetima
              prije pokretanja.
            </p>
            <p>
              Iskustvo stečeno radom s turističkim agencijama, iznajmljivačima i operaterima
              aktivnosti u Dalmaciji omogućuje nam da predvidimo izazove i ponudimo rješenja
              koja funkcioniraju od prvog dana. Znamo koje jezike najčešće koriste turisti u
              Splitu, koja pitanja postavljaju u koje doba dana, i kakve informacije trebaju
              za donošenje odluke o rezervaciji.
            </p>
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="py-16 bg-zinc-900/50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white mb-8 sm:text-3xl">
            Što Nas Razlikuje
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              {
                title: "AI-First Pristup",
                desc: "Svako naše rješenje počinje s pitanjem: kako AI može učiniti ovo bolje, brže i jeftinije? Ne dodajemo AI kao dodatak — gradimo oko njega.",
              },
              {
                title: "Fokus na Turizam",
                desc: "Nismo generička IT firma. Specijalizirani smo isključivo za turističku industriju i razumijemo njezine specifične izazove i prilike.",
              },
              {
                title: "Lokalno Znanje",
                desc: "Sa sjedištem u Splitu, duboko poznajemo dalmatinsko tržište, sezonu, operatere i očekivanja gostiju koji posjećuju ovu regiju.",
              },
              {
                title: "Mjerljivi Rezultati",
                desc: "Svaka implementacija prati se s jasnim KPI-jevima — stopa odgovora, vrijeme reakcije, konverzija, zadovoljstvo gostiju.",
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

      {/* Location */}
      <section className="py-16 bg-zinc-950">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white mb-6 sm:text-3xl">
            Gdje Se Nalazimo
          </h2>
          <div className="space-y-4 text-zinc-300 leading-relaxed">
            <p>
              Opsis Dalmatia ima sjedište u Splitu, u srcu Dalmacije. Kao digitalna agencija,
              opsluživamo klijente diljem dalmatinske obale — od Zadra do Dubrovnika — te
              na otocima. Naši sustavi rade u oblaku, što znači da vaš AI chatbot i glasovni
              agenti funkcioniraju besprijekorno bez obzira na lokaciju vaše agencije.
            </p>
            <p>
              Za osobne sastanke i konzultacije dostupni smo u Splitu i široj okolici.
              Kontaktirajte nas putem{" "}
              <Link
                href="/hr/kontakt"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                kontakt stranice
              </Link>{" "}
              ili isprobajte našeg{" "}
              <Link
                href="/"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                AI chatbota
              </Link>{" "}
              koji vam može odgovoriti na sva pitanja o našim uslugama.
            </p>
          </div>
          <div className="mt-6 bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <p className="text-white font-semibold">Opsis Dalmatia</p>
            <p className="text-sm text-zinc-400 mt-1">Split 21000, Hrvatska</p>
            <p className="text-sm text-zinc-400">
              E-mail:{" "}
              <a
                href="mailto:info@opsisdalmatia.com"
                className="text-blue-400 hover:text-blue-300"
              >
                info@opsisdalmatia.com
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <CTASection
        title="Razgovarajmo o vašem poslovanju"
        description="Svaka suradnja počinje razgovorom. Kontaktirajte nas ili isprobajte chatbot i saznajte kako vam možemo pomoći."
        buttonText="Kontaktirajte Nas"
        buttonHref="/hr/kontakt"
      />
    </>
  );
}
