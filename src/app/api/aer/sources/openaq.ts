import type { UnifiedSensor } from "@/lib/aer/types";
import { calculateAqi } from "@/lib/aer/aqi-calculator";

const BASE = "https://api.openaq.org/v3";

interface OpenAQLocation {
  id: number;
  name: string;
  locality: string | null;
  coordinates: { latitude: number; longitude: number };
  sensors: { id: number; name: string; parameter: { name: string; units: string } }[];
}

interface OpenAQLatest {
  sensors: { parameter: { name: string }; value: number; datetime: { utc: string } }[];
}

export async function fetchOpenAQ(): Promise<UnifiedSensor[]> {
  const apiKey = process.env.OPENAQ_API_KEY;
  if (!apiKey) return [];

  const headers: Record<string, string> = { "X-API-Key": apiKey };

  // Get all Romanian locations
  const locRes = await fetch(`${BASE}/locations?countries_id=178&limit=200`, { headers, next: { revalidate: 300 } });
  if (!locRes.ok) return [];
  const locData = (await locRes.json()) as { results: OpenAQLocation[] };

  const sensors: UnifiedSensor[] = [];

  // Batch fetch latest for each location (limit to avoid rate limits)
  const locations = (locData.results ?? []).slice(0, 100);
  const latestPromises = locations.map(async (loc) => {
    try {
      const res = await fetch(`${BASE}/locations/${loc.id}/latest`, { headers, next: { revalidate: 300 } });
      if (!res.ok) return null;
      const data = (await res.json()) as { results: OpenAQLatest[] };
      return { loc, latest: data.results?.[0] };
    } catch {
      return null;
    }
  });

  const results = await Promise.allSettled(latestPromises);

  for (const result of results) {
    if (result.status !== "fulfilled" || !result.value) continue;
    const { loc, latest } = result.value;
    if (!latest) continue;

    const values: Record<string, number> = {};
    let lastTime = "";
    for (const s of latest.sensors ?? []) {
      values[s.parameter.name.toLowerCase()] = s.value;
      if (s.datetime?.utc) lastTime = s.datetime.utc;
    }

    sensors.push({
      id: `oaq_${loc.id}`,
      source: "openaq",
      lat: loc.coordinates.latitude,
      lng: loc.coordinates.longitude,
      aqi: calculateAqi({ pm25: values["pm25"] ?? null, pm10: values["pm10"] ?? null }),
      pm25: values["pm25"] ?? null,
      pm10: values["pm10"] ?? null,
      pm1: null,
      no2: values["no2"] ?? null,
      so2: values["so2"] ?? null,
      o3: values["o3"] ?? null,
      co: values["co"] ?? null,
      temperature: values["temperature"] ?? null,
      humidity: values["humidity"] ?? null,
      pressure: null,
      noise: null,
      updatedAt: lastTime || new Date().toISOString(),
      stationName: loc.name,
      sensorType: "RNMCA",
      isOfficial: true,
    });
  }

  return sensors;
}
