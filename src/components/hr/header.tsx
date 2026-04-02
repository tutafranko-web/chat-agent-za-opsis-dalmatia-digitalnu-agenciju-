import Link from "next/link";
import { MobileNav } from "./mobile-nav";

interface HeaderProps {
  locale: "hr" | "en";
}

const NAV_LINKS = {
  hr: [
    { label: "Usluge", href: "/hr/usluge" },
    { label: "Chatbotovi", href: "/hr/chatbotovi" },
    { label: "AI Agenti", href: "/hr/ai-agenti" },
    { label: "Glasovni Agenti", href: "/hr/glasovni-agenti" },
    { label: "Blog", href: "/hr/blog" },
    { label: "Kontakt", href: "/hr/kontakt" },
  ],
  en: [
    { label: "Services", href: "/en/services" },
    { label: "Chatbots", href: "/en/chatbots" },
    { label: "AI Agents", href: "/en/ai-agents" },
    { label: "Voice Agents", href: "/en/voice-agents" },
    { label: "Blog", href: "/en/blog" },
    { label: "Contact", href: "/en/contact" },
  ],
};

export function Header({ locale }: HeaderProps) {
  const links = NAV_LINKS[locale];
  const otherLocale = locale === "hr" ? "en" : "hr";

  return (
    <header className="sticky top-0 z-50 w-full bg-black/90 backdrop-blur-md border-b border-zinc-800/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href={`/${locale}`}
            className="text-xl font-bold text-white hover:text-blue-400 transition-colors"
          >
            Opsis Dalmatia
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-zinc-300 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center gap-4">
            {/* Language Switcher */}
            <div className="flex items-center gap-2 text-sm">
              <Link
                href={`/hr`}
                className={`transition-colors ${
                  locale === "hr"
                    ? "text-white font-semibold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                HR
              </Link>
              <span className="text-zinc-600">|</span>
              <Link
                href={`/en`}
                className={`transition-colors ${
                  locale === "en"
                    ? "text-white font-semibold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                EN
              </Link>
            </div>

            {/* CTA Button */}
            <Link
              href="/"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              {locale === "hr" ? "Isprobajte Chatbot" : "Try Chatbot"}
            </Link>
          </div>

          {/* Mobile Navigation */}
          <MobileNav locale={locale} />
        </div>
      </div>
    </header>
  );
}
