import type { Metadata } from "next";
import { OperatorForm } from "@/components/operator-form";

export const metadata: Metadata = {
  title: "Objavite izlete i primajte zahtjeve gostiju",
  description: "Organizatori izleta u Splitu i Dalmaciji: objavite ponudu u Opsis AI Concierge i plaćajte samo proviziju na potvrđene rezervacije.",
};

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  return <OperatorForm initialLang={sp.lang === "en" ? "en" : "hr"} />;
}
