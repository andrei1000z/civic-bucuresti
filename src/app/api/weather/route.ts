import { NextResponse } from "next/server";

export const revalidate = 600; // 10 minutes (ISR caching)

/**
 * Fetch current weather for Bucharest from Open-Meteo (free, no API key).
 * Returns temperature, apparent temperature, humidity, wind, weather code.
 */
export async function GET() {
  try {
    const url =
      "https://api.open-meteo.com/v1/forecast?latitude=44.43&longitude=26.10&" +
      "current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code&" +
      "timezone=Europe%2FBucharest";

    const res = await fetch(url, { next: { revalidate: 600 } });
    if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
    const json = await res.json();

    const c = json.current ?? {};
    return NextResponse.json(
      {
        data: {
          temp: Math.round(c.temperature_2m ?? 0),
          feels_like: Math.round(c.apparent_temperature ?? 0),
          humidity: c.relative_humidity_2m ?? null,
          wind: c.wind_speed_10m ?? null,
          code: c.weather_code ?? null,
          updated_at: new Date().toISOString(),
          source: "open-meteo.com",
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=600, stale-while-revalidate=300",
        },
      }
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "weather unavailable";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
