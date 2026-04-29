import { NextResponse } from "next/server";
import { rateLimitAsync, getClientIp } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

/**
 * GET /api/statistici/aqi?lat=&lng=
 *
 * Live AQI sourced cu fallback chain:
 *   1. OpenAQ v2 — query la coords date sau, fără coords, agregare
 *      across 8 reședințe județe pentru „media națională"
 *   2. Sensor.Community — fallback (citizen-science network, gratuit)
 *
 * Returnează:
 *   - { data: { aqi, pm25, source, quality, stations } } când avem date
 *   - { data: { aqi: null, ... } } când TOATE sursele eșuează
 *
 * LiveStatsBar verifică `aqi !== null` și skip stat-ul dacă e null —
 * nu mai afișăm fake AQI 65 sau text „Date indisponibile" inutil.
 */
export async function GET(req: Request) {
  const rl = await rateLimitAsync(`statistici-aqi:${getClientIp(req)}`, { limit: 60, windowMs: 60_000 });
  if (!rl.success) return NextResponse.json({ error: "Prea multe cereri" }, { status: 429 });

  const { searchParams } = new URL(req.url);
  const latParam = searchParams.get("lat");
  const lngParam = searchParams.get("lng");

  // National average mode: când nu primim coordonate, sample din 8 mari
  // reședințe ca să nu fie biased pe București.
  if (!latParam || !lngParam) {
    const result = await sampleNationalAverage();
    if (result) {
      return NextResponse.json({
        data: result,
      }, {
        headers: { "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=600" },
      });
    }
    return NextResponse.json({
      data: { aqi: null, pm25: null, source: "indisponibil", quality: null, stations: 0 },
    });
  }

  // Single-point mode (folosit de pagini /[judet]/aer cu coords specifice).
  const lat = Number(latParam);
  const lng = Number(lngParam);
  const single = await fetchAqiAt(lat, lng);
  if (single) {
    return NextResponse.json({ data: single }, {
      headers: { "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=600" },
    });
  }
  return NextResponse.json({
    data: { aqi: null, pm25: null, source: "indisponibil", quality: null, stations: 0 },
  });
}

interface AqiResult {
  aqi: number;
  pm25: number;
  source: string;
  quality: string;
  stations: number;
}

interface OpenAqMeasurement { parameter: string; value: number; unit: string }
interface OpenAqResult { measurements?: OpenAqMeasurement[] }
interface SensorCommunityRecord {
  sensordatavalues?: Array<{ value_type: string; value: string }>;
  location?: { latitude: string; longitude: string };
}

// Reședințe principale pentru sample-ul național — bune coverage
// geografic + populație + număr de senzori OpenAQ/SensorCommunity.
const NATIONAL_SAMPLE_POINTS: Array<[string, number, number]> = [
  ["București", 44.43, 26.10],
  ["Cluj", 46.77, 23.60],
  ["Timișoara", 45.75, 21.23],
  ["Iași", 47.16, 27.60],
  ["Constanța", 44.17, 28.64],
  ["Brașov", 45.66, 25.61],
  ["Sibiu", 45.79, 24.15],
  ["Craiova", 44.32, 23.80],
];

async function sampleNationalAverage(): Promise<AqiResult | null> {
  // Run sample fetches in parallel — 8 cities, settle even pe failures
  const results = await Promise.allSettled(
    NATIONAL_SAMPLE_POINTS.map(([, la, lo]) => fetchAqiAt(la, lo)),
  );
  const valid = results
    .filter((r): r is PromiseFulfilledResult<AqiResult> => r.status === "fulfilled" && r.value !== null)
    .map((r) => r.value);

  if (valid.length === 0) return null;

  // Average AQI across cities (numerical mean, NOT pm25 mean — AQI scale e
  // non-linear, dar pentru un număr indicativ național mean-of-AQIs e OK).
  const avgAqi = Math.round(valid.reduce((a, b) => a + b.aqi, 0) / valid.length);
  const avgPm25 = Math.round((valid.reduce((a, b) => a + b.pm25, 0) / valid.length) * 10) / 10;
  const totalStations = valid.reduce((a, b) => a + b.stations, 0);
  return {
    aqi: avgAqi,
    pm25: avgPm25,
    source: `mediu (${valid.length} orașe, ${valid.map((v) => v.source).filter((s, i, arr) => arr.indexOf(s) === i).join("+")})`,
    quality: aqiLabel(avgAqi),
    stations: totalStations,
  };
}

