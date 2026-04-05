"use client";

import { Circle } from "react-leaflet";
import { GeoJsonLayer } from "./GeoJsonLayer";
import { accidente } from "@/data/accidente";
import { METRO_COLORS } from "@/lib/constants";
import type { PathOptions } from "leaflet";
import type { Feature } from "geojson";

interface HartiLayersProps {
  activeTab: "bicicleta" | "pejos" | "transport" | "statistici";
  showDedicate: boolean;
  showMarcate: boolean;
  showRecomandate: boolean;
  showParcuri: boolean;
  showPietonal: boolean;
  showTraversari: boolean;
  visibleLines: string[];
  statsMode: "accidente" | "aer" | "densitate";
}

const accidentColor = { 1: "#EAB308", 2: "#F97316", 3: "#DC2626" };

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

const pedestrianStyle: PathOptions = {
  color: "#8B5CF6",
  weight: 2,
  opacity: 0.6,
  fillColor: "#8B5CF6",
  fillOpacity: 0.15,
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
  return `<div><b>${p.name ?? "Zonă pietonală"}</b></div>`;
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
          <GeoJsonLayer url="/geojson/pietonal.json" style={pedestrianStyle} popupFormatter={pedestrianPopup} />
        )}
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

  if (activeTab === "statistici") {
    if (statsMode === "accidente") {
      return (
        <>
          {accidente.map((a) => (
            <Circle
              key={a.id}
              center={[a.lat, a.lng]}
              radius={a.severity * 120}
              pathOptions={{
                color: accidentColor[a.severity],
                fillColor: accidentColor[a.severity],
                fillOpacity: 0.35,
                weight: 1.5,
              }}
            />
          ))}
        </>
      );
    }
    if (statsMode === "aer") {
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
    if (statsMode === "densitate") {
      return (
        <>
          {accidente.map((a, i) => {
            // deterministic "random" based on id hash for stable rendering
            const seed = (a.id.charCodeAt(a.id.length - 1) + i * 17) % 300;
            return (
              <Circle
                key={a.id}
                center={[a.lat + 0.002, a.lng - 0.002]}
                radius={200 + seed}
                pathOptions={{
                  color: "#8B5CF6",
                  fillColor: "#8B5CF6",
                  fillOpacity: 0.2,
                  weight: 0.5,
                }}
              />
            );
          })}
        </>
      );
    }
  }

  return null;
}
