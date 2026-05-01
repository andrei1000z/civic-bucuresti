export interface AqiLevel {
  min: number;
  max: number;
  color: string;
  bg: string;
  label: string;
  emoji: string;
}

export const AQI_LEVELS: AqiLevel[] = [
  { min: 0, max: 50, color: "#00E400", bg: "bg-green-500", label: "Bun", emoji: "🟢" },
  { min: 51, max: 100, color: "#FFFF00", bg: "bg-yellow-400", label: "Moderat", emoji: "🟡" },
  { min: 101, max: 150, color: "#FF7E00", bg: "bg-orange-500", label: "Nesănătos pt. sensibili", emoji: "🟠" },
  { min: 151, max: 200, color: "#FF0000", bg: "bg-red-500", label: "Nesănătos", emoji: "🔴" },
  { min: 201, max: 300, color: "#8F3F97", bg: "bg-purple-600", label: "Foarte nesănătos", emoji: "🟣" },
  { min: 301, max: 500, color: "#7E0023", bg: "bg-rose-900", label: "Periculos", emoji: "⚫" },
];

export function getAqiLevel(aqi: number | null): AqiLevel {
  if (aqi == null || aqi < 0) return AQI_LEVELS[0]!;
  for (const level of AQI_LEVELS) {
    if (aqi <= level.max) return level;
  }
  return AQI_LEVELS[AQI_LEVELS.length - 1]!;
}

export function getAqiColor(aqi: number | null): string {
  return getAqiLevel(aqi).color;
}

// EPA AQI breakpoint table for PM2.5 (24h avg, µg/m³). Source: EPA
// Technical Assistance Document for the Reporting of Daily Air
// Quality (2024 update). Each row maps a concentration range
// [cLow, cHigh] to an AQI range [aqiLow, aqiHigh]; we linearly
// interpolate within the row.
const PM25_BREAKPOINTS: Array<[number, number, number, number]> = [
  [0.0, 9.0, 0, 50],
  [9.1, 35.4, 51, 100],
  [35.5, 55.4, 101, 150],
  [55.5, 125.4, 151, 200],
  [125.5, 225.4, 201, 300],
  [225.5, 500, 301, 500],
];

const PM10_BREAKPOINTS: Array<[number, number, number, number]> = [
  [0, 54, 0, 50],
  [55, 154, 51, 100],
  [155, 254, 101, 150],
  [255, 354, 151, 200],
  [355, 424, 201, 300],
  [425, 604, 301, 500],
];

function aqiFromBreakpoints(
  conc: number,
  table: Array<[number, number, number, number]>,
): number {
  for (const [cLow, cHigh, aLow, aHigh] of table) {
    if (conc <= cHigh) {
      // Standard EPA piecewise linear formula.
      return Math.round(((aHigh - aLow) / (cHigh - cLow)) * (conc - cLow) + aLow);
    }
  }
  // Above the last breakpoint — clamp to the top of the worst level so
  // the color stays in the "periculos" band rather than overflowing.
  return table[table.length - 1]![3];
}

/** Convert a PM2.5 reading (µg/m³) to its EPA AQI value. */
export function aqiFromPm25(pm25: number | null): number | null {
  if (pm25 == null || isNaN(pm25) || pm25 < 0) return null;
  return aqiFromBreakpoints(pm25, PM25_BREAKPOINTS);
}

/** Convert a PM10 reading (µg/m³) to its EPA AQI value. */
export function aqiFromPm10(pm10: number | null): number | null {
  if (pm10 == null || isNaN(pm10) || pm10 < 0) return null;
  return aqiFromBreakpoints(pm10, PM10_BREAKPOINTS);
}
