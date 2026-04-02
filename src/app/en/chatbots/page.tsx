import type { Metadata } from "next";
import Link from "next/link";
import { HeroSection } from "@/components/hr/hero-section";
import { FAQSection } from "@/components/hr/faq-section";
import { CTASection } from "@/components/hr/cta-section";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { generateServiceSchema } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Chatbots for Tourism — AI Chatbot Concierge",
  description:
    "AI-powered chatbot concierge for hotels, apartments, and tour operators in Dalmatia. 24/7 multilingual guest support, activity recommendations, and booking assistance.",
  alternates: {
    canonical: "/en/chatbots",
    languages: {
      hr: "/hr/chatbotovi",
      en: "/en/chatbots",
    },
  },
  openGraph: {
    title: "Chatbots for Tourism — AI Chatbot Concierge",
    description:
      "Intelligent AI chatbots that answer guest questions, recommend activities, and handle bookings around the clock.",
    url: "https://opsisdalmatia.com/en/chatbots",
  },
};

const FAQS = [
  {
    question: "How does the AI chatbot work for my hotel or apartment?",
    answer:
      "Our chatbot is trained on your specific property information, local activities, restaurant recommendations, and booking policies. When a guest asks a question on your website or messaging platform, the AI provides an instant, accurate response — just like a knowledgeable concierge would, but available 24 hours a day.",
  },
  {
    question: "Which languages does the chatbot support?",
    answer:
      "Our chatbots support Croatian, English, German, Italian, French, and many other languages out of the box. The AI automatically detects the guest's language and responds accordingly, ensuring every visitor feels welcome regardless of where they come from.",
  },
  {
    question: "Can the chatbot actually process bookings?",
    answer:
      "Yes. The chatbot can be integrated with your existing booking system, calendar, or reservation platform. Guests can check availability, select dates, and confirm reservations directly through the chat interface without ever leaving your website.",
  },
  {
    question: "How long does it take to set up a chatbot?",
    answer:
      "A typical chatbot deployment takes between 5 and 10 business days. This includes the initial consultation, content training, integration with your website or messaging platforms, and thorough testing before going live.",
  },
  {
    question: "What happens if the chatbot cannot answer a question?",
    answer:
      "When the AI encounters a question it cannot confidently answer, it gracefully hands the conversation to a human team member via email notification, WhatsApp, or your preferred communication channel. No guest inquiry goes unanswered.",
  },
];

export default function ChatbotsPage() {
  return (
    <>
      <JsonLd
        data={generateServiceSchema(
          "AI Chatbot Concierge for Tourism",
          "Intelligent chatbot solutions for hotels, apartments, and tour operators in Split and Dalmatia. 24/7 multilingual guest support with activity recommendations and booking capabilities.",
          [
            "tourism chatbot",
            "hotel chatbot",
            "AI concierge",
            "guest support",
            "booking chatbot",
            "Dalmatia tourism",
            "Split Croatia",
          ]
        )}
      />

      <Breadcrumbs
        locale="en"
        items={[
          { name: "Home", href: "/en" },
          { name: "Services", href: "/en/services" },
          { name: "Chatbots", href: "/en/chatbots" },
        ]}
      />

      <HeroSection
        title="Chatbots for Tourism — AI Chatbot Concierge"
        subtitle="Give every guest a personal concierge that never sleeps. Our AI chatbots answer questions, recommend activities, and handle bookings in multiple languages — 24 hours a day, 365 days a year."
        ctaText="Request a Demo"
        ctaHref="/en/contact"
      />

      {/* Features Section */}
      <section className="py-20 bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white sm:text-4xl mb-12 text-center">
            What Our Chatbot Can Do
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: "🌍",
                title: "Multilingual Support",
                description:
                  "Automatically detects and responds in Croatian, English, German, Italian, French, and more. Every guest communicates in their preferred language without any configuration.",
              },
              {
                icon: "🏨",
                title: "Property Information",
                description:
                  "Answers questions about check-in times, amenities, parking, Wi-Fi, house rules, and everything else guests need to know — pulled directly from your property data.",
              },
              {
                icon: "🎯",
                title: "Activity Recommendations",
                description:
                  "Recommends boat tours, diving trips, wine tastings, hiking routes, and dozens of other activities based on guest preferences, group size, budget, and season.",
              },
              {
                icon: "📅",
                title: "Booking Integration",
                description:
                  "Connects with your booking system to check availability, process reservations, and send confirmation details — all within the chat conversation.",
              },
              {
                icon: "📱",
                title: "Multi-Platform",
                description:
                  "Deploy on your website, WhatsApp, Facebook Messenger, Instagram, Telegram, or any messaging platform your guests already use.",
              },
              {
                icon: "📊",
                title: "Analytics Dashboard",
                description:
                  "Track conversation volumes, popular questions, booking conversions, and guest satisfaction scores. Understand what your guests want and optimize your offerings.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
              >
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-zinc-900">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white sm:text-4xl mb-12 text-center">
            How It Works
          </h2>
          <div className="space-y-12">
            {[
              {
                step: "01",
                title: "Consultation & Content Collection",
                description:
                  "We start with a detailed consultation to understand your property, services, and guest profile. We collect your property information, activity catalog, pricing, FAQs, and brand guidelines.",
              },
              {
                step: "02",
                title: "AI Training & Customization",
                description:
                  "Our team trains the AI on your specific content, ensuring it understands your property inside and out. We customize the conversation flow, tone of voice, and visual design to match your brand.",
              },
              {
                step: "03",
                title: "Integration & Testing",
                description:
                  "We integrate the chatbot with your website and preferred messaging platforms. Extensive testing covers edge cases, language switching, booking flows, and handoff scenarios.",
              },
              {
                step: "04",
                title: "Launch & Ongoing Optimization",
                description:
                  "After launch, we monitor performance, analyze conversation patterns, and continuously improve the AI responses. Monthly reports keep you informed about guest interactions and ROI.",
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-600/20 border border-blue-500/30 rounded-lg flex items-center justify-center">
                  <span className="text-blue-400 font-bold text-sm">
                    {item.step}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-zinc-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 bg-zinc-950">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white sm:text-4xl mb-8">
            Who Benefits from a Tourism Chatbot?
          </h2>
          <div className="space-y-6 text-zinc-300 text-lg leading-relaxed">
            <p>
              <strong className="text-white">Hotels and boutique accommodations</strong> use our
              chatbots to reduce front desk workload. Guests get instant answers about room
              amenities, breakfast times, spa availability, and local attractions without waiting for
              staff to respond to emails or calls.
            </p>
            <p>
              <strong className="text-white">Apartment and villa rental owners</strong> benefit from
              automated check-in instructions, house rule explanations, and local tips. The chatbot
              handles the repetitive questions that consume hours of the host&apos;s time every week.
            </p>
            <p>
              <strong className="text-white">Tour operators and activity providers</strong> use
              chatbots to showcase their offerings, answer availability questions, and guide
              potential customers through the booking process — converting website visitors into
              paying customers around the clock.
            </p>
            <p>
              <strong className="text-white">Travel agencies</strong> deploy chatbots as first-line
              support to qualify leads, gather trip preferences, and schedule consultations with
              human agents — ensuring no potential client slips through during busy periods.
            </p>
          </div>
        </div>
      </section>

      <FAQSection faqs={FAQS} title="Frequently Asked Questions" />

      <CTASection
        title="Ready to Deploy Your AI Chatbot?"
        description="Get in touch for a free demo. We will show you exactly how a chatbot can work for your tourism business."
        buttonText="Contact Us"
        buttonHref="/en/contact"
      />
    </>
  );
}
