/**
 * Cross-page cached DB queries.
 *
 * Goal: eliminate duplicate Supabase round-trips when two pages (or two components
 * on the same page) ask for the same data — e.g. the homepage LiveStatsBar and the
 * /impact dashboard both want `total sesizari count`, Navbar may query AQI, etc.
 *
 * Mechanism: Next.js `unstable_cache` deduplicates based on the arguments and
 * caches the result across requests with a TTL + optional tag for manual
 * invalidation. Much cheaper than force-dynamic DB reads.
 *
 * Usage: import and call just like a normal async function. The cache layer is
 * transparent. Call `revalidateTag("sesizari-stats")` (from a mutation handler)
 * to invalidate.
 */

import { unstable_cache, revalidateTag } from "next/cache";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

/** Aggregated sesizari counts — used on home, /impact, /statistici, Navbar */
export const getSesizariStatsCached = unstable_cache(
  async () => {
    const admin = createSupabaseAdmin();
    const todayIso = new Date(Date.now() - 24 * 60 * 60_000).toISOString();

    const [total, today, inLucru, rezolvate] = await Promise.all([
      admin.from("sesizari").select("*", { count: "exact", head: true }).eq("moderation_status", "approved"),
      admin
        .from("sesizari")
        .select("*", { count: "exact", head: true })
        .eq("moderation_status", "approved")
        .gte("created_at", todayIso),
      admin
        .from("sesizari")
        .select("*", { count: "exact", head: true })
        .eq("moderation_status", "approved")
        .eq("status", "in-lucru"),
      admin
        .from("sesizari")
        .select("*", { count: "exact", head: true })
        .eq("moderation_status", "approved")
        .eq("status", "rezolvat"),
    ]);

    return {
      total: total.count ?? 0,
      today: today.count ?? 0,
      inLucru: inLucru.count ?? 0,
      rezolvate: rezolvate.count ?? 0,
    };
  },
  ["sesizari-stats"],
  { revalidate: 300, tags: ["sesizari-stats"] }
);

/** Top voted sesizari — home widget + /impact */
export const getTopVotedCached = unstable_cache(
  async (limit = 6) => {
    const admin = createSupabaseAdmin();
    const { data } = await admin
      .from("sesizari_feed")
      .select("code, titlu, locatie, sector, voturi_net, status, tip, nr_comentarii")
      .eq("publica", true)
      .order("voturi_net", { ascending: false })
      .limit(limit);
    return data ?? [];
  },
  ["sesizari-top-voted"],
  { revalidate: 300, tags: ["sesizari-stats"] }
);

/** County-level sesizari counts (sum per county) — used on /impact + county pages */
export const getSesizariByCountyCached = unstable_cache(
  async () => {
    const admin = createSupabaseAdmin();
    const { data } = await admin
      .from("sesizari")
      .select("county, status")
      .eq("moderation_status", "approved")
      .limit(5000);

    const map = new Map<string, { count: number; resolved: number }>();
    for (const r of (data ?? []) as { county: string | null; status: string }[]) {
      if (!r.county) continue;
      const prev = map.get(r.county) ?? { count: 0, resolved: 0 };
      prev.count += 1;
      if (r.status === "rezolvat") prev.resolved += 1;
      map.set(r.county, prev);
    }
    return [...map.entries()]
      .map(([county, v]) => ({ county, ...v }))
      .sort((a, b) => b.count - a.count);
  },
  ["sesizari-by-county"],
  { revalidate: 300, tags: ["sesizari-stats"] }
);

/** County-level metadata (name, authorities, latest sesizari) — expensive combined query */
export const getCountyOverviewCached = unstable_cache(
  async (countyId: string) => {
    const admin = createSupabaseAdmin();
    const id = countyId.toUpperCase();
    const [county, authorities, sesizari] = await Promise.all([
      admin.from("counties").select("*").eq("id", id).maybeSingle(),
      admin.from("authorities").select("*").eq("county_id", id).order("type"),
      admin
        .from("sesizari")
        .select("code, titlu, status, tip, created_at")
        .eq("county", id)
        .eq("moderation_status", "approved")
        .eq("publica", true)
        .order("created_at", { ascending: false })
        .limit(10),
    ]);
    return {
      county: county.data,
      authorities: authorities.data ?? [],
      sesizari: sesizari.data ?? [],
    };
  },
  ["county-overview"],
  { revalidate: 300, tags: ["county-overview", "sesizari-stats"] }
);

/**
 * Call from mutation handlers (create sesizare, vote, moderate, etc.) to bust
 * the cache immediately for everyone. Without this, cached data stays stale
 * until the TTL expires.
 */
export function invalidateSesizariCache() {
  // `profile: "max"` enables stale-while-revalidate semantics — visitors keep
  // seeing the previous (fast) value while the next pageview refreshes it.
  // Wrapped in try-catch because revalidateTag can throw at build time or
  // in unusual runtime contexts; a cache miss is acceptable, a crashing
  // mutation route is not.
  try {
    revalidateTag("sesizari-stats", "max");
  } catch (err) {
    // Intentionally swallowed. Worst case: stats are stale for up to the
    // TTL window (5 min). The mutation itself already succeeded.
    if (process.env.NODE_ENV !== "production") {
      console.warn("[cache] invalidateSesizariCache failed:", err);
    }
  }
}
