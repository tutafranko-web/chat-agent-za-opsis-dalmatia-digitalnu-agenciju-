import type { MetadataRoute } from "next";

const base = (process.env.PUBLIC_BASE_URL || "http://localhost:3000").replace(/\/+$/, "");

export default function sitemap(): MetadataRoute.Sitemap {
  const paths: [string, number][] = [
    ["/", 1],
    ["/quiz", 0.8],
    ["/partneri/iznajmljivaci", 0.6],
    ["/partneri/organizatori", 0.6],
    ["/privacy", 0.2],
    ["/uvjeti", 0.2],
  ];
  return paths.map(([p, priority]) => ({ url: `${base}${p}`, lastModified: new Date(), changeFrequency: "weekly", priority }));
}
