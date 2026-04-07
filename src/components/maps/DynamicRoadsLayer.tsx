"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { GeoJSON, useMap, useMapEvents } from "react-leaflet";
import type { PathOptions } from "leaflet";
import type { GeoJsonObject, Feature } from "geojson";

/**
 * Dynamically loads roads from Overpass API based on current map viewport.
 * Only loads when zoom >= 13 (city level). Shows streets, residential roads etc.
 * Uses Canvas renderer (inherited from MapContainer) for performance.
 */

const MIN_ZOOM = 13;
const DEBOUNCE = 800; // ms after pan/zoom stops

const ROAD_STYLE: PathOptions = {
  color: "#64748B",
  weight: 1.5,
  opacity: 0.6,
};

function roadPopup(f: Feature): string {
  const p = f.properties ?? {};
  const name = p.name || p.ref || "Stradă";
  return `<b>${name}</b>`;
}

export function DynamicRoadsLayer() {
  const map = useMap();
  const [data, setData] = useState<GeoJsonObject | null>(null);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const lastBboxRef = useRef("");

  const fetchRoads = useCallback(() => {
    const zoom = map.getZoom();
    if (zoom < MIN_ZOOM) {
      setData(null);
      return;
    }

    const bounds = map.getBounds();
    const bbox = `${bounds.getSouth().toFixed(3)},${bounds.getWest().toFixed(3)},${bounds.getNorth().toFixed(3)},${bounds.getEast().toFixed(3)}`;

    // Don't re-fetch same area
    if (bbox === lastBboxRef.current) return;
    lastBboxRef.current = bbox;

    // Abort previous request
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setLoading(true);

    const query = `[out:json][timeout:15];(way["highway"~"residential|unclassified|living_street|service"](${bbox}););out geom;`;

    fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: `data=${encodeURIComponent(query)}`,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      signal: ctrl.signal,
    })
      .then((r) => r.json())
      .then((j) => {
        if (ctrl.signal.aborted) return;
        const features = (j.elements ?? [])
          .filter((e: Record<string, unknown>) => e.type === "way" && Array.isArray(e.geometry))
          .map((e: Record<string, unknown>) => ({
            type: "Feature",
            properties: (e.tags as Record<string, string>) ?? {},
            geometry: {
              type: "LineString",
              coordinates: (e.geometry as Array<{ lat: number; lon: number }>).map((p) => [p.lon, p.lat]),
            },
          }));
        setData({ type: "FeatureCollection", features } as GeoJsonObject);
        setLoading(false);
      })
      .catch(() => {
        if (!ctrl.signal.aborted) setLoading(false);
      });
  }, [map]);

  // Debounced fetch on move/zoom
  useMapEvents({
    moveend: () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(fetchRoads, DEBOUNCE);
    },
    zoomend: () => {
      if (map.getZoom() < MIN_ZOOM) {
        setData(null);
        return;
      }
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(fetchRoads, DEBOUNCE);
    },
  });

  // Initial load
  useEffect(() => {
    if (map.getZoom() >= MIN_ZOOM) fetchRoads();
  }, [map, fetchRoads]);

  return (
    <>
      {data && <GeoJSON key={lastBboxRef.current} data={data} style={ROAD_STYLE} onEachFeature={(f, layer) => layer.bindPopup(roadPopup(f))} />}
      {loading && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[1000] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full px-4 py-1.5 shadow-lg text-xs text-[var(--color-text-muted)]">
          Se încarcă străzile...
        </div>
      )}
    </>
  );
}
