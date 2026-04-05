import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { evenimente } from "@/data/evenimente";
import { ghiduri } from "@/data/ghiduri";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE_URL}/harti`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/sesizari`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${SITE_URL}/bilete`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/statistici`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/stiri`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${SITE_URL}/istoric`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/cum-functioneaza`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/ghiduri`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/evenimente`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
  ];

  const ghiduriRoutes: MetadataRoute.Sitemap = ghiduri.map((g) => ({
    url: `${SITE_URL}/ghiduri/${g.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const evenimenteRoutes: MetadataRoute.Sitemap = evenimente.map((e) => ({
    url: `${SITE_URL}/evenimente/${e.slug}`,
    lastModified: new Date(e.data),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...ghiduriRoutes, ...evenimenteRoutes];
}
