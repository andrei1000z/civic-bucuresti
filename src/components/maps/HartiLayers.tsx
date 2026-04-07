"use client";

import { useMemo } from "react";
import { GeoJsonLayer } from "./GeoJsonLayer";
import { AqiHeatmapLayer } from "./AqiHeatmapLayer";
import { METRO_COLORS } from "@/lib/constants";
import type { PathOptions } from "leaflet";
import type { Feature } from "geojson";

interface HartiLayersProps {
  activeTab: "bicicleta" | "pejos" | "auto" | "transport" | "statistici";
  showDedicate: boolean;
  showMarcate: boolean;
  showRecomandate: boolean;
  showParcuri: boolean;
  showPietonal: boolean;
  showTraversari: boolean;
  visibleLines: string[];
  statsMode: "accidente" | "aer" | "densitate";
}

// All bike paths shown as green — no categories, no "recomandate"
function bikePathFilter(feature: Feature): boolean {
  const p = feature.properties ?? {};
  // Only show dedicated cycleways and marked lanes, NOT recommended routes
  return p.highway === "cycleway" || p.cycleway === "track" || p.cycleway === "lane" || p.cycleway === "opposite" || p.bicycle === "designated";
}

const bikeStyle = () =>
  (feature?: Feature): PathOptions => {
    if (!feature) return { weight: 0 };
    if (!bikePathFilter(feature)) return { weight: 0, opacity: 0 };
    return {
      color: "#059669",
      weight: 4,
      opacity: 0.85,
    };
  };

// Metro line styling — colour from OSM tags or fallback to METRO_COLORS
function metroLineStyle(visibleLines: string[]) {
  return (feature?: Feature): PathOptions => {
    if (!feature) return { weight: 0 };
    const ref = (feature.properties?.ref as string) ?? "";
    if (!visibleLines.includes(ref)) return { weight: 0, opacity: 0 };
    const color = (feature.properties?.colour as string) ?? METRO_COLORS[ref] ?? "#64748b";
    return { color, weight: 5, opacity: 0.85 };
  };
}

function metroStationStyle(): PathOptions {
  return {
    radius: 6,
    fillColor: "#ffffff",
    color: "#1e293b",
    weight: 2,
    opacity: 1,
    fillOpacity: 1,
  } as PathOptions;
}

const pedestrianAccessStyle: PathOptions = {
  color: "#059669", // green — pedestrian friendly
  weight: 2.5,
  opacity: 0.75,
};

const pedestrianRestrictedStyle: PathOptions = {
  color: "#DC2626", // red — restricted/private
  weight: 2.5,
  opacity: 0.65,
  dashArray: "4 4",
};

const autoAccessStyle: PathOptions = {
  color: "#2563EB", // blue — driveable city street
  weight: 1.5,
  opacity: 0.5,
};

const autoRestrictedStyle: PathOptions = {
  color: "#F97316", // orange — major roads, no pedestrians
  weight: 3,
  opacity: 0.8,
};

const parkStyle: PathOptions = {
  color: "#059669",
  weight: 1.5,
  opacity: 0.7,
  fillColor: "#10b981",
  fillOpacity: 0.25,
};

const tramStyle: PathOptions = {
  color: "#EAB308",
  weight: 3,
  opacity: 0.7,
  dashArray: "4 4",
};

function bikePopup(feature: Feature): string {
  const p = feature.properties ?? {};
  const name = p.name ?? "Pistă de bicicletă";
  return `<div style="min-width:180px"><b>${name}</b><br/><span style="font-size:11px;color:#64748b">Pistă ciclism</span></div>`;
}

function metroLinePopup(feature: Feature): string {
  const p = feature.properties ?? {};
  const name = p.name ?? `Linia ${p.ref ?? ""}`;
  return `<div><b>${name}</b><br/><span style="font-size:11px;color:#64748b">${p.operator ?? "Metrorex"}</span></div>`;
}

