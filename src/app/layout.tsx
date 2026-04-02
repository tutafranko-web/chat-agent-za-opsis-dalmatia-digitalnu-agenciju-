import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#1a1a1a",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://opsisdalmatia.com"),
  title: {
    default: "Opsis Dalmatia",
    template: "%s | Opsis Dalmatia",
  },
  description:
    "Digitalna turistička agencija u Splitu — AI chatbotovi, glasovni agenti, web razvoj za turizam.",
  robots: { index: true, follow: true },
  openGraph: {
    siteName: "Opsis Dalmatia",
    type: "website",
  },
  alternates: {
    languages: {
      hr: "https://opsisdalmatia.com/hr",
      en: "https://opsisdalmatia.com/en",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="dark">
      <body
        className={`${geistSans.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
