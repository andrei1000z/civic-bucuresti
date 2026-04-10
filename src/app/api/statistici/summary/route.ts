import { NextResponse } from "next/server";
import { getSesizariStatsCached } from "@/lib/cached-queries";

export const revalidate = 300;

/**
 * Lightweight count-based summary for homepage widgets.
 * Shares an in-memory cache with /impact and other callers — a single
 * stats pull serves all of them within the TTL window.
 */
export async function GET() {
  try {
    const data = await getSesizariStatsCached();
    return NextResponse.json(
      { data },
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
