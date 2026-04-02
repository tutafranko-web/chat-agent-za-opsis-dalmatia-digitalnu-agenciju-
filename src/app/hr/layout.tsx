import type { Metadata } from "next";
import { Header } from "@/components/hr/header";
import { Footer } from "@/components/hr/footer";

export const metadata: Metadata = {
  title: {
    default: "Opsis Dalmatia — Digitalna Turistička Agencija",
    template: "%s | Opsis Dalmatia",
  },
  description:
    "Digitalna turistička agencija u Splitu. AI chatbotovi, glasovni agenti, web razvoj za turizam u Dalmaciji.",
  openGraph: {
    locale: "hr_HR",
    siteName: "Opsis Dalmatia",
  },
  alternates: {
    languages: {
      hr: "/hr",
      en: "/en",
    },
  },
};

export default function HrLayout({ children }: { children: React.ReactNode }) {
  return (
    <div lang="hr">
      <Header locale="hr" />
      <main>{children}</main>
      <Footer locale="hr" />
    </div>
  );
}
