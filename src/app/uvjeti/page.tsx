import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUp, TriangleAlert } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { COMPANY, TERMS_VERSION } from "@/config/company";
import type { Lang } from "@/lib/types";

/** Terms of use for guests + partner terms (operators, hosts). Croatian by default, ?lang=en for English. */

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function langOf(v: string | string[] | undefined, fallback: Lang): Lang {
  const s = Array.isArray(v) ? v[0] : v;
  return s === "hr" || s === "en" ? s : fallback;
}

function fmtDate(iso: string, lang: Lang): string {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(lang === "hr" ? "hr-HR" : "en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(d);
}

const linkClass = "font-semibold text-sea-deep underline underline-offset-2 hover:no-underline";
const mail = (addr: string) => (
  <a className={linkClass} href={`mailto:${addr}`}>
    {addr}
  </a>
);

interface Clause {
  title: string;
  text: ReactNode;
}

interface Section {
  id: string;
  title: string;
  clauses: Clause[];
}

interface Copy {
  metaTitle: string;
  metaDescription: string;
  title: string;
  lead: string;
  updated: string;
  version: string;
  pilotTitle: string;
  pilotText: string;
  placeholderText: string;
  tocTitle: string;
  sections: Section[];
  contact: { title: string; labels: { company: string; oib: string; address: string; registry: string; email: string; website: string } };
  seeAlso: string;
  privacyLink: string;
  backToTop: string;
  langLabel: string;
}

const HR: Copy = {
  metaTitle: "Uvjeti korištenja",
  metaDescription:
    "Uvjeti korištenja usluge Opsis Dalmatia · AI Concierge za goste te uvjeti suradnje za organizatore izleta i iznajmljivače.",
  title: "Uvjeti korištenja",
  lead: "Ovi uvjeti vrijede za goste koji koriste Opsis Dalmatia · AI Concierge i za našu suradnju s organizatorima izleta i iznajmljivačima smještaja.",
  updated: "Zadnje ažurirano",
  version: "Verzija",
  pilotTitle: "Pilot",
  pilotText: "Usluga je u pilot fazi. Dio ponude čine demo ponude izmišljenih tvrtki, označene oznakom „Demo”.",
  placeholderText: "Podaci o tvrtki na ovoj stranici privremeni su (demo) i bit će zamijenjeni prije komercijalnog pokretanja.",
  tocTitle: "Sadržaj",
  sections: [
    {
      id: "usluga",
      title: "O usluzi",
      clauses: [
        {
          title: "Pružatelj",
          text: (
            <>
              Uslugu Opsis Dalmatia · AI Concierge (dalje: Opsis) pruža {COMPANY.legalName}, {COMPANY.address}, OIB {COMPANY.oib}.
            </>
          ),
        },
        {
          title: "Posrednik",
          text: "Opsis je posrednička platforma. Povezuje goste s lokalnim organizatorima aktivnosti (dalje: organizatori) i iznajmljivačima smještaja (dalje: iznajmljivači). Opsis nije organizator aktivnosti i nije strana ugovora između gosta i organizatora.",
        },
        {
          title: "Prihvaćanje",
          text: "Korištenjem stranice prihvaćate ove uvjete. Partneri ih prihvaćaju pri registraciji, a mi bilježimo verziju i vrijeme prihvaćanja.",
        },
      ],
    },
    {
      id: "gosti",
      title: "Za goste",
      clauses: [
        {
          title: "Zahtjev, a ne rezervacija",
          text: "Slanjem kartice rezervacije šaljete zahtjev organizatoru. Rezervacija postoji tek kada je organizator potvrdi, a potvrdu dobivate mailom. Ako organizator odbije zahtjev ili ne odgovori, rezervacija ne postoji i ništa ne plaćate.",
        },
        {
          title: "Cijene",
          text: "Cijene su prikazane po osobi, u eurima, kako ih je naveo organizator. Za djecu vrijedi pravilo prikazano uz ponudu (besplatno, pola cijene, posebna cijena za djecu ili samo odrasli). Ukupan iznos na kartici rezervacije izračunat je prema tim cijenama.",
        },
        {
          title: "Plaćanje",
          text: "U aplikaciji se ništa ne plaća i Opsis ne prima novac od gostiju. Plaćanje dogovarate izravno s organizatorom.",
        },
        {
          title: "Otkazivanje i izmjene",
          text: (
            <>
              Vrijede uvjeti organizatora. Za izmjenu ili otkazivanje odgovorite na naš mail ili pišite na {mail(COMPANY.email)} uz oznaku rezervacije, a mi ćemo
              poruku proslijediti organizatoru.
            </>
          ),
        },
        {
          title: "Aktivnost",
          text: "Za izvođenje aktivnosti, sigurnost, dozvole, osiguranje, promjene zbog vremenskih uvjeta i točnost ponude odgovoran je organizator.",
        },
        {
          title: "AI asistent",
          text: "Concierge je AI asistent i može pogriješiti, primjerice u terminima, dostupnosti ili pojedinostima ponude. Mjerodavni su podaci na kartici rezervacije i u mailu s potvrdom, a ne ono što AI napiše u razgovoru. Molimo ne upisujte u chat osjetljive osobne podatke.",
        },
        {
          title: "Demo ponude",
          text: "Tijekom pilota dio ponude čine demo ponude izmišljenih tvrtki, označene oznakom „Demo”. Zahtjev za demo ponudu prima samo tim Opsisa, a ne stvarni organizator.",
        },
        {
          title: "Primjereno korištenje",
          text: "Zabranjeni su zlouporaba usluge, automatsko prikupljanje sadržaja, pokušaji zaobilaženja sigurnosnih mjera i lažni zahtjevi. U slučaju zlouporabe možemo ograničiti pristup.",
        },
        {
          title: "Dob",
          text: "Zahtjev za rezervaciju mogu poslati samo punoljetne osobe.",
        },
      ],
    },
    {
      id: "organizatori",
      title: "Za organizatore izleta",
      clauses: [
        {
          title: "Registracija i objava",
          text: "Svaku registraciju i ponudu pregledavamo prije objave te možemo odbiti ili ukloniti ponudu koja je netočna, protivna propisima ili ne odgovara platformi. Organizator jamči da ima sve dozvole, registracije i osiguranja koje njegova djelatnost zahtijeva.",
        },
        {
          title: "Točnost ponude",
          text: "Organizator održava ponudu točnom: opis, cijene, mjesto okupljanja, pravila za djecu i dostupnost. Neradne dane i fotografije uređuje putem osobne poveznice za upravljanje. Prikazane cijene su konačne cijene za goste.",
        },
        {
          title: "Odgovor na zahtjeve",
          text: "Organizator na svaki zahtjev odgovara brzo — u pravilu unutar 24 sata, a uvijek prije datuma aktivnosti — i poštuje potvrđene rezervacije. Ako mora otkazati (npr. zbog vremenskih uvjeta ili sigurnosti), što prije obavještava gosta i Opsis.",
        },
        {
          title: "Provizija",
          text: "Za svaku aktivnost vrijedi postotak provizije naveden pri registraciji. Provizija se plaća na potvrđene rezervacije koje su se održale i obračunava se na vrijednost rezervacije. Za odbijene zahtjeve te otkazane ili neodržane rezervacije provizija se ne plaća.",
        },
        {
          title: "Obračun i račun",
          text: "Jednom mjesečno šaljemo obračun potvrđenih rezervacija i račun za proviziju, koji se plaća u roku navedenom na računu. Ako se neka rezervacija s obračuna nije održala, javite nam to što prije.",
        },
        {
          title: "Podaci gostiju",
          text: "Kontakt podatke gostiju organizator koristi samo za obradu i izvođenje te rezervacije, kao samostalni voditelj obrade u skladu s GDPR-om, a ne za marketing bez privole gosta.",
        },
        {
          title: "Poveznica za upravljanje",
          text: "Osobna poveznica za upravljanje djeluje kao lozinka: ne dijelite je. Ako dospije u pogrešne ruke, javite nam se i izdat ćemo novu.",
        },
        {
          title: "Prestanak suradnje",
          text: "Suradnju možete prekinuti u bilo kojem trenutku mailom; provizija za rezervacije potvrđene do tada ostaje dužna. Ponudu možemo privremeno ili trajno ukloniti ako se ovi uvjeti krše ili se na zahtjeve opetovano ne odgovara.",
        },
      ],
    },
    {
      id: "iznajmljivaci",
      title: "Za iznajmljivače",
      clauses: [
        {
          title: "Besplatno",
          text: "QR kod, poveznica i plakat su besplatni; iznajmljivač ne plaća nikakve naknade.",
        },
        {
          title: "Pripisivanje zahtjeva",
          text: "Zahtjevi gostiju koji otvore vaš QR kod ili poveznicu bilježe se uz vašu oznaku (preglednik gosta pamti je do 30 dana). Šaljemo vam pregled broja zahtjeva i njihova statusa.",
        },
        {
          title: "Udio u proviziji",
          text: "Udio u proviziji moguć je samo prema posebnom pisanom dogovoru. Tijekom pilota iznosi se ne prikazuju.",
        },
        {
          title: "Podaci gostiju",
          text: "Iznajmljivači ne dobivaju kontakt podatke gostiju (ime, e-mail, telefon); vide samo da je zahtjev stigao preko njihova QR koda.",
        },
        {
          title: "Korištenje QR koda",
          text: "QR kod i plakat koristite u svom objektu i u komunikaciji sa svojim gostima. Ne mijenjajte QR kod i ne obećavajte gostima ništa u ime organizatora ili Opsisa.",
        },
        {
          title: "Prestanak",
          text: "Možete prestati u bilo kojem trenutku: uklonite QR kod i javite nam se, a mi ćemo deaktivirati vašu oznaku.",
        },
      ],
    },
    {
      id: "odgovornost",
      title: "Odgovornost",
      clauses: [
        {
          title: "Uloga posrednika",
          text: "Opsis posreduje i ne odgovara za samu aktivnost, za postupke ili propuste organizatora, za otkazivanja od strane organizatora, za vremenske uvjete ni za dogovore između gosta i organizatora.",
        },
        {
          title: "Dostupnost i točnost",
          text: "Trudimo se da usluga radi i da su podaci točni, ali ne jamčimo neprekidan rad ni točnost svake ponude ili odgovora AI asistenta. Podatke o ponudi daju organizatori.",
        },
        {
          title: "Odgovornost koja se ne može isključiti",
          text: "Ništa u ovim uvjetima ne isključuje niti ograničava odgovornost koja se prema zakonu ne može isključiti, osobito za namjeru i krajnju nepažnju, kao ni prava potrošača prema prisilnim propisima.",
        },
      ],
    },
    {
      id: "pravo",
      title: "Mjerodavno pravo i sporovi",
      clauses: [
        { title: "Mjerodavno pravo", text: "Na ove uvjete primjenjuje se pravo Republike Hrvatske." },
        {
          title: "Nadležnost",
          text: "Za sporove je nadležan stvarno nadležni sud u Splitu, osim ako prisilni propisi o zaštiti potrošača ne određuju drukčije.",
        },
        {
          title: "Prigovori",
          text: <>Pitanja i prigovore šaljite na {mail(COMPANY.email)}. Na pisane prigovore odgovaramo u roku od 15 dana.</>,
        },
      ],
    },
    {
      id: "izmjene",
      title: "Izmjene i jezične verzije",
      clauses: [
        {
          title: "Izmjene",
          text: "Uvjete možemo mijenjati. Vrijedi verzija objavljena na ovoj stranici; o bitnim izmjenama partnere unaprijed obavještavamo mailom.",
        },
        {
          title: "Jezične verzije",
          text: "Uvjeti su dostupni na hrvatskom i engleskom jeziku. U slučaju razlike mjerodavna je hrvatska verzija.",
        },
      ],
    },
  ],
  contact: {
    title: "Kontakt",
    labels: { company: "Tvrtka", oib: "OIB", address: "Adresa", registry: "Registar", email: "E-mail", website: "Web" },
  },
  seeAlso: "Pogledajte i našu",
  privacyLink: "Izjavu o privatnosti",
  backToTop: "Na vrh",
  langLabel: "Jezik",
};

const EN: Copy = {
  metaTitle: "Terms of use",
  metaDescription:
    "Terms of use of Opsis Dalmatia · AI Concierge for guests, and partner terms for tour operators and accommodation hosts.",
  title: "Terms of use",
  lead: "These terms apply to guests using Opsis Dalmatia · AI Concierge and to our partnership with tour operators and accommodation hosts.",
  updated: "Last updated",
  version: "Version",
  pilotTitle: "Pilot",
  pilotText: "The service is in a pilot phase. Some listings are demo offers from fictional companies, marked “Demo”.",
  placeholderText: "Company details on this page are placeholders and will be replaced before the commercial launch.",
  tocTitle: "Contents",
  sections: [
    {
      id: "usluga",
      title: "About the service",
      clauses: [
        {
          title: "Provider",
          text: (
            <>
              Opsis Dalmatia · AI Concierge (“Opsis”) is provided by {COMPANY.legalName}, {COMPANY.address}, OIB {COMPANY.oib}.
            </>
          ),
        },
        {
          title: "Intermediary",
          text: "Opsis is an intermediary platform. It connects guests with local activity organisers (“operators”) and accommodation hosts (“hosts”). Opsis does not organise the activities and is not a party to the contract between the guest and the operator.",
        },
        {
          title: "Acceptance",
          text: "By using the site, you accept these terms. Partners accept them when registering; we record the version and the time of acceptance.",
        },
      ],
    },
    {
      id: "gosti",
      title: "For guests",
      clauses: [
        {
          title: "A request, not a booking",
          text: "Sending the booking card sends a request to the operator. A booking exists only once the operator confirms it, and you receive the confirmation by e-mail. If the operator declines or doesn't reply, there is no booking and you pay nothing.",
        },
        {
          title: "Prices",
          text: "Prices are shown per person, in euros, as provided by the operator. Children are charged according to the policy shown with the offer (free, half price, a separate child price or adults only). The total on the booking card is calculated from these prices.",
        },
        {
          title: "Payment",
          text: "There is no payment in the app, and Opsis never takes money from guests. Payment is arranged directly with the operator.",
        },
        {
          title: "Cancellations and changes",
          text: (
            <>
              The operator&apos;s terms apply. To change or cancel, reply to our e-mail or write to {mail(COMPANY.email)} with your booking reference, and we&apos;ll
              pass your message on to the operator.
            </>
          ),
        },
        {
          title: "The activity",
          text: "The operator is responsible for running the activity, safety, licences, insurance, changes due to weather and the accuracy of the offer.",
        },
        {
          title: "AI assistant",
          text: "The concierge is an AI assistant and can make mistakes, for example about times, availability or offer details. The booking card and the confirmation e-mail are authoritative, not what the AI writes in the chat. Please don't type sensitive personal data into the chat.",
        },
        {
          title: "Demo offers",
          text: "During the pilot, some listings are demo offers from fictional companies, marked “Demo”. A request for a demo offer is received only by the Opsis team, not by a real operator.",
        },
        {
          title: "Fair use",
          text: "Misuse of the service, automated scraping, attempts to bypass security measures and fake requests are not allowed. We may restrict access in case of abuse.",
        },
        {
          title: "Age",
          text: "You must be at least 18 years old to send a booking request.",
        },
      ],
    },
    {
      id: "organizatori",
      title: "For tour operators",
      clauses: [
        {
          title: "Registration and publishing",
          text: "We review every registration and offer before publishing it, and we may refuse or remove offers that are inaccurate, unlawful or don't fit the platform. The operator confirms that it holds all permits, registrations and insurance its activities require.",
        },
        {
          title: "Accurate listings",
          text: "The operator keeps its listings accurate: description, prices, meeting point, child policy and availability. Days off and photos are managed through the personal manage link. The prices shown are final prices for guests.",
        },
        {
          title: "Responding to requests",
          text: "The operator responds to every request promptly — as a rule within 24 hours, and always before the activity date — and honours confirmed bookings. If it has to cancel (for example because of weather or safety), it informs the guest and Opsis as soon as possible.",
        },
        {
          title: "Commission",
          text: "Each activity carries the commission percentage stated at registration. Commission is owed on confirmed bookings that took place and is calculated on the booking value. No commission is owed for declined requests or for bookings that were cancelled or did not take place.",
        },
        {
          title: "Statement and invoice",
          text: "Once a month we send a statement of confirmed bookings together with an invoice for the commission, payable by the due date shown on the invoice. If a booking on the statement did not take place, let us know as soon as possible.",
        },
        {
          title: "Guest data",
          text: "The operator uses guests' contact details only to handle and deliver that booking, as an independent controller in line with the GDPR, and not for marketing without the guest's consent.",
        },
        {
          title: "Manage link",
          text: "The personal manage link works like a password: don't share it. If it gets into the wrong hands, tell us and we'll issue a new one.",
        },
        {
          title: "Ending the partnership",
          text: "You can end the partnership at any time by e-mail; commission for bookings confirmed until then remains payable. We may suspend or remove listings if these terms are breached or if requests repeatedly go unanswered.",
        },
      ],
    },
    {
      id: "iznajmljivaci",
      title: "For hosts",
      clauses: [
        {
          title: "Free of charge",
          text: "The QR code, link and poster are free; hosts pay no fees.",
        },
        {
          title: "Attribution",
          text: "Requests from guests who open your QR code or link are recorded with your code (the guest's browser remembers it for up to 30 days). We send you an overview of the number of requests and their status.",
        },
        {
          title: "Commission share",
          text: "A share of the commission is possible only under a separate written agreement. Amounts are not shown during the pilot.",
        },
        {
          title: "Guest data",
          text: "Hosts don't receive guests' contact details (name, e-mail, phone); they only see that a request came via their QR code.",
        },
        {
          title: "Using the QR code",
          text: "Use the QR code and poster at your property and in your communication with guests. Don't alter the QR code, and don't promise guests anything on behalf of operators or Opsis.",
        },
        {
          title: "Ending",
          text: "You can stop at any time: remove the QR code and let us know, and we'll deactivate your code.",
        },
      ],
    },
    {
      id: "odgovornost",
      title: "Liability",
      clauses: [
        {
          title: "Intermediary role",
          text: "Opsis acts as an intermediary and is not liable for the activity itself, for the operator's acts or omissions, for cancellations by the operator, for the weather or for arrangements between the guest and the operator.",
        },
        {
          title: "Availability and accuracy",
          text: "We do our best to keep the service running and the information accurate, but we don't guarantee uninterrupted operation or the accuracy of every offer or AI answer. Offer details are provided by operators.",
        },
        {
          title: "Liability that cannot be excluded",
          text: "Nothing in these terms excludes or limits liability that cannot be excluded by law, in particular for intent or gross negligence, or the rights consumers have under mandatory law.",
        },
      ],
    },
    {
      id: "pravo",
      title: "Governing law and disputes",
      clauses: [
        { title: "Governing law", text: "These terms are governed by the law of the Republic of Croatia." },
        {
          title: "Jurisdiction",
          text: "The competent court in Split has jurisdiction, unless mandatory consumer protection rules provide otherwise.",
        },
        {
          title: "Complaints",
          text: <>Send questions and complaints to {mail(COMPANY.email)}. We reply to written complaints within 15 days.</>,
        },
      ],
    },
    {
      id: "izmjene",
      title: "Changes and language versions",
      clauses: [
        {
          title: "Changes",
          text: "We may change these terms. The version published on this page applies; we notify partners of material changes by e-mail in advance.",
        },
        {
          title: "Language versions",
          text: "These terms are available in Croatian and English. If the versions differ, the Croatian version prevails.",
        },
      ],
    },
  ],
  contact: {
    title: "Contact",
    labels: { company: "Company", oib: "OIB", address: "Address", registry: "Register", email: "E-mail", website: "Website" },
  },
  seeAlso: "See also our",
  privacyLink: "Privacy notice",
  backToTop: "Back to top",
  langLabel: "Language",
};

const COPY: Record<Lang, Copy> = { hr: HR, en: EN };

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const lang = langOf((await searchParams).lang, "hr");
  const c = COPY[lang];
  return {
    title: c.metaTitle,
    description: c.metaDescription,
    alternates: {
      canonical: lang === "en" ? "/uvjeti?lang=en" : "/uvjeti",
      languages: { hr: "/uvjeti", en: "/uvjeti?lang=en" },
    },
  };
}

