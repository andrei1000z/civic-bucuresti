import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { ALL_COUNTIES } from "@/data/counties";
import { ghiduri } from "@/data/ghiduri";
import { evenimente } from "@/data/evenimente";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export const revalidate = 3600; // hourly

const COUNTY_PAGES = [
  "", "/sesizari", "/aer", "/harti", "/statistici", "/stiri", "/ghiduri",
  "/autoritati", "/bilete", "/evenimente", "/istoric", "/cum-functioneaza",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const base = SITE_URL;

  // Static global pages
  const globalRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${base}/judete`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/legal/confidentialitate`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/legal/termeni`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  // Per-county pages: 42 counties × 8 pages = 336 URLs
  const countyRoutes: MetadataRoute.Sitemap = ALL_COUNTIES.flatMap((c) =>
    COUNTY_PAGES.map((page) => ({
      url: `${base}/${c.slug}${page}`,
      lastModified: now,
      changeFrequency: (page === "" ? "daily" : "weekly") as "daily" | "weekly",
      priority: page === "" ? 0.9 : 0.7,
    }))
  );

  // Legacy pages that still exist
  const legacyRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/sesizari`, lastModified: now, changeFrequency: "hourly", priority: 0.8 },
    { url: `${base}/aer`, lastModified: now, changeFrequency: "hourly", priority: 0.8 },
    { url: `${base}/harti`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/stiri`, lastModified: now, changeFrequency: "hourly", priority: 0.8 },
    { url: `${base}/ghiduri`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/statistici`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${base}/bilete`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/impact`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/cum-functioneaza`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/evenimente`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/istoric`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];

  // Ghiduri
  const ghiduriRoutes: MetadataRoute.Sitemap = ghiduri.map((g) => ({
    url: `${base}/ghiduri/${g.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // Evenimente
  const evenimenteRoutes: MetadataRoute.Sitemap = evenimente.map((e) => ({
    url: `${base}/evenimente/${e.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  // Dynamic sesizari
  let sesizariRoutes: MetadataRoute.Sitemap = [];
  try {
    const admin = createSupabaseAdmin();
    const { data } = await admin
      .from("sesizari")
      .select("code, updated_at")
      .eq("publica", true)
      .eq("moderation_status", "approved")
      .order("created_at", { ascending: false })
      .limit(500);
    if (data) {
      sesizariRoutes = (data as { code: string; updated_at: string }[])
        .filter((s) => s.updated_at && !isNaN(new Date(s.updated_at).getTime()))
        .map((s) => ({
          url: `${base}/sesizari/${s.code}`,
          lastModified: new Date(s.updated_at),
          changeFrequency: "weekly" as const,
          priority: 0.5,
        }));
    }
  } catch {}

  return [
    ...globalRoutes,
    ...countyRoutes,
    ...legacyRoutes,
    ...ghiduriRoutes,
    ...evenimenteRoutes,
    ...sesizariRoutes,
  ];
}
