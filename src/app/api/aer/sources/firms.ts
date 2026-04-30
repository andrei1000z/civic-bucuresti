/**
 * NASA FIRMS — active wildfire detections via Suomi NPP VIIRS satellite.
 *
 * IQAir's Romania map shows red flame markers across the country. Those
 * are NOT proprietary IQAir data; they're VIIRS thermal anomalies from
 * NASA's FIRMS (Fire Information for Resource Management System).
 *
 * Free, no API key required for the regional 24h CSV. Updates ~3h.
 * Filtered to Romania's bounding box at fetch time so we don't ship a
 * Europe-wide payload to the browser.
 *
 * Source format (VIIRS C2 NRT — confidence is `l|n|h`):
 *   latitude,longitude,bright_ti4,scan,track,acq_date,acq_time,
 *   satellite,instrument,confidence,version,bright_ti5,frp,daynight
 */

import { RO_BOUNDS } from "@/lib/aer/constants";

const FIRMS_VIIRS_24H_EUROPE =
  "https://firms.modaps.eosdis.nasa.gov/data/active_fire/suomi-npp-viirs-c2/csv/SUOMI_VIIRS_C2_Europe_24h.csv";

export interface FireDetection {
  /** Stable id derived from lat,lng,acq_date,acq_time so dedup across
   *  pulls is trivial and React keys stay stable across renders. */
  id: string;
  lat: number;
  lng: number;
  /** Brightness temperature in Kelvin, channel I-4 (3.74 µm). */
  brightness: number | null;
  /** Fire Radiative Power in MW — proxy for fire intensity. */
  frp: number | null;
  /** Detection confidence: `low` | `nominal` | `high`. */
  confidence: "low" | "nominal" | "high" | "unknown";
  /** Acquisition timestamp (UTC ISO 8601). */
  acquiredAt: string;
  /** "D" = daytime, "N" = nighttime — useful for the popup label. */
  daynight: "D" | "N" | null;
  /** Instrument that picked it up — e.g. „VIIRS". */
  instrument: string;
  /** Satellite identifier — e.g. „N" for Suomi NPP. */
  satellite: string;
}

function parseCsv(text: string): string[][] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  return lines.map((line) => line.split(","));
}

function normalizeConfidence(raw: string): FireDetection["confidence"] {
  const c = raw.trim().toLowerCase();
  if (c === "h" || c === "high") return "high";
  if (c === "n" || c === "nominal") return "nominal";
  if (c === "l" || c === "low") return "low";
  return "unknown";
}

/**
 * Pull the Europe 24h FIRMS CSV and return the fires that fall inside
 * Romania's bbox. ~10–200 detections in summer (more during heatwaves
 * / wildfires); 0–5 in winter. Fast enough that we don't bother with
 * a separate cache layer beyond the route's ISR.
 */
export async function fetchFirms(): Promise<FireDetection[]> {
  let res: Response;
  try {
    res = await fetch(FIRMS_VIIRS_24H_EUROPE, {
      headers: { "User-Agent": "civia.ro/1.0 (https://civia.ro)" },
      next: { revalidate: 600 }, // 10 min — FIRMS itself updates every 3h
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    return [];
  }
  if (!res.ok) return [];

  let text: string;
  try {
    text = await res.text();
  } catch {
    return [];
  }

  const rows = parseCsv(text);
  if (rows.length < 2) return [];
  const header = rows[0];
  if (!header) return [];

  const idx = (col: string) => header.findIndex((h) => h.trim().toLowerCase() === col);
  const iLat = idx("latitude");
  const iLng = idx("longitude");
  const iBright = idx("bright_ti4");
  const iAcqDate = idx("acq_date");
  const iAcqTime = idx("acq_time");
  const iSat = idx("satellite");
  const iInst = idx("instrument");
  const iConf = idx("confidence");
  const iFrp = idx("frp");
  const iDaynight = idx("daynight");

  if (iLat < 0 || iLng < 0 || iAcqDate < 0 || iAcqTime < 0) return [];

  const fires: FireDetection[] = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.length < header.length - 1) continue;

    const lat = parseFloat(row[iLat] ?? "");
    const lng = parseFloat(row[iLng] ?? "");
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;

    // Romania bounding box filter — FIRMS gives us all of Europe, we
    // only want detections inside our coverage area.
    if (
      lat < RO_BOUNDS.south ||
      lat > RO_BOUNDS.north ||
      lng < RO_BOUNDS.west ||
      lng > RO_BOUNDS.east
    ) {
      continue;
    }

    const acqDate = (row[iAcqDate] ?? "").trim();
    const acqTimeRaw = (row[iAcqTime] ?? "").trim();
    // FIRMS encodes time as HHMM without separator; normalize so the
    // ISO timestamp stays valid.
    const acqTime = acqTimeRaw.padStart(4, "0");
    const hh = acqTime.slice(0, 2);
    const mm = acqTime.slice(2, 4);
    const acquiredAt = acqDate ? `${acqDate}T${hh}:${mm}:00Z` : new Date().toISOString();

    const brightness = iBright >= 0 ? parseFloat(row[iBright] ?? "") : null;
    const frp = iFrp >= 0 ? parseFloat(row[iFrp] ?? "") : null;
    const confidence = iConf >= 0 ? normalizeConfidence(row[iConf] ?? "") : "unknown";
    const daynightRaw = iDaynight >= 0 ? (row[iDaynight] ?? "").trim().toUpperCase() : "";
    const daynight: FireDetection["daynight"] =
      daynightRaw === "D" || daynightRaw === "N" ? daynightRaw : null;

    fires.push({
      id: `firms_${lat.toFixed(4)}_${lng.toFixed(4)}_${acqDate}_${acqTime}`,
      lat,
      lng,
      brightness: Number.isFinite(brightness) ? brightness : null,
      frp: Number.isFinite(frp) ? frp : null,
      confidence,
      acquiredAt,
      daynight,
      instrument: iInst >= 0 ? (row[iInst] ?? "VIIRS").trim() : "VIIRS",
      satellite: iSat >= 0 ? (row[iSat] ?? "").trim() : "",
    });
  }

  return fires;
}
