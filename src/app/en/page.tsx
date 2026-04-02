import type { Metadata } from "next";
import Link from "next/link";
import { HeroSection } from "@/components/hr/hero-section";
import { ServiceCard } from "@/components/hr/service-card";
import { ActivityGrid } from "@/components/hr/activity-grid";
import { CTASection } from "@/components/hr/cta-section";
import { JsonLd } from "@/components/seo/json-ld";
import {
  generateOrganizationSchema,
  generateLocalBusinessSchema,
  generateWebSiteSchema,
} from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Digital Tourism Agency in Split — AI Solutions for Tourism",
  description:
    "Opsis Dalmatia is a digital tourism agency in Split, Croatia. We build AI chatbots, voice agents, and smart automation for hotels, apartments, tour operators, and travel agencies across Dalmatia.",
  alternates: {
    canonical: "/en",
    languages: {
      hr: "/hr",
      en: "/en",
    },
  },
  openGraph: {
    title: "Digital Tourism Agency in Split — AI Solutions for Tourism",
    description:
      "AI chatbots, voice agents, and digital solutions for tourism businesses in Split and Dalmatia.",
    url: "https://opsisdalmatia.com/en",
  },
};

export default function EnHomePage() {
  return (
    <>
      <JsonLd
        data={[
          generateOrganizationSchema(),
          generateLocalBusinessSchema(),
          generateWebSiteSchema(),
        ]}
      />

      <HeroSection
        title="Digital Tourism Agency in Split — AI Solutions for Tourism"
        subtitle="We help hotels, apartments, tour operators, and travel agencies in Dalmatia grow with intelligent chatbots, voice agents, and business automation powered by artificial intelligence."
        ctaText="Get Started"
        ctaHref="/en/contact"
      />

      {/* Services Section */}
      <section className="py-20 bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Our Services
            </h2>
            <p className="mt-4 text-lg text-zinc-400 max-w-2xl mx-auto">
              From AI-powered chatbots that answer guest questions around the clock to voice agents
              that handle phone reservations, we provide the technology that modern tourism demands.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <ServiceCard
              title="AI Chatbots"
              description="Intelligent chatbot concierges that answer guest questions 24/7 in multiple languages. Recommend activities, handle bookings, and provide instant support for your accommodation or agency."
              href="/en/chatbots"
              icon="💬"
            />
            <ServiceCard
              title="AI Agents"
              description="Autonomous AI agents that automate repetitive business tasks — from processing reservations and managing calendars to generating reports and coordinating with partners."
              href="/en/ai-agents"
              icon="🤖"
            />
            <ServiceCard
              title="Voice Agents"
              description="Voice-powered AI assistants that answer phone calls, take reservation details, and provide information in natural conversation — available 24 hours a day, 365 days a year."
              href="/en/voice-agents"
              icon="🎙️"
            />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-zinc-900">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white sm:text-4xl mb-8">
            Why Opsis Dalmatia?
          </h2>
          <div className="space-y-6 text-zinc-300 text-lg leading-relaxed">
            <p>
              Tourism in Dalmatia is evolving. Guests expect instant answers, seamless booking
              experiences, and personalized recommendations — whether they are searching for a
              sunset boat tour to the Blue Cave or a hidden local restaurant in Split&apos;s old town.
              Traditional agencies struggle to keep up with the volume and speed of modern traveler
              expectations.
            </p>
            <p>
              Opsis Dalmatia bridges that gap. We are a digital tourism agency based in Split,
              Croatia, specializing in artificial intelligence solutions purpose-built for the
              hospitality and travel industry. Our team combines deep local knowledge of Dalmatia
              with cutting-edge AI technology to deliver tools that genuinely transform how tourism
              businesses operate.
            </p>
            <p>
              Whether you run a boutique hotel on Hvar, a chain of rental apartments in Split, or a
              tour operator covering the entire Dalmatian coast, our solutions scale with your needs.
              We do not offer generic templates — every chatbot, voice agent, and automation workflow
              is tailored to your specific business, your brand voice, and the activities and
              services you provide.
            </p>
            <p>
              Our AI chatbots speak Croatian, English, German, Italian, and French, ensuring every
              guest gets help in their language. Our voice agents handle phone inquiries so your
              staff can focus on delivering exceptional in-person experiences. And our business
              automation agents eliminate hours of manual data entry, report generation, and
              follow-up communication.
            </p>
          </div>
          <div className="mt-8">
            <Link
              href="/en/about"
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              Learn more about us &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Activities Catalog */}
      <section className="py-20 bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Activities We Cover
            </h2>
            <p className="mt-4 text-lg text-zinc-400 max-w-2xl mx-auto">
              Our AI assistants are trained on a comprehensive catalog of activities and experiences
              available throughout Split and Dalmatia — from boat tours and diving to wine tastings
              and cultural heritage walks.
            </p>
          </div>
          <ActivityGrid locale="en" />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-400">24/7</p>
              <p className="mt-2 text-sm text-zinc-400">Always Available</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-400">5+</p>
              <p className="mt-2 text-sm text-zinc-400">Languages Supported</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-400">50+</p>
              <p className="mt-2 text-sm text-zinc-400">Activity Types</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-400">&lt;3s</p>
              <p className="mt-2 text-sm text-zinc-400">Response Time</p>
            </div>
          </div>
        </div>
      </section>

      <CTASection
        title="Ready to Transform Your Tourism Business?"
        description="Contact us today for a free consultation. We will show you exactly how AI can save you time, improve guest satisfaction, and increase bookings."
        buttonText="Contact Us"
        buttonHref="/en/contact"
      />
    </>
  );
}
