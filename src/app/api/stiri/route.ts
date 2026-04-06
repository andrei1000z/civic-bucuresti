import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

export const revalidate = 300; // 5 min cache

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const limit = Math.min(Number(searchParams.get("limit") ?? 50), 200); // cap at 200
  const search = (searchParams.get("q") ?? "").replace(/[,()%*]/g, "").slice(0, 64); // sanitize for .ilike

  try {
    const supabase = await createSupabaseServer();
    let query = supabase
      .from("stiri_cache")
      .select("*")
      .order("published_at", { ascending: false })
      .limit(limit);

    if (category && category !== "all") query = query.eq("category", category);
    if (search) query = query.ilike("title", `%${search}%`);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json(
      { data: data ?? [] },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=120" } }
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
