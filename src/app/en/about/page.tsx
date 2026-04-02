import type { Metadata } from "next";
import Link from "next/link";
import { HeroSection } from "@/components/hr/hero-section";
import { CTASection } from "@/components/hr/cta-section";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { generateOrganizationSchema } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "About Opsis Dalmatia",
  description:
    "Learn about Opsis Dalmatia — a digital tourism agency in Split, Croatia. Our mission is to empower tourism businesses with AI technology that improves guest experiences and operational efficiency.",
  alternates: {
    canonical: "/en/about",
    languages: {
      hr: "/hr/o-nama",
      en: "/en/about",
    },
  },
  openGraph: {
    title: "About Opsis Dalmatia",
    description:
      "Digital tourism agency in Split, Croatia. AI solutions for hotels, apartments, and tour operators.",
    url: "https://opsisdalmatia.com/en/about",
  },
};

export default function AboutPage() {
  return (
    <>
      <JsonLd data={generateOrganizationSchema()} />

      <Breadcrumbs
        locale="en"
        items={[
          { name: "Home", href: "/en" },
          { name: "About Us", href: "/en/about" },
        ]}
      />

      <HeroSection
        title="About Opsis Dalmatia"
        subtitle="We are a team of technologists and tourism professionals based in Split, Croatia, building AI solutions that transform how Dalmatian tourism businesses operate."
      />

      {/* Our Story */}
      <section className="py-20 bg-zinc-950">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white sm:text-4xl mb-8">
            Our Story
          </h2>
          <div className="space-y-6 text-zinc-300 text-lg leading-relaxed">
            <p>
              Opsis Dalmatia was born from a simple observation: tourism businesses in Dalmatia are
              among the best in the world at hospitality, but many struggle with the digital tools
              needed to compete in the modern travel market. Guests expect instant responses,
              seamless online booking, and personalized recommendations — and most small to
              medium-sized tourism businesses lack the technology and staff to deliver consistently.
            </p>
            <p>
              We set out to change that. Our founding team combines deep expertise in artificial
              intelligence, software engineering, and the Croatian tourism industry. We understand
              the seasonal rhythms of Dalmatian tourism, the multilingual demands of an
              international guest base, and the operational challenges of running accommodations
              and tour operations in a competitive market.
            </p>
            <p>
              The name &quot;Opsis&quot; comes from the Greek word for &quot;vision&quot; or &quot;sight&quot; — reflecting
              our belief that technology should provide clarity and insight, helping tourism
              professionals see new possibilities for their businesses. Combined with
              &quot;Dalmatia,&quot; our name anchors us in the region we know and serve best.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-zinc-900">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Our Mission</h2>
              <p className="text-zinc-300 text-lg leading-relaxed">
                To empower tourism businesses in Dalmatia with accessible, effective AI technology
                that improves guest satisfaction, reduces operational burden, and drives sustainable
                growth. We believe every hotel, apartment, and tour operator — regardless of size —
                deserves access to the same digital capabilities as the largest hotel chains.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Our Vision</h2>
              <p className="text-zinc-300 text-lg leading-relaxed">
                A Dalmatian tourism ecosystem where every guest interaction is enhanced by
                intelligent technology — where no call goes unanswered, no question goes
                unaddressed, and every tourism professional has the tools to focus on what they do
                best: creating unforgettable experiences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Believe */}
      <section className="py-20 bg-zinc-950">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white sm:text-4xl mb-12">
            What We Believe
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {[
              {
                title: "Technology Should Serve People",
                description:
                  "AI is not about replacing human connection — it is about freeing your team from repetitive tasks so they can deliver the warm, personal hospitality that makes Dalmatia special.",
              },
              {
                title: "Local Knowledge Matters",
                description:
                  "Generic chatbot platforms do not know the difference between Bacvice and Znjan beaches. Our solutions are built with deep Dalmatian context — local landmarks, seasonal patterns, cultural nuances.",
              },
              {
                title: "Results Over Buzzwords",
                description:
                  "We measure success in saved hours, captured bookings, and guest satisfaction scores — not in technical jargon. Every solution we build has clear, measurable business outcomes.",
              },
              {
                title: "Accessible to All Sizes",
                description:
                  "Whether you manage a single studio apartment or a 200-room hotel, our solutions scale to your needs and budget. Small businesses deserve great technology too.",
              },
            ].map((value) => (
              <div
                key={value.title}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
              >
                <h3 className="text-lg font-semibold text-white mb-3">
                  {value.title}
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Where We Work */}
      <section className="py-20 bg-zinc-900">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white sm:text-4xl mb-8">
            Where We Work
          </h2>
          <div className="space-y-6 text-zinc-300 text-lg leading-relaxed">
            <p>
              Our headquarters are in Split, Croatia — the vibrant coastal city at the heart of
              Dalmatia. From here, we serve tourism businesses across the entire Dalmatian coast and
              islands: from Zadar and &#x160;ibenik in the north to Dubrovnik in the south, and
              all the islands in between — Bra&#x10D;, Hvar, Vis, Kor&#x10D;ula, and more.
            </p>
            <p>
              While our focus is Dalmatia, our technology is location-agnostic. We work with
              tourism businesses throughout Croatia and are open to partnerships with hospitality
              companies across the Mediterranean region. If your business serves tourists and you
              want to leverage AI, we can help — regardless of where you are located.
            </p>
            <p>
              Being based in Split gives us a unique advantage. We experience Dalmatian tourism
              firsthand — we know the peak season pressure, the off-season quiet, the festivals and
              events that drive demand, and the local operators who make the magic happen. This
              lived experience informs every solution we build.
            </p>
          </div>
        </div>
      </section>

      {/* Join Us CTA */}
      <section className="py-20 bg-zinc-950">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white sm:text-4xl mb-6">
            Work With Us
          </h2>
          <p className="text-zinc-300 text-lg leading-relaxed mb-8">
            Whether you are a tourism business looking for AI solutions or a talented professional
            interested in joining our team, we would love to hear from you. We are always looking
            for passionate people who share our vision of a smarter, more connected Dalmatian
            tourism industry.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/en/services"
              className="inline-flex items-center px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors"
            >
              Explore Our Services
            </Link>
            <Link
              href="/en/contact"
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors"
            >
              Get In Touch
            </Link>
          </div>
        </div>
      </section>

      <CTASection
        title="Let's Build the Future of Dalmatian Tourism Together"
        description="Contact us for a free consultation. We will show you how AI can transform your tourism business."
        buttonText="Contact Us"
        buttonHref="/en/contact"
      />
    </>
  );
}
