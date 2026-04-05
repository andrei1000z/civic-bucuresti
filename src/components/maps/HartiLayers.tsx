"use client";

import { Circle } from "react-leaflet";
import { GeoJsonLayer } from "./GeoJsonLayer";
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

const aerSectors = [
  { center: [44.465, 26.08] as [number, number], aqi: 68, radius: 2000 },
  { center: [44.458, 26.12] as [number, number], aqi: 82, radius: 2000 },
  { center: [44.42, 26.15] as [number, number], aqi: 94, radius: 2200 },
  { center: [44.4, 26.12] as [number, number], aqi: 75, radius: 2000 },
  { center: [44.4, 26.05] as [number, number], aqi: 108, radius: 2200 },
  { center: [44.44, 26.02] as [number, number], aqi: 71, radius: 2000 },
];

function aqiColor(aqi: number): string {
  if (aqi < 50) return "#059669";
  if (aqi < 80) return "#EAB308";
  if (aqi < 100) return "#F97316";
  return "#DC2626";
}

// Categorize bike path by OSM tags
function bikePathCategory(feature: Feature): "dedicata" | "marcata" | "recomandata" {
  const p = feature.properties ?? {};
  if (p.highway === "cycleway" || p.cycleway === "track") return "dedicata";
  if (p.cycleway === "lane" || p.cycleway === "opposite") return "marcata";
  return "recomandata";
}

const bikeStyle = (show: { dedicata: boolean; marcata: boolean; recomandata: boolean }) =>
  (feature?: Feature): PathOptions => {
    if (!feature) return { weight: 0 };
    const cat = bikePathCategory(feature);
    const visible =
      (cat === "dedicata" && show.dedicata) ||
      (cat === "marcata" && show.marcata) ||
      (cat === "recomandata" && show.recomandata);
    if (!visible) return { weight: 0, opacity: 0 };
    const colors = { dedicata: "#059669", marcata: "#EAB308", recomandata: "#2563EB" };
    return {
      color: colors[cat],
      weight: 4,
      opacity: 0.85,
      dashArray: cat === "recomandata" ? "8 6" : undefined,
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
  const cat = bikePathCategory(feature);
  const catLabel = { dedicata: "Dedicată", marcata: "Marcată", recomandata: "Recomandată" }[cat];
  return `<div style="min-width:180px"><b>${name}</b><br/><span style="font-size:11px;color:#64748b">${catLabel}</span></div>`;
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

  if (activeTab === "bicicleta") {
    return (
      <GeoJsonLayer
        url="/geojson/bicicleta.json"
        style={bikeStyle({
          dedicata: showDedicate,
          marcata: showMarcate,
          recomandata: showRecomandate,
        })}
        popupFormatter={bikePopup}
      />
    );
  }

  if (activeTab === "pejos") {
    return (
      <>
        {showParcuri && (
          <GeoJsonLayer url="/geojson/parcuri.json" style={parkStyle} popupFormatter={parkPopup} />
        )}
        {showPietonal && (
          <GeoJsonLayer url="/geojson/pietonal-accesibil.json" style={pedestrianAccessStyle} popupFormatter={pedestrianPopup} />
        )}
        <GeoJsonLayer url="/geojson/pietonal-neaccesibil.json" style={pedestrianRestrictedStyle} popupFormatter={pedestrianRestrictedPopup} />
      </>
    );
  }

  if (activeTab === "auto") {
    return (
      <>
        <GeoJsonLayer url="/geojson/auto-accesibil.json" style={autoAccessStyle} popupFormatter={autoPopup} />
        <GeoJsonLayer url="/geojson/auto-restrictionat.json" style={autoRestrictedStyle} popupFormatter={autoPopup} />
      </>
    );
  }

  if (activeTab === "transport") {
    return (
      <>
        <GeoJsonLayer url="/geojson/metrou.json" style={metroLineStyle(visibleLines)} popupFormatter={metroLinePopup} />
        <GeoJsonLayer url="/geojson/metrou-statii.json" style={metroStationStyle()} popupFormatter={metroStationPopup} />
        <GeoJsonLayer url="/geojson/tramvai.json" style={tramStyle} />
      </>
    );
  }

  if (activeTab === "statistici" && statsMode === "aer") {
    return (
      <>
        {aerSectors.map((s, i) => (
          <Circle
            key={i}
            center={s.center}
            radius={s.radius}
            pathOptions={{
              color: aqiColor(s.aqi),
              fillColor: aqiColor(s.aqi),
              fillOpacity: 0.3,
              weight: 2,
            }}
          />
        ))}
      </>
    );
  }

  return null;
}
