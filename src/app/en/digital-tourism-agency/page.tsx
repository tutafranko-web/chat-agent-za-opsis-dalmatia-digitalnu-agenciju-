import type { Metadata } from "next";
import Link from "next/link";
import { HeroSection } from "@/components/hr/hero-section";
import { ServiceCard } from "@/components/hr/service-card";
import { ActivityGrid } from "@/components/hr/activity-grid";
import { CTASection } from "@/components/hr/cta-section";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import {
  generateLocalBusinessSchema,
  generateServiceSchema,
} from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Digital Tourism Agency Split — Opsis Dalmatia",
  description:
    "Opsis Dalmatia is a digital tourism agency in Split, Croatia. We combine local Dalmatian expertise with AI technology to help tourism businesses grow through chatbots, voice agents, and automation.",
  alternates: {
    canonical: "/en/digital-tourism-agency",
    languages: {
      hr: "/hr/digitalna-turisticka-agencija",
      en: "/en/digital-tourism-agency",
    },
  },
  openGraph: {
    title: "Digital Tourism Agency Split — Opsis Dalmatia",
    description:
      "AI-powered digital tourism agency in Split serving hotels, apartments, and tour operators across Dalmatia.",
    url: "https://opsisdalmatia.com/en/digital-tourism-agency",
  },
};

