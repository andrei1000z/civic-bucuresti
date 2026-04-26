// Reverse + forward geocoding using Nominatim (OpenStreetMap) — free, no API key
import { detectSectorFromText } from "./sector-detect";

/**
 * Extract a set of geocodable "street + city" queries from a verbose
 * free-text location like:
 *   "Pe trotuarul aferent arterei Calea 13 Septembrie, mai exact pe
 *    segmentul cuprins între intersecția cu Șoseaua Panduri..."
 *
 * Nominatim chokes on that whole sentence but will happily return the
 * centroid of "Calea 13 Septembrie, București". So we pull out every
 * "Strada X / Calea X / Bulevardul X / Șoseaua X / Piața X / Aleea X"
 * mention, optionally pick up an adjacent street number, and return a
 * list of progressively less specific queries for the caller to try
 * in order.
 */
export function extractGeocodeQueries(text: string, countyHint?: string | null): string[] {
  if (!text) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  const push = (q: string) => {
    const k = q.toLowerCase();
    if (!seen.has(k)) { seen.add(k); out.push(q); }
  };

  // Sector → always Bucharest
  const sectorMatch = text.match(/Sector(?:ul)?\s*([1-6])/i);
  const bucharestScope = sectorMatch ? "București" : (countyHint || "");

  // Strip parenthesized clauses + collapse whitespace
  const clean = text.replace(/\([^)]*\)/g, " ").replace(/\s+/g, " ").trim();

  // Canonical Romanian street prefixes. We search case-insensitively and
  // allow common abbreviations.
  // First char of the street name can be a letter (Calea Victoriei) or
  // a digit ("Calea 13 Septembrie", "Bulevardul 1 Mai"). We also accept
  // lowercase in the rest so abbreviations like "nr." don't break the
  // match prematurely.
  const STREET_RE =
    /(Strada|Str\.?|Calea|Bulevardul|Bd\.?|B-dul|Șoseaua|Șos\.?|Sos\.?|Piața|Aleea|Intrarea|Splaiul|Drumul|Cartier|Parcul)\s+([A-ZĂÂÎȘȚ0-9][\wĂÂÎȘȚăâîșț0-9\-'. ]{1,60}?)(?=\s*(?:nr\.?\s*\d+|,|\.|și|—|–|\(|$))/gi;
  let m: RegExpExecArray | null;
  const streetNameHits: string[] = [];
  while ((m = STREET_RE.exec(clean)) !== null) {
    const prefix = m[1]!;
    const name = m[2]!.trim().replace(/[,.]$/, "");
    if (name.length >= 2) {
      streetNameHits.push(`${prefix} ${name}`.replace(/\s+/g, " "));
    }
  }

  // Detect street number attached to the first hit (e.g. "Calea Victoriei 45"
  // or "Calea Victoriei nr. 45").
  const firstStreet = streetNameHits[0];
  if (firstStreet) {
    const tail = clean.slice(clean.toLowerCase().indexOf(firstStreet.toLowerCase()) + firstStreet.length, clean.toLowerCase().indexOf(firstStreet.toLowerCase()) + firstStreet.length + 40);
    const numMatch = tail.match(/^[^\d,]*?(?:nr\.?\s*)?(\d{1,4})\b/i);
    if (numMatch) {
      push([`${firstStreet} ${numMatch[1]}`, bucharestScope, "România"].filter(Boolean).join(", "));
    }
  }

  // Bare street + city fallback, most-specific first.
  for (const s of streetNameHits) {
    push([s, bucharestScope, "România"].filter(Boolean).join(", "));
  }

  // Last resort: city-only query (so at least the pin lands in the city,
  // not nothing). Drop if we don't even know the city.
  if (bucharestScope) {
    push(`${bucharestScope}, România`);
  }

  return out;
}

const GEOCODE_HEADERS = { "User-Agent": "CivicRomania/1.0 (civia.ro)" } as const;

// Lightweight client-side ratelimit to stay friendly with Nominatim's
// 1 req/s policy. Awaits the minimum gap between consecutive calls.
let lastNominatimHitAt = 0;
async function waitNominatimGap() {
  const GAP_MS = 1100;
  const now = Date.now();
  const elapsed = now - lastNominatimHitAt;
  if (elapsed < GAP_MS) {
    await new Promise((r) => setTimeout(r, GAP_MS - elapsed));
  }
  lastNominatimHitAt = Date.now();
}

export interface GeocodingResult {
  address: string;
  sector: string | null;
  neighborhood?: string;
  street?: string;
  houseNumber?: string;
}

export interface ForwardGeocodingResult {
  lat: number;
  lng: number;
  displayName: string;
  boundingBox?: [number, number, number, number]; // [south, north, west, east]
}

// Single-query Nominatim call. Returns null on miss / non-Romania match.
// 3s timeout — Nominatim e capricios, mai bine null decât blocare la submit.
async function nominatimOne(query: string): Promise<ForwardGeocodingResult | null> {
  if (!query || query.length < 3) return null;
  const q = query.replace(/\s+/g, " ").trim().slice(0, 180);
  try {
    await waitNominatimGap();
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=ro&limit=1&addressdetails=1&accept-language=ro`;
    const res = await fetch(url, {
      headers: GEOCODE_HEADERS,
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    const arr = (await res.json()) as Array<{
      lat: string;
      lon: string;
      display_name: string;
      boundingbox?: string[];
    }>;
    const hit = arr[0];
    if (!hit) return null;
    const lat = parseFloat(hit.lat);
    const lng = parseFloat(hit.lon);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
    // Bound to România — guard against rogue matches.
    if (lat < 43.5 || lat > 48.3 || lng < 20.2 || lng > 29.7) return null;
    const bb = hit.boundingbox?.map(parseFloat);
    return {
      lat,
      lng,
      displayName: hit.display_name,
      boundingBox: bb && bb.length === 4 && bb.every((n) => Number.isFinite(n))
        ? [bb[0]!, bb[1]!, bb[2]!, bb[3]!]
        : undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Forward geocoding: text → coordinates. Tries a sequence of extracted
 * queries — full text, then street + number + city, then street + city,
 * then just city — stopping at the first hit.
 *
 * This is the version most callers want. For a verbose sesizare text
 * like "Pe trotuarul aferent Calea 13 Septembrie, între intersecția cu
 * Șoseaua Panduri...", the first attempt often misses, but the second
 * ("Calea 13 Septembrie, București") nails it.
 */
export async function forwardGeocode(
  text: string,
  countyHint?: string | null,
): Promise<ForwardGeocodingResult | null> {
  if (!text || text.length < 3) return null;

  // Attempt 1: the original text (cleaned). Works for short, clean
  // queries the user typed into the "locatie" field.
  const cleaned = text.replace(/\([^)]*\)/g, " ").replace(/\s+/g, " ").trim().slice(0, 180);
  const direct = await nominatimOne(cleaned);
  if (direct) return direct;

  // Attempt 2+: extracted queries (street + number + city, then looser).
  const queries = extractGeocodeQueries(text, countyHint);
  for (const q of queries) {
    const hit = await nominatimOne(q);
    if (hit) return hit;
  }
  return null;
}

export async function reverseGeocode(lat: number, lng: number): Promise<GeocodingResult | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=ro`;
    const res = await fetch(url, {
      headers: { "User-Agent": "CivicBucuresti/1.0 (.)" },
      // Reverse geocode results are stable — cache 24h to cut Nominatim load.
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      address?: {
        road?: string;
        house_number?: string;
        suburb?: string;
        city_district?: string;
        neighbourhood?: string;
      };
      display_name?: string;
    };
    const addr = data.address ?? {};

    // Detect sector — try city_district first, then fallback to keyword detection
    let sector: string | null = null;
    const sectorStr = addr.city_district ?? addr.suburb ?? "";
    const match = sectorStr.match(/Sector(?:ul)?\s*(\d)/i);
    if (match) sector = `S${match[1]}`;

    const parts: string[] = [];
    if (addr.road) parts.push(addr.road);
    if (addr.house_number) parts.push(`nr. ${addr.house_number}`);
    if (addr.neighbourhood) parts.push(addr.neighbourhood);

    const address = parts.join(", ") || data.display_name?.split(",").slice(0, 3).join(",") || "";

    // Fallback: keyword-based detection from full display name + neighborhood
    if (!sector) {
      const searchText = `${address} ${data.display_name ?? ""} ${addr.neighbourhood ?? ""}`;
      sector = detectSectorFromText(searchText);
    }

    return {
      address,
      sector,
      neighborhood: addr.neighbourhood,
      street: addr.road,
      houseNumber: addr.house_number,
    };
  } catch {
    return null;
  }
}
