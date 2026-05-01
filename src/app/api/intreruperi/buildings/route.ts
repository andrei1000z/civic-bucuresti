import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { rateLimitAsync, getClientIp } from "@/lib/ratelimit";
import { loadInterruptions } from "@/lib/intreruperi/store";
import { getBuildingsForOutage, type BuildingPolygon } from "@/lib/intreruperi/buildings";

// Heavy upstream (Overpass) but cached 24h per outage. Budget the
// route up to 25s for the rare cold path.
export const maxDuration = 30;
export const revalidate = 0;

/**
 * GET /api/intreruperi/buildings?ids=a,b,c
 *
 * Returns OSM building polygons for each outage id, scoped to the
 * outage's affected radius (computed the same way the map renders
 * the colored circle). Empty array means the outage has no
 * coordinates, no buildings nearby, or Overpass timed out — caller
 * keeps the colored circle as fallback.
 *
 * Response shape:
 *   { data: { [id]: { coords: [[lat,lng],...] }[] } }
 */
export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = await rateLimitAsync(`intreruperi-buildings:${ip}`, {
    limit: 60,
    windowMs: 60_000,
  });
  if (!rl.success) {
    return NextResponse.json({ error: "Rate limit" }, { status: 429 });
  }

  const idsParam = req.nextUrl.searchParams.get("ids") ?? "";
  const ids = idsParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 30); // hard cap — viewport rarely shows more than ~20 outages
  if (ids.length === 0) {
    return NextResponse.json({ data: {} });
  }

  const { items } = await loadInterruptions();
  const byId = new Map(items.map((i) => [i.id, i]));

  // Run the building lookups in parallel. Each one resolves
  // independently from cache (fast) or Overpass (5-10s); whichever
  // is slowest paces the whole response. Never throws — falls back
  // to empty array per outage.
  const out: Record<string, BuildingPolygon[]> = {};
  const results = await Promise.all(
    ids.map(async (id) => {
      const item = byId.get(id);
      if (!item || item.lat == null || item.lng == null)
        return [id, [] as BuildingPolygon[]] as const;
      const population = item.affectedPopulation ?? item.addresses.length * 200;
      // Same radius formula as IntreruperiMap.tsx so the polygon set
      // matches the colored circle exactly.
      const radiusM = Math.max(
        200,
        Math.min(2500, Math.round(150 * Math.sqrt(population / 1000))),
      );
      const buildings = await getBuildingsForOutage(id, item.lat, item.lng, radiusM);
      return [id, buildings] as const;
    }),
  );
  for (const [id, b] of results) out[id] = b;

  return NextResponse.json(
    { data: out },
    {
      headers: {
        // Caller is the browser via /intreruperi map; CDN-cache for
        // 1h since buildings essentially don't change. SWR another
        // 23h matches the Redis TTL.
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=82800",
      },
    },
  );
}
