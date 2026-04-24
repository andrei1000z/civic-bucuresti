#!/usr/bin/env node
/**
 * Scraper de întreruperi/lucrări PMB — rulează periodic (6h) să
 * sincronizeze catalogul din src/data/intreruperi.ts cu anunțurile
 * oficiale. Scrie în src/data/intreruperi-scraped.json (consumat
 * de data/intreruperi.ts prin import static).
 *
 * Surse:
 *   - api.pmb.ro/api/get-public-interest-announcements — anunțuri
 *     publice PMB (are deep links la PDF-uri!)
 *
 * De ce PMB API funcționează și alte site-uri nu:
 *   Apa Nova, Termoenergetica, Distrigaz folosesc Cloudflare WAF care
 *   blochează orice non-browser. PMB rulează Laravel pe propriul CDN,
 *   fără WAF agresiv → API-ul răspunde la fetch simplu.
 *
 * Pentru Apa Nova / Termoenergetica avem nevoie de Playwright cu
 * browser real (viitor PR — pentru acum, doar PMB).
 */

import fs from "node:fs";
import path from "node:path";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";
const PMB_ENDPOINT = "https://api.pmb.ro/api/get-public-interest-announcements";

// Cuvinte cheie pentru filtrare — vrem doar anunțuri legate de
// întreruperi / lucrări la utilități / infrastructură publică
const KEYWORDS_LUCRARI = [
  "apa",    "apă",    "apei",
  "caldura", "căldură",
  "gaz",
  "curent", "electric",
  "trafic", "carosabil", "asfalt",
  "intrerup", "întrerup",
  "lucrar", "lucrări",
  "inchid", "închid",  // street closures
  "restric",
  "avarie",
  "magistral",
  "conduct",
];

// Cuvinte cheie care indică NU e o întrerupere (skip)
const BLACKLIST = [
  "achizi",       // achiziții publice
  "contract",
  "licita",       // licitații
  "angaja",       // anunțuri recrutare
  "raport",       // rapoarte financiare
  "declara",      // declarații avere
  "buget",
  "proiect de hot",
  "hcl ",
  "hcgmb",
];

function classifyType(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  if (/\bapa\b|\bapă\b|\bapei\b|potabil|conduct.*apa|r[eâ]ut.*apa/i.test(text)) return "apa";
  if (/\bcaldur[aă]\b|termoficare|agent termic|magistral/i.test(text)) return "caldura";
  if (/\bgaz\b|distrig/i.test(text)) return "gaz";
  if (/\bcurent\b|electric|e-distribu|en.*l\b/i.test(text)) return "electricitate";
  if (/traf|carosabil|asfalt|strad|b-dul|șos\.|închider|restric/i.test(text)) return "lucrari-strazi";
  return "altele";
}

function parseRomanianDate(input) {
  // "02.04.2026" → Date
  const m = String(input).match(/(\d{1,2})[./-](\d{1,2})[./-](\d{4})/);
  if (!m) return null;
  return new Date(Date.UTC(+m[3], +m[2] - 1, +m[1], 6, 0, 0)); // default 08:00 RO time = 06:00 UTC
}

function extractPdfLinks(html) {
  const out = [];
  const re = /href=["']([^"']+\.pdf[^"']*)["']/gi;
  let m;
  while ((m = re.exec(html))) {
    let url = m[1].trim();
    // Normalize variants:
    //   "//doc.pmb.ro/..." → "https://doc.pmb.ro/..."
    //   "/doc.pmb.ro/..."  → "https://doc.pmb.ro/..."  (PMB bug în HTML)
    //   "doc.pmb.ro/..."   → "https://doc.pmb.ro/..."
    //   "/anunturi/..."    → "https://www.pmb.ro/anunturi/..."
    if (url.startsWith("//")) {
      url = "https:" + url;
    } else if (url.startsWith("/") && url.includes("doc.pmb.ro")) {
      // PMB scrie uneori `/doc.pmb.ro/...` ca o greșeală — tratăm ca absolute
      url = "https:/" + url;
    } else if (url.startsWith("/")) {
      url = "https://www.pmb.ro" + url;
    } else if (!/^https?:/.test(url)) {
      url = "https://" + url;
    }
    // Upgrade http → https pentru doc.pmb.ro (sprijină ambele protocoale)
    url = url.replace(/^http:\/\/(doc|www|api)\.pmb\.ro/, "https://$1.pmb.ro");
    if (!out.includes(url)) out.push(url);
  }
  return out;
}

