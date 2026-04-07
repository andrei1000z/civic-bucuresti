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
    const displayName = data.display_name ?? null;

    // Extract county
    const countyRaw = (addr.county || addr.state || "").toLowerCase().trim();
    const countyCode = COUNTY_NAME_TO_CODE[countyRaw] ?? null;
    const countyName = addr.county || addr.state || null;

    // Extract locality
    const locality = addr.city || addr.town || addr.village || addr.municipality || null;

    // Detect sector for București
    let sector: string | null = null;
    if (countyCode === "B" || countyCode === "IF") {
      const suburb = (addr.suburb || addr.city_district || "").toLowerCase();
      const sectorMatch = suburb.match(/sector\s*(\d)/i) || displayName?.match(/sector\s*(\d)/i);
      if (sectorMatch) {
        sector = `S${sectorMatch[1]}`;
      }
    }

    // Extract street details
    const street = addr.road || addr.pedestrian || addr.footway || null;
    const houseNumber = addr.house_number || null;

    // Build clean short address: "Strada X nr. Y, Localitate, Județ"
    const parts: string[] = [];
    if (street) {
      parts.push(houseNumber ? `${street} ${houseNumber}` : street);
    }
    if (sector && (countyCode === "B" || countyCode === "IF")) {
      parts.push(`Sector ${sector.replace("S", "")}`);
    }
    if (locality && locality !== "București") {
      parts.push(locality);
    }
    if (countyCode === "B") {
      parts.push("București");
    } else if (countyName) {
      parts.push(`jud. ${countyName}`);
    }
    const shortAddress = parts.length > 0 ? parts.join(", ") : null;

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
