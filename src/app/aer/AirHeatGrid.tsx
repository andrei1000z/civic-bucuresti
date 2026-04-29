"use client";

import { useEffect, useState } from "react";
import { ImageOverlay } from "react-leaflet";
import type { UnifiedSensor } from "@/lib/aer/types";
import { getAqiColor } from "@/lib/aer/colors";

/**
 * AQI heatmap as a single Canvas ImageOverlay.
 *
 * Design: high-resolution IDW (Inverse Distance Weighted) interpolation
 * with a *sharper* falloff than typical heatmaps so localized hotspots
 * stay localized. Cells with no sensor within 60km go transparent
 * (instead of being painted "good" by a national-average blend) so the
 * map honestly reflects where we have coverage and where we don't.
 *
 * - 400×400 grid = 160K cells inside the Romania border ring
 * - IDW power 2.5 — sharp falloff, no global wash-out
 * - Top-K=8 nearest sensors per cell (sorted), bounded compute
 * - Cells > 60km from the closest sensor: transparent (no data)
 * - Light Gaussian blur for natural pixel transitions
 * - Progressive paint via requestAnimationFrame so the main thread
 *   never blocks for more than ~6ms.
 */

const GRID = 400;
const TOP_K = 8;
const COVERAGE_RADIUS_KM = 60;
const IDW_POWER = 2.5;
// Romania bounds — matched EXACTLY to Leaflet ImageOverlay
const LAT_S = 43.55;
const LAT_N = 48.27;
const LNG_W = 20.22;
const LNG_E = 29.75;
const BOUNDS: [[number, number], [number, number]] = [[LAT_S, LNG_W], [LAT_N, LNG_E]];

interface Props { sensors: UnifiedSensor[]; }

function pointInRing(lat: number, lng: number, ring: number[][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const pi = ring[i];
    const pj = ring[j];
    if (!pi || !pj) continue;
    const [xi, yi] = pi as [number, number];
    const [xj, yj] = pj as [number, number];
    if (yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi)
      inside = !inside;
  }
  return inside;
}

/**
 * Returns the IDW-interpolated AQI at (lat, lng), or `null` when the
 * closest sensor is farther than COVERAGE_RADIUS_KM. The TOP_K-nearest
 * subset is small enough (~8 sensors) that allocating + sorting is
 * cheap on a per-cell basis.
 */
