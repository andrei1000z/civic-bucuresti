import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { rateLimitAsync, getClientIp } from "@/lib/ratelimit";
import { allowedSourcesForView } from "@/lib/stiri/sources";

export const revalidate = 300; // 5 min cache

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
    return NextResponse.json(
      { data: data ?? [] },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=120" } },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
