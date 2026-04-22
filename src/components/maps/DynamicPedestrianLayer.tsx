"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { GeoJSON, useMap, useMapEvents } from "react-leaflet";
import type { PathOptions } from "leaflet";
import type { GeoJsonObject, Feature } from "geojson";

/**
 * Dynamic pedestrian layer — footways, pedestrian streets, paths fetched
 * from Overpass on the current viewport. Static pietonal-romania.json is
 * 23 MB which nukes the page on mobile; this swaps that brute download
 * for on-demand fetches scoped to what the user actually sees.
 *
 * Activates at zoom >= 13 (city level). Below that, the static parks
 * layer carries the weight — individual footways at z<13 would be
 * hairlines anyway.
 */

const MIN_ZOOM = 13;
const DEBOUNCE = 700; // ms after pan/zoom stops

const FOOTWAY_STYLE: PathOptions = {
  color: "#059669",
  weight: 2,
  opacity: 0.7,
};

const PEDESTRIAN_STYLE: PathOptions = {
  color: "#10b981",
  weight: 3,
  opacity: 0.85,
};

const PATH_STYLE: PathOptions = {
  color: "#64748B",
  weight: 1.5,
  opacity: 0.5,
  dashArray: "3 3",
};

function styleForFeature(f?: Feature): PathOptions {
  if (!f) return { weight: 0 };
  const h = f.properties?.highway;
  if (h === "pedestrian") return PEDESTRIAN_STYLE;
  if (h === "footway" || h === "living_street") return FOOTWAY_STYLE;
  if (h === "path" || h === "steps") return PATH_STYLE;
  return FOOTWAY_STYLE;
}

function popupFor(f: Feature): string {
  const p = f.properties ?? {};
  const name = p.name || "";
  const kind =
    p.highway === "pedestrian" ? "stradă pietonală"
    : p.highway === "footway" ? "trotuar"
    : p.highway === "living_street" ? "zonă locuibilă"
    : p.highway === "steps" ? "trepte"
    : p.highway === "path" ? "potecă"
    : "zonă pietonală";
  return `<div style="min-width:160px"><b>${name || "Zonă pietonală"}</b><br/><span style="font-size:11px;color:#64748b">${kind}</span></div>`;
}

export function DynamicPedestrianLayer() {
  const map = useMap();
  const [data, setData] = useState<GeoJsonObject | null>(null);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const lastBboxRef = useRef("");

  const fetchFeatures = useCallback(() => {
    const zoom = map.getZoom();
    if (zoom < MIN_ZOOM) {
      setData(null);
      return;
    }

    const bounds = map.getBounds();
    const bbox = `${bounds.getSouth().toFixed(3)},${bounds.getWest().toFixed(3)},${bounds.getNorth().toFixed(3)},${bounds.getEast().toFixed(3)}`;
    if (bbox === lastBboxRef.current) return;
    lastBboxRef.current = bbox;

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setLoading(true);

    // Pedestrian + footway + pedestrian zones. "designated" foot tag
    // catches shared footpaths that aren't formally tagged as highway=
    // footway (bike paths that pedestrians can also use). "path" + "steps"
    // round out the network so the user gets a complete walkable graph.
    const query = `
      [out:json][timeout:20];
      (
        way["highway"~"^(footway|pedestrian|path|steps|living_street)$"](${bbox});
        way["foot"="designated"](${bbox});
        way["area:highway"="pedestrian"](${bbox});
      );
      out geom;
    `.replace(/\s+/g, " ");

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

  useMapEvents({
    moveend: () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(fetchFeatures, DEBOUNCE);
    },
    zoomend: () => {
      if (map.getZoom() < MIN_ZOOM) {
        setData(null);
        return;
      }
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(fetchFeatures, DEBOUNCE);
    },
  });

  useEffect(() => {
    if (map.getZoom() >= MIN_ZOOM) fetchFeatures();
  }, [map, fetchFeatures]);

  return (
    <>
      {data && (
        <GeoJSON
          key={lastBboxRef.current}
          data={data}
          style={styleForFeature}
          onEachFeature={(f, layer) => layer.bindPopup(popupFor(f))}
        />
      )}
      {loading && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[1000] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full px-4 py-1.5 shadow-lg text-xs text-[var(--color-text-muted)]">
          Se încarcă trotuarele...
        </div>
      )}
      {!loading && !data && map.getZoom() < MIN_ZOOM && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[1000] bg-[var(--color-surface)]/90 backdrop-blur border border-[var(--color-border)] rounded-full px-4 py-1.5 shadow-lg text-xs text-[var(--color-text-muted)] pointer-events-none">
          Zoom la oraș pentru a vedea trotuarele
        </div>
      )}
    </>
  );
}
