/**
 * Fetch national GeoJSON data from Overpass API for all of Romania.
 *
 * Usage:
 *   npx tsx scripts/fetch-national-geojson.ts            # all layers
 *   npx tsx scripts/fetch-national-geojson.ts cycling    # one layer
 *   npx tsx scripts/fetch-national-geojson.ts cycling tram bus
 *
 * Supported layer keys:
 *   cycling, parks, tram, pedestrian, bus, trolleybus, metro
 *
 * Expected sizes (current as of refresh):
 *   cycling     ~2-3 MB
 *   parks       ~2 MB
 *   tram         ~1 MB
 *   pedestrian  ~20-50 MB (consider mapshaper simplify)
 *   bus         ~3-8 MB   (route relations expanded to LineStrings)
 *   trolleybus  ~200-500 KB
 *   metro        ~150 KB
 *
 * Output goes to public/geojson/. Run periodically (every 1-2 months)
 * to keep static map backbones in sync with current OSM data.
 */

import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

// Public Overpass mirrors, tried in order. kumi.systems is a private
// volunteer mirror with much less traffic than the official .de host
// and usually returns faster, especially for whole-country queries.
const OVERPASS_MIRRORS = [
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass-api.de/api/interpreter",
  "https://overpass.openstreetmap.fr/api/interpreter",
];
const OUT_DIR = join(process.cwd(), "public", "geojson");

async function query(overpassQL: string, name: string): Promise<unknown> {
  console.log(`\n📥 Fetching ${name}...`);
  const start = Date.now();

  let lastErr = "";
  for (const url of OVERPASS_MIRRORS) {
    const mirror = new URL(url).hostname;
    try {
      const res = await fetch(url, {
        method: "POST",
        body: `data=${encodeURIComponent(overpassQL)}`,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          // Overpass started returning 406 for requests without a User-Agent
          // and Accept header. Identify ourselves so the volunteers running
          // the public mirror can reach us if a query goes pathological.
          "User-Agent": "Civia/1.0 (civia.ro; admin@civia.ro)",
          Accept: "application/json",
        },
      });
      if (!res.ok) {
        lastErr = `HTTP ${res.status}`;
        console.error(`   ⚠ ${mirror}: ${lastErr} — trying next mirror`);
        continue;
      }
      const ct = res.headers.get("content-type") ?? "";
      if (!ct.includes("json")) {
        lastErr = `non-json (${ct.slice(0, 30)})`;
        console.error(`   ⚠ ${mirror}: ${lastErr} — trying next mirror`);
        continue;
      }
      const data = await res.json();
      // Overpass returns 200 with a `remark` describing soft errors
      // (slot limit, runtime exhausted). Treat as failure and try
      // the next mirror.
      if (data.remark && (!data.elements || data.elements.length === 0)) {
        lastErr = `remark: ${String(data.remark).slice(0, 80)}`;
        console.error(`   ⚠ ${mirror}: ${lastErr} — trying next mirror`);
        continue;
      }
      const elapsed = ((Date.now() - start) / 1000).toFixed(1);
      const elements = data.elements?.length ?? 0;
      console.log(`   ✅ ${elements} elements in ${elapsed}s (${mirror})`);
      return data;
    } catch (e) {
      lastErr = e instanceof Error ? e.message : String(e);
      console.error(`   ⚠ ${mirror}: ${lastErr} — trying next mirror`);
    }
  }
  console.error(`   ❌ ${name}: all mirrors failed (last: ${lastErr})`);
  return null;
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
      // Route relations (bus / trolleybus / subway) carry their member
      // geometry inline when queried with `out geom`. Each way-member
      // becomes its own LineString tagged with the parent relation's
      // ref/name/operator so the map popup can show "Linia 601" etc.
      // Roles like "stop"/"platform"/"forward" come back as nodes —
      // we only emit the actual line segments.
      const relTags = (el.tags as Record<string, string>) ?? {};
      for (const m of el.members as Array<Record<string, unknown>>) {
        if (m.type === "way" && Array.isArray(m.geometry) && m.geometry.length >= 2) {
          // Skip stops/platforms — keep only the running line.
          const role = (m.role as string | undefined) ?? "";
          if (role === "stop" || role === "platform" || role === "stop_entry_only" || role === "stop_exit_only") {
            continue;
          }
          features.push({
            type: "Feature",
            properties: {
              ...relTags,
              _relation_id: el.id,
              _member_role: role,
            },
            geometry: {
              type: "LineString",
              coordinates: (m.geometry as Array<{ lat: number; lon: number }>).map(
                (p) => [p.lon, p.lat],
              ),
            },
          });
        }
      }
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

interface LayerSpec {
  key: string;
  label: string;
  emoji: string;
  filename: string;
  ql: string;
}

