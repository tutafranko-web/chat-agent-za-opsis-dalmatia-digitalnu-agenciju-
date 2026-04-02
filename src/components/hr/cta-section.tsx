import Link from "next/link";

interface CTASectionProps {
  title: string;
  description: string;
  buttonText: string;
  buttonHref: string;
}

export function CTASection({
  title,
  description,
  buttonText,
  buttonHref,
}: CTASectionProps) {
  return (
    <section className="py-16 bg-gradient-to-r from-blue-900/40 to-indigo-900/40">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl font-bold text-white sm:text-3xl">{title}</h2>
        <p className="mt-4 text-lg text-zinc-300">{description}</p>
        <div className="mt-8">
          <Link
            href={buttonHref}
            className="inline-flex items-center px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors text-lg"
          >
            {buttonText}
          </Link>
        </div>
      </div>
    </section>
  );
}
