import type { Metadata } from "next";
import Link from "next/link";
import { HeroSection } from "@/components/hr/hero-section";
import { FAQSection } from "@/components/hr/faq-section";
import { CTASection } from "@/components/hr/cta-section";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { generateServiceSchema } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "AI Agents — Business Automation for Tourism",
  description:
    "AI agents that automate tourism business operations. Reservation processing, guest communication, reporting, and partner coordination — all handled by intelligent automation.",
  alternates: {
    canonical: "/en/ai-agents",
    languages: {
      hr: "/hr/ai-agenti",
      en: "/en/ai-agents",
    },
  },
  openGraph: {
    title: "AI Agents — Business Automation for Tourism",
    description:
      "Autonomous AI agents that handle reservations, reports, and guest communication for tourism businesses.",
    url: "https://opsisdalmatia.com/en/ai-agents",
  },
};

const FAQS = [
  {
    question: "What exactly is an AI agent, and how is it different from a chatbot?",
    answer:
      "A chatbot responds to direct questions from users in a conversation. An AI agent, on the other hand, operates autonomously — it can monitor incoming emails, process reservation data, update spreadsheets, send follow-up messages, and coordinate between multiple systems without human intervention. Think of it as a digital employee that handles back-office tasks around the clock.",
  },
  {
    question: "What tasks can AI agents automate for my tourism business?",
    answer:
      "Common automations include processing booking confirmations from OTAs (Booking.com, Airbnb), sending pre-arrival emails with check-in instructions, generating weekly occupancy reports, monitoring review platforms, coordinating with local activity providers, managing calendar synchronization, and updating pricing across multiple listing platforms.",
  },
  {
    question: "Do I need technical knowledge to use AI agents?",
    answer:
      "Not at all. We handle the entire setup, configuration, and integration process. Once deployed, the agents run autonomously. You receive regular reports and can adjust settings through a simple dashboard. Our team provides ongoing support and optimization.",
  },
  {
    question: "How do AI agents integrate with my existing tools?",
    answer:
      "Our agents connect with Google Sheets, Gmail, Outlook, booking platforms, CRM systems, messaging apps, and hundreds of other tools through API integrations. We work with whatever software stack you already use — no need to switch to new platforms.",
  },
  {
    question: "What is the return on investment for AI agents?",
    answer:
      "Most clients see ROI within the first month. By eliminating 10-20 hours per week of manual data entry, email writing, and report generation, the agents free up your staff to focus on guest experience and revenue-generating activities. The cost of an AI agent is typically a fraction of what you would pay for equivalent manual labor.",
  },
];

