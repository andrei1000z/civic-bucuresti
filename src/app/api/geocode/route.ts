import { NextResponse } from "next/server";
import { reverseGeocode } from "@/lib/geo/reverse-geocode";
import { rateLimitAsync, getClientIp } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

/**
 * GET /api/geocode?lat=44.43&lng=26.10
 * Reverse geocode coordinates → county + locality + sector.
 * Rate limited to respect Nominatim policy (1 req/sec per IP).
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));

  if (isNaN(lat) || isNaN(lng) || lat < 43.5 || lat > 48.3 || lng < 20.2 || lng > 29.7) {
    return NextResponse.json({ error: "Coordonate invalide (România: 43.5-48.3°N, 20.2-29.7°E)" }, { status: 400 });
  }

  // Rate limit: 2 req/sec per IP (Nominatim allows 1/sec, we buffer)
  const ip = getClientIp(req);
  const rl = await rateLimitAsync(`geocode:${ip}`, { limit: 2, windowMs: 1000 });
  if (!rl.success) {
    return NextResponse.json({ error: "Prea rapid — așteaptă o secundă" }, { status: 429 });
  }

  const result = await reverseGeocode(lat, lng);
  return NextResponse.json(
    { data: result },
    { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600" } }
  );
}
