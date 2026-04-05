import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const limit = Number(searchParams.get("limit") ?? 50);
  const search = searchParams.get("q");

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
    return NextResponse.json({ data: data ?? [] });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
