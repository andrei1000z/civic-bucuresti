import type { UnifiedSensor } from "@/lib/aer/types";
import { calculateAqi } from "@/lib/aer/aqi-calculator";

const API_URL = "https://data.sensor.community/airrohr/v1/filter/country=RO";

interface SensorDataValue {
  value_type: string;
  value: string;
}

interface SensorCommunityEntry {
  id: number;
  sensor: {
    id: number;
    sensor_type: { name: string };
  };
  location: {
    latitude: string;
    longitude: string;
  };
  sensordatavalues: SensorDataValue[];
  timestamp: string;
}

export async function fetchSensorCommunity(): Promise<UnifiedSensor[]> {
  const res = await fetch(API_URL, {
    headers: { "User-Agent": "civia.ro/1.0 (https://civia.ro)" },
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`Sensor.Community ${res.status}`);
  const data = (await res.json()) as SensorCommunityEntry[];

  // Group by sensor ID (each sensor sends multiple data rows)
  const grouped = new Map<number, { entry: SensorCommunityEntry; values: Map<string, number> }>();

  for (const entry of data) {
    const sId = entry.sensor.id;
    if (!grouped.has(sId)) {
      grouped.set(sId, { entry, values: new Map() });
    }
    const g = grouped.get(sId)!;
    for (const v of entry.sensordatavalues) {
      const num = parseFloat(v.value);
      if (!isNaN(num)) {
        g.values.set(v.value_type, num);
      }
    }
  }

  const sensors: UnifiedSensor[] = [];
  for (const [sId, { entry, values }] of grouped) {
    const lat = parseFloat(entry.location.latitude);
    const lng = parseFloat(entry.location.longitude);
    if (isNaN(lat) || isNaN(lng)) continue;

    const pm25 = values.get("P2") ?? null; // P2 = PM2.5
    const pm10 = values.get("P1") ?? null; // P1 = PM10
    const temp = values.get("temperature") ?? null;
    const hum = values.get("humidity") ?? null;
    const press = values.get("pressure") ?? null;

    sensors.push({
      id: `sc_${sId}`,
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
      temperature: temp,
      humidity: hum,
      pressure: press,
      noise: null,
      updatedAt: entry.timestamp,
      stationName: null,
      sensorType: entry.sensor.sensor_type.name,
      isOfficial: false,
    });
  }

  return sensors;
}
