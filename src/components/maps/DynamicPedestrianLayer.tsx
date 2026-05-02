"use client";

import type { PathOptions } from "leaflet";
import type { Feature } from "geojson";
import { useProgressiveOverpassLayer } from "./useProgressiveOverpassLayer";

/**
 * Dynamic pedestrian layer — footways, pedestrian streets, paths, steps
 * fetched from Overpass for the current viewport. The static
 * pietonal-romania.json was 23 MB and nuked mobile first-load; this
 * swaps that for on-demand fetches scoped to what the user sees.
 *
 * All the progressive-rendering machinery (persistent Leaflet layer,
 * rAF chunking, FIFO cache, non-blanking pans) lives in
 * useProgressiveOverpassLayer.
 */

const MIN_ZOOM = 13;

const FOOTWAY_STYLE: PathOptions = { color: "#059669", weight: 2, opacity: 0.7 };
const PEDESTRIAN_STYLE: PathOptions = { color: "#10b981", weight: 3, opacity: 0.85 };
const PATH_STYLE: PathOptions = { color: "#64748B", weight: 1.5, opacity: 0.5, dashArray: "3 3" };

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

function buildQuery(bbox: string): string {
  return `
    [out:json][timeout:20];
    (
      way["highway"~"^(footway|pedestrian|path|steps|living_street)$"](${bbox});
      way["foot"="designated"](${bbox});
      way["area:highway"="pedestrian"](${bbox});
    );
    out geom;
  `;
}

export function DynamicPedestrianLayer() {
  const { loading, lowZoom } = useProgressiveOverpassLayer({
    cacheNamespace: "pedestrian",
    minZoom: MIN_ZOOM,
    buildQuery,
    styleFn: styleForFeature,
    popupFn: popupFor,
  });

  return (
    <>
      {loading && !lowZoom && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] inline-flex items-center gap-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full px-3.5 py-1.5 shadow-lg text-xs font-medium text-[var(--color-text)] pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse" aria-hidden="true" />
          Se încarcă trotuarele…
        </div>
      )}
      {lowZoom && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] inline-flex items-center gap-1.5 bg-[var(--color-surface)]/95 backdrop-blur border border-[var(--color-border)] rounded-full px-3.5 py-1.5 shadow-lg text-xs font-medium text-[var(--color-text-muted)] pointer-events-none">
          🔍 Mărește (zoom 13+) ca să vezi trotuarele
        </div>
      )}
    </>
  );
}