const LAYERS: LayerSpec[] = [
  {
    key: "cycling",
    label: "CYCLING INFRASTRUCTURE",
    emoji: "🚲",
    filename: "bicicleta-romania.json",
    ql: `
      [out:json][timeout:120];
      area["ISO3166-1"="RO"]->.ro;
      (
        way["highway"="cycleway"](area.ro);
        way["cycleway"~"lane|track|shared_lane"](area.ro);
        way["bicycle"="designated"](area.ro);
      );
      out geom;
    `,
  },
  {
    key: "parks",
    label: "PARKS & GREEN AREAS",
    emoji: "🌳",
    filename: "parcuri-romania.json",
    ql: `
      [out:json][timeout:120];
      area["ISO3166-1"="RO"]->.ro;
      (
        way["leisure"="park"](area.ro);
        way["landuse"="recreation_ground"](area.ro);
        relation["leisure"="park"](area.ro);
      );
      out geom;
    `,
  },
  {
    key: "tram",
    label: "TRAM LINES",
    emoji: "🚋",
    filename: "tramvai-romania.json",
    ql: `
      [out:json][timeout:90];
      area["ISO3166-1"="RO"]->.ro;
      way["railway"="tram"](area.ro);
      out geom;
    `,
  },
  {
    key: "pedestrian",
    label: "PEDESTRIAN ZONES",
    emoji: "🚶",
    filename: "pietonal-romania.json",
    ql: `
      [out:json][timeout:180];
      area["ISO3166-1"="RO"]->.ro;
      (
        way["highway"="pedestrian"](area.ro);
        way["highway"="footway"]["footway"!="crossing"](area.ro);
      );
      out geom;
    `,
  },
  {
    key: "bus",
    label: "BUS LINES",
    emoji: "🚌",
    filename: "autobuz-romania.json",
    ql: `
      [out:json][timeout:180];
      area["ISO3166-1"="RO"]->.ro;
      relation["route"="bus"]["network"!="international"](area.ro);
      out geom;
    `,
  },
  {
    key: "trolleybus",
    label: "TROLLEYBUS LINES",
    emoji: "🚎",
    filename: "troleibuz-romania.json",
    ql: `
      [out:json][timeout:90];
      area["ISO3166-1"="RO"]->.ro;
      relation["route"="trolleybus"](area.ro);
      out geom;
    `,
  },
  {
    key: "metro",
    label: "METRO / SUBWAY LINES",
    emoji: "🚇",
    filename: "metrou-romania.json",
    ql: `
      [out:json][timeout:60];
      area["ISO3166-1"="RO"]->.ro;
      (
        way["railway"="subway"](area.ro);
        relation["route"="subway"](area.ro);
      );
      out geom;
    `,
  },
  {
    key: "motorways",
    label: "AUTOSTRĂZI",
    emoji: "🛣️",
    filename: "autostrazi-romania.json",
    ql: `
      [out:json][timeout:90];
      area["ISO3166-1"="RO"]->.ro;
      way["highway"="motorway"](area.ro);
      out geom;
    `,
  },
  {
    // Output is large (>20 MB raw) because Romania has thousands of km
    // of trunk + primary roads. Don't include this in default refresh
    // unless you're going to run mapshaper -simplify on the result.
    key: "national-roads",
    label: "DRUMURI NAȚIONALE / TRUNK",
    emoji: "🛤️",
    filename: "nationale-romania.json",
    ql: `
      [out:json][timeout:120];
      area["ISO3166-1"="RO"]->.ro;
      (
        way["highway"="trunk"](area.ro);
        way["highway"="primary"](area.ro);
      );
      out geom;
    `,
  },
  {
    key: "county-roads",
    label: "DRUMURI JUDEȚENE",
    emoji: "🛤️",
    filename: "judetene-romania.json",
    ql: `
      [out:json][timeout:120];
      area["ISO3166-1"="RO"]->.ro;
      way["highway"="secondary"](area.ro);
      out geom;
    `,
  },
  {
    key: "local-roads",
    label: "DRUMURI COMUNALE",
    emoji: "🛤️",
    filename: "comunale-romania.json",
    ql: `
      [out:json][timeout:180];
      area["ISO3166-1"="RO"]->.ro;
      way["highway"="tertiary"](area.ro);
      out geom;
    `,
  },
];

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  // CLI selector — runs only the requested layer keys when given.
  // No args = run everything (the periodic full refresh).
  const requested = process.argv.slice(2).map((s) => s.toLowerCase());
  const targets =
    requested.length === 0
      ? LAYERS
      : LAYERS.filter((l) => requested.includes(l.key));

  if (requested.length > 0 && targets.length === 0) {
    console.error(
      `Unknown layer(s). Valid keys: ${LAYERS.map((l) => l.key).join(", ")}`,
    );
    process.exit(1);
  }

  for (const spec of targets) {
    console.log(`\n${spec.emoji} === ${spec.label} ===`);
    const data = await query(spec.ql, spec.key);
    if (data) {
      const geojson = overpassToGeoJSON(
        data as { elements: Array<Record<string, unknown>> },
      );
      save(geojson, spec.filename);
    }
  }

  console.log("\n✅ Done! Check public/geojson/ for the output files.");
  console.log("💡 TIP: Run mapshaper to simplify large files:");
  console.log("   npx mapshaper public/geojson/pietonal-romania.json -simplify 5% -o force");
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