/** Try OpenAQ v2 first, fallback la Sensor.Community */
async function fetchAqiAt(lat: number, lng: number): Promise<AqiResult | null> {
  const fromOpenAq = await tryOpenAq(lat, lng);
  if (fromOpenAq) return fromOpenAq;
  const fromSensorCommunity = await trySensorCommunity(lat, lng);
  if (fromSensorCommunity) return fromSensorCommunity;
  return null;
}

async function tryOpenAq(lat: number, lng: number): Promise<AqiResult | null> {
  try {
    const res = await fetch(
      `https://api.openaq.org/v2/latest?coordinates=${lat},${lng}&radius=50000&limit=30`,
      {
        next: { revalidate: 1800 },
        signal: AbortSignal.timeout(5000),
      },
    );
    if (!res.ok) return null;
    const json = await res.json();
    const results: OpenAqResult[] = json?.results ?? [];
    const pm25Values = results
      .flatMap((r) => r.measurements ?? [])
      .filter((m) => m.parameter === "pm25" && typeof m.value === "number" && m.value > 0 && m.value < 500)
      .map((m) => m.value);
    if (pm25Values.length === 0) return null;
    const avgPm25 = pm25Values.reduce((a, b) => a + b, 0) / pm25Values.length;
    const aqi = pm25ToAqi(avgPm25);
    return {
      aqi: Math.round(aqi),
      pm25: Math.round(avgPm25 * 10) / 10,
      source: "OpenAQ",
      quality: aqiLabel(aqi),
      stations: pm25Values.length,
    };
  } catch {
    return null;
  }
}

async function trySensorCommunity(lat: number, lng: number): Promise<AqiResult | null> {
  try {
    // Sensor.Community area-of-interest endpoint: 1° lat × 1° lng (≈100km).
    const res = await fetch(
      `https://data.sensor.community/airrohr/v1/filter/area=${lat},${lng},1`,
      {
        next: { revalidate: 1800 },
        signal: AbortSignal.timeout(5000),
      },
    );
    if (!res.ok) return null;
    const json = (await res.json()) as SensorCommunityRecord[];
    if (!Array.isArray(json) || json.length === 0) return null;

    const pm25Values: number[] = [];
    for (const record of json) {
      const vals = record.sensordatavalues ?? [];
      const p25 = vals.find((v) => v.value_type === "P2");
      if (p25) {
        const num = Number(p25.value);
        if (Number.isFinite(num) && num > 0 && num < 500) pm25Values.push(num);
      }
    }
    if (pm25Values.length === 0) return null;
    const avgPm25 = pm25Values.reduce((a, b) => a + b, 0) / pm25Values.length;
    const aqi = pm25ToAqi(avgPm25);
    return {
      aqi: Math.round(aqi),
      pm25: Math.round(avgPm25 * 10) / 10,
      source: "Sensor.Community",
      quality: aqiLabel(aqi),
      stations: pm25Values.length,
    };
  } catch {
    return null;
  }
}

function pm25ToAqi(pm25: number): number {
  if (pm25 <= 12) return ((50 / 12) * pm25);
  if (pm25 <= 35.4) return 50 + ((50 / 23.4) * (pm25 - 12));
  if (pm25 <= 55.4) return 100 + ((50 / 20) * (pm25 - 35.4));
  if (pm25 <= 150.4) return 150 + ((50 / 95) * (pm25 - 55.4));
  if (pm25 <= 250.4) return 200 + ((100 / 100) * (pm25 - 150.4));
  return 300 + ((200 / 149.6) * (pm25 - 250.4));
}

function aqiLabel(aqi: number): string {
  if (aqi <= 50) return "Bun";
  if (aqi <= 100) return "Moderat";
  if (aqi <= 150) return "Nesănătos pentru grupe sensibile";
  if (aqi <= 200) return "Nesănătos";
  if (aqi <= 300) return "Foarte nesănătos";
  return "Periculos";
}
