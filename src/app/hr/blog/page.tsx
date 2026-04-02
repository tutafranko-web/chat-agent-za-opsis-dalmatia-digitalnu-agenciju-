import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import { BlogCard } from "@/components/hr/blog-card";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "Blog — AI u turizmu, chatbotovi i digitalna transformacija",
  description:
    "Stručni članci o AI chatbotovima, glasovnim agentima, digitalnoj transformaciji i automatizaciji u turističkoj industriji. Savjeti za turističke agencije u Hrvatskoj.",
  keywords: [
    "AI turizam blog",
    "chatbot turizam",
    "digitalna transformacija turizam",
    "glasovni agenti",
    "turistička agencija automatizacija",
  ],
  alternates: {
    canonical: "https://opsisdalmatia.com/hr/blog",
    languages: {
      hr: "/hr/blog",
      en: "/en/blog",
    },
  },
  openGraph: {
    title: "Blog — Opsis Dalmatia",
    description:
      "Stručni članci o AI chatbotovima, glasovnim agentima i digitalnoj transformaciji u turizmu.",
    url: "https://opsisdalmatia.com/hr/blog",
    locale: "hr_HR",
  },
};

interface BlogPost {
  title: string;
  displayTitle?: string;
  slug: string;
  description: string;
  date: string;
  keywords: string[];
}

function getBlogPosts(): BlogPost[] {
  const dir = path.join(process.cwd(), "src/content/blog/hr");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
  return files
    .map((f) => {
      const data = JSON.parse(
        fs.readFileSync(path.join(dir, f), "utf-8")
      ) as BlogPost;
      return data;
    })
    .sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
}

export default function HrBlogPage() {
  const posts = getBlogPosts();

  const blogListSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Opsis Dalmatia Blog",
    description:
      "Stručni članci o AI chatbotovima, glasovnim agentima i digitalnoj transformaciji u turizmu.",
    url: "https://opsisdalmatia.com/hr/blog",
    inLanguage: "hr",
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.displayTitle || post.title,
      description: post.description,
      datePublished: post.date,
      url: `https://opsisdalmatia.com/hr/blog/${post.slug}`,
    })),
  };

  return (
    <>
      <JsonLd data={blogListSchema} />
      <Breadcrumbs
        locale="hr"
        items={[
          { name: "Početna", href: "/hr" },
          { name: "Blog", href: "/hr/blog" },
        ]}
      />

      <section className="max-w-5xl mx-auto px-4 py-12 sm:py-16">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Blog
        </h1>
        <p className="text-zinc-400 text-lg mb-10 max-w-2xl">
          Stručni članci o AI chatbotovima, glasovnim agentima, digitalnoj
          transformaciji i automatizaciji u turističkoj industriji.
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogCard
              key={post.slug}
              title={post.displayTitle || post.title}
              description={post.description}
              slug={post.slug}
              date={post.date}
              locale="hr"
            />
          ))}
        </div>
      </section>
    </>
  );
}
