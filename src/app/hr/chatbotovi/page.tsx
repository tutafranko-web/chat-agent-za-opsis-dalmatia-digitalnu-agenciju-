import type { Metadata } from "next";
import { HeroSection } from "@/components/hr/hero-section";
import { FAQSection } from "@/components/hr/faq-section";
import { CTASection } from "@/components/hr/cta-section";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { generateServiceSchema } from "@/lib/structured-data";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Chatbotovi za Turizam — AI Chatbot Concierge",
  description:
    "AI chatbot za turističke agencije u Dalmaciji. Automatski odgovara turistima 24/7 na svim jezicima, preporučuje aktivnosti i omogućuje bukiranje izleta u Splitu.",
  keywords: [
    "chatbot za turizam",
    "chatbotovi",
    "AI chatbot",
    "chatbot concierge",
    "turistički chatbot",
    "chatbot Split",
    "chatbot Dalmacija",
    "automatizacija turizma",
  ],
  alternates: {
    canonical: "https://opsisdalmatia.com/hr/chatbotovi",
    languages: { hr: "/hr/chatbotovi", en: "/en/chatbots" },
  },
  openGraph: {
    title: "AI Chatbot za Turizam — Opsis Dalmatia",
    description:
      "Virtualni concierge koji radi 24/7, govori sve jezike i automatski bukira aktivnosti za vaše goste.",
    url: "https://opsisdalmatia.com/hr/chatbotovi",
    locale: "hr_HR",
  },
};

const faqs = [
  {
    question: "Što je chatbot za turizam?",
    answer:
      "Chatbot za turizam je AI-pogonjeni virtualni asistent koji automatski komunicira s turistima putem teksta. Odgovara na pitanja o destinaciji, preporučuje aktivnosti, pruža informacije o smještaju, restoranima i znamenitostima te može direktno obraditi rezervacije — sve bez ljudske intervencije. Moderni turistički chatbotovi koriste velike jezične modele (LLM) poput onih koje razvija Opsis Dalmatia, što im omogućuje prirodnu konverzaciju na bilo kojem jeziku.",
  },
  {
    question: "Kako chatbot pomaže turističkim agencijama?",
    answer:
      "Chatbot dramatično smanjuje opterećenje osoblja obrađujući do 80% ponavljajućih upita automatski. Turisti često postavljaju ista pitanja — radno vrijeme, cijene aktivnosti, kako doći do određene lokacije, dostupnost termina. Chatbot na sve to odgovara u sekundi, čak i usred noći ili vikendom. Rezultat je brže vrijeme odgovora, veće zadovoljstvo gostiju, više konverzija iz upita u rezervaciju i slobodno osoblje koje se može posvetiti složenijim zadacima.",
  },
  {
    question: "Koliko košta AI chatbot?",
    answer:
      "Cijena AI chatbota ovisi o složenosti implementacije, broju integracija i volumenu razgovora. Opsis Dalmatia nudi fleksibilne pakete prilagođene veličini agencije — od osnovnog chatbota za male iznajmljivače do naprednog sustava s integracijom bukinga, CRM-a i višekanalnom podrškom za velike turoperatore. Kontaktirajte nas za besplatnu procjenu i prilagođenu ponudu.",
  },
  {
    question: "Može li chatbot govoriti više jezika?",
    answer:
      "Da, naši chatbotovi podržavaju više od 50 jezika uključujući engleski, njemački, talijanski, francuski, španjolski, nizozemski, poljski, češki i mnoge druge. Chatbot automatski prepoznaje jezik turista i odgovara na istom jeziku — bez potrebe za ručnim odabirom. To je ključna prednost za turističke destinacije poput Dalmacije koje godišnje posjećuju gosti iz cijelog svijeta.",
  },
  {
    question: "Kako mogu dobiti chatbot za svoju agenciju?",
    answer:
      "Proces je jednostavan: kontaktirajte nas putem forme na stranici ili isprobajte našeg demo chatbota. Nakon razgovora o vašim potrebama, dizajniramo chatbot prilagođen vašoj ponudi, integriramo ga s vašim sustavima (web stranica, booking platforme, društvene mreže) i pokrećemo ga u roku od nekoliko dana. Pružamo obuku, tehničku podršku i redovite optimizacije na temelju analize razgovora.",
  },
];

