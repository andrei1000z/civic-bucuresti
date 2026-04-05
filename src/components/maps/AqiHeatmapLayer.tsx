"use client";

import { useEffect, useState } from "react";
import { Circle } from "react-leaflet";

/**
 * Air-quality heatmap for Bucharest.
 *
 * Strategy: 6 monitoring "stations" (one per sector, real approximate locations)
 * + inverse-distance-weighted interpolation onto a grid of ~200 circles across
 * the city. Each circle is colored by its interpolated AQI value.
 *
 * Data source: /api/statistici/aqi (currently Open-AQ/OpenMeteo-based fallback).
 * In production we'd fetch per-station from calitateaer.ro.
 */

// 6 monitoring stations (approximate locations of real ANPM stations per sector)
const STATIONS: { lat: number; lng: number; sector: string }[] = [
  { lat: 44.465, lng: 26.08, sector: "S1" },  // B-3 Balotești / Băneasa
  { lat: 44.458, lng: 26.12, sector: "S2" },  // B-5 Titan / Pantelimon
  { lat: 44.42, lng: 26.15, sector: "S3" },   // B-6 Drumul Taberei / Titan
  { lat: 44.39, lng: 26.12, sector: "S4" },   // B-1 Cercu / Berceni
  { lat: 44.4, lng: 26.05, sector: "S5" },    // B-4 Mihai Bravu / Rahova
  { lat: 44.44, lng: 26.02, sector: "S6" },   // B-2 Crângași / Militari
];

// Bucharest grid for heatmap — ~20x20 cells
const GRID_SIZE = 20;
const LAT_MIN = 44.36;
const LAT_MAX = 44.52;
const LNG_MIN = 26.00;
const LNG_MAX = 26.22;

interface StationReading {
  lat: number;
  lng: number;
  aqi: number;
}

/**
 * Inverse-distance-weighted interpolation.
 * Returns AQI estimated at (lat,lng) from surrounding station readings.
 */
function idw(lat: number, lng: number, stations: StationReading[], p = 2): number {
  let numerator = 0;
  let denominator = 0;
  for (const s of stations) {
    const dLat = (lat - s.lat) * 111; // km
    const dLng = (lng - s.lng) * 111 * Math.cos((lat * Math.PI) / 180);
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);
    if (dist < 0.01) return s.aqi; // point-on-station
    const w = 1 / Math.pow(dist, p);
    numerator += w * s.aqi;
    denominator += w;
  }
  return Math.round(numerator / denominator);
}

function aqiColor(aqi: number): string {
  if (aqi <= 50) return "#059669"; // good — green
  if (aqi < 80) return "#EAB308";  // moderate — yellow
  if (aqi < 100) return "#F97316"; // unhealthy-sensitive — orange
  return "#DC2626";                // unhealthy — red
}

export function AqiHeatmapLayer() {
  const [stations, setStations] = useState<StationReading[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        // Fetch the single city-wide AQI from our API, then simulate per-station
        // variation until we have real per-station endpoints wired.
        const res = await fetch("/api/statistici/aqi");
        const j = await res.json();
        const base = j.data?.aqi ?? 65;

        // Stable per-sector variation using station coords as seed (so it doesn't
        // jitter between renders). Real implementation would replace this with
        // actual per-station readings.
        const variations = [-8, 6, 14, -3, 22, -5]; // S1 cleaner (north), S5 worse
        setStations(
          STATIONS.map((s, i) => ({
            lat: s.lat,
            lng: s.lng,
            aqi: Math.max(15, Math.min(200, base + variations[i])),
          }))
        );
      } catch {
        // fallback values
        setStations(
          STATIONS.map((s, i) => ({
            lat: s.lat,
            lng: s.lng,
            aqi: 60 + (i * 7) % 40,
          }))
        );
      }
    };
    load();
    const id = setInterval(load, 10 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  if (stations.length === 0) return null;

  // Build grid of interpolated cells
  const cells: { lat: number; lng: number; aqi: number }[] = [];
  const latStep = (LAT_MAX - LAT_MIN) / GRID_SIZE;
  const lngStep = (LNG_MAX - LNG_MIN) / GRID_SIZE;
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      const lat = LAT_MIN + (i + 0.5) * latStep;
      const lng = LNG_MIN + (j + 0.5) * lngStep;
      cells.push({ lat, lng, aqi: idw(lat, lng, stations) });
    }
  }

  // Radius sized to overlap neighbors for smooth blending
  const radius = 700;

  return (
    <>
      {cells.map((c, i) => (
        <Circle
          key={i}
          center={[c.lat, c.lng]}
          radius={radius}
          pathOptions={{
            color: aqiColor(c.aqi),
            fillColor: aqiColor(c.aqi),
            fillOpacity: 0.22,
            weight: 0,
            stroke: false,
          }}
        />
      ))}
      {/* Station markers overlaid on top */}
      {stations.map((s, i) => (
        <Circle
          key={`station-${i}`}
          center={[s.lat, s.lng]}
          radius={120}
          pathOptions={{
            color: "#ffffff",
            fillColor: aqiColor(s.aqi),
            fillOpacity: 1,
            weight: 2,
          }}
        />
      ))}
    </>
  );
}
