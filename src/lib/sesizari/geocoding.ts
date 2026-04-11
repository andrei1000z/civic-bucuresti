// Reverse geocoding using Nominatim (OpenStreetMap) — free, no API key required
import { detectSectorFromText } from "./sector-detect";

export interface GeocodingResult {
  address: string;
  sector: string | null;
  neighborhood?: string;
  street?: string;
  houseNumber?: string;
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
