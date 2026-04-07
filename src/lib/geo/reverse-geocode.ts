/**
 * Reverse geocoding via Nominatim (OpenStreetMap) — free, no API key.
 * Returns county code + locality name from coordinates.
 * Rate limit: 1 req/sec (Nominatim policy).
 */

// Map Romanian county names (from Nominatim) to our 2-letter codes
const COUNTY_NAME_TO_CODE: Record<string, string> = {
  "alba": "AB", "arad": "AR", "argeș": "AG", "arges": "AG",
  "bacău": "BC", "bacau": "BC", "bihor": "BH",
  "bistrița-năsăud": "BN", "bistrita-nasaud": "BN",
  "botoșani": "BT", "botosani": "BT",
  "brăila": "BR", "braila": "BR",
  "brașov": "BV", "brasov": "BV",
  "buzău": "BZ", "buzau": "BZ",
  "călărași": "CL", "calarasi": "CL",
  "caraș-severin": "CS", "caras-severin": "CS",
  "cluj": "CJ", "constanța": "CT", "constanta": "CT",
  "covasna": "CV",
  "dâmbovița": "DB", "dambovita": "DB",
  "dolj": "DJ",
  "galați": "GL", "galati": "GL",
  "gorj": "GJ",
  "giurgiu": "GR",
  "harghita": "HR",
  "hunedoara": "HD",
  "ialomița": "IL", "ialomita": "IL",
  "iași": "IS", "iasi": "IS",
  "ilfov": "IF",
  "maramureș": "MM", "maramures": "MM",
  "mehedinți": "MH", "mehedinti": "MH",
  "mureș": "MS", "mures": "MS",
  "neamț": "NT", "neamt": "NT",
  "olt": "OT",
  "prahova": "PH",
  "sălaj": "SJ", "salaj": "SJ",
  "satu mare": "SM",
  "sibiu": "SB",
  "suceava": "SV",
  "teleorman": "TR",
  "timiș": "TM", "timis": "TM",
  "tulcea": "TL",
  "vâlcea": "VL", "valcea": "VL",
  "vaslui": "VS",
  "vrancea": "VN",
  "bucurești": "B", "bucharest": "B", "municipiul bucurești": "B",
};

export interface GeocodedLocation {
  countyCode: string | null;  // "CJ", "B", etc.
  countyName: string | null;  // "Cluj", "București"
  locality: string | null;    // "Cluj-Napoca", "Sector 3"
  sector: string | null;      // "S1"-"S6" for București only
  address: string | null;     // full formatted address from Nominatim
  shortAddress: string | null; // clean: "Strada X nr. Y, Localitate, Județ"
  street: string | null;       // street name
  houseNumber: string | null;  // house number
}

/**
 * Reverse geocode coordinates to county + locality.
 * Uses Nominatim (free, no key needed).
 */
export async function reverseGeocode(lat: number, lng: number): Promise<GeocodedLocation> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&accept-language=ro&zoom=16`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Civia/1.0 (civia.ro)" },
    });
    if (!res.ok) throw new Error(`Nominatim ${res.status}`);
    const data = await res.json();

    const addr = data.address ?? {};
    const displayName = (data.display_name ?? "") as string;

    // Extract county — try multiple Nominatim fields
    // Nominatim returns "county" for most areas, "state" for București
    const countyRaw = (addr.county || "").toLowerCase().trim();
    const stateRaw = (addr.state || "").toLowerCase().trim();
    // Try county first, then state, also handle "municipiul bucurești"
    let countyCode = COUNTY_NAME_TO_CODE[countyRaw]
      ?? COUNTY_NAME_TO_CODE[stateRaw]
      ?? COUNTY_NAME_TO_CODE[stateRaw.replace("municipiul ", "")]
      ?? null;

    // Fallback: if display_name contains "București", it's B
    if (!countyCode && displayName.toLowerCase().includes("bucurești")) {
      countyCode = "B";
    }

    const countyName = addr.county || addr.state || null;

    // Extract locality
    const locality = addr.city || addr.town || addr.village || addr.municipality || null;

    // Detect sector — check EVERYWHERE in address and display_name
    let sector: string | null = null;
    const allText = `${addr.suburb || ""} ${addr.city_district || ""} ${addr.quarter || ""} ${displayName}`.toLowerCase();
    const sectorMatch = allText.match(/sector\s*(\d)/i);
    if (sectorMatch) {
      sector = `S${sectorMatch[1]}`;
    }

    // Extract street details
    const street = addr.road || addr.pedestrian || addr.footway || null;
    const houseNumber = addr.house_number || null;

    // Build clean short address: "Strada X nr. Y, Sector Z, București"
    const parts: string[] = [];
    if (street) {
      parts.push(houseNumber ? `${street} nr. ${houseNumber}` : street);
    }
    // Add sector for București
    if (sector) {
      parts.push(`Sector ${sector.replace("S", "")}`);
    }
    // Add locality
    if (countyCode === "B" || (locality && locality.toLowerCase().includes("bucurești"))) {
      parts.push("București");
    } else if (locality) {
      parts.push(locality);
    }
    const shortAddress = parts.length > 0 ? parts.join(", ") : displayName;

    return {
      countyCode,
      countyName,
      locality,
      sector,
      address: displayName,
      shortAddress,
      street,
      houseNumber,
    };
  } catch {
    return { countyCode: null, countyName: null, locality: null, sector: null, address: null, shortAddress: null, street: null, houseNumber: null };
  }
}
