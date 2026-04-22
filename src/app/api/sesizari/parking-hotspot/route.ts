import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { rateLimitAsync, getClientIp } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

// Haversine distance in meters — tight enough for in-memory filtering
// after a bounding-box prefilter in Postgres. We don't need PostGIS here.
function distanceMeters(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const s1 =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s1));
}

/**
 * GET /api/sesizari/parking-hotspot?lat=..&lng=..&exclude=CODE
 *
 * Returns the count + codes of prior "parcare" sesizări within 50m of
 * the given point. Used by the ParkingHotspotModal after a successful
 * submit to decide whether to offer the "Cere bolarzi de la ASPMB"
 * upsell. Excludes the just-created sesizare (passed as `exclude`) so
 * the current report doesn't self-count.
 *
 * Public endpoint (no auth) — the feed view already filters to
 * moderation_status='approved' + publica=true so we're only exposing
 * data that's already on the public map.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const lat = parseFloat(url.searchParams.get("lat") ?? "");
  const lng = parseFloat(url.searchParams.get("lng") ?? "");
  const exclude = (url.searchParams.get("exclude") ?? "").trim().toUpperCase();

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: "lat/lng required" }, { status: 400 });
  }

  // IP ceiling so this can't be used for bulk map-scraping.
  const rl = await rateLimitAsync(`parking-hotspot:${getClientIp(req)}`, {
    limit: 30,
    windowMs: 60_000,
  });
  if (!rl.success) {
    return NextResponse.json({ error: "Prea multe cereri" }, { status: 429 });
  }

  // ~50m = 0.00045° lat; at Bucharest latitude (44.4°) the lng multiplier
  // is cos(44.4°) ≈ 0.715, so we widen the lng window a bit.
  const LAT_PAD = 0.0006;
  const LNG_PAD = 0.0009;

  const admin = createSupabaseAdmin();
  const { data, error } = await admin
    .from("sesizari_feed")
    .select("code, lat, lng, locatie, titlu")
    .eq("tip", "parcare")
    .gte("lat", lat - LAT_PAD)
    .lte("lat", lat + LAT_PAD)
    .gte("lng", lng - LNG_PAD)
    .lte("lng", lng + LNG_PAD)
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const nearby = (data ?? [])
    .filter((r) => r.lat != null && r.lng != null)
    .filter((r) => {
      if (exclude && r.code?.toUpperCase() === exclude) return false;
      return distanceMeters(lat, lng, r.lat, r.lng) <= 50;
    })
    .sort((a, b) => distanceMeters(lat, lng, a.lat, a.lng) - distanceMeters(lat, lng, b.lat, b.lng));

  return NextResponse.json({
    data: {
      count: nearby.length,
      codes: nearby.map((r) => r.code),
      sample: nearby.slice(0, 3).map((r) => ({ code: r.code, titlu: r.titlu, locatie: r.locatie })),
      threshold: 3,
      isHotspot: nearby.length >= 3,
    },
  });
}
