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

function warmingLockKey(outageId: string): string {
  return `civia:intreruperi:buildings:warming:${outageId}`;
}

/**
 * Read polygons for an outage from Redis. Returns null on cache miss
 * (or Redis hiccup) — the caller decides whether to trigger warming.
 * Never queries Overpass; safe to call on the hot path for every
 * outage in a viewport without rate-limit risk.
 */
export async function getCachedBuildings(
  outageId: string,
): Promise<BuildingPolygon[] | null> {
  if (!analyticsRedis) return null;
  try {
    const cached = await analyticsRedis.get<BuildingPolygon[]>(buildingKey(outageId));
    if (cached && Array.isArray(cached) && cached.length > 0) return cached;
  } catch {
    // Redis hiccup — treat as miss.
  }
  return null;
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
  const cached = await getCachedBuildings(outageId);
  if (cached) return cached;
  const fresh = await queryOverpass(lat, lng, radiusM);
  if (analyticsRedis && fresh.length > 0) {
    try {
      await analyticsRedis.set(buildingKey(outageId), fresh, { ex: 24 * 60 * 60 });
    } catch {
      // Cache write failure is silent — result still returned to caller.
    }
  }
  return fresh;
}

export interface WarmTarget {
  id: string;
  lat: number;
  lng: number;
  radiusM: number;
}

/**
 * Background-warm a list of outages with cross-request deduplication.
 *
 * Each outage gets a Redis NX lock with 60s TTL — if 5 viewers all
 * trigger warming for the same outage at once, only the first
 * acquires the lock and queries Overpass; the rest skip. This lets
 * us safely call this from `after()` on every map load without
 * fanning out Overpass requests.
 *
 * Errors are swallowed — the next viewer will retry. Designed to be
 * fired from `after()` (Next 16 background-after) so it never delays
 * the API response.
 */
export async function warmBuildingsBackground(
  targets: ReadonlyArray<WarmTarget>,
): Promise<void> {
  if (targets.length === 0 || !analyticsRedis) return;
  for (const t of targets) {
    let acquired = false;
    try {
      // Upstash returns "OK" when NX set succeeds, null when key exists.
      const got = await analyticsRedis.set(warmingLockKey(t.id), "1", {
        ex: 60,
        nx: true,
      });
      acquired = got === "OK";
    } catch {
      // Lock check failed — be conservative, skip this one.
      continue;
    }
    if (!acquired) continue;
    try {
      const fresh = await queryOverpass(t.lat, t.lng, t.radiusM);
      if (fresh.length > 0) {
        await analyticsRedis.set(buildingKey(t.id), fresh, { ex: 24 * 60 * 60 });
      }
    } catch {
      // Silent — next viewer retries after lock expires.
    }
    // Be polite to Overpass between cold queries (kumi.systems mirror
    // throttles around 1 req/s/IP). 1500ms gap matches the cron warmer.
    await new Promise((r) => setTimeout(r, 1500));
  }
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