function idw(
  lat: number,
  lng: number,
  sensors: { lat: number; lng: number; aqi: number }[],
): number | null {
  if (sensors.length === 0) return null;

  // First pass: distance for all sensors. We don't bail early on a
  // distance threshold because we need TOP_K nearest, and a coarse cut
  // would risk picking a worse subset on sparse-coverage edges.
  const distances: { aqi: number; dist: number }[] = [];
  for (const s of sensors) {
    const dLat = (lat - s.lat) * 111;
    const dLng = (lng - s.lng) * 111 * Math.cos((lat * Math.PI) / 180);
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);
    distances.push({ aqi: s.aqi, dist });
  }
  distances.sort((a, b) => a.dist - b.dist);

  const closestDist = distances[0]?.dist ?? Infinity;
  if (closestDist > COVERAGE_RADIUS_KM) return null;

  // Snap-to-sensor when extremely close (~300m): avoids floating-point
  // weirdness from huge weights and gives the marker an exact pixel.
  if (closestDist < 0.3) return distances[0]!.aqi;

  let num = 0;
  let den = 0;
  const k = Math.min(TOP_K, distances.length);
  for (let i = 0; i < k; i++) {
    const { aqi, dist } = distances[i]!;
    const w = 1 / Math.pow(Math.max(dist, 0.5), IDW_POWER);
    num += w * aqi;
    den += w;
  }
  if (den === 0) return null;
  return Math.round(num / den);
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function AirHeatGrid({ sensors }: Props) {
  const [border, setBorder] = useState<number[][] | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch("/geojson/romania-border.json")
      .then((r) => r.json())
      .then((j) => {
        const geom = j.geometry;
        if (geom.type === "Polygon") setBorder(geom.coordinates[0]);
        else if (geom.type === "MultiPolygon") setBorder(geom.coordinates[0][0]);
      })
      .catch(() => null);
  }, []);

  useEffect(() => {
    if (!border || sensors.length === 0) return;

    const valid = sensors
      .filter((s) => s.aqi != null && s.aqi > 0)
      .map((s) => ({ lat: s.lat, lng: s.lng, aqi: s.aqi! }));
    if (valid.length === 0) return;

    // Progressive compute: split the GRID×GRID loop into row-batches
    // rendered across multiple requestAnimationFrame ticks so the main
    // thread never blocks for more than ~6ms. At GRID=400 and ROWS_PER_TICK=16
    // we paint the whole map in ~25 frames (~420ms) while the user can
    // keep panning/zooming.
    const ROWS_PER_TICK = 16;
    const latStep = (LAT_N - LAT_S) / GRID;
    const lngStep = (LNG_E - LNG_W) / GRID;

    const canvas = document.createElement("canvas");
    canvas.width = GRID;
    canvas.height = GRID;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.createImageData(GRID, GRID);
    const data = imageData.data;
    const mask = new Uint8Array(GRID * GRID);

    let row = 0;
    let cancelled = false;
    let raf = 0;

    const finalize = () => {
      ctx.putImageData(imageData, 0, 0);
      const blurred = document.createElement("canvas");
      blurred.width = GRID;
      blurred.height = GRID;
      const bCtx = blurred.getContext("2d");
      if (bCtx) {
        bCtx.filter = "blur(3px)";
        bCtx.drawImage(canvas, 0, 0);
        const bd = bCtx.getImageData(0, 0, GRID, GRID).data;
        const clean = bCtx.createImageData(GRID, GRID);
        for (let i = 0; i < GRID * GRID; i++) {
          clean.data[i * 4] = bd[i * 4] ?? 0;
          clean.data[i * 4 + 1] = bd[i * 4 + 1] ?? 0;
          clean.data[i * 4 + 2] = bd[i * 4 + 2] ?? 0;
          clean.data[i * 4 + 3] = mask[i] ? (bd[i * 4 + 3] ?? 0) : 0;
        }
        bCtx.putImageData(clean, 0, 0);
        setImageUrl(blurred.toDataURL());
      } else {
        setImageUrl(canvas.toDataURL());
      }
    };

    const tick = () => {
      if (cancelled) return;
      const rowEnd = Math.min(row + ROWS_PER_TICK, GRID);
      for (let r = row; r < rowEnd; r++) {
        for (let col = 0; col < GRID; col++) {
          const lat = LAT_N - (r + 0.5) * latStep;
          const lng = LNG_W + (col + 0.5) * lngStep;
          if (!pointInRing(lat, lng, border)) continue;

          const aqi = idw(lat, lng, valid);
          // No sensor within COVERAGE_RADIUS_KM → leave this cell
          // transparent. Honest map: no data ≠ "good".
          if (aqi == null) continue;

          mask[r * GRID + col] = 1;
          const color = hexToRgb(getAqiColor(aqi));
          const idx = (r * GRID + col) * 4;
          data[idx] = color[0];
          data[idx + 1] = color[1];
          data[idx + 2] = color[2];
          // Slightly higher alpha (160) so hotspots read clearly without
          // hiding the underlying map texture.
          data[idx + 3] = 160;
        }
      }
      row = rowEnd;
      if (row < GRID) {
        raf = requestAnimationFrame(tick);
      } else {
        finalize();
      }
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      if (raf) cancelAnimationFrame(raf);
    };
  }, [sensors, border]);

  if (!imageUrl) return null;

  return <ImageOverlay url={imageUrl} bounds={BOUNDS} opacity={1} zIndex={200} />;
}
