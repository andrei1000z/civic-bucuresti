"use client";

import { useMemo, useEffect, useState } from "react";
import { Circle } from "react-leaflet";
import type { UnifiedSensor } from "@/lib/aer/types";
import { getAqiColor } from "@/lib/aer/colors";

/**
 * Dense heatmap grid covering Romania, masked to the real border polygon.
 * IDW interpolation from real sensor data.
 * Grid 120×120 for smooth coverage with NO gaps.
 */

const GRID_SIZE = 350;
// Slightly padded bounds to ensure full border coverage
const LAT_MIN = 43.4;
const LAT_MAX = 48.4;
const LNG_MIN = 20.0;
const LNG_MAX = 30.2;

interface Props {
  sensors: UnifiedSensor[];
}

function pointInRing(lat: number, lng: number, ring: number[][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const intersect = yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * IDW with NO maximum distance — every cell gets a value.
 * Uses power=2 for nearby sensors, smoothly fades to national average
 * for cells far from any sensor.
 */
function idw(
  lat: number,
  lng: number,
  sensors: { lat: number; lng: number; aqi: number }[],
  nationalAvg: number
): number {
  let num = 0;
  let den = 0;
  let closestDist = Infinity;

  for (const s of sensors) {
    const dLat = (lat - s.lat) * 111;
    const dLng = (lng - s.lng) * 111 * Math.cos((lat * Math.PI) / 180);
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);
    if (dist < 0.2) return s.aqi; // on top of sensor
    if (dist < closestDist) closestDist = dist;
    const w = 1 / (dist * dist);
    num += w * s.aqi;
    den += w;
  }

  if (den === 0) return nationalAvg;

  // Blend with national average for cells very far from sensors
  // (prevents extreme extrapolation at borders)
  const interpolated = num / den;
  if (closestDist > 100) {
    // Gradually blend towards national average
    const blendFactor = Math.min(1, (closestDist - 100) / 200);
    return Math.round(interpolated * (1 - blendFactor) + nationalAvg * blendFactor);
  }

  return Math.round(interpolated);
}

export function AirHeatGrid({ sensors }: Props) {
  const [border, setBorder] = useState<number[][] | null>(null);

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

  const cells = useMemo(() => {
    const valid = sensors
      .filter((s) => s.aqi != null && s.aqi > 0)
      .map((s) => ({ lat: s.lat, lng: s.lng, aqi: s.aqi! }));
    if (valid.length === 0) return [];

    // National average for blending at edges
    const nationalAvg = Math.round(valid.reduce((s, v) => s + v.aqi, 0) / valid.length);

    const latStep = (LAT_MAX - LAT_MIN) / GRID_SIZE;
    const lngStep = (LNG_MAX - LNG_MIN) / GRID_SIZE;
    const result: { lat: number; lng: number; aqi: number }[] = [];

    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        const lat = LAT_MIN + (i + 0.5) * latStep;
        const lng = LNG_MIN + (j + 0.5) * lngStep;
        if (border && !pointInRing(lat, lng, border)) continue;
        const aqi = idw(lat, lng, valid, nationalAvg);
        result.push({ lat, lng, aqi });
      }
    }
    return result;
  }, [sensors, border]);

  if (cells.length === 0) return null;

  // Cell radius — overlap slightly for no gaps
  const cellKm = ((LAT_MAX - LAT_MIN) / GRID_SIZE) * 111;
  const radius = cellKm * 1000 * 0.55;

  return (
    <>
      {cells.map((c, i) => (
        <Circle
          key={i}
          center={[c.lat, c.lng]}
          radius={radius}
          pathOptions={{
            color: getAqiColor(c.aqi),
            fillColor: getAqiColor(c.aqi),
            fillOpacity: 0.45,
            weight: 0,
            stroke: false,
          }}
        />
      ))}
    </>
  );
}
