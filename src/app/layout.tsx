import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import dynamic from "next/dynamic";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { AuthModal } from "@/components/auth/AuthModal";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { OrganizationJsonLd, WebsiteJsonLd } from "@/components/JsonLd";
import { CookieBanner } from "@/components/CookieBanner";
import { AlertBanner } from "@/components/AlertBanner";
import { Analytics } from "@/components/Analytics";
import { NavProgress } from "@/components/NavProgress";
import { DeferredClientMount } from "@/components/DeferredClientMount";
import { ToastProvider } from "@/components/Toast";
import { BackToTop } from "@/components/BackToTop";
import { InstallPrompt } from "@/components/InstallPrompt";
import { MobileFab } from "@/components/layout/MobileFab";
import { KeyboardShortcuts } from "@/components/KeyboardShortcuts";
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from "@/lib/constants";

// CivicAssistant is heavy (AI chat UI) and not needed on first paint — lazy-load it.
const CivicAssistant = dynamic(
  () => import("@/components/ai/CivicAssistant").then((m) => ({ default: m.CivicAssistant }))
);
const CommandPalette = dynamic(
  () => import("@/components/CommandPalette").then((m) => ({ default: m.CommandPalette }))
);

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const sora = Sora({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sora",
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} — Platforma civică a României`,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  authors: [{ name: "Civia" }],
  creator: "Civia",
  publisher: "Civia",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "ro_RO",
    url: SITE_URL,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: ["/opengraph-image"],
  },
  other: {
    "theme-color": "#1C4ED8",
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0F172A" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ro"
      className={`${inter.variable} ${sora.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://api.groq.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.open-meteo.com" />
        <link rel="dns-prefetch" href="https://api.openaq.org" />
        <link rel="dns-prefetch" href="https://plausible.io" />
        {/* Nominatim + OSM tiles are hit by every map page. Warming
            the DNS + TCP pool up-front shaves ~200ms off the first
            tile load on cold visits. */}
        <link rel="dns-prefetch" href="https://nominatim.openstreetmap.org" />
        <link rel="dns-prefetch" href="https://tile.openstreetmap.org" />
        {/* Overpass is the bottleneck for /harti at zoom >= 13 — preconnect
            so the first viewport fetch doesn't pay TLS handshake latency. */}
        <link rel="preconnect" href="https://overpass-api.de" crossOrigin="anonymous" />
        {/* Supabase — every page that reads data hits this origin. */}
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL} crossOrigin="anonymous" />
        <link rel="alternate" type="application/rss+xml" title="Sesizări Civia" href="/feed.xml" />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--color-bg)]">
        <OrganizationJsonLd />
        <WebsiteJsonLd />
        <Analytics />
        <NavProgress />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[200] focus:px-4 focus:py-2 focus:bg-[var(--color-primary)] focus:text-white focus:rounded-[8px] focus:shadow-lg"
        >
          Sări la conținut
        </a>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <AlertBanner />
              <Navbar />
              <main id="main-content" className="flex-1 flex flex-col">{children}</main>
              <Footer />
              {/* Heavy interactive widgets — mount only after first paint + idle.
                  Shaves ~300ms off LCP on slow devices. */}
              <DeferredClientMount>
                <CivicAssistant />
                <CommandPalette />
                <AuthModal />
                <CookieBanner />
                <BackToTop />
                <InstallPrompt />
                <MobileFab />
                <KeyboardShortcuts />
              </DeferredClientMount>
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
