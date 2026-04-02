import type { Metadata } from "next";
import Link from "next/link";
import { HeroSection } from "@/components/hr/hero-section";
import { ServiceCard } from "@/components/hr/service-card";
import { CTASection } from "@/components/hr/cta-section";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { generateServiceSchema } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Our Services",
  description:
    "Explore Opsis Dalmatia's AI-powered services for tourism: chatbot concierges, voice agents, business automation, and web development for hotels, apartments, and tour operators.",
  alternates: {
    canonical: "/en/services",
    languages: {
      hr: "/hr/usluge",
      en: "/en/services",
    },
  },
  openGraph: {
    title: "Our Services | Opsis Dalmatia",
    description:
      "AI chatbots, voice agents, and business automation for tourism in Split and Dalmatia.",
    url: "https://opsisdalmatia.com/en/services",
  },
};

export default function ServicesPage() {
  return (
    <>
      <JsonLd
        data={generateServiceSchema(
          "Opsis Dalmatia Services",
          "AI-powered digital solutions for tourism businesses in Split and Dalmatia, Croatia. Chatbots, voice agents, business automation, and web development.",
          [
            "tourism services",
            "AI chatbot",
            "voice agent",
            "business automation",
            "web development",
            "Split Croatia",
          ]
        )}
      />

      <Breadcrumbs
        locale="en"
        items={[
          { name: "Home", href: "/en" },
          { name: "Services", href: "/en/services" },
        ]}
      />

      <HeroSection
        title="Our Services"
        subtitle="We build AI-powered tools that help tourism businesses in Dalmatia serve their guests better, operate more efficiently, and grow their revenue."
      />

      {/* Main Services */}
      <section className="py-20 bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <ServiceCard
              title="AI Chatbot Concierge"
              description="Intelligent chatbots that answer guest questions, recommend activities, and process bookings 24/7 in multiple languages. Deploy on your website, WhatsApp, Instagram, or any messaging platform."
              href="/en/chatbots"
              icon="💬"
            />
            <ServiceCard
              title="AI Business Agents"
              description="Autonomous agents that automate reservation processing, guest emails, occupancy reports, review monitoring, and partner coordination. Your digital operations team that works around the clock."
              href="/en/ai-agents"
              icon="🤖"
            />
            <ServiceCard
              title="Voice AI Agents"
              description="Natural-sounding voice assistants that answer phone calls, take reservations, and provide tourist information. Never miss a call again — even after hours, on weekends, and during peak season."
              href="/en/voice-agents"
              icon="🎙️"
            />
          </div>
        </div>
      </section>

      {/* Detailed Service Descriptions */}
      <section className="py-20 bg-zinc-900">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white sm:text-4xl mb-12">
            What We Deliver
          </h2>

          <div className="space-y-16">
            {/* Chatbots Detail */}
            <div>
              <h3 className="text-2xl font-semibold text-white mb-4 flex items-center gap-3">
                <span className="text-3xl">💬</span>
                AI Chatbot Concierge
              </h3>
              <div className="space-y-4 text-zinc-300 leading-relaxed">
                <p>
                  Our chatbot concierge acts as a tireless front-desk assistant for your tourism
                  business. Trained on your specific property information, local knowledge, and
                  service catalog, it provides instant, accurate responses to guest inquiries at any
                  hour of the day or night.
                </p>
                <p>
                  Key capabilities include multilingual support in 5+ languages, seamless booking
                  integration with your reservation system, personalized activity recommendations
                  based on guest preferences, automated check-in instructions and house rule
                  delivery, and graceful handoff to human staff when needed.
                </p>
              </div>
              <Link
                href="/en/chatbots"
                className="inline-block mt-4 text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                Learn more about chatbots &rarr;
              </Link>
            </div>

            {/* AI Agents Detail */}
            <div>
              <h3 className="text-2xl font-semibold text-white mb-4 flex items-center gap-3">
                <span className="text-3xl">🤖</span>
                AI Business Agents
              </h3>
              <div className="space-y-4 text-zinc-300 leading-relaxed">
                <p>
                  Business automation agents work behind the scenes to eliminate the repetitive tasks
                  that consume hours of your team&apos;s time every week. From processing incoming
                  reservations and sending personalized guest emails to generating financial reports
                  and monitoring online reviews, these agents handle it all autonomously.
                </p>
                <p>
                  We integrate with your existing tools — Google Sheets, Gmail, booking platforms,
                  CRM systems — so there is no need to learn new software. The agents run on robust
                  automation infrastructure and are monitored continuously to ensure reliability.
                </p>
              </div>
              <Link
                href="/en/ai-agents"
                className="inline-block mt-4 text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                Learn more about AI agents &rarr;
              </Link>
            </div>

            {/* Voice Agents Detail */}
            <div>
              <h3 className="text-2xl font-semibold text-white mb-4 flex items-center gap-3">
                <span className="text-3xl">🎙️</span>
                Voice AI Agents
              </h3>
              <div className="space-y-4 text-zinc-300 leading-relaxed">
                <p>
                  Voice agents answer your phone calls with natural, human-like conversation. They
                  handle reservation inquiries, provide directions and local information, process
                  booking modifications, and capture caller details for follow-up — all without
                  requiring your staff to pick up the phone.
                </p>
                <p>
                  Particularly valuable during peak season when call volumes spike, and for capturing
                  after-hours inquiries from international travelers calling from different time
                  zones. Our voice agents support multiple languages and integrate with your existing
                  phone system.
                </p>
              </div>
              <Link
                href="/en/voice-agents"
                className="inline-block mt-4 text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                Learn more about voice agents &rarr;
              </Link>
            </div>

            {/* Web Development */}
            <div>
              <h3 className="text-2xl font-semibold text-white mb-4 flex items-center gap-3">
                <span className="text-3xl">🌐</span>
                Web Development
              </h3>
              <div className="space-y-4 text-zinc-300 leading-relaxed">
                <p>
                  We build fast, beautiful, SEO-optimized websites for tourism businesses. Our
                  websites are designed to convert visitors into bookings, with integrated chatbots,
                  activity catalogs, and direct booking functionality. Built with modern frameworks
                  for maximum performance and search engine visibility.
                </p>
                <p>
                  Every website we build is mobile-first, multilingual, and optimized for the
                  specific keywords and search patterns that bring tourism traffic in the Dalmatian
                  region. We handle everything from design and development to hosting and ongoing
                  maintenance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 bg-zinc-950">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white sm:text-4xl mb-12 text-center">
            Our Process
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {[
              {
                step: "1",
                title: "Discovery Call",
                description:
                  "We learn about your business, your guests, your pain points, and your goals. This free consultation helps us identify which solutions will deliver the most value.",
              },
              {
                step: "2",
                title: "Solution Design",
                description:
                  "We design a tailored solution — selecting the right combination of chatbot, voice agent, and automation tools to address your specific needs and budget.",
              },
              {
                step: "3",
                title: "Build & Train",
                description:
                  "Our team builds and trains the AI on your content, integrates with your existing systems, and conducts thorough testing to ensure everything works flawlessly.",
              },
              {
                step: "4",
                title: "Launch & Optimize",
                description:
                  "We launch your solution, monitor performance closely during the first weeks, and continuously optimize based on real conversation data and guest feedback.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
              >
                <div className="text-blue-400 font-bold text-sm mb-2">
                  Step {item.step}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Ready to Get Started?"
        description="Schedule a free discovery call. We will analyze your current operations and show you exactly where AI can save you time and increase revenue."
        buttonText="Schedule a Call"
        buttonHref="/en/contact"
      />
    </>
  );
}
