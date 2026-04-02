import Link from "next/link";
import { JsonLd } from "./json-ld";

interface BreadcrumbItem {
  name: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  locale: "hr" | "en";
}

export function Breadcrumbs({ items, locale }: BreadcrumbsProps) {
  const breadcrumbSchema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `https://opsisdalmatia.com${item.href}`,
    })),
  };

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <nav
        aria-label={locale === "hr" ? "Navigacija" : "Breadcrumb"}
        className="py-3 px-4"
      >
        <ol className="flex items-center gap-1.5 text-sm text-zinc-400">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={item.href} className="flex items-center gap-1.5">
                {index > 0 && (
                  <span className="text-zinc-600" aria-hidden="true">
                    /
                  </span>
                )}
                {isLast ? (
                  <span className="text-zinc-300" aria-current="page">
                    {item.name}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="hover:text-white transition-colors"
                  >
                    {item.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
