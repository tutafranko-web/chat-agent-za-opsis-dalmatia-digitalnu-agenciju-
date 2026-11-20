import type { Metadata } from "next";
import { LandlordForm } from "@/components/landlord-form";

export const metadata: Metadata = {
  title: "Besplatni QR concierge za iznajmljivače",
  description: "Gosti skeniraju QR kod u apartmanu i biraju izlete u chatu. Besplatno za iznajmljivače u Splitu i Dalmaciji.",
};

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  return <LandlordForm initialLang={sp.lang === "en" ? "en" : "hr"} />;
}