export default function ChatbotoviPage() {
  return (
    <>
      <JsonLd
        data={generateServiceSchema(
          "AI Chatbot za Turizam",
          "Virtualni concierge chatbot za turističke agencije — automatski odgovara turistima 24/7, preporučuje aktivnosti i obrađuje rezervacije na svim jezicima.",
          ["chatbot", "AI chatbot", "turistički chatbot", "chatbot concierge", "chatbot Split"]
        )}
      />

      <Breadcrumbs
        locale="hr"
        items={[
          { name: "Početna", href: "/hr" },
          { name: "Usluge", href: "/hr/usluge" },
          { name: "Chatbotovi", href: "/hr/chatbotovi" },
        ]}
      />

      <HeroSection
        title="Chatbotovi za Turizam — AI Chatbot Concierge"
        subtitle="Virtualni asistent koji odgovara vašim gostima 24/7, na svim jezicima, i automatski bukira aktivnosti u Dalmaciji."
        ctaText="Isprobajte Demo Chatbot"
        ctaHref="/"
      />

      {/* Problem Section */}
      <section className="py-16 bg-zinc-950">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white mb-6 sm:text-3xl">
            Problem: Ponavljajuća Pitanja Troše Vaše Vrijeme
          </h2>
          <div className="space-y-4 text-zinc-300 leading-relaxed">
            <p>
              Svaka turistička agencija u Dalmaciji poznaje ovaj scenarij: sezona je u punom jeku,
              telefoni zvone bez prestanka, inbox je prepun istih pitanja — &ldquo;Koliko košta izlet
              na Modru špilju?&rdquo;, &ldquo;Imate li slobodnih mjesta za rafting sutra?&rdquo;,
              &ldquo;Kako dolazim do vaše poslovnice?&rdquo;. Vaše osoblje troši sate svaki dan
              odgovarajući na ista pitanja, umjesto da se bavi prodajom i brigom o gostima koji su
              već rezervirali.
            </p>
            <p>
              Istraživanja pokazuju da turisti očekuju odgovor u roku od 5 minuta. Ako ne dobiju
              odgovor brzo, 78% ih odlazi konkurenciji. A kada turist iz Njemačke, Italije ili
              Francuske pošalje upit na svojem jeziku kasno navečer — tko mu odgovara? U većini
              agencija nitko, jer osoblje radi od 8 do 16. Rezultat: izgubljena rezervacija,
              nezadovoljan gost i prihod koji je mogao biti vaš.
            </p>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-16 bg-zinc-900/50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white mb-6 sm:text-3xl">
            Rješenje: AI Chatbot Koji Nikad Ne Spava
          </h2>
          <div className="space-y-4 text-zinc-300 leading-relaxed">
            <p>
              Opsis Dalmatia razvija AI chatbot concierge sustav koji preuzima komunikaciju s
              turistima — automatski, točno i na bilo kojem jeziku. Naš chatbot koristi napredne
              jezične modele koji razumiju kontekst, pamte prethodne poruke u razgovoru i daju
              relevantne preporuke temeljene na stvarnim podacima o vašoj ponudi.
            </p>
            <p>
              Za razliku od jednostavnih chatbotova s unaprijed definiranim odgovorima, naš sustav
              vodi prirodnu konverzaciju. Turist može pitati &ldquo;Što mogu raditi s djecom u
              Splitu po kiši?&rdquo; i chatbot će predložiti muzeje, gastronomske radionice ili
              zatvorene aktivnosti iz vaše ponude — s cijenama, dostupnošću i linkom za
              rezervaciju. Sve to bez ijedne sekunde rada vašeg osoblja.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-zinc-950">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white mb-8 sm:text-3xl">
            Značajke Našeg Chatbot Sustava
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              {
                title: "Dostupnost 24/7/365",
                desc: "Chatbot radi non-stop, uključujući vikende, praznike i usred noći kada turisti najčešće planiraju aktivnosti.",
              },
              {
                title: "50+ Jezika",
                desc: "Automatska detekcija jezika — turist piše na svojem jeziku, chatbot odgovara na istom. Bez prevoditelja, bez kašnjenja.",
              },
              {
                title: "Integracija s Bukingom",
                desc: "Direktno povezivanje s vašim sustavom za rezervacije. Chatbot provjerava dostupnost i obrađuje buking u realnom vremenu.",
              },
              {
                title: "Preporuke Aktivnosti",
                desc: "Personalizirane preporuke temeljene na interesima gosta, vremenskim uvjetima, lokaciji i dostupnosti.",
              },
              {
                title: "Trenutni Odgovori",
                desc: "Prosječno vrijeme odgovora manje od 2 sekunde. Bez čekanja na liniji, bez automatizirane glazbe.",
              },
              {
                title: "Analitika i Izvještaji",
                desc: "Detaljni uvid u najčešća pitanja, stopu konverzije i zadovoljstvo gostiju za kontinuirano poboljšanje usluge.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
              >
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-zinc-900/50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white mb-8 sm:text-3xl">
            Kako Funkcionira?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Integracija",
                desc: "Povezujemo chatbot s vašom web stranicom, društvenim mrežama i sustavom za bukiranje. Proces traje nekoliko dana.",
              },
              {
                step: "2",
                title: "Učenje",
                desc: "Chatbot uči vašu ponudu, cijene, rasporede i sve informacije koje turisti trebaju. Hranimo ga vašim stvarnim podacima.",
              },
              {
                step: "3",
                title: "Pokretanje",
                desc: "Chatbot počinje odgovarati gostima. Vi pratite analitiku, mi optimiziramo performanse na temelju stvarnih razgovora.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <p className="text-zinc-400 text-sm">
              Želite saznati više o tome kako AI agenti mogu dodatno automatizirati vaše
              poslovanje?{" "}
              <Link
                href="/hr/ai-agenti"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Pročitajte o AI agentima
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQSection faqs={faqs} title="Često Postavljana Pitanja o Chatbotovima" />

      {/* CTA */}
      <CTASection
        title="Spremni za svojeg AI chatbota?"
        description="Isprobajte demo chatbot ili nas kontaktirajte za besplatnu procjenu. Pokažite gostima da vam je stalo do njihovog iskustva."
        buttonText="Isprobajte Demo Chatbot"
        buttonHref="/"
      />
    </>
  );
}
