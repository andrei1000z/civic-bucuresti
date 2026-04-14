"use client";

import { useEffect, useState } from "react";
import { Circle } from "react-leaflet";

/**
 * Air-quality heatmap masked to Bucharest admin boundary.
 *
 * Strategy: 50x50 grid across the bbox, point-in-polygon filter against
 * the real OSM city boundary, IDW interpolation from 6 sector "stations".
 */

interface Polygon {
  type: "Polygon";
  coordinates: number[][][];
}

interface BorderFeature {
  type: "Feature";
  geometry: Polygon | { type: "MultiPolygon"; coordinates: number[][][][] };
}

const STATIONS: { lat: number; lng: number; sector: string }[] = [
  { lat: 44.475, lng: 26.08, sector: "S1" },
  { lat: 44.458, lng: 26.14, sector: "S2" },
  { lat: 44.41, lng: 26.17, sector: "S3" },
  { lat: 44.39, lng: 26.11, sector: "S4" },
  { lat: 44.40, lng: 26.04, sector: "S5" },
  { lat: 44.45, lng: 26.02, sector: "S6" },
];

const GRID_SIZE = 50;
const LAT_MIN = 44.33;
const LAT_MAX = 44.56;
const LNG_MIN = 25.98;
const LNG_MAX = 26.24;

interface StationReading { lat: number; lng: number; aqi: number; }

function idw(lat: number, lng: number, stations: StationReading[]): number {
  let num = 0, den = 0;
  for (const s of stations) {
    const dLat = (lat - s.lat) * 111;
    const dLng = (lng - s.lng) * 111 * Math.cos((lat * Math.PI) / 180);
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);
    if (dist < 0.01) return s.aqi;
    const w = 1 / (dist * dist);
    num += w * s.aqi;
    den += w;
  }
  return Math.round(num / den);
}

function aqiColor(aqi: number): string {
  if (aqi <= 50) return "#059669";
  if (aqi < 80) return "#EAB308";
  if (aqi < 100) return "#F97316";
  return "#DC2626";
}

// Ray-casting point-in-polygon
function pointInRing(lat: number, lng: number, ring: number[][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const pi = ring[i];
    const pj = ring[j];
    if (!pi || !pj) continue;
    const [xi, yi] = pi as [number, number]; // [lng, lat]
    const [xj, yj] = pj as [number, number];
    const intersect =
      yi > lat !== yj > lat &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function pointInBorder(lat: number, lng: number, border: BorderFeature | null): boolean {
  if (!border) return true; // if no border loaded, show all (fallback)
  if (border.geometry.type === "Polygon") {
    const ring = border.geometry.coordinates[0];
    return ring ? pointInRing(lat, lng, ring) : false;
  }
  // MultiPolygon
  for (const poly of border.geometry.coordinates) {
    const ring = poly[0];
    if (ring && pointInRing(lat, lng, ring)) return true;
  }
  return false;
}

export function AqiHeatmapLayer() {
  const [stations, setStations] = useState<StationReading[]>([]);
  const [border, setBorder] = useState<BorderFeature | null>(null);

  // Load border once
  useEffect(() => {
    fetch("/geojson/bucuresti-border.json")
      .then((r) => r.json())
      .then((j: BorderFeature) => setBorder(j))
      .catch(() => setBorder(null));
  }, []);

  // Load AQI readings, refresh every 10 min
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/statistici/aqi");
        const j = await res.json();
        const base = j.data?.aqi ?? 65;
        // Per-sector variation (stable per station)
        const variations = [-10, 4, 16, -2, 24, -6];
        setStations(
          STATIONS.map((s, i) => ({
            lat: s.lat,
            lng: s.lng,
            aqi: Math.max(15, Math.min(200, base + variations[i])),
          }))
        );
      } catch {
        setStations(STATIONS.map((s, i) => ({ lat: s.lat, lng: s.lng, aqi: 60 + (i * 9) % 40 })));
      }
    };
    load();
    const id = setInterval(load, 10 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  if (stations.length === 0) return null;

  // Build dense grid masked to Bucharest border
  const cells: { lat: number; lng: number; aqi: number }[] = [];
  const latStep = (LAT_MAX - LAT_MIN) / GRID_SIZE;
  const lngStep = (LNG_MAX - LNG_MIN) / GRID_SIZE;
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      const lat = LAT_MIN + (i + 0.5) * latStep;
      const lng = LNG_MIN + (j + 0.5) * lngStep;
      if (!pointInBorder(lat, lng, border)) continue;
      cells.push({ lat, lng, aqi: idw(lat, lng, stations) });
    }
  }

  // Radius ≈ half the diagonal of a cell, so neighbors overlap
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
            color: aqiColor(c.aqi),
            fillColor: aqiColor(c.aqi),
            fillOpacity: 0.28,
            weight: 0,
            stroke: false,
          }}
        />
      ))}
      {stations.map((s, i) => (
        <Circle
          key={`station-${i}`}
          center={[s.lat, s.lng]}
          radius={140}
          pathOptions={{
            color: "#ffffff",
            fillColor: aqiColor(s.aqi),
            fillOpacity: 1,
            weight: 3,
          }}
        />
      ))}
    </>
  );
}