export default function DigitalTourismAgencyPage() {
  return (
    <>
      <JsonLd
        data={[
          generateLocalBusinessSchema(),
          generateServiceSchema(
            "Digital Tourism Agency Services",
            "Comprehensive digital tourism services in Split, Croatia including AI chatbots, voice agents, business automation, and web development for the hospitality industry.",
            [
              "digital tourism agency",
              "Split Croatia",
              "tourism technology",
              "hotel technology",
              "AI tourism",
              "Dalmatia",
            ]
          ),
        ]}
      />

      <Breadcrumbs
        locale="en"
        items={[
          { name: "Home", href: "/en" },
          { name: "Digital Tourism Agency", href: "/en/digital-tourism-agency" },
        ]}
      />

      <HeroSection
        title="Digital Tourism Agency Split — Opsis Dalmatia"
        subtitle="We are a next-generation tourism agency based in Split, Croatia. Instead of traditional brochures and call centers, we equip tourism businesses with AI-powered tools that deliver better guest experiences at lower cost."
        ctaText="Explore Our Services"
        ctaHref="/en/services"
      />

      {/* What is a Digital Tourism Agency */}
      <section className="py-20 bg-zinc-950">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white sm:text-4xl mb-8">
            What Is a Digital Tourism Agency?
          </h2>
          <div className="space-y-6 text-zinc-300 text-lg leading-relaxed">
            <p>
              A digital tourism agency operates at the intersection of hospitality expertise and
              modern technology. While traditional agencies focus on selling package tours and
              managing bookings through manual processes, a digital agency builds the technology
              infrastructure that makes tourism businesses more efficient, more responsive, and more
              profitable.
            </p>
            <p>
              At Opsis Dalmatia, we specialize in artificial intelligence solutions specifically
              designed for the tourism and hospitality sector. Our services range from AI chatbots
              that handle guest inquiries around the clock to voice agents that answer phone calls
              in natural conversation, and business automation agents that eliminate hours of
              repetitive administrative work.
            </p>
            <p>
              We are based in Split, the heart of Dalmatia, and we understand the unique challenges
              that tourism businesses face in this region. Seasonal demand fluctuations, multilingual
              guest communication, coordination with dozens of local activity providers, and the
              constant pressure to respond faster than competitors — these are the problems we solve
              with technology.
            </p>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-20 bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white sm:text-4xl mb-12 text-center">
            Our Core Services
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <ServiceCard
              title="AI Chatbot Concierge"
              description="Deploy intelligent chatbots on your website, WhatsApp, or social media channels. Guests get instant answers about your property, local activities, and booking options in their preferred language."
              href="/en/chatbots"
              icon="💬"
            />
            <ServiceCard
              title="Business Automation"
              description="AI agents that automate reservation processing, guest communication workflows, reporting, review management, and partner coordination. Your digital back office that never sleeps."
              href="/en/ai-agents"
              icon="🤖"
            />
            <ServiceCard
              title="Voice AI Assistants"
              description="Natural-sounding voice agents that answer phone calls, handle reservation inquiries, and provide tourist information. Capture every call, even after hours and during peak season rushes."
              href="/en/voice-agents"
              icon="🎙️"
            />
          </div>
        </div>
      </section>

      {/* Local Content - Split & Dalmatia */}
      <section className="py-20 bg-zinc-950">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white sm:text-4xl mb-8">
            Built for Split and Dalmatia
          </h2>
          <div className="space-y-6 text-zinc-300 text-lg leading-relaxed">
            <p>
              Split is Croatia&apos;s second-largest city and the gateway to the Dalmatian islands.
              With Diocletian&apos;s Palace at its core, a UNESCO World Heritage Site, the city
              attracts millions of visitors annually. The surrounding region — from Trogir and
              Ka&#x161;tela to Makarska, Omi&#x161;, and the islands of Bra&#x10D;, Hvar, Vis,
              and Kor&#x10D;ula — offers an extraordinary range of tourism experiences.
            </p>
            <p>
              Our AI systems are trained on comprehensive local knowledge. When a guest asks your
              chatbot about the best beach near Split, it knows about &#x17D;njan, Ka&#x161;juni,
              and Ba&#x10D;vice. When someone calls your voice agent asking about ferry schedules
              to Hvar, it provides accurate, up-to-date information. This deep local context is
              what sets our solutions apart from generic chatbot platforms.
            </p>
            <p>
              We work with accommodation providers across the Dalmatian coast — from small family-run
              apartments in Split&apos;s old town to large hotel complexes in Makarska. We partner
              with tour operators offering everything from Blue Cave excursions and Krka waterfalls
              day trips to quad biking on Bra&#x10D; and wine tasting in Hvar&apos;s vineyards.
              Whatever your niche in Dalmatian tourism, our technology adapts to serve it.
            </p>
          </div>
        </div>
      </section>

      {/* Activity Catalog */}
      <section className="py-20 bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Activities Our AI Covers
            </h2>
            <p className="mt-4 text-lg text-zinc-400 max-w-2xl mx-auto">
              Our chatbots and voice agents are trained on a comprehensive catalog of activities
              and experiences available across Split and the Dalmatian region.
            </p>
          </div>
          <ActivityGrid locale="en" />
        </div>
      </section>

      {/* Why Digital Matters */}
      <section className="py-20 bg-zinc-950">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white sm:text-4xl mb-8">
            Why Going Digital Matters for Tourism
          </h2>
          <div className="space-y-6 text-zinc-300 text-lg leading-relaxed">
            <p>
              Today&apos;s travelers research, compare, and book online. They expect instant
              responses to their questions, regardless of time zone. They communicate through
              WhatsApp, Instagram DMs, and website chat — not just phone calls and emails. Tourism
              businesses that cannot meet these expectations lose bookings to those that can.
            </p>
            <p>
              The shift to digital is not about replacing the human touch that makes Dalmatian
              hospitality special. It is about amplifying it. When AI handles the repetitive
              inquiries — &quot;What time is check-in?&quot; &quot;Is parking available?&quot; &quot;How far is the
              beach?&quot; — your staff are free to deliver the warm, personal experiences that earn
              five-star reviews and repeat visitors.
            </p>
          </div>
          <div className="mt-8">
            <Link
              href="/en/contact"
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              Talk to us about your digital transformation &rarr;
            </Link>
          </div>
        </div>
      </section>

      <CTASection
        title="Partner with Dalmatia's Digital Tourism Experts"
        description="Whether you are a hotel, apartment owner, or tour operator, we have the AI solutions to grow your business. Let us show you how."
        buttonText="Contact Us"
        buttonHref="/en/contact"
      />
    </>
  );
}
