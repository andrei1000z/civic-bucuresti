"use client";

import { useEffect, useState } from "react";
import { ImageOverlay } from "react-leaflet";
import type { UnifiedSensor } from "@/lib/aer/types";
import { getAqiColor } from "@/lib/aer/colors";

/**
 * AQI heatmap as a single Canvas ImageOverlay.
 * - 300×300 grid = 90K cells (fast, no freeze)
 * - IDW power 1.5 for smooth spread
 * - Gaussian blur for natural transitions
 * - Async computation with requestAnimationFrame
 */

const GRID = 300;
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

function idw(
  lat: number, lng: number,
  sensors: { lat: number; lng: number; aqi: number }[],
  nationalAvg: number,
): number {
  let num = 0, den = 0, closestDist = Infinity;
  // Only use nearest 30 sensors for speed
  const nearby = sensors.filter((s) => {
    const d = Math.abs(s.lat - lat) + Math.abs(s.lng - lng);
    return d < 5; // rough filter ~500km
  });
  const use = nearby.length > 0 ? nearby : sensors.slice(0, 20);

  for (const s of use) {
    const dLat = (lat - s.lat) * 111;
    const dLng = (lng - s.lng) * 111 * Math.cos((lat * Math.PI) / 180);
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);
    if (dist < 0.5) return s.aqi;
    if (dist < closestDist) closestDist = dist;
    const w = 1 / Math.pow(dist, 1.5);
    num += w * s.aqi;
    den += w;
  }
  if (den === 0) return nationalAvg;
  const val = num / den;
  if (closestDist > 80) {
    const blend = Math.min(1, (closestDist - 80) / 150);
    return Math.round(val * (1 - blend) + nationalAvg * blend);
  }
  return Math.round(val);
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

    // Compute async to avoid freezing the UI
    requestAnimationFrame(() => {
      const nationalAvg = Math.round(valid.reduce((s, v) => s + v.aqi, 0) / valid.length);
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

      for (let row = 0; row < GRID; row++) {
        for (let col = 0; col < GRID; col++) {
          const lat = LAT_N - (row + 0.5) * latStep;
          const lng = LNG_W + (col + 0.5) * lngStep;
          if (!pointInRing(lat, lng, border)) continue;

          mask[row * GRID + col] = 1;
          const aqi = idw(lat, lng, valid, nationalAvg);
          const color = hexToRgb(getAqiColor(aqi));
          const idx = (row * GRID + col) * 4;
          data[idx] = color[0];
          data[idx + 1] = color[1];
          data[idx + 2] = color[2];
          data[idx + 3] = 140;
        }
      }

      ctx.putImageData(imageData, 0, 0);

      // Gaussian blur
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
    });
  }, [sensors, border]);

  if (!imageUrl) return null;

  return <ImageOverlay url={imageUrl} bounds={BOUNDS} opacity={1} zIndex={200} />;
}
