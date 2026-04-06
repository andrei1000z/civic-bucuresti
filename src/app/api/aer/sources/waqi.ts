import type { UnifiedSensor } from "@/lib/aer/types";
import { RO_BOUNDS } from "@/lib/aer/constants";

interface WaqiStation {
  uid: number;
  aqi: string;
  lat: number;
  lon: number;
  station: { name: string };
}

export async function fetchWaqi(): Promise<UnifiedSensor[]> {
  const token = process.env.WAQI_TOKEN;
  if (!token) return [];

  const { south, west, north, east } = RO_BOUNDS;
  const url = `https://api.waqi.info/v2/map/bounds/?latlng=${south},${west},${north},${east}&networks=all&token=${token}`;

  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) return [];
  const json = (await res.json()) as { status: string; data: WaqiStation[] };
  if (json.status !== "ok" || !Array.isArray(json.data)) return [];

  return json.data
    .filter((s) => s.lat && s.lon && s.aqi !== "-")
    .map((s) => {
      const aqi = parseInt(s.aqi, 10);
      return {
        id: `waqi_${s.uid}`,
        source: "waqi" as const,
        lat: s.lat,
        lng: s.lon,
        aqi: isNaN(aqi) ? null : aqi,
        pm25: null,
        pm10: null,
        pm1: null,
        no2: null,
        so2: null,
        o3: null,
        co: null,
        temperature: null,
        humidity: null,
        pressure: null,
        noise: null,
        updatedAt: new Date().toISOString(),
        stationName: s.station?.name ?? null,
        sensorType: null,
        isOfficial: true,
      };
    });
}

/**
 * WAQI tile URL for Leaflet overlay (pre-interpolated heatmap).
 * Use this as a TileLayer source if WAQI_TOKEN is available.
 */
export function getWaqiTileUrl(): string | null {
  const token = process.env.NEXT_PUBLIC_WAQI_TOKEN || process.env.WAQI_TOKEN;
  if (!token) return null;
  return `https://tiles.aqicn.org/tiles/usepa-aqi/{z}/{x}/{y}.png?token=${token}`;
}
