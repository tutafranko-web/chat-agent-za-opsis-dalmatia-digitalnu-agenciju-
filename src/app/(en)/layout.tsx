import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Opsis Dalmatia - Tourist Assistant",
  description:
    "Your personal AI assistant for booking activities and tours in Split and Dalmatia, Croatia. Discover boat tours, adventure sports, guided experiences and more.",
  openGraph: {
    title: "Opsis Dalmatia - Tourist Assistant",
    description:
      "Discover and book the best activities in Split and Dalmatia.",
    url: "https://opsisdalmatia.com",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "Opsis Dalmatia - Tourist Assistant",
    description:
      "Discover and book the best activities in Split and Dalmatia.",
  },
  alternates: {
    canonical: "https://opsisdalmatia.com",
    languages: {
      hr: "https://opsisdalmatia.com/hr",
      en: "https://opsisdalmatia.com",
    },
  },
};

export default function EnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div lang="en">{children}</div>;
}