function extractAddresses(text) {
  // Foarte heuristic — caută „Str. X", „B-dul X", „Calea X", „Șos. X"
  const out = [];
  const re = /((?:Str\.|Bd\.|B-dul|Bulevardul|Calea|[SȘ]os\.|[SȘ]oseaua|Aleea|Pia[țt]a|Drumul)[^,;.]*?)(?:[,;.]|$)/g;
  let m;
  while ((m = re.exec(text))) {
    const addr = m[1].trim().replace(/\s+/g, " ");
    if (addr.length > 5 && addr.length < 120 && !out.includes(addr)) out.push(addr);
  }
  return out.slice(0, 10);
}

function stripHtml(html) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x?\d+;/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(s) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

async function fetchPage(page = 1) {
  const url = `${PMB_ENDPOINT}?sort=-release_date&page=${page}`;
  const res = await fetch(url, {
    headers: { "User-Agent": UA, "Accept": "application/json" },
  });
  if (!res.ok) throw new Error(`PMB API ${res.status} on page ${page}`);
  return res.json();
}

function isRelevant(title, description) {
  const text = `${title} ${stripHtml(description)}`.toLowerCase();
  if (BLACKLIST.some((w) => text.includes(w))) return false;
  return KEYWORDS_LUCRARI.some((w) => text.includes(w));
}

function transform(entry) {
  const descriptionPlain = stripHtml(entry.description || "");
  const pdfs = extractPdfLinks(entry.description || "");
  const releaseDate = parseRomanianDate(entry.release_date) || new Date(entry.release_date || entry.created_at);
  if (!releaseDate || isNaN(releaseDate.getTime())) return null;

  // Estimăm sfârșitul — PMB rar specifică end, dar lucrări durează 1-30 zile.
  // Default: +7 zile. Uitând la titlu putem detecta „N zile" sau interval.
  let endAt = new Date(releaseDate);
  endAt.setDate(endAt.getDate() + 7);
  const durMatch = descriptionPlain.match(/(\d+)\s*zile/i);
  if (durMatch) {
    endAt = new Date(releaseDate);
    endAt.setDate(endAt.getDate() + Math.min(90, +durMatch[1]));
  }

  const type = classifyType(entry.title, descriptionPlain);
  const addresses = extractAddresses(entry.title + " " + descriptionPlain);
  if (addresses.length === 0) addresses.push("București (zonă nespecificată)");

  const slug = slugify(`pmb-${entry.title.slice(0, 40)}`);
  const id = `pmb-${entry.id}-${slug}`;

  return {
    id,
    externalId: `pmb-${entry.id}`,
    type,
    status: endAt > new Date() ? "programat" : "finalizat",
    provider: "Primăria Municipiului București",
    sourceUrl: "https://www.pmb.ro/anunturi-lucrari",
    sourceEntryUrl: pdfs[0] || undefined,
    sourceEntryTitle: entry.title?.slice(0, 200) || undefined,
    reason: entry.title?.slice(0, 200) || "Anunț PMB",
    addresses,
    county: "B",
    locality: "București",
    startAt: releaseDate.toISOString(),
    endAt: endAt.toISOString(),
    excerpt:
      descriptionPlain.length > 250
        ? descriptionPlain.slice(0, 247) + "..."
        : descriptionPlain || entry.short_description || undefined,
  };
}

async function main() {
  console.log("📡 Fetch PMB announcements...");
  const out = [];
  let totalChecked = 0;

  // Pull first 3 pages (api returns ~20 per page)
  for (let page = 1; page <= 3; page++) {
    try {
      const resp = await fetchPage(page);
      const rows = resp.data ?? [];
      if (rows.length === 0) break;
      for (const row of rows) {
        totalChecked++;
        if (!isRelevant(row.title || "", row.description || "")) continue;
        const item = transform(row);
        if (item) out.push(item);
      }
    } catch (e) {
      console.error(`⚠️  Page ${page} failed: ${e.message}`);
    }
  }

  console.log(`✅ ${totalChecked} anunțuri verificate, ${out.length} relevante (lucrări/întreruperi).`);
  console.log(`📎 ${out.filter((i) => i.sourceEntryUrl).length} au deep link la PDF.`);

  const outPath = path.join(process.cwd(), "src/data/intreruperi-scraped.json");
  fs.writeFileSync(
    outPath,
    JSON.stringify(
      {
        updated_at: new Date().toISOString(),
        source: "api.pmb.ro",
        count: out.length,
        items: out,
      },
      null,
      2,
    ),
  );
  console.log(`💾 Scris în ${outPath}`);

  // Log summary
  if (out.length > 0) {
    console.log("\nSample:");
    for (const item of out.slice(0, 3)) {
      console.log(`  - ${item.reason.slice(0, 70)}`);
      console.log(`    📎 ${item.sourceEntryUrl || "(fără PDF)"}`);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
