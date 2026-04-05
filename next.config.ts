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
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