function metroStationPopup(feature: Feature): string {
  const p = feature.properties ?? {};
  return `<div><b>${p.name ?? "Stație metrou"}</b><br/><span style="font-size:11px;color:#64748b">${p.operator ?? "Metrorex"}</span></div>`;
}

function pedestrianPopup(feature: Feature): string {
  const p = feature.properties ?? {};
  const name = p.name ?? "Zonă pietonală";
  const type = p.highway === "pedestrian" ? "stradă pietonală" : p.highway === "footway" ? "trotuar" : "cale";
  return `<div><b>${name}</b><br/><span style="font-size:11px;color:#64748b">${type}</span></div>`;
}

function pedestrianRestrictedPopup(feature: Feature): string {
  const p = feature.properties ?? {};
  return `<div><b>${p.name ?? "Acces restricționat"}</b><br/><span style="font-size:11px;color:#64748b">privat / interzis pietonilor</span></div>`;
}

function autoPopup(feature: Feature): string {
  const p = feature.properties ?? {};
  const name = p.name ?? "Stradă";
  const type = p.highway ?? "";
  return `<div><b>${name}</b><br/><span style="font-size:11px;color:#64748b">${type}</span></div>`;
}

function parkPopup(feature: Feature): string {
  const p = feature.properties ?? {};
  return `<div><b>${p.name ?? "Parc"}</b></div>`;
}

export default function HartiLayers(props: HartiLayersProps) {
  const {
    activeTab,
    showDedicate,
    showMarcate,
    showRecomandate,
    showParcuri,
    showPietonal,
    visibleLines,
    statsMode,
  } = props;

  // Memoize style functions — stable references prevent GeoJSON re-creation on every map pan/zoom
  const memoizedBikeStyle = useMemo(
    () => bikeStyle(),
    [showDedicate, showMarcate, showRecomandate]
  );
  const memoizedMetroStyle = useMemo(() => metroLineStyle(visibleLines), [visibleLines]);

  if (activeTab === "bicicleta") {
    return (
      <GeoJsonLayer
        key="bike"
        url="/geojson/bicicleta-romania.json"
        style={memoizedBikeStyle}
        popupFormatter={bikePopup}
      />
    );
  }

  if (activeTab === "pejos") {
    return (
      <>
        {showParcuri && (
          <GeoJsonLayer key="parks" url="/geojson/parcuri-romania.json" style={parkStyle} popupFormatter={parkPopup} />
        )}
        {showPietonal && (
          <GeoJsonLayer key="ped-ok" url="/geojson/pietonal-romania.json" style={pedestrianAccessStyle} popupFormatter={pedestrianPopup} />
        )}
        <GeoJsonLayer key="ped-no" url="/geojson/pietonal-neaccesibil.json" style={pedestrianRestrictedStyle} popupFormatter={pedestrianRestrictedPopup} />
      </>
    );
  }

  if (activeTab === "auto") {
    return (
      <>
        <GeoJsonLayer key="auto-ok" url="/geojson/auto-accesibil.json" style={autoAccessStyle} popupFormatter={autoPopup} />
        <GeoJsonLayer key="auto-no" url="/geojson/auto-restrictionat.json" style={autoRestrictedStyle} popupFormatter={autoPopup} />
      </>
    );
  }

  if (activeTab === "transport") {
    return (
      <>
        <GeoJsonLayer key="metro-lines" url="/geojson/metrou.json" style={memoizedMetroStyle} popupFormatter={metroLinePopup} />
        <GeoJsonLayer key="metro-stations" url="/geojson/metrou-statii.json" style={metroStationStyle()} popupFormatter={metroStationPopup} />
        <GeoJsonLayer key="trams" url="/geojson/tramvai-romania.json" style={tramStyle} />
      </>
    );
  }

  if (activeTab === "statistici" && statsMode === "aer") {
    return <AqiHeatmapLayer key="aqi-heatmap" />;
  }

  return null;
}
