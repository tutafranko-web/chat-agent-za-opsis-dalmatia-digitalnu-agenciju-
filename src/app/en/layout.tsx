import type { Metadata } from "next";
import { Header } from "@/components/hr/header";
import { Footer } from "@/components/hr/footer";

export const metadata: Metadata = {
  title: {
    default: "Opsis Dalmatia — Digital Tourism Agency",
    template: "%s | Opsis Dalmatia",
  },
  description:
    "Digital tourism agency in Split, Croatia. AI chatbots, voice agents, web development for tourism.",
  openGraph: {
    locale: "en_US",
    siteName: "Opsis Dalmatia",
  },
  alternates: {
    languages: {
      hr: "/hr",
      en: "/en",
    },
  },
};

export default function EnLayout({ children }: { children: React.ReactNode }) {
  return (
    <div lang="en">
      <Header locale="en" />
      <main>{children}</main>
      <Footer locale="en" />
    </div>
  );
}
