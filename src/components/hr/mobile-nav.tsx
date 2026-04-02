"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";

interface MobileNavProps {
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

export function MobileNav({ locale }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const links = NAV_LINKS[locale];

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Hamburger Button */}
      <button
        type="button"
        onClick={toggle}
        className="md:hidden relative z-50 flex flex-col items-center justify-center w-10 h-10 gap-1.5"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
      >
        <span
          className={`block w-6 h-0.5 bg-white transition-all duration-300 ${
            isOpen ? "rotate-45 translate-y-2" : ""
          }`}
        />
        <span
          className={`block w-6 h-0.5 bg-white transition-all duration-300 ${
            isOpen ? "opacity-0" : ""
          }`}
        />
        <span
          className={`block w-6 h-0.5 bg-white transition-all duration-300 ${
            isOpen ? "-rotate-45 -translate-y-2" : ""
          }`}
        />
      </button>

      {/* Full-screen Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/95 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!isOpen}
      >
        <nav className="flex flex-col items-center justify-center h-full gap-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={close}
              className="text-2xl font-medium text-white hover:text-blue-400 transition-colors"
            >
              {link.label}
            </Link>
          ))}

          {/* Language Switcher */}
          <div className="flex items-center gap-3 mt-4 text-lg">
            <Link
              href="/hr"
              onClick={close}
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
              href="/en"
              onClick={close}
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
            onClick={close}
            className="mt-4 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors"
          >
            {locale === "hr" ? "Isprobajte Chatbot" : "Try Chatbot"}
          </Link>
        </nav>
      </div>
    </>
  );
}
