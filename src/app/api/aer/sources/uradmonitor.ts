/**
 * uRADMonitor — European citizen sensor network with strong Romania
 * coverage (project founded in Cluj). Reads PM2.5, PM10, ozone, NOx,
 * temperature, humidity, pressure, noise.
 *
 * Their dashboard at https://www.uradmonitor.com is publicly browsable,
 * but the data API requires per-account credentials — `X-User-Id` +
 * `X-User-Hash` headers tied to a registered uRADMonitor account.
 * Set `URADMONITOR_USER_ID` + `URADMONITOR_USER_HASH` env vars to
 * activate; without them this source is a graceful no-op so the rest
 * of the aggregator keeps working.
 */

import type { UnifiedSensor } from "@/lib/aer/types";
import { calculateAqi } from "@/lib/aer/aqi-calculator";
import { RO_BOUNDS } from "@/lib/aer/constants";

const ENDPOINT = "https://data.uradmonitor.com/api/v1/devices";

// uRADMonitor returns an object map keyed by device id. Values include
// telemetry like `pm25`, `pm10`, `o3_ppb`, `temperature`, `humidity`,
// `pressure`, `voc`, `noise`, `cpm` (radiation). Field names vary per
// hardware revision so we tolerate missing keys.
interface UradDevice {
  id?: string;
  latitude?: number;
  longitude?: number;
  pm25?: number;
  pm10?: number;
  o3_ppb?: number;
  no2_ppb?: number;
  so2_ppb?: number;
  co_ppb?: number;
  temperature?: number;
  humidity?: number;
  pressure?: number;
  noise?: number;
  time?: number; // unix seconds
}

export async function fetchUradMonitor(): Promise<UnifiedSensor[]> {
  const userId = process.env.URADMONITOR_USER_ID;
  const userHash = process.env.URADMONITOR_USER_HASH;
  if (!userId || !userHash) return [];

  let res: Response;
  try {
    res = await fetch(ENDPOINT, {
      headers: {
        "X-User-Id": userId,
        "X-User-Hash": userHash,
        "User-Agent": "civia.ro/1.0 (https://civia.ro)",
      },
      next: { revalidate: 120 },
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    return [];
  }
  if (!res.ok) return [];

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    return [];
  }

  // uRADMonitor returns either an array of devices or an object map
  // depending on endpoint version. Normalize to array.
  const devices: UradDevice[] = Array.isArray(json)
    ? (json as UradDevice[])
    : Object.values((json ?? {}) as Record<string, UradDevice>);

  const sensors: UnifiedSensor[] = [];
  for (const d of devices) {
    const lat = typeof d.latitude === "number" ? d.latitude : NaN;
    const lng = typeof d.longitude === "number" ? d.longitude : NaN;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    if (
      lat < RO_BOUNDS.south ||
      lat > RO_BOUNDS.north ||
      lng < RO_BOUNDS.west ||
      lng > RO_BOUNDS.east
    ) {
      continue;
    }

    const pm25 = typeof d.pm25 === "number" ? d.pm25 : null;
    const pm10 = typeof d.pm10 === "number" ? d.pm10 : null;
    // ppb → µg/m³ rough conversions for AQI math (good enough for
    // map-level color coding; the popup still shows raw ppb).
    const o3 = typeof d.o3_ppb === "number" ? d.o3_ppb * 1.96 : null;
    const no2 = typeof d.no2_ppb === "number" ? d.no2_ppb * 1.88 : null;
    const so2 = typeof d.so2_ppb === "number" ? d.so2_ppb * 2.62 : null;
    const co = typeof d.co_ppb === "number" ? d.co_ppb * 1.145 : null;

    sensors.push({
      id: `urad_${d.id ?? `${lat.toFixed(4)}_${lng.toFixed(4)}`}`,
      source: "uradmonitor",
      lat,
      lng,
      // calculateAqi takes PM2.5 + PM10 only (US-EPA AQI is dominated
      // by particulates at our latitude); ozone / NOx are surfaced in
      // the popup separately so users with a full pollutant picture
      // still see the readings.
      aqi: calculateAqi({ pm25, pm10 }),
      pm25,
      pm10,
      pm1: null,
      no2,
      so2,
      o3,
      co,
      temperature: typeof d.temperature === "number" ? d.temperature : null,
      humidity: typeof d.humidity === "number" ? d.humidity : null,
      pressure: typeof d.pressure === "number" ? d.pressure : null,
      noise: typeof d.noise === "number" ? d.noise : null,
      updatedAt:
        typeof d.time === "number"
          ? new Date(d.time * 1000).toISOString()
          : new Date().toISOString(),
      stationName: d.id ?? null,
      sensorType: "uRADMonitor",
      isOfficial: false,
    });
  }
  return sensors;
}
