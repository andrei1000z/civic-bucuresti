import type { UnifiedSensor } from "@/lib/aer/types";
import { calculateAqi } from "@/lib/aer/aqi-calculator";

/**
 * Sensor.Community v2 static API — 5-minute averages for ALL dust sensors.
 * This endpoint has MORE sensors than the v1 country filter because it
 * includes sensors that have reported in the last hour, not just 5 minutes.
 */
const API_URL = "https://data.sensor.community/static/v2/data.dust.min.json";

interface V2Entry {
  id: number;
  location: { country: string; latitude: string; longitude: string };
  sensor: { id: number; sensor_type: { name: string } };
  sensordatavalues: { value_type: string; value: string }[];
  timestamp: string;
}

export async function fetchSensorCommunityV2(): Promise<UnifiedSensor[]> {
  try {
    const res = await fetch(API_URL, {
      headers: { "User-Agent": "civia.ro/1.0 (contact@civia.ro)" },
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as V2Entry[];

    // Filter Romania only
    const roData = data.filter((e) => e.location?.country === "RO");

    // Group by sensor ID
    const grouped = new Map<number, { entry: V2Entry; pm25: number | null; pm10: number | null }>();
    for (const entry of roData) {
      const sId = entry.sensor.id;
      if (grouped.has(sId)) continue;
      let pm25: number | null = null;
      let pm10: number | null = null;
      for (const v of entry.sensordatavalues) {
        const num = parseFloat(v.value);
        if (isNaN(num)) continue;
        if (v.value_type === "P2") pm25 = num;
        if (v.value_type === "P1") pm10 = num;
      }
      grouped.set(sId, { entry, pm25, pm10 });
    }

    const sensors: UnifiedSensor[] = [];
    for (const [sId, { entry, pm25, pm10 }] of grouped) {
      const lat = parseFloat(entry.location.latitude);
      const lng = parseFloat(entry.location.longitude);
      if (isNaN(lat) || isNaN(lng)) continue;
      // Skip if already have from v1 (dedup handles this but be safe)
      sensors.push({
        id: `sc2_${sId}`,
        source: "sensor-community",
        lat,
        lng,
        aqi: calculateAqi({ pm25, pm10 }),
        pm25,
        pm10,
        pm1: null,
        no2: null,
        so2: null,
        o3: null,
        co: null,
        temperature: null,
        humidity: null,
        pressure: null,
        noise: null,
        updatedAt: entry.timestamp,
        stationName: null,
        sensorType: entry.sensor.sensor_type.name,
        isOfficial: false,
      });
    }
    return sensors;
  } catch {
    return [];
  }
}
