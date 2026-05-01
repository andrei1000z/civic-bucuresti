/**
 * Strict Romania boundary check.
 *
 * Sensor.Community filters by country code (clean RO), but WAQI returns
 * everything inside the bounding box (43.5° to 48.3° lat, 20.2° to
 * 30.0° lng) — which leaks Belgrade, Sofia, Chișinău, Subotica and a
 * good chunk of southern Hungary onto our map. We need a proper
 * point-in-polygon test against Romania's real border.
 *
 * The polygon lives in `public/geojson/romania-border.json`. It's
 * loaded once on first call and cached for the lifetime of the
 * Node process. ~49KB on disk, decoded once.
 */

import { readFile } from "fs/promises";
import path from "path";

interface Loaded {
  /** Outer ring of [lng, lat] pairs. */
  outer: ReadonlyArray<readonly [number, number]>;
  /** Tight bbox computed once for cheap pre-filter. */
  bbox: { minLat: number; maxLat: number; minLng: number; maxLng: number };
}

let cached: Loaded | null = null;
let loadingPromise: Promise<Loaded> | null = null;

async function loadPolygon(): Promise<Loaded> {
  if (cached) return cached;
  if (loadingPromise) return loadingPromise;
  loadingPromise = (async () => {
    const file = path.join(process.cwd(), "public", "geojson", "romania-border.json");
    const text = await readFile(file, "utf-8");
    const json = JSON.parse(text) as {
      geometry?: { type: string; coordinates: unknown };
      type?: string;
      coordinates?: unknown;
    };
    const geom = json.geometry ?? (json as { type: string; coordinates: unknown });
    if (geom.type !== "Polygon") {
      throw new Error(`Expected Polygon geometry, got ${geom.type}`);
    }
    // Polygon → first ring is outer, rest are holes (Romania has none).
    const rings = geom.coordinates as number[][][];
    const outer = (rings[0] ?? []) as unknown as ReadonlyArray<readonly [number, number]>;
    let minLat = Infinity,
      maxLat = -Infinity,
      minLng = Infinity,
      maxLng = -Infinity;
    for (const [lng, lat] of outer) {
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
    }
    cached = { outer, bbox: { minLat, maxLat, minLng, maxLng } };
    loadingPromise = null;
    return cached;
  })();
  return loadingPromise;
}

/**
 * Standard ray-casting point-in-polygon. Cheap bbox pre-filter so
 * obvious out-of-country points (Belgrade, Sofia) reject in O(1)
 * before we do the per-edge math. ~50µs per call after the polygon
 * is loaded — fine to run over a few hundred sensors per request.
 */
function pointInRing(
  lat: number,
  lng: number,
  ring: ReadonlyArray<readonly [number, number]>,
): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[i];
    const b = ring[j];
    if (!a || !b) continue;
    const [xi, yi] = a;
    const [xj, yj] = b;
    const intersect =
      yi > lat !== yj > lat &&
      lng < ((xj - xi) * (lat - yi)) / ((yj - yi) || 1e-12) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * True when (lat, lng) falls inside Romania's land border. Pre-load
 * with `await preloadRomaniaPolygon()` at the start of a request so
 * the first sensor doesn't pay the 49KB read latency.
 */
export async function isInsideRomania(lat: number, lng: number): Promise<boolean> {
  const poly = await loadPolygon();
  // Bbox pre-filter: rejects ~80% of cross-border noise (Hungary lats
  // < 48.3 but lngs west of 20.2 etc.) without touching the ring.
  if (
    lat < poly.bbox.minLat ||
    lat > poly.bbox.maxLat ||
    lng < poly.bbox.minLng ||
    lng > poly.bbox.maxLng
  ) {
    return false;
  }
  return pointInRing(lat, lng, poly.outer);
}

/** Pre-warm the polygon cache. Call once per request before the
 *  first `isInsideRomania` so subsequent calls are sync-fast. */
export async function preloadRomaniaPolygon(): Promise<void> {
  await loadPolygon();
}
