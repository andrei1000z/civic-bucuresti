"use client";

import L from "leaflet";
import type { PathOptions, Layer, LatLng, CircleMarkerOptions } from "leaflet";
import type { Feature } from "geojson";
import { useProgressiveOverpassLayer } from "./useProgressiveOverpassLayer";

/**
 * Dynamic transit layer — bus / trolley / tram stops + any additional
 * tram ways outside the static tramvai-romania.json that live in the
 * current viewport. Powers the Transport tab's "at this zoom you see
 * every station in the city" feel without downloading the entire
 * national transit graph up front.
 *
 * Runs at zoom >= 13 (city level). The static metrou.json,
 * metrou-statii.json and tramvai-romania.json already cover the
 * bird's-eye view — this hook fills in the street-level detail
 * progressively as the user zooms in.
 */

const MIN_ZOOM = 13;

const TRAM_STYLE: PathOptions = { color: "#EAB308", weight: 3, opacity: 0.85, dashArray: "4 4" };
const TROLLEY_STYLE: PathOptions = { color: "#8B5CF6", weight: 2.5, opacity: 0.75, dashArray: "2 3" };
const LIGHTRAIL_STYLE: PathOptions = { color: "#F59E0B", weight: 3, opacity: 0.85 };

function styleForFeature(f?: Feature): PathOptions {
  if (!f) return { weight: 0 };
  const p = f.properties ?? {};
  if (p.railway === "tram") return TRAM_STYLE;
  if (p.railway === "light_rail") return LIGHTRAIL_STYLE;
  if (p.route === "trolleybus") return TROLLEY_STYLE;
  return { weight: 0 };
}

function popupFor(f: Feature): string {
  const p = f.properties ?? {};
  const name = p.name || p.ref || "Stație";
  const kind =
    p.highway === "bus_stop" ? "stație autobuz"
    : p.railway === "tram_stop" ? "stație tramvai"
    : p.public_transport === "stop_position" && p.bus === "yes" ? "stație autobuz"
    : p.public_transport === "stop_position" && p.tram === "yes" ? "stație tramvai"
    : p.public_transport === "platform" ? "peron"
    : p.amenity === "bus_station" ? "autogară"
    : p.railway === "tram" ? "linie tramvai"
    : p.railway === "light_rail" ? "tren ușor"
    : p.route === "trolleybus" ? "linie troleibuz"
    : "transport public";
  const operator = p.operator ? `<br/><span style="font-size:10px;color:#94a3b8">${p.operator}</span>` : "";
  return `<div style="min-width:160px"><b>${name}</b><br/><span style="font-size:11px;color:#64748b">${kind}</span>${operator}</div>`;
}

const BUS_STOP_STYLE: CircleMarkerOptions = {
  radius: 4,
  fillColor: "#EA580C",
  color: "#ffffff",
  weight: 1.5,
  fillOpacity: 0.95,
};

const TRAM_STOP_STYLE: CircleMarkerOptions = {
  radius: 5,
  fillColor: "#EAB308",
  color: "#ffffff",
  weight: 1.5,
  fillOpacity: 0.95,
};

const TROLLEY_STOP_STYLE: CircleMarkerOptions = {
  radius: 4,
  fillColor: "#8B5CF6",
  color: "#ffffff",
  weight: 1.5,
  fillOpacity: 0.95,
};

function pointToLayer(feature: Feature, latlng: LatLng): Layer {
  const p = feature.properties ?? {};
  let style: CircleMarkerOptions = BUS_STOP_STYLE;
  if (p.railway === "tram_stop" || p.tram === "yes") style = TRAM_STOP_STYLE;
  else if (p.trolleybus === "yes") style = TROLLEY_STOP_STYLE;
  return L.circleMarker(latlng, style);
}

function buildQuery(bbox: string): string {
  return `
    [out:json][timeout:20];
    (
      node["highway"="bus_stop"](${bbox});
      node["railway"="tram_stop"](${bbox});
      node["public_transport"="stop_position"](${bbox});
      node["amenity"="bus_station"](${bbox});
      way["railway"="tram"](${bbox});
      way["railway"="light_rail"](${bbox});
      relation["route"="trolleybus"](${bbox});
    );
    out geom;
  `;
}

export function DynamicTransitLayer() {
  const { loading, lowZoom } = useProgressiveOverpassLayer({
    cacheNamespace: "transit",
    minZoom: MIN_ZOOM,
    buildQuery,
    styleFn: styleForFeature,
    popupFn: popupFor,
    pointToLayer,
  });

  return (
    <>
      {loading && !lowZoom && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] inline-flex items-center gap-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full px-3.5 py-1.5 shadow-lg text-xs font-medium text-[var(--color-text)] pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse" aria-hidden="true" />
          Se încarcă stațiile…
        </div>
      )}
      {lowZoom && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] inline-flex items-center gap-1.5 bg-[var(--color-surface)]/95 backdrop-blur border border-[var(--color-border)] rounded-full px-3.5 py-1.5 shadow-lg text-xs font-medium text-[var(--color-text-muted)] pointer-events-none">
          🔍 Mărește (zoom 13+) ca să vezi stațiile
        </div>
      )}
    </>
  );
}
