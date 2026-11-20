import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUp, Check, TriangleAlert } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { COMPANY, PRIVACY_VERSION } from "@/config/company";
import type { Lang } from "@/lib/types";

/** Privacy notice (GDPR Art. 13 and 14). English by default, ?lang=hr for Croatian. */

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
const website = (
  <a className={linkClass} href={COMPANY.website}>
    {COMPANY.website.replace(/^https?:\/\//, "")}
  </a>
);
const azop = (
  <a className={linkClass} href="https://azop.hr" hrefLang="hr">
    azop.hr
  </a>
);

interface Processing {
  id: string;
  title: string;
  data: ReactNode;
  purpose: ReactNode;
  basis: ReactNode;
  recipients?: ReactNode;
  note?: ReactNode;
}

interface Copy {
  metaTitle: string;
  metaDescription: string;
  title: string;
  lead: string;
  updated: string;
  version: string;
  placeholderTitle: string;
  placeholderText: string;
  summaryTitle: string;
  summary: ReactNode[];
  tocTitle: string;
  controller: { title: string; body: ReactNode };
  processing: {
    title: string;
    intro: string;
    labels: { data: string; purpose: string; basis: string; recipients: string; note: string };
    items: Processing[];
  };
  processors: { title: string; intro: string; list: [string, string][]; outro: string };
  retention: { title: string; head: [string, string]; rows: [string, string][]; outro: string };
  rights: { title: string; body: ReactNode };
  other: { title: string; items: [string, ReactNode][] };
  seeAlso: string;
  termsLink: string;
  backToTop: string;
  langLabel: string;
}

const EN: Copy = {
  metaTitle: "Privacy notice",
  metaDescription:
    "How Opsis Dalmatia · AI Concierge processes the personal data of guests, hosts and tour operators, and what your rights are.",
  title: "Privacy notice",
  lead: "This notice explains which personal data we process when you use Opsis Dalmatia · AI Concierge — as a guest, a host or a tour operator — why we process it and what your rights are under the GDPR (Articles 13 and 14).",
  updated: "Last updated",
  version: "Version",
  placeholderTitle: "Pilot: company details are placeholders",
  placeholderText:
    "During the pilot, the company name, OIB, address and registration details on this page are placeholders. They will be replaced with the real details before the commercial launch.",
  summaryTitle: "In short",
  summary: [
    "We collect only what is needed to pass your booking request to the organiser and to run the service.",
    "No payments in the app, no advertising cookies, no analytics trackers — and we never sell data.",
    "Chat messages are processed by Anthropic (Claude) to write the replies. The conversation is kept in your browser, not on our servers.",
    "Hosts never receive guests' contact details.",
    <>You can ask us to access, correct or delete your data at any time: {mail(COMPANY.privacyContact)}.</>,
  ],
  tocTitle: "Contents",
  controller: {
    title: "Who is responsible",
    body: (
      <>
        <p>
          The controller of your personal data is <strong className="font-semibold text-ink">{COMPANY.legalName}</strong>, {COMPANY.address}, OIB{" "}
          {COMPANY.oib}. Court register: {COMPANY.registry}. Website: {website}. E-mail: {mail(COMPANY.email)}.
        </p>
        <p className="mt-3">For any question about your data, or to exercise your rights, write to {mail(COMPANY.privacyContact)}.</p>
      </>
    ),
  },
  processing: {
    title: "What we process and why",
    intro: "What we process depends on how you use the service.",
    labels: { data: "Data", purpose: "Purpose", basis: "Legal basis", recipients: "Who receives it", note: "Please note" },
    items: [
      {
        id: "bookings",
        title: "Booking requests",
        data: "Your name, e-mail address, phone number and notes for the organiser; the chosen activity, date, number of adults and children, price, booking reference and language. If you opened the site through a host's QR code, the request also carries that host's code.",
        purpose:
          "To pass your request to the organiser, let them confirm or decline it, and e-mail you about it (receipt, confirmation or decline). We also use booking records to calculate the commission organisers pay us.",
        basis:
          "Taking steps at your request before a contract is concluded, and providing our booking service (Art. 6(1)(b) GDPR). Calculating commission: our legitimate interest in billing our partners (Art. 6(1)(f) GDPR).",
        recipients:
          "The organiser of the activity you chose, who uses your details as an independent controller to confirm and provide the activity, and authorised Opsis staff. Hosts never receive your name, e-mail address or phone number — they only see that a request came via their QR code (type of activity, date and status).",
      },
      {
        id: "chat",
        title: "AI chat",
        data: "The messages you type and the conversation so far.",
        purpose:
          "To write the concierge's replies and suggest activities. Your messages are sent to Anthropic (Claude API), which processes them on our behalf. The conversation is kept in your own browser (session storage), signed by our server so it can't be altered, and expires after 24 hours at the latest. We don't store chat transcripts on our servers — only technical records without message content, such as message counts and errors.",
        basis: "Providing the chat you choose to use (Art. 6(1)(b) GDPR).",
        note: "Please don't type sensitive information (such as health or payment details) into the chat. Contact details for a booking are entered on the booking card, which goes straight to our server and is never sent to the AI.",
      },
      {
        id: "quiz",
        title: "Quiz",
        data: "Your answers and — only if you ask for the results by e-mail — your e-mail address. If you came through a host's QR code, that host's code.",
        purpose:
          "To recommend activities and, if you ask, e-mail you the results. Your answers (never your e-mail address) may be sent to Anthropic to write short explanations of the recommendations. We don't use your e-mail address for anything else.",
        basis:
          "Providing the recommendations you ask for (Art. 6(1)(b) GDPR). E-mailing the results is based on your consent (Art. 6(1)(a) GDPR), which you can withdraw at any time.",
      },
      {
        id: "partners",
        title: "Host and tour operator registrations",
        data: "Business contact details (name, company or property name, e-mail, phone, address, town), details of your property or offers (number of units, typical number of guests, sales channels; activities, prices, commission, photos) and when you accepted our terms.",
        purpose:
          "To run the partnership: review and publish offers, create QR codes and links, forward booking requests, send statements and invoices, and contact you about the service. For tour operators, the company name and offer details are shown publicly on the site.",
        basis: "Performance of our contract with you (Art. 6(1)(b) GDPR) and legal accounting obligations (Art. 6(1)(c) GDPR).",
      },
      {
        id: "outreach",
        title: "Business e-mails to tour operators and hosts",
        data: "Business e-mail address, name, company or property name, town, the public source where we found the address (for example your website, a business profile or a public register) and a record of the e-mails we sent.",
        purpose: "To offer our service to tour operators and accommodation hosts with a short business e-mail.",
        basis: "Our legitimate interest in offering our service to businesses (Art. 6(1)(f) GDPR).",
        note: (
          <>
            You can object at any time with the unsubscribe link in every e-mail or by writing to {mail(COMPANY.privacyContact)}. We then keep your address on a
            suppression list only to make sure we never contact you again.
          </>
        ),
      },
      {
        id: "technical",
        title: "Technical data and browser storage",
        data: "Your IP address, and small entries in your browser's localStorage and sessionStorage: your language choice, the current chat and the host's QR code you arrived from.",
        purpose:
          "The IP address is used for rate limiting and security (to stop abuse) and is kept only in server memory, for at most 24 hours; our hosting provider may also process it briefly in technical logs. Browser storage makes the site work: the chat lasts while your tab is open (at most 24 hours), and the host's code is remembered for up to 30 days so that your requests are attributed to that host. You can clear it in your browser settings at any time. We don't use advertising cookies, analytics trackers or social media pixels.",
        basis: "Our legitimate interest in a secure, working service (Art. 6(1)(f) GDPR).",
      },
    ],
  },
  processors: {
    title: "Processors and transfers outside the EU",
    intro: "We use these service providers, who process personal data only on our instructions:",
    list: [
      ["Vercel", "website hosting (EU and USA)"],
      ["Google", "storage of requests and registrations (Google Sheets)"],
      ["Anthropic", "AI model for the chat and the quiz explanations (Claude API)"],
      ["Resend", "e-mail delivery"],
    ],
    outro:
      "Some of these providers are based in the USA or process data there. Such transfers are based on the European Commission's standard contractual clauses, which are part of the providers' data processing terms. We may also disclose data to public authorities where the law requires it. We never sell personal data or share it for advertising.",
  },
  retention: {
    title: "How long we keep data",
    head: ["Data", "Retention"],
    rows: [
      ["Booking requests", "24 months from the request"],
      ["Quiz results (including your e-mail, if given)", "12 months"],
      ["AI chat", "Not stored on our servers; in your browser for at most 24 hours"],
      ["Host and tour operator registrations", "For the duration of the partnership plus 12 months"],
      ["Business e-mail contacts", "Up to 12 months after our last e-mail, unless you object earlier"],
      ["Suppression list (addresses that unsubscribed)", "As long as needed to respect your choice"],
      ["Event log (technical, without message content)", "12 months"],
      ["IP addresses for rate limiting", "At most 24 hours, in server memory only"],
      ["Invoices and accounting records", "As long as Croatian accounting and tax law requires"],
    ],
    outro: "When a period ends, we delete the data or anonymise it.",
  },
  rights: {
    title: "Your rights",
    body: (
      <>
        <p>
          You have the right to access your personal data, to have it corrected or erased, to restrict its processing, to data portability, and to object to
          processing based on our legitimate interests (including business e-mails). Where processing is based on consent, you can withdraw it at any time;
          this doesn&apos;t affect processing carried out before the withdrawal.
        </p>
        <p className="mt-3">
          To exercise your rights, write to {mail(COMPANY.privacyContact)}. We reply within one month and may first ask you to confirm your identity.
        </p>
        <p className="mt-3">
          You can also lodge a complaint with the Croatian supervisory authority, Agencija za zaštitu osobnih podataka (AZOP), Selska cesta 136, 10000 Zagreb,{" "}
          {azop}, or with the supervisory authority in the EU country where you live.
        </p>
      </>
    ),
  },
  other: {
    title: "Other information",
    items: [
      ["Is providing data required?", "Name, e-mail and phone are needed to send a booking request; without them the organiser can't confirm it. Everything else is optional."],
      [
        "Automated decisions",
        "We don't make decisions based solely on automated processing that have legal or similarly significant effects on you. The AI concierge and the quiz only make suggestions; organisers decide on requests themselves.",
      ],
      ["Changes", "We may update this notice. The date at the top shows when it was last changed, and we'll point out significant changes on the site."],
    ],
  },
  seeAlso: "See also our",
  termsLink: "Terms of use",
  backToTop: "Back to top",
  langLabel: "Language",
};

const HR: Copy = {
  metaTitle: "Izjava o privatnosti",
  metaDescription:
    "Kako Opsis Dalmatia · AI Concierge obrađuje osobne podatke gostiju, iznajmljivača i organizatora izleta te koja su vaša prava.",
  title: "Izjava o privatnosti",
  lead: "Ova izjava objašnjava koje osobne podatke obrađujemo kada koristite Opsis Dalmatia · AI Concierge — kao gost, iznajmljivač ili organizator izleta — zašto ih obrađujemo i koja su vaša prava prema Općoj uredbi o zaštiti podataka (GDPR, članci 13. i 14.).",
  updated: "Zadnje ažurirano",
  version: "Verzija",
  placeholderTitle: "Pilot: podaci o tvrtki su privremeni",
  placeholderText:
    "Tijekom pilota naziv tvrtke, OIB, adresa i podaci o upisu na ovoj stranici privremeni su (demo). Prije komercijalnog pokretanja zamijenit ćemo ih stvarnim podacima.",
  summaryTitle: "Ukratko",
  summary: [
    "Prikupljamo samo ono što je potrebno da vaš zahtjev za rezervaciju proslijedimo organizatoru i da usluga radi.",
    "U aplikaciji nema plaćanja, reklamnih kolačića ni alata za praćenje, a podatke nikad ne prodajemo.",
    "Poruke iz chata obrađuje Anthropic (Claude) kako bi napisao odgovore. Razgovor se čuva u vašem pregledniku, a ne na našim poslužiteljima.",
    "Iznajmljivači nikad ne dobivaju kontakt podatke gostiju.",
    <>U svakom trenutku možete zatražiti uvid, ispravak ili brisanje podataka: {mail(COMPANY.privacyContact)}.</>,
  ],
  tocTitle: "Sadržaj",
  controller: {
    title: "Tko je odgovoran",
    body: (
      <>
        <p>
          Voditelj obrade vaših osobnih podataka je <strong className="font-semibold text-ink">{COMPANY.legalName}</strong>, {COMPANY.address}, OIB{" "}
          {COMPANY.oib}. Upis u sudski registar: {COMPANY.registry}. Web: {website}. E-mail: {mail(COMPANY.email)}.
        </p>
        <p className="mt-3">Za sva pitanja o vašim podacima i za ostvarivanje prava pišite na {mail(COMPANY.privacyContact)}.</p>
      </>
    ),
  },
  processing: {
    title: "Koje podatke obrađujemo i zašto",
    intro: "Koje podatke obrađujemo ovisi o tome kako koristite uslugu.",
    labels: { data: "Podaci", purpose: "Svrha", basis: "Pravna osnova", recipients: "Tko ih prima", note: "Važno" },
    items: [
      {
        id: "bookings",
        title: "Zahtjevi za rezervaciju",
        data: "Ime i prezime, e-mail adresa, broj telefona i napomena za organizatora; odabrana aktivnost, datum, broj odraslih i djece, cijena, oznaka rezervacije i jezik. Ako ste stranicu otvorili preko QR koda iznajmljivača, zahtjev nosi i oznaku tog iznajmljivača.",
        purpose:
          "Prosljeđivanje zahtjeva organizatoru kako bi ga potvrdio ili odbio te slanje mailova o zahtjevu (primitak, potvrda ili odbijanje). Podatke o rezervacijama koristimo i za obračun provizije koju nam organizatori plaćaju.",
        basis:
          "Poduzimanje radnji na vaš zahtjev prije sklapanja ugovora i pružanje naše usluge rezervacije (čl. 6. st. 1. toč. (b) GDPR-a). Obračun provizije: naš legitimni interes za naplatu od partnera (čl. 6. st. 1. toč. (f) GDPR-a).",
        recipients:
          "Organizator aktivnosti koju ste odabrali, koji vaše podatke koristi kao samostalni voditelj obrade kako bi potvrdio i izveo aktivnost, te ovlaštene osobe u Opsisu. Iznajmljivači nikad ne dobivaju vaše ime, e-mail adresu ni broj telefona — vide samo da je zahtjev stigao preko njihova QR koda (vrsta aktivnosti, datum i status).",
      },
      {
        id: "chat",
        title: "AI chat",
        data: "Poruke koje upišete i dosadašnji tijek razgovora.",
        purpose:
          "Pisanje odgovora i preporuka aktivnosti. Vaše poruke šaljemo tvrtki Anthropic (Claude API), koja ih obrađuje u naše ime. Razgovor se čuva u vašem pregledniku (session storage), potpisan od našeg poslužitelja kako se ne bi mogao mijenjati, i istječe najkasnije nakon 24 sata. Zapise razgovora ne pohranjujemo na našim poslužiteljima — samo tehničke zapise bez sadržaja poruka, poput broja poruka i grešaka.",
        basis: "Pružanje chata koji sami odlučite koristiti (čl. 6. st. 1. toč. (b) GDPR-a).",
        note: "Molimo ne upisujte u chat osjetljive podatke (npr. o zdravlju ili plaćanju). Kontakt podaci za rezervaciju upisuju se u karticu rezervacije, koja ide izravno na naš poslužitelj i nikad se ne šalje AI-ju.",
      },
      {
        id: "quiz",
        title: "Kviz",
        data: "Vaši odgovori i — samo ako zatražite rezultate mailom — vaša e-mail adresa. Ako ste došli preko QR koda iznajmljivača, i oznaka tog iznajmljivača.",
        purpose:
          "Preporuka aktivnosti i, ako to zatražite, slanje rezultata mailom. Vaši odgovori (nikad e-mail adresa) mogu se poslati Anthropicu radi kratkih objašnjenja preporuka. E-mail adresu ne koristimo ni za što drugo.",
        basis:
          "Pružanje preporuka koje tražite (čl. 6. st. 1. toč. (b) GDPR-a). Slanje rezultata mailom temelji se na vašoj privoli (čl. 6. st. 1. toč. (a) GDPR-a), koju možete povući u svakom trenutku.",
      },
      {
        id: "partners",
        title: "Registracije iznajmljivača i organizatora izleta",
        data: "Poslovni kontakt podaci (ime, naziv tvrtke ili objekta, e-mail, telefon, adresa, mjesto), podaci o objektu ili ponudi (broj smještajnih jedinica, uobičajen broj gostiju, kanali prodaje; aktivnosti, cijene, provizija, fotografije) te vrijeme prihvaćanja uvjeta.",
        purpose:
          "Provedba suradnje: provjera i objava ponude, izrada QR kodova i poveznica, prosljeđivanje zahtjeva, slanje obračuna i računa te komunikacija o usluzi. Kod organizatora izleta naziv tvrtke i podaci o ponudi javno su prikazani na stranici.",
        basis: "Izvršenje ugovora s vama (čl. 6. st. 1. toč. (b) GDPR-a) i zakonske računovodstvene obveze (čl. 6. st. 1. toč. (c) GDPR-a).",
      },
      {
        id: "outreach",
        title: "Poslovni mailovi organizatorima i iznajmljivačima",
        data: "Poslovna e-mail adresa, ime, naziv tvrtke ili objekta, mjesto, javni izvor u kojem smo adresu pronašli (npr. vaša web stranica, poslovni profil ili javni registar) i evidencija poslanih mailova.",
        purpose: "Kratka poslovna ponuda naše usluge organizatorima izleta i iznajmljivačima smještaja.",
        basis: "Naš legitimni interes da poslovnim subjektima ponudimo svoju uslugu (čl. 6. st. 1. toč. (f) GDPR-a).",
        note: (
          <>
            Prigovor možete uložiti u svakom trenutku putem poveznice za odjavu u svakom mailu ili pisanjem na {mail(COMPANY.privacyContact)}. Adresu tada
            čuvamo na popisu za blokadu slanja samo kako vam se više nikad ne bismo javili.
          </>
        ),
      },
      {
        id: "technical",
        title: "Tehnički podaci i pohrana u pregledniku",
        data: "Vaša IP adresa te mali zapisi u localStorage i sessionStorage vašeg preglednika: odabrani jezik, trenutačni razgovor i oznaka QR koda iznajmljivača preko kojeg ste došli.",
        purpose:
          "IP adresa služi za ograničavanje broja zahtjeva i sigurnost (sprječavanje zlouporabe) i čuva se samo u memoriji poslužitelja, najviše 24 sata; naš pružatelj hostinga može je kratko obrađivati u tehničkim zapisima. Pohrana u pregledniku omogućuje rad stranice: razgovor traje dok je kartica otvorena (najviše 24 sata), a oznaka iznajmljivača pamti se do 30 dana kako bi se vaši zahtjevi pripisali tom iznajmljivaču. Pohranu možete obrisati u postavkama preglednika u bilo kojem trenutku. Ne koristimo reklamne kolačiće, alate za analitiku ni pratilice društvenih mreža.",
        basis: "Naš legitimni interes za sigurnu uslugu koja radi (čl. 6. st. 1. toč. (f) GDPR-a).",
      },
    ],
  },
  processors: {
    title: "Izvršitelji obrade i prijenos izvan EU-a",
    intro: "Koristimo sljedeće pružatelje usluga, koji osobne podatke obrađuju samo prema našim uputama:",
    list: [
      ["Vercel", "hosting stranice (EU i SAD)"],
      ["Google", "pohrana zahtjeva i registracija (Google Sheets)"],
      ["Anthropic", "AI model za chat i objašnjenja u kvizu (Claude API)"],
      ["Resend", "slanje e-pošte"],
    ],
    outro:
      "Neki od njih imaju sjedište u SAD-u ili ondje obrađuju podatke. Takvi se prijenosi temelje na standardnim ugovornim klauzulama Europske komisije, koje su dio uvjeta obrade podataka tih pružatelja. Podatke možemo dati i tijelima javne vlasti kada to propisuje zakon. Osobne podatke nikad ne prodajemo niti ih dijelimo radi oglašavanja.",
  },
  retention: {
    title: "Koliko dugo čuvamo podatke",
    head: ["Podaci", "Rok čuvanja"],
    rows: [
      ["Zahtjevi za rezervaciju", "24 mjeseca od zahtjeva"],
      ["Rezultati kviza (uključujući e-mail, ako ste ga dali)", "12 mjeseci"],
      ["AI chat", "Ne pohranjuje se na našim poslužiteljima; u vašem pregledniku najviše 24 sata"],
      ["Registracije iznajmljivača i organizatora izleta", "Dok traje suradnja i još 12 mjeseci"],
      ["Kontakti za poslovne mailove", "Do 12 mjeseci nakon zadnjeg maila, osim ako ranije uložite prigovor"],
      ["Popis za blokadu slanja (odjavljene adrese)", "Dok je potrebno da bismo poštovali vaš izbor"],
      ["Dnevnik događaja (tehnički, bez sadržaja poruka)", "12 mjeseci"],
      ["IP adrese za ograničavanje zahtjeva", "Najviše 24 sata, samo u memoriji poslužitelja"],
      ["Računi i računovodstvena dokumentacija", "Koliko propisuju hrvatski računovodstveni i porezni propisi"],
    ],
    outro: "Nakon isteka roka podatke brišemo ili anonimiziramo.",
  },
  rights: {
    title: "Vaša prava",
    body: (
      <>
        <p>
          Imate pravo na pristup osobnim podacima, njihov ispravak ili brisanje, ograničenje obrade, prenosivost podataka te pravo na prigovor na obradu koja se
          temelji na našem legitimnom interesu (uključujući poslovne mailove). Ako se obrada temelji na privoli, možete je povući u bilo kojem trenutku, što ne
          utječe na zakonitost obrade prije povlačenja.
        </p>
        <p className="mt-3">
          Za ostvarivanje prava pišite na {mail(COMPANY.privacyContact)}. Odgovaramo u roku od mjesec dana, a prije toga vas možemo zamoliti da potvrdite
          identitet.
        </p>
        <p className="mt-3">
          Pritužbu možete podnijeti i hrvatskom nadzornom tijelu, Agenciji za zaštitu osobnih podataka (AZOP), Selska cesta 136, 10000 Zagreb, {azop}, ili
          nadzornom tijelu u državi EU-a u kojoj živite.
        </p>
      </>
    ),
  },
  other: {
    title: "Ostale informacije",
    items: [
      ["Je li davanje podataka obavezno?", "Ime, e-mail i telefon potrebni su za slanje zahtjeva za rezervaciju; bez njih ga organizator ne može potvrditi. Sve ostalo je neobavezno."],
      [
        "Automatizirano odlučivanje",
        "Ne donosimo odluke koje se temelje isključivo na automatiziranoj obradi i imaju pravne ili slično značajne učinke na vas. AI concierge i kviz samo predlažu, a o zahtjevima odlučuju organizatori.",
      ],
      ["Izmjene", "Ovu izjavu možemo ažurirati. Datum na vrhu pokazuje kada je zadnji put mijenjana, a o bitnim izmjenama obavijestit ćemo na stranici."],
    ],
  },
  seeAlso: "Pogledajte i naše",
  termsLink: "Uvjete korištenja",
  backToTop: "Na vrh",
  langLabel: "Jezik",
};

const COPY: Record<Lang, Copy> = { en: EN, hr: HR };

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const lang = langOf((await searchParams).lang, "en");
  const c = COPY[lang];
  return {
    title: c.metaTitle,
    description: c.metaDescription,
    alternates: {
      canonical: lang === "hr" ? "/privacy?lang=hr" : "/privacy",
      languages: { en: "/privacy", hr: "/privacy?lang=hr" },
    },
  };
}

function SectionHeading({ id, n, children }: { id: string; n: number; children: ReactNode }) {
  return (
    <h2 id={id} className="scroll-mt-6 font-display text-[24px] font-semibold leading-snug text-ink sm:text-[28px]">
      <span className="text-sea-deep">{n}.</span> {children}
    </h2>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="sm:grid sm:grid-cols-[9.5rem_1fr] sm:gap-4">
      <dt className="text-[13px] font-bold uppercase tracking-[0.08em] text-sea-deep sm:pt-1">{label}</dt>
      <dd className="mt-1 sm:mt-0">{children}</dd>
    </div>
  );
}

export default async function PrivacyPage({ searchParams }: { searchParams: SearchParams }) {
  const lang = langOf((await searchParams).lang, "en");
  const c = COPY[lang];
  const toc: [string, string][] = [
    ["controller", c.controller.title],
    ["processing", c.processing.title],
    ["processors", c.processors.title],
    ["retention", c.retention.title],
    ["rights", c.rights.title],
    ["other", c.other.title],
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
            {(["en", "hr"] as const).map((l) => (
              <Link
                key={l}
                href={`/privacy?lang=${l}`}
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
            {c.updated}: {fmtDate(PRIVACY_VERSION, lang)} · {c.version} {PRIVACY_VERSION}
          </p>
        </div>

        {COMPANY.isPlaceholder && (
          <aside className="mt-6 flex gap-3 rounded-2xl border border-sun/50 bg-sun/10 p-4 text-[15px] leading-relaxed text-ink">
            <TriangleAlert className="mt-1 size-5 shrink-0 text-sun" aria-hidden />
            <div>
              <p className="font-semibold">{c.placeholderTitle}</p>
              <p className="mt-1 text-body">{c.placeholderText}</p>
            </div>
          </aside>
        )}

        <section aria-labelledby="summary" className="mt-8 rounded-2xl border border-sand bg-stone-2 p-5 sm:p-6">
          <h2 id="summary" className="font-display text-[22px] font-semibold text-ink">{c.summaryTitle}</h2>
          <ul className="mt-3 space-y-2.5">
            {c.summary.map((item, i) => (
              <li key={i} className="flex gap-3">
                <Check className="mt-1.5 size-4 shrink-0 text-sea-deep" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <nav aria-labelledby="toc" className="mt-8">
          <h2 id="toc" className="text-[13px] font-bold uppercase tracking-[0.14em] text-sea-deep">{c.tocTitle}</h2>
          <ol className="mt-2 grid gap-x-6 sm:grid-cols-2">
            {toc.map(([id, title], i) => (
              <li key={id}>
                <a href={`#${id}`} className="inline-block py-1.5 font-medium text-ink underline-offset-2 hover:underline">
                  {i + 1}. {title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <section aria-labelledby="controller" className="mt-12 scroll-mt-6">
          <SectionHeading id="controller" n={1}>{c.controller.title}</SectionHeading>
          <div className="mt-3">{c.controller.body}</div>
        </section>

        <section aria-labelledby="processing" className="mt-12 scroll-mt-6">
          <SectionHeading id="processing" n={2}>{c.processing.title}</SectionHeading>
          <p className="mt-3">{c.processing.intro}</p>
          {c.processing.items.map((it, i) => (
            <article key={it.id} id={it.id} aria-labelledby={`${it.id}-h`} className="mt-5 scroll-mt-6 rounded-2xl border border-sand bg-stone-2 p-5 sm:p-6">
              <h3 id={`${it.id}-h`} className="text-[19px] font-semibold leading-snug text-ink">
                <span className="text-sea-deep">2.{i + 1}</span> {it.title}
              </h3>
              <dl className="mt-3 space-y-3">
                <Row label={c.processing.labels.data}>{it.data}</Row>
                <Row label={c.processing.labels.purpose}>{it.purpose}</Row>
                <Row label={c.processing.labels.basis}>{it.basis}</Row>
                {it.recipients && <Row label={c.processing.labels.recipients}>{it.recipients}</Row>}
              </dl>
              {it.note && (
                <p className="mt-4 rounded-xl border border-sea-deep/20 bg-white px-4 py-3 text-[15px] leading-relaxed">
                  <strong className="font-semibold text-ink">{c.processing.labels.note}:</strong> {it.note}
                </p>
              )}
            </article>
          ))}
        </section>

        <section aria-labelledby="processors" className="mt-12 scroll-mt-6">
          <SectionHeading id="processors" n={3}>{c.processors.title}</SectionHeading>
          <p className="mt-3">{c.processors.intro}</p>
          <ul className="mt-3 divide-y divide-sand rounded-2xl border border-sand bg-stone-2">
            {c.processors.list.map(([name, role]) => (
              <li key={name} className="flex flex-col px-4 py-3 sm:flex-row sm:gap-3">
                <span className="font-semibold text-ink sm:w-32 sm:shrink-0">{name}</span>
                <span>{role}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4">{c.processors.outro}</p>
        </section>

        <section aria-labelledby="retention" className="mt-12 scroll-mt-6">
          <SectionHeading id="retention" n={4}>{c.retention.title}</SectionHeading>
          <div className="mt-4 overflow-hidden rounded-2xl border border-sand bg-stone-2">
            <table className="w-full border-collapse text-left text-[15px] leading-normal sm:text-[16px]">
              <caption className="sr-only">{c.retention.title}</caption>
              <thead className="bg-sand/60 text-[12px] uppercase tracking-[0.1em] text-ink">
                <tr>
                  <th scope="col" className="px-4 py-3 font-bold">{c.retention.head[0]}</th>
                  <th scope="col" className="px-4 py-3 font-bold">{c.retention.head[1]}</th>
                </tr>
              </thead>
              <tbody>
                {c.retention.rows.map(([what, howLong]) => (
                  <tr key={what} className="border-t border-sand align-top">
                    <th scope="row" className="w-1/2 px-4 py-3 font-semibold text-ink">{what}</th>
                    <td className="px-4 py-3">{howLong}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4">{c.retention.outro}</p>
        </section>

        <section aria-labelledby="rights" className="mt-12 scroll-mt-6">
          <SectionHeading id="rights" n={5}>{c.rights.title}</SectionHeading>
          <div className="mt-3">{c.rights.body}</div>
        </section>

        <section aria-labelledby="other" className="mt-12 scroll-mt-6">
          <SectionHeading id="other" n={6}>{c.other.title}</SectionHeading>
          <dl className="mt-3 space-y-4">
            {c.other.items.map(([q, a]) => (
              <div key={q}>
                <dt className="font-semibold text-ink">{q}</dt>
                <dd className="mt-1">{a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <div className="mt-12 flex flex-col gap-3 border-t border-sand pt-6 text-[15px] sm:flex-row sm:items-center sm:justify-between">
          <p>
            {c.seeAlso}{" "}
            <Link className={linkClass} href={`/uvjeti?lang=${lang}`}>
              {c.termsLink}
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
