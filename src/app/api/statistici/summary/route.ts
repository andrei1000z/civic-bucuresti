import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const revalidate = 300; // 5 minutes

/**
 * Lightweight count-based summary for homepage widgets.
 * Returns totals WITHOUT fetching row data.
 */
export async function GET() {
  try {
    const admin = createSupabaseAdmin();

    const todayIso = new Date(Date.now() - 24 * 60 * 60_000).toISOString();

    const [total, today, inLucru, rezolvate] = await Promise.all([
      admin
        .from("sesizari")
        .select("*", { count: "exact", head: true })
        .eq("moderation_status", "approved"),
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

    return NextResponse.json(
      {
        data: {
          total: total.count ?? 0,
          today: today.count ?? 0,
          inLucru: inLucru.count ?? 0,
          rezolvate: rezolvate.count ?? 0,
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
        },
      }
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
