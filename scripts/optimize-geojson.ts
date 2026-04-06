// Strip all non-geometry properties + round coords to 5 decimals (~1m precision).
// Used to shrink GeoJSON files without losing visual quality at city-scale zoom.
// Usage: npx tsx scripts/optimize-geojson.ts
import { readFileSync, writeFileSync, statSync } from "fs";
import { join } from "path";

const OUT = join(process.cwd(), "public", "geojson");

const TARGETS = [
  "pietonal-accesibil.json",
  "pietonal-neaccesibil.json",
  "parcuri.json",
  "bicicleta.json",
];

// deno-lint-ignore no-explicit-any
function roundCoords(geom: any, digits = 5): any {
  if (!geom) return geom;
  const r = (n: number) => Math.round(n * 10 ** digits) / 10 ** digits;
  // deno-lint-ignore no-explicit-any
  const walk = (c: any): any => {
    if (typeof c[0] === "number") return [r(c[0]), r(c[1])];
    return c.map(walk);
  };
  return { ...geom, coordinates: walk(geom.coordinates) };
}

function optimize(filename: string) {
  const path = join(OUT, filename);
  const raw = JSON.parse(readFileSync(path, "utf-8"));
  const sizeBefore = statSync(path).size;

  // deno-lint-ignore no-explicit-any
  const features = (raw.features ?? []).map((f: any) => ({
    type: "Feature",
    properties: {}, // strip all
    geometry: roundCoords(f.geometry),
  }));

  const optimized = { type: "FeatureCollection", features };
  writeFileSync(path, JSON.stringify(optimized));
  const sizeAfter = statSync(path).size;
  const reduction = Math.round((1 - sizeAfter / sizeBefore) * 100);
  console.log(
    `${filename}: ${(sizeBefore / 1024 / 1024).toFixed(2)}MB → ${(sizeAfter / 1024 / 1024).toFixed(2)}MB (-${reduction}%)`
  );
}

for (const t of TARGETS) optimize(t);
console.log("✅ Done");
