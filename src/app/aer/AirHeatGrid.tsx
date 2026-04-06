"use client";

import { useMemo } from "react";
import { Circle } from "react-leaflet";
import type { UnifiedSensor } from "@/lib/aer/types";
import { getAqiColor } from "@/lib/aer/colors";

/**
 * Dense heatmap grid covering all of Romania with IDW interpolation
 * from real sensor data. Same visual style as the București AQI heatmap
 * on /harti but at national scale.
 */

const GRID_SIZE = 80; // 80×80 = 6400 cells (performant enough)
const LAT_MIN = 43.6;
const LAT_MAX = 48.2;
const LNG_MIN = 20.3;
const LNG_MAX = 29.8;

interface Props {
  sensors: UnifiedSensor[];
}

function idw(lat: number, lng: number, sensors: { lat: number; lng: number; aqi: number }[]): number {
  let num = 0;
  let den = 0;
  for (const s of sensors) {
    const dLat = (lat - s.lat) * 111;
    const dLng = (lng - s.lng) * 111 * Math.cos((lat * Math.PI) / 180);
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);
    if (dist < 0.5) return s.aqi; // point-on-sensor
    if (dist > 100) continue; // ignore sensors >100km away
    const w = 1 / (dist * dist);
    num += w * s.aqi;
    den += w;
  }
  if (den === 0) return -1; // no nearby sensors
  return Math.round(num / den);
}

export function AirHeatGrid({ sensors }: Props) {
  const cells = useMemo(() => {
    // Filter to sensors with valid AQI
    const validSensors = sensors
      .filter((s) => s.aqi != null && s.aqi > 0)
      .map((s) => ({ lat: s.lat, lng: s.lng, aqi: s.aqi! }));

    if (validSensors.length === 0) return [];

    const latStep = (LAT_MAX - LAT_MIN) / GRID_SIZE;
    const lngStep = (LNG_MAX - LNG_MIN) / GRID_SIZE;
    const result: { lat: number; lng: number; aqi: number }[] = [];

    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        const lat = LAT_MIN + (i + 0.5) * latStep;
        const lng = LNG_MIN + (j + 0.5) * lngStep;
        const aqi = idw(lat, lng, validSensors);
        if (aqi >= 0) {
          result.push({ lat, lng, aqi });
        }
      }
    }
    return result;
  }, [sensors]);

  if (cells.length === 0) return null;

  // Cell radius to overlap slightly for smooth look
  const cellSizeKm = ((LAT_MAX - LAT_MIN) / GRID_SIZE) * 111;
  const radius = cellSizeKm * 1000 * 0.65;

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
            fillOpacity: 0.3,
            weight: 0,
            stroke: false,
          }}
        />
      ))}
    </>
  );
}
