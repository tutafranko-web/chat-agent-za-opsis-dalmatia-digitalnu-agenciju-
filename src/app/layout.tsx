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
  title: "Opsis Dalmatia - Tourist Assistant",
  description:
    "Your personal AI assistant for booking activities and tours in Split and Dalmatia, Croatia. Discover boat tours, adventure sports, guided experiences and more.",
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
  openGraph: {
    title: "Opsis Dalmatia - Tourist Assistant",
    description: "Discover and book the best activities in Split and Dalmatia.",
    url: "https://opsisdalmatia.com",
    siteName: "Opsis Dalmatia",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "Opsis Dalmatia - Tourist Assistant",
    description: "Discover and book the best activities in Split and Dalmatia.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
      </head>
      <body
        className={`${geistSans.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
