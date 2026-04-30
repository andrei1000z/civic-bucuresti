import { NextResponse } from "next/server";
import { fetchSensorCommunity } from "./sources/sensor-community";
import { fetchSensorCommunityV2 } from "./sources/sensor-community-v2";
import { fetchOpenAQ } from "./sources/openaq";
import { fetchWaqi } from "./sources/waqi";
import { fetchUradMonitor } from "./sources/uradmonitor";
import type { UnifiedSensor, AirDataResponse } from "@/lib/aer/types";
import { DEDUP_RADIUS_M } from "@/lib/aer/constants";
import { rateLimitAsync, getClientIp } from "@/lib/ratelimit";

// 60s ISR cache. Sensor.Community + uRADMonitor update every ~1 min;
// OpenAQ + WAQI are pulled hourly upstream but their endpoints are
// fast. With 60s revalidate the map feels live without blowing
// through Vercel function-invocation limits — at most 60 cold pulls
// per hour per route.
export const revalidate = 60;

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
    const a = sorted[i];
    if (!a) continue;
    kept.push(a);
    for (let j = i + 1; j < sorted.length; j++) {
      if (used.has(j)) continue;
      const b = sorted[j];
      if (!b) continue;
      if (distanceM(a.lat, a.lng, b.lat, b.lng) < DEDUP_RADIUS_M) {
        used.add(j);
      }
    }
  }

  return kept;
}

export async function GET(req: Request) {
  const rl = await rateLimitAsync(`aer:${getClientIp(req)}`, { limit: 30, windowMs: 60_000 });
  if (!rl.success) return NextResponse.json({ error: "Prea multe cereri" }, { status: 429 });
  const startTime = Date.now();

  // Fetch all sources in parallel — don't fail if one is down. Each
  // pull is timeout-bounded inside its own module so a slow third
  // party doesn't pin the whole route.
  const results = await Promise.allSettled([
    fetchSensorCommunity(),
    fetchSensorCommunityV2(),
    fetchOpenAQ(),
    fetchWaqi(),
    fetchUradMonitor(),
  ]);

  const allSensors: UnifiedSensor[] = [];
  const bySource: Record<string, number> = {};
  const errors: string[] = [];

  const sourceNames = [
    "sensor-community",
    "sensor-community-v2",
    "openaq",
    "waqi",
    "uradmonitor",
  ] as const;
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    const name = sourceNames[i];
    if (!result || !name) continue;
    if (result.status === "fulfilled") {
      allSensors.push(...result.value);
      bySource[name] = result.value.length;
    } else {
      bySource[name] = 0;
      const reason = result.reason as { message?: string } | undefined;
      errors.push(`${name}: ${reason?.message ?? "unknown error"}`);
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
