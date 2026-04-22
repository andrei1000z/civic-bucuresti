import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { rateLimitAsync, getClientIp } from "@/lib/ratelimit";

export const revalidate = 86400; // 24h cache

/**
 * GET /api/localities?county=CJ&q=cluj&limit=20
 * Search localities by county and/or name (autocomplete).
 */
export async function GET(req: Request) {
  const rl = await rateLimitAsync(`localities:${getClientIp(req)}`, { limit: 120, windowMs: 60_000 });
  if (!rl.success) return NextResponse.json({ error: "Prea multe cereri" }, { status: 429 });

  const { searchParams } = new URL(req.url);
  const county = searchParams.get("county");
  const q = (searchParams.get("q") ?? "").trim();
  const limit = Math.min(Number(searchParams.get("limit") ?? 20), 100);

  try {
    const supabase = await createSupabaseServer();
    let query = supabase
      .from("localities")
      .select("id, name, type, county_id, lat, lng, population")
      .order("population", { ascending: false, nullsFirst: false })
      .limit(limit);

    if (county) query = query.eq("county_id", county.toUpperCase());
    if (q.length >= 2) query = query.ilike("name", `%${q.replace(/[%_]/g, "")}%`);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(
      { data: data ?? [] },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
        },
      }
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
