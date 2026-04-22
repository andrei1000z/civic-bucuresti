import { NextResponse } from "next/server";
import { rateLimitAsync, getClientIp } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

/**
 * GET /api/statistici/aqi?lat=44.43&lng=26.10
 * Fetch live AQI from OpenAQ for the nearest city to given coordinates.
 * Defaults to București if no coords provided.
 */
export async function GET(req: Request) {
  const rl = await rateLimitAsync(`statistici-aqi:${getClientIp(req)}`, { limit: 60, windowMs: 60_000 });
  if (!rl.success) return NextResponse.json({ error: "Prea multe cereri" }, { status: 429 });

  const { searchParams } = new URL(req.url);
  const lat = Number(searchParams.get("lat") || "44.43");
  const lng = Number(searchParams.get("lng") || "26.10");

  try {
    // OpenAQ v2 — search by coordinates with radius 50km
    const res = await fetch(
      `https://api.openaq.org/v2/latest?coordinates=${lat},${lng}&radius=50000&limit=30`,
      { next: { revalidate: 1800 } }
    );
    if (res.ok) {
      const json = await res.json();
      interface Measurement { parameter: string; value: number; unit: string; }
      interface Result { measurements?: Measurement[]; }
      const results: Result[] = json?.results ?? [];
      const pm25Values = results
        .flatMap((r) => r.measurements ?? [])
        .filter((m) => m.parameter === "pm25" && typeof m.value === "number" && m.value > 0 && m.value < 500)
        .map((m) => m.value);

      if (pm25Values.length > 0) {
        const avgPm25 = pm25Values.reduce((a, b) => a + b, 0) / pm25Values.length;
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
    // fall through
  }

  // No live data available
  return NextResponse.json({
    data: {
      aqi: null,
      pm25: null,
      source: "indisponibil",
      quality: "Date indisponibile",
      stations: 0,
    },
  });
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
  if (aqi <= 150) return "Nesănătos (grupe sensibile)";
  if (aqi <= 200) return "Nesănătos";
  return "Periculos";
}
