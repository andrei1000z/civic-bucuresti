import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  // Block indexing for preview / non-production environments
  if (process.env.NODE_ENV !== "production") {
    return {
      rules: { userAgent: "*", disallow: "/" },
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",        // all API routes
          "/auth",        // auth callback/error (both with & without slash)
          "/auth/",
          "/cont",        // personal account (private)
          "/cont/",
          "/admin",       // admin panel
          "/admin/",
        ],
      },
    ],
    sitemap: [`${SITE_URL}/sitemap.xml`],
  };
}
