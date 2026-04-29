import { NextResponse, after } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { rateLimitAsync, getClientIp } from "@/lib/ratelimit";
import { allowedSourcesForView } from "@/lib/stiri/sources";
import { analyticsRedis } from "@/lib/analytics/redis";

// 30s cache — paired with client polling at the same cadence so the
// /stiri page surfaces freshly-fetched RSS articles within ~30s.
export const revalidate = 30;

// Self-healing background refresh: when the /stiri page is being viewed,
// kick off /api/stiri/fetch in the background — but throttled so at most
// one fetch happens every 5 minutes regardless of how many tabs are
// polling. The lock is a Redis NX SET; only the first request after the
// TTL expires acquires it. RSS feeds get hit politely; the daily Vercel
// cron remains the floor.
const FETCH_LOCK_KEY = "civia:stiri:fetch-lock";
const FETCH_LOCK_TTL_S = 5 * 60;

async function maybeTriggerBackgroundFetch() {
  if (!analyticsRedis) return;
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return;
  const lock = await analyticsRedis.set(FETCH_LOCK_KEY, Date.now(), {
    nx: true,
    ex: FETCH_LOCK_TTL_S,
  });
  if (lock !== "OK") return; // Someone else just triggered (or is in-flight)
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://civia.ro";
    await fetch(`${baseUrl}/api/stiri/fetch`, {
      method: "POST",
      headers: { Authorization: `Bearer ${cronSecret}` },
      signal: AbortSignal.timeout(60_000),
    });
  } catch {
    // Background failure — let next stale read retry.
  }
}

export async function GET(req: Request) {
  const rl = await rateLimitAsync(`stiri:${getClientIp(req)}`, { limit: 120, windowMs: 60_000 });
  if (!rl.success) return NextResponse.json({ error: "Prea multe cereri" }, { status: 429 });

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const county = searchParams.get("county");
  const limit = Math.min(Number(searchParams.get("limit") ?? 50), 200);
  const search = (searchParams.get("q") ?? "").replace(/[,()%*]/g, "").slice(0, 64);

  // Source tier filtering: national-only on /stiri, national + local houses
  // on /[judet]/stiri. Driven entirely by the `source` column — local houses
  // are mapped to counties in src/lib/stiri/sources.ts.
  const allowedSources = allowedSourcesForView(county);

  try {
    const supabase = await createSupabaseServer();
    let query = supabase
      .from("stiri_cache")
      .select("*")
      .in("source", allowedSources)
      .order("published_at", { ascending: false })
      .limit(limit);

    if (category && category !== "all") query = query.eq("category", category);
    if (search) query = query.ilike("title", `%${search}%`);

    const { data, error } = await query;
    if (error) throw error;

    // Fire the throttled background RSS refresh AFTER the response is
    // sent — Next 16 `after()` keeps the function instance alive long
    // enough for the trigger fetch to leave the box. The lock makes
    // sure traffic spikes don't translate to RSS feed hammering.
    after(maybeTriggerBackgroundFetch);

    return NextResponse.json(
      { data: data ?? [] },
      { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" } },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
