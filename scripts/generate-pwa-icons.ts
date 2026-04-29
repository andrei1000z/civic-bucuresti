// Generate PWA icons as static PNGs using sharp.
// Usage: npx tsx scripts/generate-pwa-icons.ts
import sharp from "sharp";
import { writeFileSync } from "fs";
import { join } from "path";

const OUT = join(process.cwd(), "public");

// Civia gradient logo: emerald gradient + white "C" monogram
// Match cu navbar (icon.tsx + apple-icon.tsx) — același gradient 3-stop.
async function makeIcon(size: number, maskable = false): Promise<Buffer> {
  // Maskable icons need a safe zone (content within 80% center)
  const padding = maskable ? Math.round(size * 0.1) : 0;
  const innerSize = size - padding * 2;
  const radius = maskable ? 0 : Math.round(size * 0.22);

  const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#059669"/>
        <stop offset="60%" stop-color="#047857"/>
        <stop offset="100%" stop-color="#064e3b"/>
      </linearGradient>
    </defs>
    ${maskable
      ? `<rect width="${size}" height="${size}" fill="#047857"/>`
      : `<rect width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="url(#g)"/>`}
    ${maskable ? `<rect x="${padding}" y="${padding}" width="${innerSize}" height="${innerSize}" rx="${innerSize * 0.2}" fill="url(#g)"/>` : ""}
    <text
      x="${size * 0.45}"
      y="${size * 0.46}"
      text-anchor="middle"
      dominant-baseline="central"
      font-family="system-ui, -apple-system, sans-serif"
      font-weight="600"
      font-size="${size * 0.78}"
      fill="white"
    >C</text>
  </svg>`;

  return sharp(Buffer.from(svg)).png().toBuffer();
}

async function run() {
  console.log("Generating PWA icons...");
  const sizes: { name: string; size: number; maskable?: boolean }[] = [
    { name: "icon-192.png", size: 192 },
    { name: "icon-512.png", size: 512 },
    { name: "icon-maskable-512.png", size: 512, maskable: true },
    { name: "apple-touch-icon.png", size: 180 },
    { name: "favicon-32.png", size: 32 },
    { name: "favicon-16.png", size: 16 },
  ];
  for (const { name, size, maskable } of sizes) {
    const buf = await makeIcon(size, maskable);
    writeFileSync(join(OUT, name), buf);
    console.log(`✓ ${name} (${size}×${size}${maskable ? " maskable" : ""})`);
  }
  console.log("\n✅ Done!");
}

run().catch((e) => {
  console.error("❌", e);
  process.exit(1);
});
