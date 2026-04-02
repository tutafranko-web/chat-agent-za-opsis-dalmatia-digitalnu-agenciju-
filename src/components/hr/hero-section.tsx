import Link from "next/link";

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaHref?: string;
}

export function HeroSection({
  title,
  subtitle,
  ctaText,
  ctaHref,
}: HeroSectionProps) {
  return (
    <section className="relative w-full py-20 md:py-32 bg-gradient-to-b from-zinc-950 to-zinc-900">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-6 text-lg text-zinc-300 sm:text-xl max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
        {ctaText && ctaHref && (
          <div className="mt-10">
            <Link
              href={ctaHref}
              className="inline-flex items-center px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors text-lg"
            >
              {ctaText}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
