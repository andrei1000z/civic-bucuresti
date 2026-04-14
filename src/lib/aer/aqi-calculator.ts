import type { AqiBreakpoint } from "./types";

/**
 * US EPA AQI breakpoints for PM2.5 (24-hour average, µg/m³)
 */
const PM25_BREAKPOINTS: AqiBreakpoint[] = [
  { cLow: 0.0, cHigh: 12.0, aqiLow: 0, aqiHigh: 50 },
  { cLow: 12.1, cHigh: 35.4, aqiLow: 51, aqiHigh: 100 },
  { cLow: 35.5, cHigh: 55.4, aqiLow: 101, aqiHigh: 150 },
  { cLow: 55.5, cHigh: 150.4, aqiLow: 151, aqiHigh: 200 },
  { cLow: 150.5, cHigh: 250.4, aqiLow: 201, aqiHigh: 300 },
  { cLow: 250.5, cHigh: 500.4, aqiLow: 301, aqiHigh: 500 },
];

/**
 * US EPA AQI breakpoints for PM10 (24-hour average, µg/m³)
 */
const PM10_BREAKPOINTS: AqiBreakpoint[] = [
  { cLow: 0, cHigh: 54, aqiLow: 0, aqiHigh: 50 },
  { cLow: 55, cHigh: 154, aqiLow: 51, aqiHigh: 100 },
  { cLow: 155, cHigh: 254, aqiLow: 101, aqiHigh: 150 },
  { cLow: 255, cHigh: 354, aqiLow: 151, aqiHigh: 200 },
  { cLow: 355, cHigh: 424, aqiLow: 201, aqiHigh: 300 },
  { cLow: 425, cHigh: 604, aqiLow: 301, aqiHigh: 500 },
];

function interpolateAqi(concentration: number, breakpoints: AqiBreakpoint[]): number {
  const first = breakpoints[0];
  const last = breakpoints[breakpoints.length - 1];
  if (!first || !last) return 0;
  // Clamp to min/max
  if (concentration <= first.cLow) return 0;
  if (concentration >= last.cHigh) return 500;

  for (const bp of breakpoints) {
    if (concentration >= bp.cLow && concentration <= bp.cHigh) {
      return Math.round(
        ((bp.aqiHigh - bp.aqiLow) / (bp.cHigh - bp.cLow)) * (concentration - bp.cLow) + bp.aqiLow
      );
    }
  }
  return 0;
}

/**
 * Calculate AQI from PM2.5 concentration (µg/m³)
 */
export function aqiFromPm25(pm25: number): number {
  return interpolateAqi(pm25, PM25_BREAKPOINTS);
}

/**
 * Calculate AQI from PM10 concentration (µg/m³)
 */
export function aqiFromPm10(pm10: number): number {
  return interpolateAqi(pm10, PM10_BREAKPOINTS);
}

/**
 * Calculate overall AQI from available pollutant values.
 * Returns the MAXIMUM AQI across all available pollutants.
 */
export function calculateAqi(params: {
  pm25?: number | null;
  pm10?: number | null;
}): number | null {
  const values: number[] = [];
  if (params.pm25 != null && params.pm25 >= 0) values.push(aqiFromPm25(params.pm25));
  if (params.pm10 != null && params.pm10 >= 0) values.push(aqiFromPm10(params.pm10));
  if (values.length === 0) return null;
  return Math.max(...values);
}
