import { NextResponse, after } from "next/server";
import type { NextRequest } from "next/server";
import { rateLimitAsync, getClientIp } from "@/lib/ratelimit";
import { loadInterruptions } from "@/lib/intreruperi/store";
import {
  getCachedBuildings,
  warmBuildingsBackground,
  type BuildingPolygon,
  type WarmTarget,
} from "@/lib/intreruperi/buildings";

// Hot path: cache reads only. Background warming runs after the
// response is sent, so a 5s budget is plenty.
export const maxDuration = 10;
export const revalidate = 0;

/**
 * GET /api/intreruperi/buildings?ids=a,b,c
 *
 * Returns OSM building polygons for each outage id, scoped to the
 * outage's affected radius (computed the same way the map renders
 * the colored circle). Two-phase design:
 *
 *   1. Read cache for all requested IDs in parallel — instant.
 *   2. For cache misses, queue background warming via `after()` with
 *      a per-outage NX lock so concurrent viewers don't trigger
 *      duplicate Overpass requests. The next viewer (or a re-poll
 *      from the same viewer ~10s later) sees the freshly cached
 *      polygons.
 *
 * Empty array per ID = either no buildings nearby, no coordinates,
 * or warming hasn't completed yet. Caller (IntreruperiMap) keeps the
 * colored Circle as fallback and polls again to fill in late arrivals.
 *
 * Response shape:
 *   { data: { [id]: { coords: [[lat,lng],...] }[] }, warming: number }
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
    .slice(0, 30); // viewport rarely shows more than ~20 outages
  if (ids.length === 0) {
    return NextResponse.json({ data: {}, warming: 0 });
  }

  const { items } = await loadInterruptions();
  const byId = new Map(items.map((i) => [i.id, i]));

  // Build a target list (id + lat/lng/radius) for the IDs that have
  // coordinates. Skip outages without coords entirely — neither cache
  // nor warming applies.
  const targets: WarmTarget[] = [];
  for (const id of ids) {
    const item = byId.get(id);
    if (!item || item.lat == null || item.lng == null) continue;
    const population = item.affectedPopulation ?? item.addresses.length * 200;
    // Same radius formula as IntreruperiMap.tsx so the polygon set
    // matches the colored circle exactly.
    const radiusM = Math.max(
      200,
      Math.min(2500, Math.round(150 * Math.sqrt(population / 1000))),
    );
    targets.push({ id, lat: item.lat, lng: item.lng, radiusM });
  }

  // Phase 1 — parallel cache reads. Each is one Redis GET; ~30 total
  // settles in well under 1s.
  const out: Record<string, BuildingPolygon[]> = {};
  await Promise.all(
    targets.map(async (t) => {
      const cached = await getCachedBuildings(t.id);
      out[t.id] = cached ?? [];
    }),
  );

  // Phase 2 — fire background warming for cache misses. NX locks
  // inside warmBuildingsBackground dedupe across concurrent viewers,
  // so we can safely fire this on every request without overloading
  // Overpass. Runs after the response is sent → no API latency cost.
  const cold = targets.filter((t) => out[t.id]!.length === 0);
  if (cold.length > 0) {
    after(async () => {
      await warmBuildingsBackground(cold);
    });
  }

  return NextResponse.json(
    { data: out, warming: cold.length },
    {
      headers: {
        // Short CDN cache so polling reflects newly-warmed buildings
        // within ~30s. Long SWR matches the underlying Redis 24h TTL.
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=82800",
      },
    },
  );
}
