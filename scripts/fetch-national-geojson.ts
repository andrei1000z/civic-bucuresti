/**
 * Fetch national GeoJSON data from Overpass API for all of Romania.
 * This script downloads cycling, pedestrian, road, and transit data.
 *
 * Usage: npx tsx scripts/fetch-national-geojson.ts
 *
 * WARNING: These queries return large datasets. Expect:
 * - Cycling: ~5-10MB
 * - Pedestrian areas: ~20-50MB (will be simplified)
 * - Transit: ~5-10MB
 *
 * The script saves to public/geojson/ and simplifies with mapshaper if available.
 */

import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const OUT_DIR = join(process.cwd(), "public", "geojson");

async function query(overpassQL: string, name: string): Promise<unknown> {
  console.log(`\n📥 Fetching ${name}...`);
  const start = Date.now();

  const res = await fetch(OVERPASS_URL, {
    method: "POST",
    body: `data=${encodeURIComponent(overpassQL)}`,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  if (!res.ok) {
    console.error(`   ❌ ${name}: HTTP ${res.status}`);
    return null;
  }

  const data = await res.json();
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  const elements = data.elements?.length ?? 0;
  console.log(`   ✅ ${elements} elements in ${elapsed}s`);
  return data;
}

function overpassToGeoJSON(data: { elements: Array<Record<string, unknown>> }): object {
  const features: object[] = [];

  for (const el of data.elements ?? []) {
    if (el.type === "way" && Array.isArray(el.geometry)) {
      features.push({
        type: "Feature",
        properties: el.tags ?? {},
        geometry: {
          type: "LineString",
          coordinates: (el.geometry as Array<{ lat: number; lon: number }>).map((p) => [p.lon, p.lat]),
        },
      });
    } else if (el.type === "relation" && Array.isArray(el.members)) {
      // Skip relations for now — too complex
    } else if (el.type === "node" && el.lat && el.lon) {
      features.push({
        type: "Feature",
        properties: el.tags ?? {},
        geometry: {
          type: "Point",
          coordinates: [el.lon, el.lat],
        },
      });
    }
  }

  return { type: "FeatureCollection", features };
}

function save(geojson: object, filename: string) {
  const path = join(OUT_DIR, filename);
  const json = JSON.stringify(geojson);
  writeFileSync(path, json);
  const sizeMB = (json.length / 1024 / 1024).toFixed(1);
  console.log(`   💾 Saved ${path} (${sizeMB} MB, ${(geojson as { features: unknown[] }).features?.length ?? 0} features)`);
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  // 1. CYCLING — all cycle paths in Romania
  console.log("\n🚲 === CYCLING INFRASTRUCTURE ===");
  const cyclingData = await query(`
    [out:json][timeout:120];
    area["ISO3166-1"="RO"]->.ro;
    (
      way["highway"="cycleway"](area.ro);
      way["cycleway"~"lane|track|shared_lane"](area.ro);
      way["bicycle"="designated"](area.ro);
    );
    out geom;
  `, "cycling-romania");

  if (cyclingData) {
    const geojson = overpassToGeoJSON(cyclingData as { elements: Array<Record<string, unknown>> });
    save(geojson, "bicicleta-romania.json");
  }

  // 2. PARKS — all parks and green areas in Romania
  console.log("\n🌳 === PARKS & GREEN AREAS ===");
  const parksData = await query(`
    [out:json][timeout:120];
    area["ISO3166-1"="RO"]->.ro;
    (
      way["leisure"="park"](area.ro);
      way["landuse"="recreation_ground"](area.ro);
      relation["leisure"="park"](area.ro);
    );
    out geom;
  `, "parks-romania");

  if (parksData) {
    const geojson = overpassToGeoJSON(parksData as { elements: Array<Record<string, unknown>> });
    save(geojson, "parcuri-romania.json");
  }

  // 3. TRAM LINES — all tram routes in Romania
  console.log("\n🚋 === TRAM LINES ===");
  const tramData = await query(`
    [out:json][timeout:90];
    area["ISO3166-1"="RO"]->.ro;
    way["railway"="tram"](area.ro);
    out geom;
  `, "tram-romania");

  if (tramData) {
    const geojson = overpassToGeoJSON(tramData as { elements: Array<Record<string, unknown>> });
    save(geojson, "tramvai-romania.json");
  }

  // 4. PEDESTRIAN AREAS — pedestrian zones
  console.log("\n🚶 === PEDESTRIAN ZONES ===");
  const pedestrianData = await query(`
    [out:json][timeout:120];
    area["ISO3166-1"="RO"]->.ro;
    (
      way["highway"="pedestrian"](area.ro);
      way["highway"="footway"]["footway"!="crossing"](area.ro);
    );
    out geom;
  `, "pedestrian-romania");

  if (pedestrianData) {
    const geojson = overpassToGeoJSON(pedestrianData as { elements: Array<Record<string, unknown>> });
    save(geojson, "pietonal-romania.json");
  }

  console.log("\n✅ Done! Check public/geojson/ for the output files.");
  console.log("💡 TIP: Run mapshaper to simplify large files:");
  console.log("   npx mapshaper public/geojson/pietonal-romania.json -simplify 5% -o force");
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
