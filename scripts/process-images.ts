// Process raw images: resize + convert to WebP only, organize into folders.
// Usage: npx tsx scripts/process-images.ts
//
// 2026-04: trecut pe webp-only. Toate browserele pe care țintim suportă
// WebP (Safari 14+, Chrome/Edge/Firefox de ani de zile). Nu mai
// dublăm fiecare imagine în .jpg ca fallback — site-ul nu folosea
// niciodată variantele .jpg, doar webp-urile.
import sharp from "sharp";
import { readFileSync, mkdirSync, unlinkSync, existsSync } from "fs";
import { join } from "path";

const ROOT = process.cwd();
const OUT_BASE = join(ROOT, "public", "images");

interface ImageSpec {
  sourceFile: string;  // relative to repo root
  outputSubdir: string; // relative to public/images/
  outputName: string;   // without extension
  width: number;        // target width (max)
  height?: number;      // target height (if cropping)
  fit?: "cover" | "contain" | "inside";
  quality?: number;
}

const images: ImageSpec[] = [
  // Evenimente (landscape 16:10, 1200px wide)
  { sourceFile: "Cutremurul-din-1977-in-Bucuresti.jpg", outputSubdir: "evenimente", outputName: "cutremur-1977", width: 1200, height: 800, fit: "cover" },
  { sourceFile: "cutremur-1940-carlton.jpg", outputSubdir: "evenimente", outputName: "cutremur-1940-carlton", width: 1200, height: 800, fit: "cover" },
  { sourceFile: "colectiv-2015.jpg", outputSubdir: "evenimente", outputName: "colectiv-2015", width: 1200, height: 800, fit: "cover" },
  { sourceFile: "protest-10-august-2018.jpg", outputSubdir: "evenimente", outputName: "protest-10-august-2018", width: 1200, height: 800, fit: "cover" },
  { sourceFile: "protest-ouG13-2017.jpg", outputSubdir: "evenimente", outputName: "protest-oug13-2017", width: 1200, height: 800, fit: "cover" },
  { sourceFile: "furtuna-august-2023.jpg", outputSubdir: "evenimente", outputName: "furtuna-august-2023", width: 1200, height: 800, fit: "cover" },
  { sourceFile: "inundatie-vitan-2023.jpg", outputSubdir: "evenimente", outputName: "inundatie-vitan-2023", width: 1200, height: 800, fit: "cover" },
  { sourceFile: "rahova-2025.jpg", outputSubdir: "evenimente", outputName: "rahova-2025", width: 1200, height: 800, fit: "cover" },

  // Homepage hero (Full HD)
  { sourceFile: "hero-bucuresti.jpg", outputSubdir: "home", outputName: "hero-bucuresti", width: 1920, height: 1080, fit: "cover" },

  // Ghiduri (16:9)
  { sourceFile: "ghid-biciclist.jpg", outputSubdir: "ghiduri", outputName: "ghid-biciclist", width: 1200, height: 630, fit: "cover" },
  { sourceFile: "ghid-cutremur.jpg", outputSubdir: "ghiduri", outputName: "ghid-cutremur", width: 1200, height: 630, fit: "cover" },
  { sourceFile: "ghid-vara.jpg", outputSubdir: "ghiduri", outputName: "ghid-vara", width: 1200, height: 630, fit: "cover" },
  { sourceFile: "ghid-transport.jpg", outputSubdir: "ghiduri", outputName: "ghid-transport", width: 1200, height: 630, fit: "cover" },
  { sourceFile: "ghid-cetatean.jpg", outputSubdir: "ghiduri", outputName: "ghid-cetatean", width: 1200, height: 630, fit: "cover" },
  { sourceFile: "ghid-sesizari.jpg", outputSubdir: "ghiduri", outputName: "ghid-sesizari", width: 1200, height: 630, fit: "cover" },

  // Transport / parcs
  { sourceFile: "stb-tramvai.jpg", outputSubdir: "transport", outputName: "stb-tramvai", width: 1200, height: 800, fit: "cover" },
  { sourceFile: "metrorex-peron.jpg", outputSubdir: "transport", outputName: "metrorex-peron", width: 1200, height: 800, fit: "cover" },
  { sourceFile: "parc-herastrau.jpg", outputSubdir: "parcuri", outputName: "parc-herastrau", width: 1200, height: 800, fit: "cover" },

  // Primari (square avatar)
  { sourceFile: "primar-nicusor-dan.jpg", outputSubdir: "primari", outputName: "nicusor-dan", width: 400, height: 400, fit: "cover" },
  { sourceFile: "primar-firea.jpg", outputSubdir: "primari", outputName: "firea", width: 400, height: 400, fit: "cover" },
];

async function processOne(spec: ImageSpec): Promise<void> {
  const sourcePath = join(ROOT, spec.sourceFile);
  if (!existsSync(sourcePath)) {
    console.log(`⚠️  Missing: ${spec.sourceFile}`);
    return;
  }

  const outDir = join(OUT_BASE, spec.outputSubdir);
  mkdirSync(outDir, { recursive: true });

  const input = readFileSync(sourcePath);
  const meta = await sharp(input).metadata();

  const outPath = join(outDir, `${spec.outputName}.webp`);
  const quality = spec.quality ?? 82;
  await sharp(input)
    .resize({
      width: spec.width,
      height: spec.height,
      fit: spec.fit ?? "cover",
      position: "center",
      withoutEnlargement: true,
    })
    .webp({ quality, effort: 5 })
    .toFile(outPath);

  const sizeKb = Math.round(input.length / 1024);
  console.log(`✓ ${spec.outputSubdir}/${spec.outputName}.webp — ${meta.width}×${meta.height} → ${spec.width}${spec.height ? `×${spec.height}` : ""} (${sizeKb}KB source)`);
}

async function run() {
  console.log(`Processing ${images.length} images → webp\n`);
  for (const spec of images) {
    await processOne(spec);
  }
  console.log("\n✅ Done! Cleaning up originals...");

  // Delete source files from root
  for (const spec of images) {
    const sourcePath = join(ROOT, spec.sourceFile);
    if (existsSync(sourcePath)) {
      try {
        unlinkSync(sourcePath);
      } catch {
        // ignore
      }
    }
  }
  console.log("✅ Source files deleted from root.");
}

run().catch((e) => {
  console.error("❌", e);
  process.exit(1);
});
