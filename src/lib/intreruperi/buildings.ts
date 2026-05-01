/**
 * OpenStreetMap building footprint lookup for outage areas.
 *
 * For each outage with a (lat, lng, radius) we query the public
 * Overpass API for every `building=*` way inside that disc and return
 * the polygons. The map then paints each building in the outage's
 * type color — so users see "this exact block has no water" instead
 * of a vague colored circle.
 *
 * Costs:
 *   - ~5-10s per Overpass query (slow upstream, single shared node)
 *   - Building data is essentially static (changes once a year for a
 *     given block), so cache aggressively in Redis (24h TTL).
 *   - Falls back to empty array on failure — the existing colored
 *     circle still renders, so the page doesn't degrade visibly.
 *
 * Why server-side: Overpass is rate-limited per IP and applies CORS
 * preflight checks that are friendlier to a single backend. Doing it
 * client-side would (a) risk users hitting rate limits when refreshing
 * (b) break on iOS Safari which is strict about CORS preflights.
 */

import { analyticsRedis } from "@/lib/analytics/redis";

export interface BuildingPolygon {
  /** Outer ring of [lat, lng] pairs. Closed (first === last). */
  coords: Array<[number, number]>;
}

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.openstreetmap.fr/api/interpreter",
];

/** Max buildings we'll keep per outage. Past 600 the polygon list
 *  starts to choke the map render on mid-range Android. Outages
 *  affecting more than 600 blocks are rare; on those we fall back
 *  to the colored Circle alone. */
const MAX_BUILDINGS = 600;

interface OverpassWay {
  type: "way";
  geometry?: Array<{ lat: number; lon: number }>;
}

/**
 * Round to ~5m precision (5 decimal places ≈ 1.1m at equator).
 * Keeps the JSON payload small without visibly degrading the polygon.
 */
function roundCoord(n: number): number {
  return Math.round(n * 1e5) / 1e5;
}

async function queryOverpass(
  lat: number,
  lng: number,
  radiusM: number,
): Promise<BuildingPolygon[]> {
  // Overpass QL — get every `building` way inside the disc, with
  // its full geometry attached. `out geom` includes coordinates so
  // we don't need a follow-up query.
  const ql = `[out:json][timeout:20];(way["building"](around:${radiusM},${lat},${lng}););out geom ${MAX_BUILDINGS};`;

  // Try each endpoint in order — primary often rate-limits during
  // peak hours. If all three fail we return [] and the map still
  // renders the colored Circle.
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `data=${encodeURIComponent(ql)}`,
        signal: AbortSignal.timeout(25_000),
      });
      if (!res.ok) continue;
      const data = (await res.json()) as { elements: OverpassWay[] };
      const out: BuildingPolygon[] = [];
      for (const el of data.elements ?? []) {
        if (el.type !== "way" || !el.geometry || el.geometry.length < 3) continue;
        const coords: Array<[number, number]> = el.geometry.map(
          (p) => [roundCoord(p.lat), roundCoord(p.lon)] as [number, number],
        );
        out.push({ coords });
        if (out.length >= MAX_BUILDINGS) break;
      }
      return out;
    } catch {
      // try next endpoint
    }
  }
  return [];
}

/**
 * Get building polygons for an outage. Result cached in Redis under
 * `civia:intreruperi:buildings:<outage-id>` for 24h. The first user
 * to view an outage on the map pays the Overpass cost (5-10s);
 * everyone else gets it instantly.
 */
export async function getBuildingsForOutage(
  outageId: string,
  lat: number,
  lng: number,
  radiusM: number,
): Promise<BuildingPolygon[]> {
  const key = `civia:intreruperi:buildings:${outageId}`;
  if (analyticsRedis) {
    try {
      const cached = await analyticsRedis.get<BuildingPolygon[]>(key);
      if (cached && Array.isArray(cached)) return cached;
    } catch {
      // Redis hiccup — fall through to fresh query.
    }
  }
  const fresh = await queryOverpass(lat, lng, radiusM);
  if (analyticsRedis && fresh.length > 0) {
    try {
      // 24h TTL — buildings are nearly static. If a building is
      // demolished mid-day, the next user 24h later picks up the
      // change. Worth the rare staleness for the cache hit rate.
      await analyticsRedis.set(key, fresh, { ex: 24 * 60 * 60 });
    } catch {
      // Cache write failure is silent — the result is still returned.
    }
  }
  return fresh;
}
