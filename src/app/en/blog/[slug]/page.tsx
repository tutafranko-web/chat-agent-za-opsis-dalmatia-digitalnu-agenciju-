import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { generateBlogPostSchema } from "@/lib/structured-data";

interface BlogPost {
  title: string;
  slug: string;
  description: string;
  date: string;
  keywords: string[];
  content: string;
}

const BLOG_DIR = path.join(process.cwd(), "src/content/blog/en");

function getPost(slug: string): BlogPost | null {
  const filePath = path.join(BLOG_DIR, `${slug}.json`);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as BlogPost;
}

function getAllPosts(): BlogPost[] {
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".json"));
  return files
    .map(
      (f) =>
        JSON.parse(fs.readFileSync(path.join(BLOG_DIR, f), "utf-8")) as BlogPost
    )
    .sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
}

export function generateStaticParams() {
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".json"));
  return files.map((f) => ({ slug: f.replace(".json", "") }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: {
      canonical: `https://opsisdalmatia.com/en/blog/${slug}`,
      languages: {
        hr: `/hr/blog/${getHrSlug(slug)}`,
        en: `/en/blog/${slug}`,
      },
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://opsisdalmatia.com/en/blog/${slug}`,
      type: "article",
      locale: "en_US",
      publishedTime: post.date,
    },
  };
}

function getHrSlug(enSlug: string): string {
  const map: Record<string, string> = {
    "what-are-chatbots": "sto-su-chatbotovi",
    "ai-in-tourism": "ai-u-turizmu",
    "voice-agents-future": "glasovni-agenti-buducnost",
    "digital-transformation": "digitalna-transformacija",
    "chatbot-increase-bookings": "chatbot-povecanje-rezervacija",
  };
  return map[enSlug] || enSlug;
}

export default async function EnBlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const allPosts = getAllPosts();
  const relatedPosts = allPosts
    .filter((p) => p.slug !== slug)
    .slice(0, 2);

  const schema = generateBlogPostSchema(
    post.title,
    post.description,
    post.date,
    post.slug,
    "en"
  );

  return (
    <>
      <JsonLd data={schema} />
      <Breadcrumbs
        locale="en"
        items={[
          { name: "Home", href: "/en" },
          { name: "Blog", href: "/en/blog" },
          { name: post.title, href: `/en/blog/${slug}` },
        ]}
      />

      <article className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
        <header className="mb-10">
          <time
            dateTime={post.date}
            className="text-sm font-medium text-zinc-500 uppercase tracking-wider"
          >
            {new Date(post.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          <h1 className="mt-3 text-3xl sm:text-4xl font-bold text-white leading-tight">
            {post.title}
          </h1>
          <p className="mt-4 text-lg text-zinc-400">{post.description}</p>
        </header>

        <div
          className="prose prose-invert prose-zinc max-w-none prose-headings:text-white prose-p:text-zinc-300 prose-li:text-zinc-300 prose-strong:text-white prose-a:text-blue-400 hover:prose-a:text-blue-300"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div className="mt-12 pt-8 border-t border-zinc-800">
          <Link
            href="/en/blog"
            className="inline-flex items-center text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
          >
            <span className="mr-1" aria-hidden="true">
              &larr;
            </span>
            Back to blog
          </Link>
        </div>

        {relatedPosts.length > 0 && (
          <section className="mt-12 pt-8 border-t border-zinc-800">
            <h2 className="text-xl font-semibold text-white mb-6">
              Related articles
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {relatedPosts.map((related) => (
                <Link
                  key={related.slug}
                  href={`/en/blog/${related.slug}`}
                  className="block p-4 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-600 transition-colors"
                >
                  <time
                    dateTime={related.date}
                    className="text-xs text-zinc-500"
                  >
                    {new Date(related.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                  <h3 className="mt-1 text-sm font-medium text-white">
                    {related.title}
                  </h3>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </>
  );
}
