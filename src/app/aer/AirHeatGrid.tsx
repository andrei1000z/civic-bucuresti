"use client";

import { useMemo, useEffect, useState } from "react";
import { Circle } from "react-leaflet";
import type { UnifiedSensor } from "@/lib/aer/types";
import { getAqiColor } from "@/lib/aer/colors";

/**
 * Dense heatmap grid covering Romania, masked to the real border polygon.
 * IDW interpolation from real sensor data. 100×100 grid.
 */

const GRID_SIZE = 100;
const LAT_MIN = 43.5;
const LAT_MAX = 48.3;
const LNG_MIN = 20.2;
const LNG_MAX = 30.0;

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

function idw(lat: number, lng: number, sensors: { lat: number; lng: number; aqi: number }[]): number {
  let num = 0;
  let den = 0;
  for (const s of sensors) {
    const dLat = (lat - s.lat) * 111;
    const dLng = (lng - s.lng) * 111 * Math.cos((lat * Math.PI) / 180);
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);
    if (dist < 0.3) return s.aqi;
    if (dist > 80) continue;
    const w = 1 / (dist * dist);
    num += w * s.aqi;
    den += w;
  }
  if (den === 0) return -1;
  return Math.round(num / den);
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

    const latStep = (LAT_MAX - LAT_MIN) / GRID_SIZE;
    const lngStep = (LNG_MAX - LNG_MIN) / GRID_SIZE;
    const result: { lat: number; lng: number; aqi: number }[] = [];

    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        const lat = LAT_MIN + (i + 0.5) * latStep;
        const lng = LNG_MIN + (j + 0.5) * lngStep;
        if (border && !pointInRing(lat, lng, border)) continue;
        const aqi = idw(lat, lng, valid);
        if (aqi >= 0) result.push({ lat, lng, aqi });
      }
    }
    return result;
  }, [sensors, border]);

  if (cells.length === 0) return null;

  const cellKm = ((LAT_MAX - LAT_MIN) / GRID_SIZE) * 111;
  const radius = cellKm * 1000 * 0.62;

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
            fillOpacity: 0.35,
            weight: 0,
            stroke: false,
          }}
        />
      ))}
    </>
  );
}
