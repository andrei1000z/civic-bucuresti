"use client";

import { useEffect, useState } from "react";
import { ImageOverlay } from "react-leaflet";
import type { UnifiedSensor } from "@/lib/aer/types";
import { getAqiColor } from "@/lib/aer/colors";

/**
 * Dense AQI heatmap as a single Canvas image with Gaussian blur.
 * - 600×600 grid = 360K cells
 * - IDW power 1.5 (smoother spread, no bullseye)
 * - 2-pass Gaussian blur on the canvas for natural transitions
 * - Masked to Romania border
 */

const GRID = 600;
const LAT_MIN = 43.4;
const LAT_MAX = 48.4;
const LNG_MIN = 20.0;
const LNG_MAX = 30.2;
const BOUNDS: [[number, number], [number, number]] = [[LAT_MIN, LNG_MIN], [LAT_MAX, LNG_MAX]];

interface Props { sensors: UnifiedSensor[]; }

function pointInRing(lat: number, lng: number, ring: number[][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi)
      inside = !inside;
  }
  return inside;
}

/** IDW with power 1.5 — much smoother spread, no sharp bullseye */
function idw(
  lat: number, lng: number,
  sensors: { lat: number; lng: number; aqi: number }[],
  nationalAvg: number,
): number {
  let num = 0, den = 0, closestDist = Infinity;
  for (const s of sensors) {
    const dLat = (lat - s.lat) * 111;
    const dLng = (lng - s.lng) * 111 * Math.cos((lat * Math.PI) / 180);
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);
    if (dist < 0.5) return s.aqi;
    if (dist < closestDist) closestDist = dist;
    // Power 1.5 instead of 2 — much smoother, wider influence
    const w = 1 / Math.pow(dist, 1.5);
    num += w * s.aqi;
    den += w;
  }
  if (den === 0) return nationalAvg;
  const val = num / den;
  // Blend to national avg for far-away cells
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

    const nationalAvg = Math.round(valid.reduce((s, v) => s + v.aqi, 0) / valid.length);
    const latStep = (LAT_MAX - LAT_MIN) / GRID;
    const lngStep = (LNG_MAX - LNG_MIN) / GRID;

    // Build pixel data
    const canvas = document.createElement("canvas");
    canvas.width = GRID;
    canvas.height = GRID;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.createImageData(GRID, GRID);
    const data = imageData.data;

    // Track which pixels are inside Romania for the mask
    const mask = new Uint8Array(GRID * GRID);

    for (let row = 0; row < GRID; row++) {
      for (let col = 0; col < GRID; col++) {
        const lat = LAT_MAX - (row + 0.5) * latStep;
        const lng = LNG_MIN + (col + 0.5) * lngStep;

        if (!pointInRing(lat, lng, border)) continue;

        mask[row * GRID + col] = 1;
        const aqi = idw(lat, lng, valid, nationalAvg);
        const color = hexToRgb(getAqiColor(aqi));
        const idx = (row * GRID + col) * 4;
        data[idx] = color[0];
        data[idx + 1] = color[1];
        data[idx + 2] = color[2];
        data[idx + 3] = 130; // ~51% opacity
      }
    }

    ctx.putImageData(imageData, 0, 0);

    // Apply Gaussian blur for smooth transitions (no bullseye)
    // Use CSS filter on a second canvas
    const blurred = document.createElement("canvas");
    blurred.width = GRID;
    blurred.height = GRID;
    const bCtx = blurred.getContext("2d");
    if (bCtx) {
      bCtx.filter = "blur(4px)";
      bCtx.drawImage(canvas, 0, 0);

      // Re-apply mask — blur spreads outside Romania border, clip it
      const blurredData = bCtx.getImageData(0, 0, GRID, GRID);
      const bd = blurredData.data;
      for (let i = 0; i < GRID * GRID; i++) {
        if (mask[i] === 0) {
          bd[i * 4 + 3] = 0; // transparent outside Romania
        }
      }
      bCtx.putImageData(blurredData, 0, 0);
      setImageUrl(blurred.toDataURL());
    } else {
      setImageUrl(canvas.toDataURL());
    }
  }, [sensors, border]);

  if (!imageUrl) return null;

  return (
    <ImageOverlay
      url={imageUrl}
      bounds={BOUNDS}
      opacity={1}
      zIndex={200}
    />
  );
}
