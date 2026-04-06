import { NextResponse } from "next/server";
import { fetchSensorCommunity } from "./sources/sensor-community";
import { fetchOpenAQ } from "./sources/openaq";
import { fetchWaqi } from "./sources/waqi";
import type { UnifiedSensor, AirDataResponse } from "@/lib/aer/types";
import { DEDUP_RADIUS_M } from "@/lib/aer/constants";

export const revalidate = 300; // 5 min ISR cache

/**
 * Distance between two points in meters (Haversine).
 */
function distanceM(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Deduplicate sensors that are within DEDUP_RADIUS_M of each other.
 * Prefers: official > sensor-community, more data fields > fewer.
 */
function dedup(sensors: UnifiedSensor[]): UnifiedSensor[] {
  // Sort: official first, then by number of non-null fields
  const sorted = [...sensors].sort((a, b) => {
    if (a.isOfficial !== b.isOfficial) return a.isOfficial ? -1 : 1;
    const countFields = (s: UnifiedSensor) =>
      [s.pm25, s.pm10, s.no2, s.so2, s.o3, s.temperature].filter((v) => v != null).length;
    return countFields(b) - countFields(a);
  });

  const kept: UnifiedSensor[] = [];
  const used = new Set<number>();

  for (let i = 0; i < sorted.length; i++) {
    if (used.has(i)) continue;
    kept.push(sorted[i]);
    // Mark nearby sensors as duplicates
    for (let j = i + 1; j < sorted.length; j++) {
      if (used.has(j)) continue;
      if (distanceM(sorted[i].lat, sorted[i].lng, sorted[j].lat, sorted[j].lng) < DEDUP_RADIUS_M) {
        used.add(j);
      }
    }
  }

  return kept;
}

export async function GET() {
  const startTime = Date.now();

  // Fetch all sources in parallel — don't fail if one is down
  const results = await Promise.allSettled([
    fetchSensorCommunity(),
    fetchOpenAQ(),
    fetchWaqi(),
  ]);

  const allSensors: UnifiedSensor[] = [];
  const bySource: Record<string, number> = {};
  const errors: string[] = [];

  const sourceNames = ["sensor-community", "openaq", "waqi"];
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    const name = sourceNames[i];
    if (result.status === "fulfilled") {
      allSensors.push(...result.value);
      bySource[name] = result.value.length;
    } else {
      bySource[name] = 0;
      errors.push(`${name}: ${result.reason?.message ?? "unknown error"}`);
    }
  }

  // Deduplicate
  const deduplicated = dedup(allSensors);

  // Calculate average AQI
  const aqiValues = deduplicated.map((s) => s.aqi).filter((v): v is number => v != null);
  const avgAqi = aqiValues.length > 0 ? Math.round(aqiValues.reduce((a, b) => a + b, 0) / aqiValues.length) : null;

  const response: AirDataResponse = {
    sensors: deduplicated,
    meta: {
      total: deduplicated.length,
      bySource,
      avgAqi,
      lastUpdate: new Date().toISOString(),
    },
  };

  return NextResponse.json(response, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
      "X-Fetch-Time": `${Date.now() - startTime}ms`,
      ...(errors.length > 0 ? { "X-Errors": errors.join("; ") } : {}),
    },
  });
}
