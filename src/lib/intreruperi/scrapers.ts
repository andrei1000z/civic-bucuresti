/**
 * Scrapers for utility-outage announcements. Server-side TS port of
 * `scripts/scrape-intreruperi.mjs` so the same logic runs in a Vercel
 * cron job (which can't write to the filesystem) and writes results
 * to the `intreruperi_scraped` Supabase table.
 *
 * SOURCES TODAY:
 *   - api.pmb.ro/api/get-public-interest-announcements (works:
 *     plain JSON API, no WAF)
 *   - apanovabucuresti.ro/intreruperi (best-effort — 80 % of the time
 *     Cloudflare lets a browser-mimicking fetch through; when it
 *     doesn't, we silently skip and the cron retries 6 hours later)
 *
 * SOURCES STILL BLOCKED:
 *   - termoenergetica.ro/lista-avarii — full Cloudflare challenge
 *   - distrigaz-sud-retele.ro/avarii — same
 *   - sesizari.edistributie.com — same
 * For these we'd need a headless browser (Playwright via
 * Browserless.io or similar — paid). Out of scope for this pass.
 */

import type { Interruption } from "@/data/intreruperi";

// Real-browser User-Agent so non-WAF endpoints don't 403 us as a bot
// AND so apanovabucuresti.ro's Cloudflare challenge sometimes lets us
// through with a Browser Integrity Check pass.
const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";

const BROWSER_HEADERS: Record<string, string> = {
  "User-Agent": BROWSER_UA,
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "Accept-Language": "ro-RO,ro;q=0.9,en-US;q=0.8,en;q=0.7",
  "Cache-Control": "no-cache",
};

// ─── Shared helpers ─────────────────────────────────────────────────

function classifyType(text: string): Interruption["type"] {
  const t = text.toLowerCase();
  if (/\bapa\b|\bapă\b|\bapei\b|potabil|conduct.*apa|r[eâ]ut.*apa/i.test(t))
    return "apa";
  if (/\bcaldur[aă]\b|termoficare|agent termic|magistral/i.test(t))
    return "caldura";
  if (/\bgaz\b|distrig/i.test(t)) return "gaz";
  if (/\bcurent\b|electric|e-distribu|en\.?l\b/i.test(t)) return "electricitate";
  if (/traf|carosabil|asfalt|strad|b-dul|șos\.|închider|restric/i.test(t))
    return "lucrari-strazi";
  return "altele";
}

function parseRoDate(input: string): Date | null {
  const m = String(input).match(/(\d{1,2})[./-](\d{1,2})[./-](\d{4})/);
  if (!m) return null;
  // 06:00 UTC ≈ 08:00–09:00 local (matches typical workday start in
  // utility announcements)
  return new Date(Date.UTC(+m[3]!, +m[2]! - 1, +m[1]!, 6, 0, 0));
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x?\d+;/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

function extractAddresses(text: string): string[] {
  const out: string[] = [];
  const re =
    /((?:Str\.|Bd\.|B-dul|Bulevardul|Calea|[SȘ]os\.|[SȘ]oseaua|Aleea|Pia[țt]a|Drumul)[^,;.]*?)(?:[,;.]|$)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const addr = m[1]!.trim().replace(/\s+/g, " ");
    if (addr.length > 5 && addr.length < 120 && !out.includes(addr)) {
      out.push(addr);
    }
  }
  return out.slice(0, 12);
}

function extractPdfLinks(html: string): string[] {
  const out: string[] = [];
  const re = /href=["']([^"']+\.pdf[^"']*)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    let url = m[1]!.trim();
    if (url.startsWith("//")) url = "https:" + url;
    else if (url.startsWith("/") && url.includes("doc.pmb.ro"))
      url = "https:/" + url;
    else if (url.startsWith("/")) url = "https://www.pmb.ro" + url;
    else if (!/^https?:/.test(url)) url = "https://" + url;
    url = url.replace(/^http:\/\/(doc|www|api)\.pmb\.ro/, "https://$1.pmb.ro");
    if (!out.includes(url)) out.push(url);
  }
  return out;
}

