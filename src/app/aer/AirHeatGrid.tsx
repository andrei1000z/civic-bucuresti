"use client";

import { useMemo, useEffect, useState, useRef } from "react";
import { ImageOverlay, useMap } from "react-leaflet";
import type { UnifiedSensor } from "@/lib/aer/types";
import { getAqiColor } from "@/lib/aer/colors";

/**
 * Dense AQI heatmap rendered as a SINGLE Canvas image overlay.
 * No SVG circles = zero DOM elements = instant scrolling.
 *
 * Strategy:
 * 1. Compute IDW grid (500×500 = 250K cells)
 * 2. Render to offscreen Canvas
 * 3. Display as ImageOverlay on the map
 */

const GRID = 500;
const LAT_MIN = 43.4;
const LAT_MAX = 48.4;
const LNG_MIN = 20.0;
const LNG_MAX = 30.2;
const BOUNDS: [[number, number], [number, number]] = [[LAT_MIN, LNG_MIN], [LAT_MAX, LNG_MAX]];

interface Props {
  sensors: UnifiedSensor[];
}

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

function idw(
  lat: number, lng: number,
  sensors: { lat: number; lng: number; aqi: number }[],
  nationalAvg: number
): number {
  let num = 0, den = 0, closestDist = Infinity;
  for (const s of sensors) {
    const dLat = (lat - s.lat) * 111;
    const dLng = (lng - s.lng) * 111 * Math.cos((lat * Math.PI) / 180);
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);
    if (dist < 0.2) return s.aqi;
    if (dist < closestDist) closestDist = dist;
    const w = 1 / (dist * dist);
    num += w * s.aqi;
    den += w;
  }
  if (den === 0) return nationalAvg;
  const interpolated = num / den;
  if (closestDist > 100) {
    const blend = Math.min(1, (closestDist - 100) / 200);
    return Math.round(interpolated * (1 - blend) + nationalAvg * blend);
  }
  return Math.round(interpolated);
}

/** Parse hex color "#RRGGBB" → [r,g,b] */
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

  // Compute grid + render to canvas
  useEffect(() => {
    if (!border || sensors.length === 0) return;

    const valid = sensors
      .filter((s) => s.aqi != null && s.aqi > 0)
      .map((s) => ({ lat: s.lat, lng: s.lng, aqi: s.aqi! }));
    if (valid.length === 0) return;

    const nationalAvg = Math.round(valid.reduce((s, v) => s + v.aqi, 0) / valid.length);
    const latStep = (LAT_MAX - LAT_MIN) / GRID;
    const lngStep = (LNG_MAX - LNG_MIN) / GRID;

    // Create offscreen canvas
    const canvas = document.createElement("canvas");
    canvas.width = GRID;
    canvas.height = GRID;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear transparent
    ctx.clearRect(0, 0, GRID, GRID);

    const imageData = ctx.createImageData(GRID, GRID);
    const data = imageData.data;

    for (let row = 0; row < GRID; row++) {
      for (let col = 0; col < GRID; col++) {
        // Map pixel to geo coords (row 0 = top = LAT_MAX)
        const lat = LAT_MAX - (row + 0.5) * latStep;
        const lng = LNG_MIN + (col + 0.5) * lngStep;

        // Check if inside Romania
        if (!pointInRing(lat, lng, border)) continue;

        const aqi = idw(lat, lng, valid, nationalAvg);
        const color = hexToRgb(getAqiColor(aqi));
        const idx = (row * GRID + col) * 4;
        data[idx] = color[0];
        data[idx + 1] = color[1];
        data[idx + 2] = color[2];
        data[idx + 3] = 115; // ~45% opacity
      }
    }

    ctx.putImageData(imageData, 0, 0);
    setImageUrl(canvas.toDataURL());
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
