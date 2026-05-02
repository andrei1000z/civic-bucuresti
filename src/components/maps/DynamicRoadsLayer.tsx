"use client";

import type { PathOptions } from "leaflet";
import type { Feature } from "geojson";
import { useProgressiveOverpassLayer } from "./useProgressiveOverpassLayer";

/**
 * Dynamic roads layer — residential / service / unclassified streets
 * fetched from Overpass for the current viewport. Shares the same
 * progressive-rendering engine as the pedestrian and transit layers:
 * features stream in via requestAnimationFrame, cached by bbox grid
 * cell, and survive pans without blanking.
 */

const MIN_ZOOM = 13;

const STREET_STYLE: PathOptions = { color: "#64748B", weight: 1.5, opacity: 0.6 };
const SERVICE_STYLE: PathOptions = { color: "#94A3B8", weight: 1, opacity: 0.5 };
const LIVING_STYLE: PathOptions = { color: "#475569", weight: 1.75, opacity: 0.7 };

function styleForFeature(f?: Feature): PathOptions {
  if (!f) return { weight: 0 };
  const h = f.properties?.highway;
  if (h === "service") return SERVICE_STYLE;
  if (h === "living_street") return LIVING_STYLE;
  return STREET_STYLE;
}

function popupFor(f: Feature): string {
  const p = f.properties ?? {};
  const name = p.name || p.ref || "Stradă";
  const kind =
    p.highway === "residential" ? "stradă rezidențială"
    : p.highway === "service" ? "drum de serviciu"
    : p.highway === "unclassified" ? "stradă neclasificată"
    : p.highway === "living_street" ? "zonă locuibilă"
    : "stradă";
  return `<div style="min-width:160px"><b>${name}</b><br/><span style="font-size:11px;color:#64748b">${kind}</span></div>`;
}

function buildQuery(bbox: string): string {
  return `
    [out:json][timeout:15];
    (
      way["highway"~"^(residential|unclassified|living_street|service)$"](${bbox});
    );
    out geom;
  `;
}

export function DynamicRoadsLayer() {
  const { loading, lowZoom } = useProgressiveOverpassLayer({
    cacheNamespace: "roads",
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
          Se încarcă străzile…
        </div>
      )}
      {lowZoom && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] inline-flex items-center gap-1.5 bg-[var(--color-surface)]/95 backdrop-blur border border-[var(--color-border)] rounded-full px-3.5 py-1.5 shadow-lg text-xs font-medium text-[var(--color-text-muted)] pointer-events-none">
          🔍 Mărește (zoom 13+) ca să vezi străzile
        </div>
      )}
    </>
  );
}
