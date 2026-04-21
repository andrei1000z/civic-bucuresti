// Reverse + forward geocoding using Nominatim (OpenStreetMap) — free, no API key
import { detectSectorFromText } from "./sector-detect";

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

/**
 * Forward geocoding: text → coordinates. Used for backfilling and correcting
 * sesizări that were submitted with wrong/missing lat/lng. We pre-parse the
 * input to extract a street+locality substring and restrict Nominatim to
 * România via `countrycodes=ro` so we don't land in Kazakhstan because some
 * Ukrainian village shares a name with a Bucharest street.
 */
export async function forwardGeocode(text: string): Promise<ForwardGeocodingResult | null> {
  if (!text || text.length < 3) return null;
  // Clean: drop parenthesized asides, keep street + locality.
  const cleaned = text
    .replace(/\([^)]*\)/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleaned)}&countrycodes=ro&limit=1&addressdetails=1&accept-language=ro`;
    const res = await fetch(url, {
      headers: { "User-Agent": "CivicRomania/1.0 (civia.ro)" },
      next: { revalidate: 86400 },
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
    // Bound to România — guard against rogue matches.
    if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
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

export async function reverseGeocode(lat: number, lng: number): Promise<GeocodingResult | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=ro`;
    const res = await fetch(url, {
      headers: { "User-Agent": "CivicBucuresti/1.0 (.)" },
      // Reverse geocode results are stable — cache 24h to cut Nominatim load.
      next: { revalidate: 86400 },
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
