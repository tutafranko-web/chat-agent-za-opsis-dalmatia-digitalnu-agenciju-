import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import { BlogCard } from "@/components/hr/blog-card";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "Blog — AI in Tourism, Chatbots and Digital Transformation",
  description:
    "Expert articles about AI chatbots, voice agents, digital transformation and automation in the tourism industry. Tips for travel agencies in Croatia.",
  keywords: [
    "AI tourism blog",
    "chatbot tourism",
    "digital transformation tourism",
    "voice agents",
    "travel agency automation",
  ],
  alternates: {
    canonical: "https://opsisdalmatia.com/en/blog",
    languages: {
      hr: "/hr/blog",
      en: "/en/blog",
    },
  },
  openGraph: {
    title: "Blog — Opsis Dalmatia",
    description:
      "Expert articles about AI chatbots, voice agents and digital transformation in tourism.",
    url: "https://opsisdalmatia.com/en/blog",
    locale: "en_US",
  },
};

interface BlogPost {
  title: string;
  slug: string;
  description: string;
  date: string;
  keywords: string[];
}

function getBlogPosts(): BlogPost[] {
  const dir = path.join(process.cwd(), "src/content/blog/en");
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

export default function EnBlogPage() {
  const posts = getBlogPosts();

  const blogListSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Opsis Dalmatia Blog",
    description:
      "Expert articles about AI chatbots, voice agents and digital transformation in tourism.",
    url: "https://opsisdalmatia.com/en/blog",
    inLanguage: "en",
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      url: `https://opsisdalmatia.com/en/blog/${post.slug}`,
    })),
  };

  return (
    <>
      <JsonLd data={blogListSchema} />
      <Breadcrumbs
        locale="en"
        items={[
          { name: "Home", href: "/en" },
          { name: "Blog", href: "/en/blog" },
        ]}
      />

      <section className="max-w-5xl mx-auto px-4 py-12 sm:py-16">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Blog
        </h1>
        <p className="text-zinc-400 text-lg mb-10 max-w-2xl">
          Expert articles about AI chatbots, voice agents, digital
          transformation and automation in the tourism industry.
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogCard
              key={post.slug}
              title={post.title}
              description={post.description}
              slug={post.slug}
              date={post.date}
              locale="en"
            />
          ))}
        </div>
      </section>
    </>
  );
}
