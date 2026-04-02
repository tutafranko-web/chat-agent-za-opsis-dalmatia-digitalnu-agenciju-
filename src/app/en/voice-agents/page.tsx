import type { Metadata } from "next";
import Link from "next/link";
import { HeroSection } from "@/components/hr/hero-section";
import { FAQSection } from "@/components/hr/faq-section";
import { CTASection } from "@/components/hr/cta-section";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { generateServiceSchema } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Voice Agents — Voice AI for Tourism Agencies",
  description:
    "AI-powered voice agents for tourism. Handle phone calls, take reservations, and answer guest inquiries with natural voice conversation — available 24/7 in multiple languages.",
  alternates: {
    canonical: "/en/voice-agents",
    languages: {
      hr: "/hr/glasovni-agenti",
      en: "/en/voice-agents",
    },
  },
  openGraph: {
    title: "Voice Agents — Voice AI for Tourism Agencies",
    description:
      "AI voice assistants that answer calls, take reservations, and provide information in natural conversation.",
    url: "https://opsisdalmatia.com/en/voice-agents",
  },
};

const FAQS = [
  {
    question: "How natural does the voice agent sound?",
    answer:
      "Modern voice AI technology produces remarkably natural speech with proper intonation, pacing, and emotional nuance. Most callers cannot distinguish our voice agents from human operators. The agent handles natural conversation flow including interruptions, clarifications, and topic changes seamlessly.",
  },
  {
    question: "Can the voice agent handle calls in multiple languages?",
    answer:
      "Yes. Our voice agents support Croatian, English, German, Italian, and other languages commonly encountered in Dalmatian tourism. The agent can detect the caller's language automatically and switch mid-conversation if needed.",
  },
  {
    question: "What happens with complex calls the agent cannot handle?",
    answer:
      "The voice agent recognizes when a call requires human attention — such as a complaint, a special request, or a complex group booking. It politely informs the caller that it will connect them to a team member and transfers the call, or takes a message and ensures a callback within a defined timeframe.",
  },
  {
    question: "Does the voice agent integrate with my phone system?",
    answer:
      "We integrate with most modern phone systems, including VoIP providers, traditional PBX systems, and mobile lines. The voice agent can receive forwarded calls, handle a dedicated phone number, or operate as a first-line filter before routing to your staff.",
  },
  {
    question: "How is the voice agent trained on my business?",
    answer:
      "We train the agent on your property details, services, pricing, policies, and frequently asked questions. We also program common call scenarios — reservation inquiries, availability checks, directions, check-in procedures — so the agent handles the vast majority of calls without escalation.",
  },
];

