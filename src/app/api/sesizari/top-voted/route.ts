import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { rateLimitAsync, getClientIp } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const rl = await rateLimitAsync(`top-voted:${getClientIp(req)}`, { limit: 60, windowMs: 60_000 });
  if (!rl.success) {
    return NextResponse.json({ error: "Prea rapid" }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? 10), 50);
  try {
    const supabase = await createSupabaseServer();
    const { data, error } = await supabase
      .from("sesizari_feed")
      .select("*")
      .in("status", ["nou", "in-lucru"])
      .order("voturi_net", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return NextResponse.json(
      { data: data ?? [] },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" } }
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
