import fs from "fs";
import path from "path";
import type { MetadataRoute } from "next";

const BASE = "https://opsisdalmatia.com";

function getBlogSlugs(locale: string): string[] {
  try {
    const dir = path.join(process.cwd(), "src/content/blog", locale);
    return fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(".json", ""));
  } catch {
    return [];
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: "weekly", priority: 1 },
    // HR pages
    { url: `${BASE}/hr`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/hr/chatbotovi`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/hr/ai-agenti`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/hr/glasovni-agenti`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/hr/digitalna-turisticka-agencija`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/hr/usluge`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/hr/o-nama`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/hr/kontakt`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/hr/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    // EN pages
    { url: `${BASE}/en`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/en/chatbots`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/en/ai-agents`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/en/voice-agents`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/en/digital-tourism-agency`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/en/services`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/en/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/en/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/en/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
  ];

  const hrBlogPosts = getBlogSlugs("hr").map((slug) => ({
    url: `${BASE}/hr/blog/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const enBlogPosts = getBlogSlugs("en").map((slug) => ({
    url: `${BASE}/en/blog/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...hrBlogPosts, ...enBlogPosts];
}
