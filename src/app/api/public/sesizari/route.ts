import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 120;

// Public API — CORS enabled for third-party civic apps, journalists, researchers
// GET /api/public/sesizari?status=nou&sector=S3&limit=100

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const sector = searchParams.get("sector");
  const tip = searchParams.get("tip");
  const limit = Math.min(Number(searchParams.get("limit") ?? 50), 500);
  const offset = Number(searchParams.get("offset") ?? 0);

  try {
    const supabase = await createSupabaseServer();
    let query = supabase
      .from("sesizari_feed")
      .select("code, titlu, descriere, locatie, sector, lat, lng, tip, status, created_at, voturi_net, nr_comentarii")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) query = query.eq("status", status);
    if (sector) query = query.eq("sector", sector);
    if (tip) query = query.eq("tip", tip);

    const { data, error } = await query;
    if (error) throw error;

    return new NextResponse(JSON.stringify({
      data: data ?? [],
      meta: {
        count: data?.length ?? 0,
        limit,
        offset,
        license: "CC BY 4.0 — free to use with attribution to Civia",
        docs: "https://civia.ro/api-docs",
      },
    }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, s-maxage=120, stale-while-revalidate=60",
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500, headers: { "Access-Control-Allow-Origin": "*" } });
  }
}
