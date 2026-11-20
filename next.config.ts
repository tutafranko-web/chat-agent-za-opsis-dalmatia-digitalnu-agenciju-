import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const csp = [
  "default-src 'self'",
  // Next.js App Router injects small inline scripts (RSC payload); no third-party scripts.
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    const common = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
      { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
    ];
    return [
      { source: "/(.*)", headers: isProd ? [...common, { key: "Content-Security-Policy", value: csp }] : common },
      { source: "/(r|admin|partneri/upravljanje)/(.*)", headers: [{ key: "Referrer-Policy", value: "no-referrer" }, { key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
  async redirects() {
    return [
      // Old n8n-era form URLs (used in earlier outreach e-mails and QR links).
      { source: "/landlord/register", destination: "/partneri/iznajmljivaci", permanent: false },
      { source: "/operator/register", destination: "/partneri/organizatori", permanent: false },
      { source: "/operator/day-off", destination: "/partneri/organizatori", permanent: false },
      { source: "/operator/photos", destination: "/partneri/organizatori", permanent: false },
      // Agency SEO pages that used to live on this project now live on the agency site.
      { source: "/hr", destination: "https://opsisdalmatia.com/", permanent: false },
      { source: "/hr/:path*", destination: "https://opsisdalmatia.com/", permanent: false },
      { source: "/en", destination: "https://opsisdalmatia.com/en/", permanent: false },
      { source: "/en/:path*", destination: "https://opsisdalmatia.com/en/", permanent: false },
    ];
  },
};

export default nextConfig;
