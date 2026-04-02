import { JsonLd } from "@/components/seo/json-ld";

interface FAQ {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  faqs: FAQ[];
  title?: string;
}

function generateFAQSchema(faqs: FAQ[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function FAQSection({ faqs, title = "Često postavljana pitanja" }: FAQSectionProps) {
  return (
    <section className="py-16">
      <JsonLd data={generateFAQSchema(faqs)} />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {title && (
          <h2 className="text-2xl font-bold text-white mb-8 sm:text-3xl">
            {title}
          </h2>
        )}
        <div className="divide-y divide-zinc-800">
          {faqs.map((faq, index) => (
            <details key={index} className="group py-4">
              <summary className="flex cursor-pointer items-center justify-between text-left text-white font-medium hover:text-blue-400 transition-colors">
                <span className="pr-4">{faq.question}</span>
                <span className="ml-4 flex-shrink-0 text-zinc-500 group-open:rotate-45 transition-transform duration-200">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </span>
              </summary>
              <div className="mt-3 text-sm text-zinc-400 leading-relaxed pr-12">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
