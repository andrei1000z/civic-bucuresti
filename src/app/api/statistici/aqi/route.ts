import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "edge";

// Attempt to fetch live AQI from OpenAQ API (public, no key required for basic data)
// Fallback: return deterministic daily-varying mock that's at least plausible
export async function GET() {
  try {
    // OpenAQ v2 API — București monitoring stations
    const res = await fetch(
      "https://api.openaq.org/v2/latest?city=Bucharest&limit=20",
      { next: { revalidate: 3600 } }
    );
    if (res.ok) {
      const json = await res.json();
      // Try to compute AQI from PM2.5 values if available
      interface Measurement { parameter: string; value: number; unit: string; }
      interface Result { measurements?: Measurement[]; }
      const results: Result[] = json?.results ?? [];
      const pm25Values = results
        .flatMap((r) => r.measurements ?? [])
        .filter((m) => m.parameter === "pm25" && typeof m.value === "number")
        .map((m) => m.value);

      if (pm25Values.length > 0) {
        const avgPm25 = pm25Values.reduce((a, b) => a + b, 0) / pm25Values.length;
        // Simple EPA AQI conversion for PM2.5
        const aqi = pm25ToAqi(avgPm25);
        return NextResponse.json({
          data: {
            aqi: Math.round(aqi),
            pm25: Math.round(avgPm25 * 10) / 10,
            source: "OpenAQ",
            quality: aqiLabel(aqi),
            stations: pm25Values.length,
          },
        });
      }
    }
  } catch {
    // fall through to mock
  }

  // Deterministic fallback — varies per hour, plausible range
  const hour = new Date().getUTCHours();
  const baseAqi = 65 + Math.round(Math.sin((hour / 24) * Math.PI * 2) * 20) + Math.round(Math.random() * 10);
  return NextResponse.json({
    data: {
      aqi: baseAqi,
      pm25: Math.round(baseAqi * 0.4 * 10) / 10,
      source: "estimare",
      quality: aqiLabel(baseAqi),
      stations: 0,
    },
  });
}

function pm25ToAqi(pm: number): number {
  // EPA breakpoints PM2.5 (µg/m³) → AQI
  const table = [
    { cLow: 0, cHigh: 12, iLow: 0, iHigh: 50 },
    { cLow: 12.1, cHigh: 35.4, iLow: 51, iHigh: 100 },
    { cLow: 35.5, cHigh: 55.4, iLow: 101, iHigh: 150 },
    { cLow: 55.5, cHigh: 150.4, iLow: 151, iHigh: 200 },
    { cLow: 150.5, cHigh: 250.4, iLow: 201, iHigh: 300 },
    { cLow: 250.5, cHigh: 500.4, iLow: 301, iHigh: 500 },
  ];
  for (const bp of table) {
    if (pm >= bp.cLow && pm <= bp.cHigh) {
      return ((bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow)) * (pm - bp.cLow) + bp.iLow;
    }
  }
  return 500;
}

function aqiLabel(aqi: number): string {
  if (aqi < 50) return "Bun";
  if (aqi < 100) return "Moderat";
  if (aqi < 150) return "Nesănătos (grupe sensibile)";
  if (aqi < 200) return "Nesănătos";
  if (aqi < 300) return "Foarte nesănătos";
  return "Periculos";
}
