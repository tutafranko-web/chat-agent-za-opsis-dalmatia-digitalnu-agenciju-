export const translations = {
  hr: {
    nav: {
      home: "Početna",
      services: "Usluge",
      chatbots: "Chatbotovi",
      aiAgents: "AI Agenti",
      voiceAgents: "Glasovni Agenti",
      about: "O nama",
      contact: "Kontakt",
      blog: "Blog",
      tryChatbot: "Isprobajte Chatbot",
    },
    footer: {
      company: "Opsis Dalmatia",
      tagline: "Digitalna turistička agencija u Splitu",
      address: "Split, Hrvatska",
      services: "Usluge",
      quickLinks: "Brzi linkovi",
      followUs: "Pratite nas",
      rights: "Sva prava pridržana.",
    },
    cta: {
      tryNow: "Isprobajte besplatno",
      contactUs: "Kontaktirajte nas",
      learnMore: "Saznajte više",
      bookNow: "Rezervirajte sada",
    },
    hero: {
      title: "Vaš AI turistički partner u Dalmaciji",
      subtitle:
        "Bukiranje aktivnosti, personalizirane preporuke i 24/7 podrška putem AI chatbota.",
      primaryCta: "Isprobajte chatbot",
      secondaryCta: "Saznajte više",
    },
    services: {
      title: "Naše usluge",
      subtitle: "Sve što trebate za nezaboravan odmor u Splitu i Dalmaciji",
      chatbotTitle: "AI Chatbot",
      chatbotDesc:
        "Personalizirani turistički asistent dostupan 24/7 za bukiranje aktivnosti i preporuke.",
      voiceTitle: "Glasovni agenti",
      voiceDesc:
        "AI glasovni asistenti koji odgovaraju na pozive i pomažu s rezervacijama na više jezika.",
      webTitle: "Web razvoj",
      webDesc:
        "Izrada modernih web stranica s integriranim AI alatima za turističke operatere.",
    },
    activities: {
      title: "Aktivnosti",
      subtitle: "Preko 48 aktivnosti u 5 kategorija u Splitu i Dalmaciji",
      viewAll: "Pogledajte sve aktivnosti",
      bookActivity: "Rezerviraj",
    },
    about: {
      title: "O nama",
      description:
        "Opsis Dalmatia je digitalna turistička agencija sa sjedištem u Splitu. Koristimo najnoviju AI tehnologiju kako bismo turistima pružili personalizirano iskustvo, a operaterima jednostavnije poslovanje.",
    },
    contact: {
      title: "Kontaktirajte nas",
      subtitle: "Javite nam se za besplatnu konzultaciju",
      nameLabel: "Ime i prezime",
      emailLabel: "Email adresa",
      messageLabel: "Poruka",
      sendButton: "Pošaljite poruku",
      successMessage: "Poruka uspješno poslana!",
    },
    blog: {
      title: "Blog",
      subtitle: "Savjeti, vodiči i novosti iz svijeta turizma i AI tehnologije",
      readMore: "Pročitajte više",
      publishedOn: "Objavljeno",
      backToBlog: "Natrag na blog",
    },
    common: {
      loading: "Učitavanje...",
      error: "Došlo je do greške. Pokušajte ponovno.",
      close: "Zatvori",
      back: "Natrag",
      next: "Dalje",
      submit: "Pošalji",
      cancel: "Odustani",
    },
  },
  en: {
    nav: {
      home: "Home",
      services: "Services",
      chatbots: "Chatbots",
      aiAgents: "AI Agents",
      voiceAgents: "Voice Agents",
      about: "About",
      contact: "Contact",
      blog: "Blog",
      tryChatbot: "Try Chatbot",
    },
    footer: {
      company: "Opsis Dalmatia",
      tagline: "Digital tourism agency in Split",
      address: "Split, Croatia",
      services: "Services",
      quickLinks: "Quick Links",
      followUs: "Follow Us",
      rights: "All rights reserved.",
    },
    cta: {
      tryNow: "Try for free",
      contactUs: "Contact us",
      learnMore: "Learn more",
      bookNow: "Book now",
    },
    hero: {
      title: "Your AI Tourism Partner in Dalmatia",
      subtitle:
        "Activity booking, personalized recommendations, and 24/7 support via AI chatbot.",
      primaryCta: "Try the chatbot",
      secondaryCta: "Learn more",
    },
    services: {
      title: "Our Services",
      subtitle: "Everything you need for an unforgettable holiday in Split and Dalmatia",
      chatbotTitle: "AI Chatbot",
      chatbotDesc:
        "Personalized tourism assistant available 24/7 for activity booking and recommendations.",
      voiceTitle: "Voice Agents",
      voiceDesc:
        "AI voice assistants that answer calls and help with reservations in multiple languages.",
      webTitle: "Web Development",
      webDesc:
        "Modern website development with integrated AI tools for tourism operators.",
    },
    activities: {
      title: "Activities",
      subtitle: "Over 48 activities across 5 categories in Split and Dalmatia",
      viewAll: "View all activities",
      bookActivity: "Book",
    },
    about: {
      title: "About Us",
      description:
        "Opsis Dalmatia is a digital tourism agency based in Split. We use cutting-edge AI technology to provide tourists with a personalized experience and operators with streamlined business tools.",
    },
    contact: {
      title: "Contact Us",
      subtitle: "Get in touch for a free consultation",
      nameLabel: "Full name",
      emailLabel: "Email address",
      messageLabel: "Message",
      sendButton: "Send message",
      successMessage: "Message sent successfully!",
    },
    blog: {
      title: "Blog",
      subtitle: "Tips, guides, and news from the world of tourism and AI technology",
      readMore: "Read more",
      publishedOn: "Published",
      backToBlog: "Back to blog",
    },
    common: {
      loading: "Loading...",
      error: "Something went wrong. Please try again.",
      close: "Close",
      back: "Back",
      next: "Next",
      submit: "Submit",
      cancel: "Cancel",
    },
  },
} as const;

export type Locale = "hr" | "en";
export type Translations = typeof translations;
export type TranslationKeys = (typeof translations)[Locale];

/** Helper to get translations for a given locale */
export function getTranslations(locale: Locale) {
  return translations[locale];
}

/** Helper to get a nested translation value by section and key */
export function t(
  locale: Locale,
  section: keyof (typeof translations)["hr"],
  key: string
): string {
  const sectionData = translations[locale][section] as Record<string, string>;
  return sectionData[key] ?? key;
}
