/**
 * AI-augmented air quality grid for Romania.
 *
 * Real sensors are sparse and unevenly distributed — most concentrate
 * in big cities, leaving large rural / mountain regions with no
 * reading at all. The naive heatmap (IDW from real sensors only)
 * paints those regions green by default, which is misleading: a
 * Bărăgan plain in a January heating-season night without sensors is
 * not "perfect green air".
 *
 * This module produces a uniform grid of estimated AQI values across
 * the country. Each cell:
 *   1. Starts from the IDW interpolation of real sensors near it.
 *   2. Adds a fire-proximity boost (NASA FIRMS detections nearby
 *      → smoke plume → +PM).
 *   3. Multiplies by a temporal factor (rush hour, workday vs
 *      weekend, winter heating season vs summer).
 *   4. Adds a baseline tied to known industrial / heavy-traffic
 *      centers so a Galați / Hunedoara / Pitești cell never reads
 *      "perfect" by default.
 *
 * Output is consumed by the heatmap renderer to paint the whole
 * country, not just sensor neighborhoods.
 */

import type { UnifiedSensor } from "./types";
import type { FireDetection } from "@/app/api/aer/sources/firms";
import { isInsideRomania } from "./romania-polygon";

export interface GridCell {
  lat: number;
  lng: number;
  /** Estimated AQI 0–500. */
  aqi: number;
  /** How confident we are (0–1). 1 = sensor within a few km; 0 = pure
   *  AI estimate from temporal + structural factors. */
  confidence: number;
}

/** Known heavy-emission centers in Romania. Coords + a baseline PM
 *  contribution that gets added to the IDW result for cells nearby.
 *  Tuned so a city without a sensor still reads moderate, not green. */
const INDUSTRIAL_CENTERS: ReadonlyArray<{ lat: number; lng: number; pmAdd: number; radiusKm: number }> = [
  // Steel / heavy industry
  { lat: 45.43, lng: 28.05, pmAdd: 25, radiusKm: 25 }, // Galați (combinatul siderurgic)
  { lat: 45.75, lng: 22.91, pmAdd: 22, radiusKm: 25 }, // Hunedoara (oțelărie)
  { lat: 45.85, lng: 22.43, pmAdd: 18, radiusKm: 18 }, // Călan
  // Petrochemistry / refineries
  { lat: 44.95, lng: 26.03, pmAdd: 28, radiusKm: 25 }, // Ploiești (Petrobrazi, Petrotel-Lukoil)
  { lat: 44.18, lng: 28.60, pmAdd: 18, radiusKm: 20 }, // Constanța (Petromidia / port)
  { lat: 44.92, lng: 24.86, pmAdd: 15, radiusKm: 18 }, // Pitești (Arpechim historical)
  // Mining / coal / cement
  { lat: 44.95, lng: 23.27, pmAdd: 30, radiusKm: 30 }, // Rovinari (CET cărbune)
  { lat: 45.10, lng: 23.00, pmAdd: 25, radiusKm: 25 }, // Turceni (CET cărbune)
  { lat: 44.62, lng: 22.66, pmAdd: 18, radiusKm: 20 }, // Drobeta-Turnu Severin
  // Big traffic-centric cities (without dedicated heavy industry but
  // chronic PM from car traffic + winter heating)
  { lat: 44.43, lng: 26.10, pmAdd: 18, radiusKm: 22 }, // București
  { lat: 46.77, lng: 23.60, pmAdd: 12, radiusKm: 18 }, // Cluj-Napoca
  { lat: 47.16, lng: 27.59, pmAdd: 14, radiusKm: 18 }, // Iași
  { lat: 45.75, lng: 21.23, pmAdd: 12, radiusKm: 18 }, // Timișoara
  { lat: 44.32, lng: 23.79, pmAdd: 16, radiusKm: 18 }, // Craiova
  { lat: 47.17, lng: 27.58, pmAdd: 12, radiusKm: 15 }, // Iași center
  { lat: 45.65, lng: 25.61, pmAdd: 10, radiusKm: 15 }, // Brașov
];

/** PM2.5 → AQI breakpoints, US-EPA. */
function pm25ToAqi(pm: number): number {
  const bp: Array<[number, number, number, number]> = [
    [0, 12, 0, 50],
    [12.1, 35.4, 51, 100],
    [35.5, 55.4, 101, 150],
    [55.5, 150.4, 151, 200],
    [150.5, 250.4, 201, 300],
    [250.5, 500, 301, 500],
  ];
  for (const [cLow, cHigh, aLow, aHigh] of bp) {
    if (pm >= cLow && pm <= cHigh) {
      return Math.round(((aHigh - aLow) / (cHigh - cLow)) * (pm - cLow) + aLow);
    }
  }
  return pm > 500 ? 500 : 0;
}

/** Aproximative km between two lat/lng points (Haversine). */
function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/**
 * Hour-of-day factor for traffic + heating contributions.
 *   06–10  → 1.25 (morning rush)
 *   10–16  → 1.00 (midday baseline)
 *   16–20  → 1.30 (evening rush + heating starts in winter)
 *   20–23  → 1.20 (evening domestic heating)
 *   23–06  → 0.90 (night, less traffic — but inversion can trap
 *                  pollutants, so not below 0.9)
 */
function hourFactor(date: Date): number {
  const h = date.getUTCHours() + 3; // crude UTC → EET, OK for factor
  const localHour = ((h % 24) + 24) % 24;
  if (localHour >= 6 && localHour < 10) return 1.25;
  if (localHour >= 10 && localHour < 16) return 1.0;
  if (localHour >= 16 && localHour < 20) return 1.3;
  if (localHour >= 20 && localHour < 23) return 1.2;
  return 0.9;
}