export default function AIAgentsPage() {
  return (
    <>
      <JsonLd
        data={generateServiceSchema(
          "AI Agents for Tourism Business Automation",
          "Autonomous AI agents that automate reservation processing, guest communication, reporting, and business operations for hotels, apartments, and tour operators in Dalmatia.",
          [
            "AI agents",
            "business automation",
            "tourism automation",
            "hotel automation",
            "reservation processing",
            "Split Croatia",
          ]
        )}
      />

      <Breadcrumbs
        locale="en"
        items={[
          { name: "Home", href: "/en" },
          { name: "Services", href: "/en/services" },
          { name: "AI Agents", href: "/en/ai-agents" },
        ]}
      />

      <HeroSection
        title="AI Agents — Business Automation for Tourism"
        subtitle="Stop spending hours on repetitive tasks. Our AI agents handle reservations, guest communication, reporting, and partner coordination autonomously — so you can focus on what matters most."
        ctaText="Schedule a Consultation"
        ctaHref="/en/contact"
      />

      {/* Use Cases */}
      <section className="py-20 bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white sm:text-4xl mb-12 text-center">
            What AI Agents Can Do for You
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {[
              {
                icon: "📧",
                title: "Automated Guest Communication",
                description:
                  "Pre-arrival emails with check-in instructions, local tips, and activity suggestions. Post-stay follow-ups requesting reviews. All personalized and sent at the right time without manual effort.",
              },
              {
                icon: "📋",
                title: "Reservation Processing",
                description:
                  "Automatically extract booking details from Booking.com, Airbnb, and direct inquiries. Update your calendar, notify cleaning staff, and prepare welcome packages — all triggered by a single new reservation.",
              },
              {
                icon: "📊",
                title: "Reporting & Analytics",
                description:
                  "Weekly occupancy reports, revenue summaries, competitor price monitoring, and review sentiment analysis — generated automatically and delivered to your inbox every Monday morning.",
              },
              {
                icon: "🤝",
                title: "Partner Coordination",
                description:
                  "Coordinate with local activity providers, transfer services, and restaurant partners. Automatically send guest details, confirm bookings, and handle schedule changes.",
              },
              {
                icon: "💰",
                title: "Dynamic Pricing",
                description:
                  "Monitor competitor pricing, local events, and seasonal demand patterns. Receive pricing recommendations or let the agent automatically adjust your rates across all listing platforms.",
              },
              {
                icon: "⭐",
                title: "Review Management",
                description:
                  "Monitor new reviews across Google, TripAdvisor, Booking.com, and Airbnb. Get instant notifications, sentiment analysis, and AI-drafted response suggestions for every review.",
              },
            ].map((useCase) => (
              <div
                key={useCase.title}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-600 transition-colors"
              >
                <div className="text-3xl mb-4">{useCase.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {useCase.title}
                </h3>
                <p className="text-zinc-400 leading-relaxed">
                  {useCase.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 bg-zinc-900">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white sm:text-4xl mb-8 text-center">
            Manual Work vs. AI Agents
          </h2>
          <p className="text-center text-zinc-400 mb-12 max-w-2xl mx-auto">
            See how AI agents compare to traditional manual processes across common tourism
            business operations.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-zinc-700">
                  <th className="text-left py-4 px-4 text-zinc-300 font-semibold">Task</th>
                  <th className="text-left py-4 px-4 text-zinc-300 font-semibold">Manual</th>
                  <th className="text-left py-4 px-4 text-blue-400 font-semibold">AI Agent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {[
                  {
                    task: "Process a reservation",
                    manual: "15-20 minutes",
                    ai: "Under 30 seconds",
                  },
                  {
                    task: "Send pre-arrival email",
                    manual: "5-10 min per guest",
                    ai: "Automatic, instant",
                  },
                  {
                    task: "Weekly occupancy report",
                    manual: "1-2 hours",
                    ai: "Auto-generated",
                  },
                  {
                    task: "Monitor competitor prices",
                    manual: "30+ min daily",
                    ai: "Continuous, real-time",
                  },
                  {
                    task: "Respond to reviews",
                    manual: "10 min per review",
                    ai: "Draft in 5 seconds",
                  },
                  {
                    task: "Availability",
                    manual: "Business hours only",
                    ai: "24/7/365",
                  },
                ].map((row) => (
                  <tr key={row.task}>
                    <td className="py-3 px-4 text-zinc-300">{row.task}</td>
                    <td className="py-3 px-4 text-zinc-500">{row.manual}</td>
                    <td className="py-3 px-4 text-blue-400 font-medium">{row.ai}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* How We Build */}
      <section className="py-20 bg-zinc-950">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white sm:text-4xl mb-8">
            How We Build Your AI Agents
          </h2>
          <div className="space-y-6 text-zinc-300 text-lg leading-relaxed">
            <p>
              Every AI agent we build starts with a deep understanding of your business processes.
              We sit down with you to map out your daily workflows — from the moment a new booking
              arrives to the follow-up after a guest checks out. We identify the repetitive,
              time-consuming tasks that are perfect candidates for automation.
            </p>
            <p>
              Our agents are built on robust automation platforms and connected to your existing
              tools through secure API integrations. We use platforms like n8n for workflow
              orchestration, combined with large language models for tasks that require natural
              language understanding — such as parsing guest emails, generating personalized
              responses, or analyzing review sentiment.
            </p>
            <p>
              After deployment, we monitor agent performance closely during the first month. We
              track success rates, identify edge cases, and refine the automation logic to ensure
              reliability. You receive a monthly performance report showing exactly how much time
              and effort the agents saved your team.
            </p>
          </div>
        </div>
      </section>

      <FAQSection faqs={FAQS} title="Frequently Asked Questions" />

      <CTASection
        title="Automate Your Tourism Business Today"
        description="Book a free consultation to discover which tasks AI agents can handle for you. We will map your workflows and show you the potential time savings."
        buttonText="Get Started"
        buttonHref="/en/contact"
      />
    </>
  );
}
