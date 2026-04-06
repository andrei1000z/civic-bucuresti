// Fetch Romania administrative boundary from OSM.
// Usage: npx tsx scripts/fetch-romania-border.ts
import { writeFileSync } from "fs";
import { join } from "path";

const QUERY = `[out:json][timeout:90];
relation["boundary"="administrative"]["name"="România"]["admin_level"="2"];
out geom;`;

const MIRRORS = [
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass-api.de/api/interpreter",
];

async function fetchOverpass() {
  for (const url of MIRRORS) {
    try {
      console.log(`Trying ${url}...`);
      const res = await fetch(url, {
        method: "POST",
        body: `data=${encodeURIComponent(QUERY)}`,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      if (res.ok) return res.json();
      console.log(`  ${res.status}, trying next...`);
    } catch (e) {
      console.log(`  Error: ${(e as Error).message}`);
    }
    await new Promise((r) => setTimeout(r, 3000));
  }
  throw new Error("All mirrors failed");
}

async function run() {
  console.log("Fetching România admin boundary from OSM...");
  const data = (await fetchOverpass()) as { elements: Array<{ members?: Array<{ type: string; role: string; geometry?: Array<{ lat: number; lon: number }> }> }> };
  const rel = data.elements?.[0];
  if (!rel?.members) throw new Error("No boundary found");

  const outerRings: number[][][] = [];
  let currentRing: number[][] = [];

  for (const m of rel.members) {
    if (m.role !== "outer" || !m.geometry) continue;
    const coords = m.geometry.map((g) => [g.lon, g.lat]);
    if (currentRing.length === 0) {
      currentRing = [...coords];
    } else {
      const last = currentRing[currentRing.length - 1];
      const first = coords[0];
      if (Math.abs(last[0] - first[0]) < 1e-5 && Math.abs(last[1] - first[1]) < 1e-5) {
        currentRing.push(...coords.slice(1));
      } else {
        const rev = [...coords].reverse();
        if (Math.abs(last[0] - rev[0][0]) < 1e-5 && Math.abs(last[1] - rev[0][1]) < 1e-5) {
          currentRing.push(...rev.slice(1));
        } else {
          outerRings.push(currentRing);
          currentRing = [...coords];
        }
      }
    }
    if (currentRing.length > 2) {
      const s = currentRing[0];
      const e = currentRing[currentRing.length - 1];
      if (Math.abs(s[0] - e[0]) < 1e-5 && Math.abs(s[1] - e[1]) < 1e-5) {
        outerRings.push(currentRing);
        currentRing = [];
      }
    }
  }
  if (currentRing.length > 2) outerRings.push(currentRing);

  // Simplify: keep every Nth point to reduce file size
  const simplified = outerRings.map((ring) => {
    const step = Math.max(1, Math.floor(ring.length / 2000));
    const result = ring.filter((_, i) => i % step === 0);
    if (result[result.length - 1] !== ring[ring.length - 1]) result.push(ring[ring.length - 1]);
    return result;
  });

  const geojson = {
    type: "Feature",
    properties: { name: "România" },
    geometry: {
      type: simplified.length === 1 ? "Polygon" : "MultiPolygon",
      coordinates: simplified.length === 1 ? [simplified[0]] : simplified.map((r) => [r]),
    },
  };

  const path = join(process.cwd(), "public", "geojson", "romania-border.json");
  writeFileSync(path, JSON.stringify(geojson));
  const totalPts = simplified.reduce((n, r) => n + r.length, 0);
  console.log(`✓ romania-border.json — ${simplified.length} ring(s), ${totalPts} points`);
}

run().catch((e) => { console.error("❌", e); process.exit(1); });