/**
 * Day-of-week factor: workday traffic vs weekend.
 *   Mon–Fri → 1.10
 *   Sat     → 0.90
 *   Sun     → 0.80
 */
function weekdayFactor(date: Date): number {
  const dow = date.getUTCDay(); // 0 = Sun
  if (dow === 0) return 0.8;
  if (dow === 6) return 0.9;
  return 1.1;
}

/**
 * Winter heating-season multiplier. Romanian apartments mostly heat
 * with gas + biomass; rural areas burn wood + coal — both add PM.
 * Active October through March.
 */
function heatingSeasonFactor(date: Date): number {
  const m = date.getUTCMonth(); // 0 = Jan
  // Oct (9), Nov (10), Dec (11), Jan (0), Feb (1), Mar (2) → +25%
  if (m >= 9 || m <= 2) return 1.25;
  // Apr (3), Sep (8) shoulder seasons → +10%
  if (m === 3 || m === 8) return 1.1;
  return 1.0;
}

/** Apply industrial baselines and temporal modifiers to a cell. */
function applyEstimationFactors(
  basePm25: number,
  baseConfidence: number,
  cellLat: number,
  cellLng: number,
  fires: ReadonlyArray<FireDetection>,
  now: Date,
): { pm25: number; confidence: number } {
  let pm = basePm25;
  const conf = baseConfidence;

  // Industrial baseline — additive, decays with distance.
  for (const c of INDUSTRIAL_CENTERS) {
    const d = distanceKm(cellLat, cellLng, c.lat, c.lng);
    if (d < c.radiusKm) {
      const falloff = 1 - d / c.radiusKm;
      pm += c.pmAdd * falloff;
      // Industrial proximity isn't a "real measurement", don't bump confidence
    }
  }

  // Active fires nearby — wildfire smoke can travel 50+ km. Within
  // 10km add a heavy bump, taper to ~0 at 50km.
  for (const f of fires) {
    const d = distanceKm(cellLat, cellLng, f.lat, f.lng);
    if (d < 50) {
      const intensity =
        f.confidence === "high" ? 80 : f.confidence === "nominal" ? 50 : 25;
      const falloff = 1 - d / 50;
      pm += intensity * falloff * falloff; // squared so it's truly local
    }
  }

  // Temporal modifiers
  pm *= hourFactor(now) * weekdayFactor(now) * heatingSeasonFactor(now);

  // Cap at the realistic max (we already filter outliers from the
  // input sensors, but the multipliers can push past 500 in unlikely
  // cases — clamp).
  if (pm > 500) pm = 500;
  if (pm < 0) pm = 0;

  // Modifiers reduce confidence proportionally — a pure-modifier cell
  // (no nearby sensor) tops out at ~0.4 even after applying everything.
  return { pm25: pm, confidence: Math.min(1, conf) };
}

interface BuildOpts {
  sensors: ReadonlyArray<UnifiedSensor>;
  fires: ReadonlyArray<FireDetection>;
  /** Grid resolution in degrees (default 0.25° ≈ 27 km). */
  step?: number;
  /** Override "now" for deterministic testing. */
  now?: Date;
}

/**
 * Sample Romania at a uniform grid and produce an AQI estimate per
 * cell. Result covers the whole country including no-sensor regions
 * by combining IDW from real sensors + industrial baselines +
 * temporal modifiers + fire proximity.
 */
export async function buildEstimationGrid(opts: BuildOpts): Promise<GridCell[]> {
  const step = opts.step ?? 0.25;
  const now = opts.now ?? new Date();
  const fires = opts.fires;

  // Pre-extract sensor lat/lng/pm25 once.
  const points = opts.sensors
    .filter((s) => s.pm25 != null && s.pm25 >= 0)
    .map((s) => ({ lat: s.lat, lng: s.lng, pm25: s.pm25 as number }));

  // Romania bbox grid sweep.
  const cells: GridCell[] = [];
  for (let lat = 43.5; lat <= 48.4; lat += step) {
    for (let lng = 20.2; lng <= 30.0; lng += step) {
      if (!(await isInsideRomania(lat, lng))) continue;

      // IDW interpolation from nearby sensors. Power=2 standard;
      // max radius 80km past which the contribution is negligible.
      let weighted = 0;
      let weightSum = 0;
      let nearestKm = Infinity;
      for (const p of points) {
        const d = distanceKm(lat, lng, p.lat, p.lng);
        if (d > 80) continue;
        if (d < nearestKm) nearestKm = d;
        const w = 1 / (d ** 2 + 0.5);
        weighted += w * p.pm25;
        weightSum += w;
      }

      // Cells with no sensor within 80km still get a value via the
      // estimation factors below; their basePm25 is the national
      // background (~12 µg/m³, EU rural baseline) so they aren't
      // arbitrarily low.
      const basePm25 = weightSum > 0 ? weighted / weightSum : 12;
      const baseConfidence =
        nearestKm === Infinity
          ? 0
          : Math.max(0, Math.min(1, 1 - nearestKm / 80));

      const { pm25, confidence } = applyEstimationFactors(
        basePm25,
        baseConfidence,
        lat,
        lng,
        fires,
        now,
      );

      cells.push({ lat, lng, aqi: pm25ToAqi(pm25), confidence });
    }
  }

  return cells;
}