export default function VoiceAgentsPage() {
  return (
    <>
      <JsonLd
        data={generateServiceSchema(
          "Voice AI Agents for Tourism",
          "AI-powered voice agents that handle phone calls for hotels, apartments, and tour operators in Dalmatia. Natural conversation, multilingual support, and seamless reservation handling.",
          [
            "voice AI",
            "voice agent",
            "phone automation",
            "tourism voice assistant",
            "hotel phone agent",
            "Split Croatia",
          ]
        )}
      />

      <Breadcrumbs
        locale="en"
        items={[
          { name: "Home", href: "/en" },
          { name: "Services", href: "/en/services" },
          { name: "Voice Agents", href: "/en/voice-agents" },
        ]}
      />

      <HeroSection
        title="Voice Agents — Voice AI for Tourism Agencies"
        subtitle="Never miss a phone call again. Our AI voice agents answer calls, provide information, and take reservations in natural conversation — around the clock, in multiple languages."
        ctaText="Hear a Demo"
        ctaHref="/en/contact"
      />

      {/* Technology Explanation */}
      <section className="py-20 bg-zinc-950">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white sm:text-4xl mb-8">
            How Voice AI Technology Works
          </h2>
          <div className="space-y-6 text-zinc-300 text-lg leading-relaxed">
            <p>
              Voice AI combines three powerful technologies: automatic speech recognition (ASR) that
              converts spoken words to text, large language models (LLMs) that understand intent and
              generate intelligent responses, and text-to-speech (TTS) synthesis that produces
              natural-sounding voice output. Together, these technologies create a seamless
              conversational experience that feels like talking to a well-informed human operator.
            </p>
            <p>
              Unlike older interactive voice response (IVR) systems that force callers through rigid
              menu trees — &quot;Press 1 for reservations, press 2 for directions&quot; — our voice agents
              understand natural language. A caller can simply say &quot;I would like to book a double
              room for next weekend&quot; and the agent immediately understands the intent, checks
              availability, and guides the conversation toward a confirmed booking.
            </p>
            <p>
              The technology has matured dramatically in the past two years. Latency is now under
              500 milliseconds, meaning the agent responds as quickly as a human would in natural
              conversation. Voice quality is virtually indistinguishable from a real person, with
              proper pronunciation of local place names like Bra&#x10D;, Hvar, Vis, and Trogir.
            </p>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white sm:text-4xl mb-12 text-center">
            Voice Agent Use Cases in Tourism
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: "📞",
                title: "Reservation Calls",
                description:
                  "Handle incoming reservation inquiries. Check room or apartment availability, collect guest details, and confirm bookings — all through natural voice conversation without a single button press.",
              },
              {
                icon: "🗺️",
                title: "Tourist Information",
                description:
                  "Answer questions about local attractions, restaurant recommendations, transportation options, weather, events, and activity availability. The agent knows Dalmatia as well as your best concierge.",
              },
              {
                icon: "🔄",
                title: "Booking Modifications",
                description:
                  "Process date changes, room upgrades, cancellations, and special requests. The voice agent accesses your reservation system in real time to handle modifications instantly.",
              },
              {
                icon: "🏖️",
                title: "Activity Bookings",
                description:
                  "Tour operators can deploy voice agents to handle activity booking calls — from kayaking tours and diving trips to wine tastings and cultural walking tours.",
              },
              {
                icon: "🕐",
                title: "After-Hours Coverage",
                description:
                  "Capture bookings and inquiries that come in after business hours, on weekends, and during holidays. International travelers often call from different time zones — the voice agent is always ready.",
              },
              {
                icon: "📝",
                title: "Follow-Up Calls",
                description:
                  "Proactively call guests before arrival with check-in details, or after departure to request feedback and reviews. Outbound campaigns run on your schedule without burdening your team.",
              },
            ].map((useCase) => (
              <div
                key={useCase.title}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-600 transition-colors"
              >
                <div className="text-3xl mb-4">{useCase.icon}</div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {useCase.title}
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {useCase.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-zinc-950">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white sm:text-4xl mb-8">
            Why Tourism Businesses Choose Voice Agents
          </h2>
          <div className="space-y-6 text-zinc-300 text-lg leading-relaxed">
            <p>
              In peak season, a typical hotel or tour operator in Split receives dozens of phone
              calls daily. Many of these go unanswered because staff are busy with guests, managing
              operations, or simply because the call arrives outside business hours. Every missed
              call is a potential lost booking worth hundreds or thousands of euros.
            </p>
            <p>
              A voice agent eliminates this problem entirely. It answers every call on the first
              ring, handles the conversation professionally, and either completes the booking or
              captures the caller&apos;s information for follow-up. During peak months, our clients
              report capturing 30 to 40 percent more reservation inquiries compared to handling
              calls manually.
            </p>
            <p>
              The cost advantage is significant. A full-time receptionist in Croatia costs between
              1,200 and 1,800 EUR per month, covers only standard working hours, needs vacation
              time, and can handle one call at a time. A voice agent operates 24/7, handles
              multiple simultaneous calls, never takes a day off, and costs a fraction of a
              full-time salary. For small accommodations and tour operators, this is often the
              difference between being reachable and losing business to competitors who answer
              faster.
            </p>
          </div>
        </div>
      </section>

      <FAQSection faqs={FAQS} title="Frequently Asked Questions" />

      <CTASection
        title="Start Answering Every Call with AI"
        description="Request a live demo to hear our voice agent in action. We will customize a sample conversation for your specific business."
        buttonText="Request a Demo"
        buttonHref="/en/contact"
      />
    </>
  );
}
