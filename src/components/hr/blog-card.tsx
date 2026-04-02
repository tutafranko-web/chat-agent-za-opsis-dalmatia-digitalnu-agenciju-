import Link from "next/link";

interface BlogCardProps {
  title: string;
  description: string;
  slug: string;
  date: string;
  locale: "hr" | "en";
}

export function BlogCard({
  title,
  description,
  slug,
  date,
  locale,
}: BlogCardProps) {
  return (
    <article className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-600 transition-colors group">
      <time
        dateTime={date}
        className="text-xs font-medium text-zinc-500 uppercase tracking-wider"
      >
        {new Date(date).toLocaleDateString(locale === "hr" ? "hr-HR" : "en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </time>
      <h3 className="mt-3 text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
        <Link href={`/${locale}/blog/${slug}`}>{title}</Link>
      </h3>
      <p className="mt-2 text-sm text-zinc-400 leading-relaxed line-clamp-3">
        {description}
      </p>
      <Link
        href={`/${locale}/blog/${slug}`}
        className="inline-flex items-center mt-4 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
      >
        {locale === "hr" ? "Čitaj više" : "Read more"}
        <span className="ml-1" aria-hidden="true">
          &rarr;
        </span>
      </Link>
    </article>
  );
}
