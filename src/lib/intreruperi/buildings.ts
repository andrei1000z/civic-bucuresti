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

// Endpoint order matters: kumi.systems first because it's a private
// volunteer mirror with way less traffic than the official one, so
// it almost never rate-limits. Official .de second as a strong
// backup. .fr third — slow but works when the others throttle.
const OVERPASS_ENDPOINTS = [
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass-api.de/api/interpreter",
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

  // Try each endpoint in order — primary may rate-limit. If all fail
  // we return [] and the map still renders the colored Circle.
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `data=${encodeURIComponent(ql)}`,
        signal: AbortSignal.timeout(25_000),
      });
      // 429 / 504 / 503 — rate-limited or upstream issue, try next
      // mirror. Status 200 doesn't mean success: Overpass returns
      // 200 with a `remark` field describing soft errors (slot limit,
      // runtime error). Empty `elements` with a `remark` is a soft
      // fail; try the next endpoint instead of caching empty.
      if (!res.ok) continue;
      const ctype = res.headers.get("content-type") ?? "";
      if (!ctype.includes("json")) continue; // HTML error page
      const data = (await res.json()) as {
        elements?: OverpassWay[];
        remark?: string;
      };
      if (data.remark && (!data.elements || data.elements.length === 0)) {
        // soft-fail — try next endpoint instead of caching empty
        continue;
      }
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

function buildingKey(outageId: string): string {
  return `civia:intreruperi:buildings:${outageId}`;
}

/**
 * Get building polygons for an outage. Result cached in Redis for 24h.
 * Only hits Overpass on cache miss. The cache is pre-warmed by the
 * 6h refresh cron (warmBuildingsForOutages below) so users almost
 * never pay the Overpass latency on a page load.
 */
export async function getBuildingsForOutage(
  outageId: string,
  lat: number,
  lng: number,
  radiusM: number,
): Promise<BuildingPolygon[]> {
  const key = buildingKey(outageId);
  if (analyticsRedis) {
    try {
      const cached = await analyticsRedis.get<BuildingPolygon[]>(key);
      if (cached && Array.isArray(cached) && cached.length > 0) return cached;
    } catch {
      // Redis hiccup — fall through to fresh query.
    }
  }
  const fresh = await queryOverpass(lat, lng, radiusM);
  if (analyticsRedis && fresh.length > 0) {
    try {
      await analyticsRedis.set(key, fresh, { ex: 24 * 60 * 60 });
    } catch {
      // Cache write failure is silent — result still returned to caller.
    }
  }
  return fresh;
}

interface WarmTarget {
  id: string;
  lat: number;
  lng: number;
  radiusM: number;
}

/**
 * Pre-warm the Redis building cache for a list of outages. Serialized
 * with a 600ms gap between requests so we stay polite to Overpass
 * (the public mirrors throttle at ~1 req/s per IP). Idempotent: if
 * the cache already has the buildings, the lookup is instant and
 * Overpass is never called.
 *
 * Called by /api/intreruperi/refresh after the scrape completes so
 * the building polygons are ready by the time the next user views
 * the map. Returns counts so the cron can report what got warmed.
 */
export async function warmBuildingsForOutages(
  targets: ReadonlyArray<WarmTarget>,
): Promise<{ warmed: number; skipped: number; total: number }> {
  let warmed = 0;
  let skipped = 0;
  for (const t of targets) {
    if (analyticsRedis) {
      try {
        const cached = await analyticsRedis.get<BuildingPolygon[]>(buildingKey(t.id));
        if (cached && Array.isArray(cached) && cached.length > 0) {
          skipped++;
          continue;
        }
      } catch {
        // Redis hiccup — re-query upstream.
      }
    }
    const fresh = await queryOverpass(t.lat, t.lng, t.radiusM);
    if (fresh.length > 0 && analyticsRedis) {
      try {
        await analyticsRedis.set(buildingKey(t.id), fresh, { ex: 24 * 60 * 60 });
        warmed++;
      } catch {
        // Silent — next viewer will retry.
      }
    }
    // Be polite to Overpass: 1500ms between cold requests. Public
    // mirrors enforce a slot-based limit (1-2 concurrent slots per
    // IP with a few seconds of cooldown). 1.5s sustained is well
    // under the threshold and lets all 22-50 outages succeed in
    // a single warm pass instead of 19/22 timing out.
    await new Promise((r) => setTimeout(r, 1500));
  }
  return { warmed, skipped, total: targets.length };
}
