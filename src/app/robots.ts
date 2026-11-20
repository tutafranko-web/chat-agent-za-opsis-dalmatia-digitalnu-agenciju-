import type { MetadataRoute } from "next";

const base = (process.env.PUBLIC_BASE_URL || "http://localhost:3000").replace(/\/+$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/", "/r/", "/partneri/upravljanje/", "/partneri/plakat/", "/odjava"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
