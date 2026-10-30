import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnalyticsProvider from "@/components/AnalyticsProvider";
import { SITE } from "@/lib/catalog";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Meridian Press — Understand Human Nature. Think Clearly. Live Intentionally.",
    template: "%s · Meridian Press",
  },
  description:
    "Practical, carefully written books on human psychology, strategic thinking, habits, self-discipline, and communication — from an independent press that publishes honestly. Preview upcoming titles, get a free reader's guide, and help shape what's written next.",
  keywords: [
    "human psychology books",
    "personal development",
    "strategic thinking",
    "habit tracking",
    "self-discipline",
    "emotional intelligence",
    "communication skills",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: "Meridian Press — Practical books for clearer thinking",
    description: SITE.description,
    url: "/",
    images: [{ url: "/images/og-banner.jpg", width: 1200, height: 630, alt: "Meridian Press — understand human nature, think clearly, live intentionally" }],
    locale: "en_US",
    alternateLocale: ["en_GB", "en_CA", "en_AU", "de_DE", "fr_FR"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Meridian Press — Practical books for clearer thinking",
    description: SITE.description,
    images: ["/images/og-banner.jpg"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#17243A",
  width: "device-width",
  initialScale: 1,
};

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE.name,
  url: SITE.url,
  description: SITE.description,
  logo: `${SITE.url}/icon.svg`,
  areaServed: ["US", "CA", "GB", "AU", "DE", "FR"],
};

const siteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE.name,
  url: SITE.url,
  inLanguage: "en",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="flex min-h-screen flex-col">
        <a
          href="#books"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:bg-navy focus:px-4 focus:py-2 focus:text-ivory"
        >
          Skip to books
        </a>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <AnalyticsProvider />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
        {GA_ID ? (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
gtag('config', '${GA_ID}', { anonymize_ip: true });`}
            </Script>
          </>
        ) : null}
      </body>
    </html>
  );
}