export default async function TermsPage({ searchParams }: { searchParams: SearchParams }) {
  const lang = langOf((await searchParams).lang, "hr");
  const c = COPY[lang];
  const contactN = c.sections.length + 1;
  const contactRows: [string, ReactNode][] = [
    [c.contact.labels.company, COMPANY.legalName],
    [c.contact.labels.oib, COMPANY.oib],
    [c.contact.labels.address, COMPANY.address],
    [c.contact.labels.registry, COMPANY.registry],
    [c.contact.labels.email, mail(COMPANY.email)],
    [
      c.contact.labels.website,
      <a key="web" className={linkClass} href={COMPANY.website}>
        {COMPANY.website.replace(/^https?:\/\//, "")}
      </a>,
    ],
  ];

  return (
    <div lang={lang} className="flex min-h-dvh flex-col bg-stone text-ink">
      <header className="bg-ink text-stone">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <Link href={`/?lang=${lang}`} className="flex min-h-10 items-center gap-2">
            <span className="font-display text-[18px] font-semibold">{COMPANY.brand}</span>
            <span className="hidden text-[11px] font-bold uppercase tracking-[0.2em] text-sea sm:inline">AI Concierge</span>
          </Link>
          <nav aria-label={c.langLabel} className="flex items-center gap-1 rounded-full border border-line p-1 text-[13px] font-bold">
            {(["hr", "en"] as const).map((l) => (
              <Link
                key={l}
                href={`/uvjeti?lang=${l}`}
                hrefLang={l}
                lang={l}
                aria-current={l === lang ? "true" : undefined}
                aria-label={l === "hr" ? "Hrvatski" : "English"}
                className={`inline-flex min-h-9 min-w-11 items-center justify-center rounded-full px-3 ${l === lang ? "bg-sea text-ink" : "text-stone hover:text-sea"}`}
              >
                {l.toUpperCase()}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-16 pt-8 text-[16px] leading-[1.7] text-body sm:pt-12 sm:text-[17px]">
        <div id="top">
          <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-sea-deep">Opsis Dalmatia · AI Concierge</p>
          <h1 className="mt-2 font-display text-[34px] font-semibold leading-[1.1] text-ink sm:text-[44px]">{c.title}</h1>
          <p className="mt-4 text-[17px] leading-relaxed sm:text-[18px]">{c.lead}</p>
          <p className="mt-3 text-[14px] text-body/85">
            {c.updated}: {fmtDate(TERMS_VERSION, lang)} · {c.version} {TERMS_VERSION}
          </p>
        </div>

        <aside className="mt-6 flex gap-3 rounded-2xl border border-sun/50 bg-sun/10 p-4 text-[15px] leading-relaxed text-ink">
          <TriangleAlert className="mt-1 size-5 shrink-0 text-sun" aria-hidden />
          <div>
            <p className="font-semibold">{c.pilotTitle}</p>
            <p className="mt-1 text-body">{c.pilotText}</p>
            {COMPANY.isPlaceholder && <p className="mt-1 text-body">{c.placeholderText}</p>}
          </div>
        </aside>

        <nav aria-labelledby="toc" className="mt-8">
          <h2 id="toc" className="text-[13px] font-bold uppercase tracking-[0.14em] text-sea-deep">{c.tocTitle}</h2>
          <ol className="mt-2 grid gap-x-6 sm:grid-cols-2">
            {[...c.sections.map((s) => [s.id, s.title] as const), ["kontakt", c.contact.title] as const].map(([id, title], i) => (
              <li key={id}>
                <a href={`#${id}`} className="inline-block py-1.5 font-medium text-ink underline-offset-2 hover:underline">
                  {i + 1}. {title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {c.sections.map((s, si) => (
          <section key={s.id} aria-labelledby={s.id} className="mt-12">
            <h2 id={s.id} className="scroll-mt-6 font-display text-[24px] font-semibold leading-snug text-ink sm:text-[28px]">
              <span className="text-sea-deep">{si + 1}.</span> {s.title}
            </h2>
            <ol className="mt-4 space-y-4">
              {s.clauses.map((cl, ci) => (
                <li key={cl.title} className="flex gap-3 sm:gap-4">
                  <span className="w-9 shrink-0 pt-px text-[15px] font-semibold tabular-nums text-sea-deep sm:w-10">
                    {si + 1}.{ci + 1}
                  </span>
                  <p>
                    <strong className="font-semibold text-ink">{cl.title}.</strong> {cl.text}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        ))}

        <section aria-labelledby="kontakt" className="mt-12">
          <h2 id="kontakt" className="scroll-mt-6 font-display text-[24px] font-semibold leading-snug text-ink sm:text-[28px]">
            <span className="text-sea-deep">{contactN}.</span> {c.contact.title}
          </h2>
          <dl className="mt-4 divide-y divide-sand rounded-2xl border border-sand bg-stone-2">
            {contactRows.map(([label, value]) => (
              <div key={label} className="flex flex-col px-4 py-3 sm:flex-row sm:gap-3">
                <dt className="font-semibold text-ink sm:w-28 sm:shrink-0">{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <div className="mt-12 flex flex-col gap-3 border-t border-sand pt-6 text-[15px] sm:flex-row sm:items-center sm:justify-between">
          <p>
            {c.seeAlso}{" "}
            <Link className={linkClass} href={`/privacy?lang=${lang}`}>
              {c.privacyLink}
            </Link>
            .
          </p>
          <a href="#top" className="inline-flex items-center gap-1.5 font-semibold text-sea-deep hover:underline">
            <ArrowUp className="size-4" aria-hidden /> {c.backToTop}
          </a>
        </div>
      </main>

      <SiteFooter lang={lang} light />
    </div>
  );
}