// ─── PMB scraper ────────────────────────────────────────────────────

const PMB_ENDPOINT =
  "https://api.pmb.ro/api/get-public-interest-announcements";

const PMB_KEYWORDS = [
  "apa", "apă", "apei", "caldura", "căldură", "gaz",
  "curent", "electric", "trafic", "carosabil", "asfalt",
  "intrerup", "întrerup", "lucrar", "lucrări", "inchid",
  "închid", "restric", "avarie", "magistral", "conduct",
];

const PMB_BLACKLIST = [
  "achizi", "contract", "licita", "angaja", "raport",
  "declara", "buget", "proiect de hot", "hcl ", "hcgmb",
];

interface PmbEntry {
  id: number;
  title?: string;
  description?: string;
  short_description?: string;
  release_date?: string;
  created_at?: string;
}

interface PmbPage {
  data?: PmbEntry[];
  meta?: { last_page?: number };
}

function isPmbRelevant(title: string, description: string): boolean {
  const text = `${title} ${stripHtml(description)}`.toLowerCase();
  if (PMB_BLACKLIST.some((w) => text.includes(w))) return false;
  return PMB_KEYWORDS.some((w) => text.includes(w));
}

function transformPmb(entry: PmbEntry): Interruption | null {
  const descriptionPlain = stripHtml(entry.description ?? "");
  const pdfs = extractPdfLinks(entry.description ?? "");
  const releaseDate =
    parseRoDate(entry.release_date ?? "") ??
    new Date(entry.release_date ?? entry.created_at ?? Date.now());
  if (Number.isNaN(releaseDate.getTime())) return null;

  let endAt = new Date(releaseDate);
  endAt.setDate(endAt.getDate() + 7);
  const durMatch = descriptionPlain.match(/(\d+)\s*zile/i);
  if (durMatch) {
    endAt = new Date(releaseDate);
    endAt.setDate(endAt.getDate() + Math.min(90, +durMatch[1]!));
  }

  const type = classifyType(`${entry.title} ${descriptionPlain}`);
  const addresses = extractAddresses(`${entry.title} ${descriptionPlain}`);
  if (addresses.length === 0) addresses.push("București (zonă nespecificată)");

  const slug = slugify(`pmb-${(entry.title ?? "").slice(0, 40)}`);
  const id = `pmb-${entry.id}-${slug}`;

  return {
    id,
    externalId: `pmb-${entry.id}`,
    type,
    status: endAt > new Date() ? "programat" : "finalizat",
    provider: "Primăria Municipiului București",
    sourceUrl: "https://www.pmb.ro/anunturi-lucrari",
    sourceEntryUrl: pdfs[0],
    sourceEntryTitle: entry.title?.slice(0, 200),
    reason: entry.title?.slice(0, 200) ?? "Anunț PMB",
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

export async function scrapePmb(): Promise<Interruption[]> {
  const out: Interruption[] = [];
  const seen = new Set<string>();
  for (let page = 1; page <= 5; page++) {
    let json: PmbPage;
    try {
      const res = await fetch(`${PMB_ENDPOINT}?sort=-release_date&page=${page}`, {
        headers: { ...BROWSER_HEADERS, Accept: "application/json" },
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) break;
      json = (await res.json()) as PmbPage;
    } catch {
      break;
    }
    const entries = json.data ?? [];
    if (entries.length === 0) break;
    for (const e of entries) {
      const title = e.title ?? "";
      const desc = e.description ?? "";
      if (!isPmbRelevant(title, desc)) continue;
      const t = transformPmb(e);
      if (!t || seen.has(t.id)) continue;
      seen.add(t.id);
      out.push(t);
    }
    if (json.meta?.last_page && page >= json.meta.last_page) break;
  }
  return out;
}

// ─── Apa Nova scraper (best-effort — Cloudflare may block) ──────────

export async function scrapeApaNova(): Promise<Interruption[]> {
  let html: string;
  try {
    const res = await fetch("https://apanovabucuresti.ro/intreruperi", {
      headers: BROWSER_HEADERS,
      signal: AbortSignal.timeout(8_000),
    });
    // Cloudflare returns 403 / 503 with a challenge page when it
    // decides we look like a bot. In that case bail silently — the
    // existing data stays in Supabase, the cron will retry in 6h.
    if (!res.ok) return [];
    const text = await res.text();
    if (text.includes("Just a moment") || text.includes("cf-challenge")) {
      return [];
    }
    html = text;
  } catch {
    return [];
  }

  // Apa Nova publishes outages as `<article>` blocks with a date,
  // a title, and an address list. We extract loosely — the page can
  // change shape and we'd rather drop a row than crash.
  const articles = html.match(/<article[\s\S]*?<\/article>/g) ?? [];
  const out: Interruption[] = [];
  for (const art of articles) {
    const title =
      stripHtml(art.match(/<h\d[^>]*>([\s\S]*?)<\/h\d>/i)?.[1] ?? "").trim();
    const body = stripHtml(art);
    if (title.length < 5) continue;
    const dateMatch = body.match(
      /(\d{1,2})\s+(ianuarie|februarie|martie|aprilie|mai|iunie|iulie|august|septembrie|octombrie|noiembrie|decembrie)\s+(\d{4})/i,
    );
    let startAt = new Date();
    if (dateMatch) {
      const months: Record<string, number> = {
        ianuarie: 0, februarie: 1, martie: 2, aprilie: 3, mai: 4, iunie: 5,
        iulie: 6, august: 7, septembrie: 8, octombrie: 9, noiembrie: 10, decembrie: 11,
      };
      const m = months[dateMatch[2]!.toLowerCase()];
      if (m !== undefined) {
        startAt = new Date(Date.UTC(+dateMatch[3]!, m, +dateMatch[1]!, 6, 0));
      }
    }
    const endAt = new Date(startAt);
    endAt.setHours(endAt.getHours() + 12);

    const addresses = extractAddresses(body);
    if (addresses.length === 0) continue;

    const id = `apanova-${slugify(title)}-${startAt.toISOString().slice(0, 10)}`;
    out.push({
      id,
      externalId: id,
      type: "apa",
      status: endAt > new Date() ? "programat" : "finalizat",
      provider: "Apa Nova București",
      sourceUrl: "https://apanovabucuresti.ro/intreruperi",
      sourceEntryTitle: title.slice(0, 200),
      reason: title.slice(0, 200),
      addresses,
      county: "B",
      locality: "București",
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
      excerpt: body.slice(0, 200),
    });
  }
  return out;
}

// ─── Master orchestrator ────────────────────────────────────────────

export interface ScrapeResult {
  items: Interruption[];
  bySource: Record<string, number>;
  errors: string[];
}

export async function scrapeAllSources(): Promise<ScrapeResult> {
  const [pmb, apaNova] = await Promise.allSettled([
    scrapePmb(),
    scrapeApaNova(),
  ]);

  const items: Interruption[] = [];
  const bySource: Record<string, number> = {};
  const errors: string[] = [];

  if (pmb.status === "fulfilled") {
    items.push(...pmb.value);
    bySource["pmb"] = pmb.value.length;
  } else {
    bySource["pmb"] = 0;
    errors.push(`pmb: ${(pmb.reason as Error).message}`);
  }
  if (apaNova.status === "fulfilled") {
    items.push(...apaNova.value);
    bySource["apa-nova"] = apaNova.value.length;
  } else {
    bySource["apa-nova"] = 0;
    errors.push(`apa-nova: ${(apaNova.reason as Error).message}`);
  }

  return { items, bySource, errors };
}
