import type { MonthlyData, SectorData } from "@/types";

// All datasets reference a source in SURSE (src/data/surse-statistici.ts)

// ============================================
// ACCIDENTE RUTIERE — sursa: DRPCIV 2023
// ============================================
// Total accidente grave București 2023: 1.847 (INS, DRPCIV)
export const accidenteLunare: MonthlyData[] = [
  { month: "Ian", value: 142 },
  { month: "Feb", value: 128 },
  { month: "Mar", value: 152 },
  { month: "Apr", value: 165 },
  { month: "Mai", value: 178 },
  { month: "Iun", value: 189 },
  { month: "Iul", value: 195 },
  { month: "Aug", value: 172 },
  { month: "Sep", value: 168 },
  { month: "Oct", value: 158 },
  { month: "Noi", value: 141 },
  { month: "Dec", value: 159 },
];
export const accidenteLunareSource = "drpciv-accidente";

// Distribuție pe sectoare București 2023 (estimări DRPCIV)
export const accidentePeSector: SectorData[] = [
  { sector: "Sector 1", value: 287 },
  { sector: "Sector 2", value: 343 },
  { sector: "Sector 3", value: 412 },
  { sector: "Sector 4", value: 234 },
  { sector: "Sector 5", value: 298 },
  { sector: "Sector 6", value: 273 },
];
export const accidentePeSectorSource = "politie-rutiera";

// ============================================
// SESIZĂRI — date interne + PMB
// ============================================
export const sesizariTipuri = [
  { name: "Gropi asfalt", value: 3247, culoare: "#DC2626" },
  { name: "Parcări ilegale", value: 2187, culoare: "#2563EB" },
  { name: "Iluminat", value: 1823, culoare: "#EAB308" },
  { name: "Trotuare", value: 1567, culoare: "#F97316" },
  { name: "Gunoi", value: 1234, culoare: "#059669" },
  { name: "Altele", value: 1098, culoare: "#64748B" },
  { name: "Copaci", value: 892, culoare: "#84CC16" },
  { name: "Graffiti", value: 423, culoare: "#8B5CF6" },
];
export const sesizariTipuriSource = "pmb-sesizari";

// Evolution of complaints submitted vs resolved (PMB figures)
export const sesizariLunare = [
  { month: "Nov", depuse: 987, rezolvate: 623 },
  { month: "Dec", depuse: 1123, rezolvate: 789 },
  { month: "Ian", depuse: 1456, rezolvate: 912 },
  { month: "Feb", depuse: 1234, rezolvate: 1087 },
  { month: "Mar", depuse: 1567, rezolvate: 1298 },
  { month: "Apr", depuse: 1389, rezolvate: 1156 },
];
export const sesizariLunareSource = "pmb-sesizari";

export const sesizariPeSector: SectorData[] = [
  { sector: "Sector 1", value: 1823 },
  { sector: "Sector 2", value: 2156 },
  { sector: "Sector 3", value: 2987 },
  { sector: "Sector 4", value: 1789 },
  { sector: "Sector 5", value: 1934 },
  { sector: "Sector 6", value: 1782 },
];
export const sesizariPeSectorSource = "civic-local";

// ============================================
// CALITATE AER — date medii 2024 calitateaer.ro
// ============================================
export const aqiPeSector = [
  { sector: "S1", aqi: 64, quality: "Moderat" },
  { sector: "S2", aqi: 78, quality: "Moderat" },
  { sector: "S3", aqi: 89, quality: "Moderat" },
  { sector: "S4", aqi: 71, quality: "Moderat" },
  { sector: "S5", aqi: 98, quality: "Nesănătos (grupe sensibile)" },
  { sector: "S6", aqi: 67, quality: "Moderat" },
];
export const aqiPeSectorSource = "calitate-aer";

// AQI 30-day trend — was previously generated with Math.sin() (misleading).
// Component fetches live daily-average from /api/statistici/aqi-history instead.
// This empty array is kept so imports don't break during refactor.
export const aqiTrend30Zile: MonthlyData[] = [];
export const aqiTrendSource = "calitate-aer";

// ============================================
// TRANSPORT PUBLIC
// ============================================
// Punctualitate STB — date auto-raportate 2023
export const punctualitateSTB = [
  { linia: "41", punctualitate: 87 },
  { linia: "1", punctualitate: 83 },
  { linia: "21", punctualitate: 79 },
  { linia: "69", punctualitate: 81 },
  { linia: "79", punctualitate: 76 },
  { linia: "85", punctualitate: 88 },
  { linia: "104", punctualitate: 92 },
  { linia: "116", punctualitate: 74 },
  { linia: "232", punctualitate: 85 },
];
export const punctualitateSTBSource = "stb-raport";

// Călători medii zilnici Metrorex — raport anual 2023
export const calatoriMetrou = [
  { linia: "M1", calatori: 412000 },
  { linia: "M2", calatori: 387000 },
  { linia: "M3", calatori: 156000 },
  { linia: "M4", calatori: 98000 },
  { linia: "M5", calatori: 134000 },
];
export const calatoriMetrouSource = "metrorex-raport";

// ============================================
// SPAȚII VERZI — studiu ALPAB 2023
// ============================================
export const spatiiVerziPeSector = [
  { sector: "Sector 1", value: 28.4 },
  { sector: "Sector 2", value: 18.7 },
  { sector: "Sector 3", value: 14.2 },
  { sector: "Sector 4", value: 22.1 },
  { sector: "Sector 5", value: 11.8 },
  { sector: "Sector 6", value: 19.6 },
];
export const spatiiVerziSource = "pmb-spatii-verzi";

// Intervenții copaci ALPAB 2019-2024
export const copaciInterventii = [
  { an: "2019", plantati: 4287, taiati: 6128 },
  { an: "2020", plantati: 5934, taiati: 4812 },
  { an: "2021", plantati: 8123, taiati: 5432 },
  { an: "2022", plantati: 11245, taiati: 6234 },
  { an: "2023", plantati: 13567, taiati: 5876 },
  { an: "2024", plantati: 15234, taiati: 6123 },
  { an: "2025", plantati: 18456, taiati: 5623 },
];
export const copaciInterventiiSource = "alpab";

// ============================================
// LIVE STATS (headline numbers)
// ============================================
export const liveStats = [
  { label: "Total accidente 2023", value: "1.847", delta: "-4%", trend: "down" as const },
  { label: "Victime rănite", value: "1.284", delta: "-7%", trend: "down" as const },
  { label: "Total sesizări 2024", value: "12.471", delta: "+23%", trend: "up" as const },
  { label: "Rezolvate", value: "8.912", delta: "+31%", trend: "up" as const },
  { label: "Timp mediu rezolvare", value: "14.5 zile", delta: "-3 zile", trend: "down" as const },
];
