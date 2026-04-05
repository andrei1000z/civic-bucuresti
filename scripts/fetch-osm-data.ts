// Fetch real Bucharest geography from OpenStreetMap Overpass API
// Saves GeoJSON to public/geojson/ for use in Leaflet maps
// Usage: npm run fetch-osm

import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const OVERPASS_MIRRORS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.openstreetmap.fr/api/interpreter",
];
const OUTPUT_DIR = join(process.cwd(), "public", "geojson");

// Bucharest bounding box: [south, west, north, east]
const BUCHAREST_BBOX = "44.33,25.97,44.55,26.25";

interface OverpassElement {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  nodes?: number[];
  tags?: Record<string, string>;
  geometry?: { lat: number; lon: number }[];
  members?: Array<{ type: string; ref: number; role: string; geometry?: { lat: number; lon: number }[] }>;
}

interface OverpassResponse {
  version: number;
  generator: string;
  elements: OverpassElement[];
}

interface GeoJSONFeature {
  type: "Feature";
  properties: Record<string, string | number | undefined>;
  geometry: {
    type: "LineString" | "Point" | "Polygon" | "MultiLineString";
    coordinates: number[] | number[][] | number[][][];
  };
}

interface GeoJSONCollection {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function queryOverpass(query: string, label: string): Promise<OverpassResponse> {
  console.log(`🌍 Fetching ${label}...`);
  const body = `[out:json][timeout:90];${query}out geom;`;

  for (const mirror of OVERPASS_MIRRORS) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const res = await fetch(mirror, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `data=${encodeURIComponent(body)}`,
        });
        if (res.ok) {
          const data = (await res.json()) as OverpassResponse;
          console.log(`   → ${data.elements.length} elements (via ${new URL(mirror).hostname})`);
          return data;
        }
        if ((res.status === 429 || res.status === 504 || res.status === 503) && attempt < 3) {
          const wait = attempt * 20000;
          console.log(`   ⏳ ${res.status}, waiting ${wait / 1000}s...`);
          await sleep(wait);
          continue;
        }
        console.log(`   ✗ ${mirror} → ${res.status}, trying next mirror`);
        break;
      } catch (e) {
        console.log(`   ✗ ${mirror} → error, trying next mirror`);
        break;
      }
    }
  }
  throw new Error(`Overpass ${label} failed on all mirrors`);
}

async function fetchAndSave(
  fileName: string,
  query: string,
  label: string,
  extra: Record<string, string | number | undefined> = {}
): Promise<void> {
  const path = join(OUTPUT_DIR, `${fileName}.json`);
  if (existsSync(path)) {
    console.log(`⏭  ${fileName}.json exists, skipping`);
    return;
  }
  const data = await queryOverpass(query, label);
  save(fileName, toGeoJSON(data, extra));
  await sleep(5000);
}

function elementToGeoJSON(
  el: OverpassElement,
  extraProps: Record<string, string | number | undefined> = {}
): GeoJSONFeature | null {
  const props = { ...(el.tags ?? {}), osm_id: el.id, ...extraProps };

  if (el.type === "node" && el.lat != null && el.lon != null) {
    return {
      type: "Feature",
      properties: props,
      geometry: { type: "Point", coordinates: [el.lon, el.lat] },
    };
  }

  if (el.type === "way" && el.geometry && el.geometry.length >= 2) {
    const coords = el.geometry.map((p) => [p.lon, p.lat]);
    const isClosed =
      coords.length >= 4 &&
      coords[0][0] === coords[coords.length - 1][0] &&
      coords[0][1] === coords[coords.length - 1][1];
    if (isClosed && (el.tags?.area === "yes" || el.tags?.leisure === "park" || el.tags?.landuse)) {
      return {
        type: "Feature",
        properties: props,
        geometry: { type: "Polygon", coordinates: [coords] },
      };
    }
    return {
      type: "Feature",
      properties: props,
      geometry: { type: "LineString", coordinates: coords },
    };
  }

  if (el.type === "relation" && el.members) {
    // Convert relation ways to MultiLineString
    const lines: number[][][] = [];
    for (const m of el.members) {
      if (m.geometry && m.geometry.length >= 2) {
        lines.push(m.geometry.map((p) => [p.lon, p.lat]));
      }
    }
    if (lines.length === 0) return null;
    return {
      type: "Feature",
      properties: props,
      geometry: { type: "MultiLineString", coordinates: lines },
    };
  }

  return null;
}

function toGeoJSON(response: OverpassResponse, extra: Record<string, string | number | undefined> = {}): GeoJSONCollection {
  const features: GeoJSONFeature[] = [];
  for (const el of response.elements) {
    const feat = elementToGeoJSON(el, extra);
    if (feat) features.push(feat);
  }
  return { type: "FeatureCollection", features };
}

function save(name: string, data: GeoJSONCollection) {
  const path = join(OUTPUT_DIR, `${name}.json`);
  writeFileSync(path, JSON.stringify(data), "utf-8");
  const sizeKB = (JSON.stringify(data).length / 1024).toFixed(0);
  console.log(`   ✓ Saved ${name}.json (${data.features.length} features, ${sizeKB}KB)`);
}

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });

  await fetchAndSave(
    "bicicleta",
    `(
      way["highway"="cycleway"](${BUCHAREST_BBOX});
      way["cycleway"~"lane|track|opposite|shared_lane"](${BUCHAREST_BBOX});
      way["bicycle"="designated"](${BUCHAREST_BBOX});
    );`,
    "bike paths"
  );

  await fetchAndSave(
    "metrou",
    `(
      relation["route"="subway"]["network"~"Metrorex|București"](${BUCHAREST_BBOX});
    );`,
    "metro lines"
  );

  await fetchAndSave(
    "metrou-statii",
    `(
      node["railway"="station"]["subway"="yes"](${BUCHAREST_BBOX});
      node["station"="subway"](${BUCHAREST_BBOX});
    );`,
    "metro stations"
  );

  await fetchAndSave(
    "tramvai",
    `(
      relation["route"="tram"](${BUCHAREST_BBOX});
    );`,
    "tram lines"
  );

  await fetchAndSave(
    "pietonal",
    `(
      way["highway"="pedestrian"](${BUCHAREST_BBOX});
      way["highway"="footway"]["area"="yes"](${BUCHAREST_BBOX});
    );`,
    "pedestrian areas"
  );

  await fetchAndSave(
    "parcuri",
    `(
      way["leisure"="park"](${BUCHAREST_BBOX});
    );`,
    "parks"
  );

  console.log("\n✅ OSM data fetched successfully!");
  console.log(`   Files saved to: ${OUTPUT_DIR}`);
}

main().catch((e) => {
  console.error("❌ Fetch failed:", e);
  process.exit(1);
});
