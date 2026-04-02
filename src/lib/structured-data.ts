const SITE_URL = "https://opsisdalmatia.com";
const SITE_NAME = "Opsis Dalmatia";

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.ico`,
    description:
      "Digitalna turistička agencija u Splitu — AI chatbotovi, glasovni agenti, web razvoj",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Split",
      addressRegion: "Splitsko-dalmatinska županija",
      addressCountry: "HR",
    },
    sameAs: [
      "https://www.instagram.com/opsisdalmatia/",
      "https://www.facebook.com/opsisdalmatia",
      "https://www.linkedin.com/company/opsisdalmatia",
    ],
  };
}

export function generateLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "TourOperator",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.ico`,
    image: `${SITE_URL}/og-image.jpg`,
    description:
      "Digitalna turistička agencija u Splitu koja koristi AI tehnologiju za personalizirane turističke usluge u Dalmaciji.",
    telephone: "+385-21-000-000",
    email: "info@opsisdalmatia.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Split",
      addressLocality: "Split",
      postalCode: "21000",
      addressRegion: "Splitsko-dalmatinska županija",
      addressCountry: "HR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 43.5081,
      longitude: 16.4402,
    },
    areaServed: {
      "@type": "GeoCircle",
      geoMidpoint: {
        "@type": "GeoCoordinates",
        latitude: 43.5081,
        longitude: 16.4402,
      },
      geoRadius: "100000",
    },
    priceRange: "$$",
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "00:00",
      closes: "23:59",
    },
    sameAs: [
      "https://www.instagram.com/opsisdalmatia/",
      "https://www.facebook.com/opsisdalmatia",
      "https://www.linkedin.com/company/opsisdalmatia",
    ],
  };
}

export function generateWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description:
      "Digitalna turistička agencija u Splitu — bukiranje aktivnosti, AI chatbot, vodiči po Dalmaciji",
    inLanguage: ["hr", "en"],
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function generateServiceSchema(
  name: string,
  description: string,
  keywords: string[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    provider: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    areaServed: {
      "@type": "Place",
      name: "Split, Dalmatia, Croatia",
    },
    keywords: keywords.join(", "),
  };
}

export function generateFAQSchema(
  faqs: { question: string; answer: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function generateBlogPostSchema(
  title: string,
  description: string,
  datePublished: string,
  slug: string,
  lang: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    datePublished,
    dateModified: datePublished,
    url: `${SITE_URL}/${lang}/blog/${slug}`,
    inLanguage: lang,
    author: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/favicon.ico`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/${lang}/blog/${slug}`,
    },
  };
}

export function generateBreadcrumbSchema(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}
