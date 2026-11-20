import type { Metadata, Viewport } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({ subsets: ["latin", "latin-ext"], variable: "--font-fraunces", display: "swap", weight: ["400", "600", "700"] });
const dmSans = DM_Sans({ subsets: ["latin", "latin-ext"], variable: "--font-dm-sans", display: "swap", weight: ["400", "500", "700"] });

const base = process.env.PUBLIC_BASE_URL || "http://localhost:3000";

export const viewport: Viewport = {
  themeColor: "#0e1a22",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
};

export const metadata: Metadata = {
  metadataBase: new URL(base),
  title: { default: "Opsis Dalmatia · AI Concierge for Split & Dalmatia", template: "%s · Opsis Dalmatia" },
  description:
    "Find and request tours and activities in Split and Dalmatia: boat trips, the Blue Cave, rafting, wine tastings, transfers and more — with a friendly AI concierge.",
  robots: { index: true, follow: true },
  openGraph: {
    title: "Opsis Dalmatia · AI Concierge",
    description: "Find and request the best tours and activities in Split and Dalmatia.",
    siteName: "Opsis Dalmatia",
    type: "website",
    locale: "en_GB",
    images: [{ url: "/activities/blue-cave.jpg", width: 1200, height: 800, alt: "Blue Cave, Biševo" }],
  },
  twitter: { card: "summary_large_image", title: "Opsis Dalmatia · AI Concierge" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${dmSans.variable}`}>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
