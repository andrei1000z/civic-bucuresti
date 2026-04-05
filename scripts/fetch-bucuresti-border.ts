// Fetch Bucharest administrative boundary as a single polygon GeoJSON.
// Usage: npx tsx scripts/fetch-bucuresti-border.ts
import { writeFileSync } from "fs";
import { join } from "path";

const QUERY = `[out:json][timeout:60];
relation["boundary"="administrative"]["name"="București"]["admin_level"="4"];
out geom;`;

const MIRRORS = [
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass-api.de/api/interpreter",
];

async function fetchOverpass() {
  for (const url of MIRRORS) {
    try {
      const res = await fetch(url, {
        method: "POST",
        body: `data=${encodeURIComponent(QUERY)}`,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      if (res.ok) return res.json();
    } catch {
      // try next
    }
    await new Promise((r) => setTimeout(r, 3000));
  }
  throw new Error("All mirrors failed");
}

interface OverpassMember {
  type: string;
  role: string;
  geometry?: { lat: number; lon: number }[];
}

async function run() {
  console.log("Fetching București admin boundary from OSM...");
  // deno-lint-ignore no-explicit-any
  const data = (await fetchOverpass()) as any;
  const rel = data.elements?.[0];
  if (!rel || !rel.members) throw new Error("No boundary found");

  // Collect outer ways (roles: outer)
  const outerRings: number[][][] = [];
  let currentRing: number[][] = [];

  for (const m of rel.members as OverpassMember[]) {
    if (m.role !== "outer" || !m.geometry) continue;
    const coords = m.geometry.map((g) => [g.lon, g.lat]);
    if (currentRing.length === 0) {
      currentRing = [...coords];
    } else {
      const last = currentRing[currentRing.length - 1];
      const first = coords[0];
      // Connect ways end-to-end
      if (Math.abs(last[0] - first[0]) < 1e-6 && Math.abs(last[1] - first[1]) < 1e-6) {
        currentRing.push(...coords.slice(1));
      } else {
        // Might need to reverse
        const coordsRev = [...coords].reverse();
        const firstRev = coordsRev[0];
        if (Math.abs(last[0] - firstRev[0]) < 1e-6 && Math.abs(last[1] - firstRev[1]) < 1e-6) {
          currentRing.push(...coordsRev.slice(1));
        } else {
          // New ring
          outerRings.push(currentRing);
          currentRing = [...coords];
        }
      }
    }
    // Check if ring closed
    if (currentRing.length > 2) {
      const s = currentRing[0];
      const e = currentRing[currentRing.length - 1];
      if (Math.abs(s[0] - e[0]) < 1e-6 && Math.abs(s[1] - e[1]) < 1e-6) {
        outerRings.push(currentRing);
        currentRing = [];
      }
    }
  }
  if (currentRing.length > 2) outerRings.push(currentRing);

  console.log(`✓ Built ${outerRings.length} ring(s)`);

  const geojson = {
    type: "Feature",
    properties: {
      name: "București",
      admin_level: 4,
      source: "OpenStreetMap",
    },
    geometry: {
      type: outerRings.length === 1 ? "Polygon" : "MultiPolygon",
      coordinates: outerRings.length === 1 ? [outerRings[0]] : outerRings.map((r) => [r]),
    },
  };

  const path = join(process.cwd(), "public", "geojson", "bucuresti-border.json");
  writeFileSync(path, JSON.stringify(geojson));
  const pointCount = outerRings.reduce((n, r) => n + r.length, 0);
  console.log(`✓ bucuresti-border.json — ${pointCount} total points`);
}

run().catch((e) => {
  console.error("❌", e);
  process.exit(1);
});
