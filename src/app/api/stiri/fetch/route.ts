import { NextResponse } from "next/server";
import { fetchAllFeeds } from "@/lib/stiri/rss";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST() {
  try {
    const articles = await fetchAllFeeds();
    if (articles.length === 0) {
      return NextResponse.json({ data: { inserted: 0, total: 0 } });
    }

    const supabase = createSupabaseAdmin();
    const { error, count } = await supabase
      .from("stiri_cache")
      .upsert(articles, { onConflict: "url", ignoreDuplicates: true, count: "exact" });

    if (error) throw error;

    return NextResponse.json({
      data: {
        total: articles.length,
        inserted: count ?? 0,
        sources: [...new Set(articles.map((a) => a.source))],
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Fetch failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
