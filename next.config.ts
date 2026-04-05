import type { NextConfig } from "next";

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
        ],
      },
    ];
  },
};

export default nextConfig;
