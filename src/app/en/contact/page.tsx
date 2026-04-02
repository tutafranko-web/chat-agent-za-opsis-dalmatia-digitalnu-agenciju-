import type { Metadata } from "next";
import Link from "next/link";
import { HeroSection } from "@/components/hr/hero-section";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { generateLocalBusinessSchema } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Contact Opsis Dalmatia — digital tourism agency in Split, Croatia. Get a free consultation about AI chatbots, voice agents, and business automation for your tourism business.",
  alternates: {
    canonical: "/en/contact",
    languages: {
      hr: "/hr/kontakt",
      en: "/en/contact",
    },
  },
  openGraph: {
    title: "Contact Us | Opsis Dalmatia",
    description:
      "Get in touch with our team for a free consultation about AI solutions for your tourism business.",
    url: "https://opsisdalmatia.com/en/contact",
  },
};

export default function ContactPage() {
  return (
    <>
      <JsonLd data={generateLocalBusinessSchema()} />

      <Breadcrumbs
        locale="en"
        items={[
          { name: "Home", href: "/en" },
          { name: "Contact", href: "/en/contact" },
        ]}
      />

      <HeroSection
        title="Contact Us"
        subtitle="Ready to explore how AI can help your tourism business? Get in touch for a free, no-obligation consultation. We will analyze your needs and show you exactly what is possible."
      />

      {/* Contact Info + Form */}
      <section className="py-20 bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            {/* Contact Information */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-8">
                Get In Touch
              </h2>
              <div className="space-y-8">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    Email
                  </h3>
                  <a
                    href="mailto:info@opsisdalmatia.com"
                    className="text-lg text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    info@opsisdalmatia.com
                  </a>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    Phone
                  </h3>
                  <a
                    href="tel:+38521000000"
                    className="text-lg text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    +385 21 000 000
                  </a>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    Location
                  </h3>
                  <p className="text-lg text-zinc-300">
                    Split, Croatia
                  </p>
                  <p className="text-sm text-zinc-500 mt-1">
                    Splitsko-dalmatinska County
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    Working Hours
                  </h3>
                  <p className="text-lg text-zinc-300">
                    Monday &ndash; Friday: 09:00 &ndash; 17:00
                  </p>
                  <p className="text-sm text-zinc-500 mt-1">
                    Our AI solutions work 24/7 &mdash; even when we are offline.
                  </p>
                </div>

                {/* Social Links */}
                <div>
                  <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                    Follow Us
                  </h3>
                  <div className="flex gap-4">
                    <a
                      href="https://instagram.com/opsisdalmatia"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-400 hover:text-white transition-colors"
                    >
                      Instagram
                    </a>
                    <a
                      href="https://facebook.com/opsisdalmatia"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-400 hover:text-white transition-colors"
                    >
                      Facebook
                    </a>
                    <a
                      href="https://linkedin.com/company/opsisdalmatia"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-400 hover:text-white transition-colors"
                    >
                      LinkedIn
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">
                Send Us a Message
              </h2>
              <form className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-zinc-300 mb-2"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-zinc-300 mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="business"
                    className="block text-sm font-medium text-zinc-300 mb-2"
                  >
                    Business Type
                  </label>
                  <select
                    id="business"
                    name="business"
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select your business type</option>
                    <option value="hotel">Hotel</option>
                    <option value="apartment">Apartment / Villa Rental</option>
                    <option value="tour-operator">Tour Operator</option>
                    <option value="travel-agency">Travel Agency</option>
                    <option value="restaurant">Restaurant / Bar</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="service"
                    className="block text-sm font-medium text-zinc-300 mb-2"
                  >
                    Interested In
                  </label>
                  <select
                    id="service"
                    name="service"
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a service</option>
                    <option value="chatbot">AI Chatbot Concierge</option>
                    <option value="ai-agents">AI Business Agents</option>
                    <option value="voice-agents">Voice AI Agents</option>
                    <option value="web-development">Web Development</option>
                    <option value="multiple">Multiple Services</option>
                    <option value="not-sure">Not Sure Yet</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-zinc-300 mb-2"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    required
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Tell us about your business and what you are looking for..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors"
                >
                  Send Message
                </button>

                <p className="text-xs text-zinc-500 text-center">
                  We typically respond within 24 hours on business days.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* What to Expect */}
      <section className="py-20 bg-zinc-900">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white sm:text-4xl mb-8 text-center">
            What to Expect
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Free Consultation",
                description:
                  "We schedule a 30-minute call to understand your business, your guests, and your current challenges. No commitment, no pressure.",
              },
              {
                step: "2",
                title: "Custom Proposal",
                description:
                  "Based on our conversation, we prepare a detailed proposal outlining the recommended solutions, timeline, and transparent pricing.",
              },
              {
                step: "3",
                title: "Implementation",
                description:
                  "Once approved, we build, test, and deploy your AI solutions within 2-4 weeks. You receive ongoing support and monthly performance reports.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="text-center"
              >
                <div className="w-12 h-12 bg-blue-600/20 border border-blue-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-400 font-bold">{item.step}</span>
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

      {/* Quick Links */}
      <section className="py-16 bg-zinc-950">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-zinc-400 mb-6">
            Want to learn more before reaching out? Explore our services:
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/en/chatbots"
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg transition-colors text-sm"
            >
              AI Chatbots
            </Link>
            <Link
              href="/en/ai-agents"
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg transition-colors text-sm"
            >
              AI Agents
            </Link>
            <Link
              href="/en/voice-agents"
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg transition-colors text-sm"
            >
              Voice Agents
            </Link>
            <Link
              href="/en/about"
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg transition-colors text-sm"
            >
              About Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
