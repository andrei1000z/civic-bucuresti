// Fetch real Bucharest geodata from OpenStreetMap via Overpass API.
// Usage: npx tsx scripts/fetch-osm-bucharest.ts
//
// Writes GeoJSON files to public/geojson/ — commit them to the repo.
// Overpass rate-limits are polite: ~2 heavy queries/minute. Run ONCE,
// re-run only when OSM data changes significantly (~monthly).

import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const OUT_DIR = join(process.cwd(), "public", "geojson");
mkdirSync(OUT_DIR, { recursive: true });

// Bucharest bounding box (slightly padded to catch edge metro stations)
const BBOX = "44.33,25.97,44.55,26.25";

// Overpass mirrors — we retry on failure
const MIRRORS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
];

async function overpass(query: string, retries = 3): Promise<unknown> {
  const body = `[out:json][timeout:60];${query}out geom;`;
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < retries; attempt++) {
    const url = MIRRORS[attempt % MIRRORS.length];
    try {
      const res = await fetch(url, {
        method: "POST",
        body: `data=${encodeURIComponent(body)}`,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      if (res.ok) {
        const text = await res.text();
        if (text.includes("runtime error") || text.includes("rate_limited")) {
          throw new Error("Overpass rate-limited or timed out");
        }
        return JSON.parse(text);
      }
      lastError = new Error(`${url}: HTTP ${res.status}`);
    } catch (e) {
      lastError = e as Error;
    }
    console.log(`  retry ${attempt + 1}/${retries} (switching mirror)...`);
    await sleep(5000 + attempt * 5000);
  }
  throw lastError ?? new Error("All overpass mirrors failed");
}

// Convert Overpass JSON result into simple GeoJSON FeatureCollection
interface OverpassElement {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  geometry?: { lat: number; lon: number }[];
  tags?: Record<string, string>;
  members?: { type: string; ref: number; role: string; geometry?: { lat: number; lon: number }[] }[];
}

interface OverpassResponse {
  elements: OverpassElement[];
}

// deno-lint-ignore no-explicit-any
function toGeoJson(data: any): object {
  const features: object[] = [];
  const typed = data as OverpassResponse;
  for (const el of typed.elements ?? []) {
    if (el.type === "node" && el.lat !== undefined && el.lon !== undefined) {
      features.push({
        type: "Feature",
        id: `node/${el.id}`,
        properties: el.tags ?? {},
        geometry: { type: "Point", coordinates: [el.lon, el.lat] },
      });
    } else if (el.type === "way" && el.geometry) {
      const coords = el.geometry.map((g) => [g.lon, g.lat]);
      const isArea = el.tags?.area === "yes" || el.tags?.leisure === "park" || el.tags?.landuse;
      if (isArea && coords.length > 2) {
        // Close polygon if not already closed
        if (coords[0][0] !== coords[coords.length - 1][0] || coords[0][1] !== coords[coords.length - 1][1]) {
          coords.push(coords[0]);
        }
        features.push({
          type: "Feature",
          id: `way/${el.id}`,
          properties: el.tags ?? {},
          geometry: { type: "Polygon", coordinates: [coords] },
        });
      } else {
        features.push({
          type: "Feature",
          id: `way/${el.id}`,
          properties: el.tags ?? {},
          geometry: { type: "LineString", coordinates: coords },
        });
      }
    } else if (el.type === "relation" && el.members) {
      // Combine all way members into MultiLineString
      const lines: number[][][] = [];
      for (const m of el.members) {
        if (m.type === "way" && m.geometry) {
          lines.push(m.geometry.map((g) => [g.lon, g.lat]));
        }
      }
      if (lines.length > 0) {
        features.push({
          type: "Feature",
          id: `relation/${el.id}`,
          properties: el.tags ?? {},
          geometry: { type: "MultiLineString", coordinates: lines },
        });
      }
    }
  }
  return { type: "FeatureCollection", features };
}

function save(name: string, geojson: object) {
  const path = join(OUT_DIR, `${name}.json`);
  writeFileSync(path, JSON.stringify(geojson));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const n = ((geojson as any).features as unknown[]).length;
  console.log(`✓ ${name}.json — ${n} features`);
}

async function run() {
  console.log("Fetching Bucharest geodata from OpenStreetMap...\n");

  // 1. Bike infrastructure — dedicated cycleways + on-road lanes
  console.log("→ bicicleta (cycleways + lanes)");
  const bike = await overpass(`(
    way["highway"="cycleway"](${BBOX});
    way["cycleway"~"lane|track|opposite_track|opposite_lane"](${BBOX});
    way["cycleway:left"~"lane|track"](${BBOX});
    way["cycleway:right"~"lane|track"](${BBOX});
    way["cycleway:both"~"lane|track"](${BBOX});
  );`);
  save("bicicleta", toGeoJson(bike));

  await sleep(3000); // polite delay

  // 2. Metro lines (Metrorex)
  console.log("→ metrou (M1-M5 relations)");
  const metroRels = await overpass(`(
    relation["route"="subway"]["network"~"Metrorex|Societatea de Transport București"](${BBOX});
    relation["route"="subway"](${BBOX});
  );`);
  save("metrou", toGeoJson(metroRels));

  await sleep(3000);

  // 3. Metro stations
  console.log("→ metrou-statii");
  const metroStations = await overpass(`(
    node["station"="subway"](${BBOX});
    node["railway"="station"]["subway"="yes"](${BBOX});
  );`);
  save("metrou-statii", toGeoJson(metroStations));

  await sleep(3000);

  // 4. Tram lines
  console.log("→ tramvai");
  const tram = await overpass(`(
    way["railway"="tram"](${BBOX});
  );`);
  save("tramvai", toGeoJson(tram));

  await sleep(3000);

  // 5. Pedestrian zones (accessible)
  console.log("→ pietonal-accesibil");
  const pedAccess = await overpass(`(
    way["highway"="pedestrian"](${BBOX});
    way["highway"="footway"][!"access"](${BBOX});
    way["highway"="footway"]["access"="yes"](${BBOX});
    way["highway"="path"]["foot"="yes"](${BBOX});
  );`);
  save("pietonal-accesibil", toGeoJson(pedAccess));

  await sleep(3000);

  // 6. Pedestrian zones (restricted)
  console.log("→ pietonal-neaccesibil");
  const pedRestricted = await overpass(`(
    way["highway"="footway"]["access"~"private|no"](${BBOX});
    way["foot"="no"](${BBOX});
    way["highway"="path"]["access"~"private|no"](${BBOX});
  );`);
  save("pietonal-neaccesibil", toGeoJson(pedRestricted));

  await sleep(3000);

  // 7. Auto-accessible roads (normal city streets)
  console.log("→ auto-accesibil");
  const autoOk = await overpass(`(
    way["highway"~"^(residential|living_street|tertiary|unclassified)$"](${BBOX});
  );`);
  save("auto-accesibil", toGeoJson(autoOk));

  await sleep(3000);

  // 8. Restricted-access roads (motorways, no pedestrians)
  console.log("→ auto-restrictionat (motorways, trunk)");
  const autoRestricted = await overpass(`(
    way["highway"~"^(motorway|trunk|motorway_link|trunk_link)$"](${BBOX});
    way["highway"~"^(primary|secondary)$"](${BBOX});
  );`);
  save("auto-restrictionat", toGeoJson(autoRestricted));

  await sleep(3000);

  // 9. Parks and green spaces
  console.log("→ parcuri");
  const parks = await overpass(`(
    way["leisure"="park"](${BBOX});
    way["leisure"="garden"](${BBOX});
    relation["leisure"="park"](${BBOX});
  );`);
  save("parcuri", toGeoJson(parks));

  console.log("\n✅ Done! GeoJSON files in public/geojson/");
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

run().catch((e) => {
  console.error("❌", e);
  process.exit(1);
});
