import type { NextConfig } from "next";

// Guard against shipping localhost URLs to a real production deploy.
// Skip the check for local prod builds (npm run build on dev machine).
// The Vercel / CI env sets VERCEL=1 or CI=1; those are the ones that matter.
if (
  process.env.NODE_ENV === "production" &&
  (process.env.VERCEL === "1" || process.env.CI === "true" || process.env.CI === "1")
) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  if (siteUrl.includes("localhost") || siteUrl.includes("127.0.0.1")) {
    throw new Error(
      `[next.config] NEXT_PUBLIC_SITE_URL is set to "${siteUrl}" in production build. ` +
      `Set it to https://civia.ro (or your actual domain) in Vercel / hosting env vars.`
    );
  }
  if (!siteUrl) {
    console.warn("[next.config] NEXT_PUBLIC_SITE_URL is not set — using fallback");
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "unpkg.com" }, // Leaflet marker icons
      { protocol: "https", hostname: "s.digi24.ro" },
      { protocol: "https", hostname: "b365.ro" },
      { protocol: "https", hostname: "hotnews.ro" },
      { protocol: "https", hostname: "*.b365.ro" },
      { protocol: "https", hostname: "*.hotnews.ro" },
      { protocol: "https", hostname: "*.digi24.ro" },
    ],
  },
  async headers() {
    const csp = [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline' ${process.env.NODE_ENV === "development" ? "'unsafe-eval'" : ""} https://plausible.io`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https: http:",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.groq.com https://api.open-meteo.com https://overpass-api.de https://plausible.io https://api.openaq.org",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ");
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Permissions-Policy", value: "geolocation=(self), camera=(), microphone=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          // same-origin-allow-popups is needed for Supabase OAuth popup flow
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
          { key: "Content-Security-Policy", value: csp },
        ],
      },
      {
        // Long-lived cache for GeoJSON (they rarely change + committed to repo)
        source: "/geojson/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400" },
        ],
      },
    ];
  },
};

export default nextConfig;
