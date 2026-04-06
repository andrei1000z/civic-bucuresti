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
          "/auth/",       // auth callback/error
          "/cont/",       // personal account (private)
          "/admin/",      // admin panel
          "/embed/",      // iframe embeds
        ],
      },
    ],
    sitemap: [`${SITE_URL}/sitemap.xml`],
  };
}
