import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getActiveInterruptions, INTRERUPERI } from "@/data/intreruperi";

export const revalidate = 1800;

/**
 * GET /api/intreruperi
 *   ?county=CJ          — filtrează pe județ
 *   ?type=apa           — filtrează pe tip (apa|caldura|gaz|electricitate|lucrari-strazi)
 *   ?active=1           — doar cele active (neterminate)
 *   ?lat=44.43&lng=26.1&radius_km=5 — bounding-circle distance filter
 *
 * Cache: 30 min (revalidate).
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const county = searchParams.get("county")?.toUpperCase();
  const type = searchParams.get("type");
  const activeOnly = searchParams.get("active") === "1";
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));
  const radius = Number(searchParams.get("radius_km"));

  let list = activeOnly ? getActiveInterruptions() : INTRERUPERI;

  if (county) list = list.filter((i) => i.county.toUpperCase() === county);
  if (type) list = list.filter((i) => i.type === type);

  if (!isNaN(lat) && !isNaN(lng) && !isNaN(radius) && radius > 0) {
    const R = 6371;
    const toRad = (x: number) => (x * Math.PI) / 180;
    list = list.filter((i) => {
      if (i.lat == null || i.lng == null) return false;
      const dLat = toRad(i.lat - lat);
      const dLng = toRad(i.lng - lng);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat)) * Math.cos(toRad(i.lat)) * Math.sin(dLng / 2) ** 2;
      const dist = 2 * R * Math.asin(Math.sqrt(a));
      return dist <= radius;
    });
  }

  return NextResponse.json(
    { data: list, count: list.length, updated_at: new Date().toISOString() },
    {
      headers: {
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
      },
    },
  );
}
