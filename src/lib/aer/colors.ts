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
