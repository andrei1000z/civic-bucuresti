export const SITE_NAME = "Civia";
export const SITE_TAGLINE = "Platforma civică a României";
export const SITE_DESCRIPTION =
  "Sesizări, hărți, ghiduri și statistici despre orașul tău — într-un singur loc. Funcționează în toată România.";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://civia.ro";

// Romania geographic center
export const ROMANIA_CENTER: [number, number] = [45.9432, 24.9668];
export const ROMANIA_BOUNDS: [[number, number], [number, number]] = [
  [43.5, 20.2],
  [48.3, 30.0],
];

// Bucharest geographic center (used for default map view)
export const BUCHAREST_CENTER: [number, number] = [44.4268, 26.1025];
export const BUCHAREST_BOUNDS: [[number, number], [number, number]] = [
  [44.33, 25.97],
  [44.55, 26.25],
];

export const NAV_LINKS = [
  { href: "/harti", label: "Hărți" },
  { href: "/bilete", label: "Bilete" },
  { href: "/sesizari", label: "Sesizări" },
  { href: "/statistici", label: "Statistici" },
  { href: "/ghiduri", label: "Ghiduri" },
  { href: "/stiri", label: "Știri" },
  { href: "/evenimente", label: "Evenimente" },
  { href: "/istoric", label: "Istoric" },
  { href: "/cum-functioneaza", label: "Despre PMB" },
] as const;

export const GHID_DROPDOWN = [
  { href: "/ghiduri/ghid-cetatean", label: "Drepturile cetățeanului", icon: "⚖️" },
  { href: "/ghiduri/ghid-sesizari", label: "Ghid sesizări", icon: "📮" },
  { href: "/ghiduri/ghid-biciclist", label: "Ghidul biciclistului", icon: "🚲" },
  { href: "/ghiduri/ghid-vara", label: "Ghid de vară", icon: "☀️" },
  { href: "/ghiduri/ghid-cutremur", label: "Ghid cutremur", icon: "🌍" },
  { href: "/ghiduri/ghid-transport", label: "Ghid transport", icon: "🚇" },
] as const;

export const SESIZARE_TIPURI = [
  { value: "groapa", label: "Groapă în asfalt", icon: "🕳️" },
  { value: "trotuar", label: "Trotuar degradat", icon: "🧱" },
  { value: "iluminat", label: "Iluminat public defect", icon: "💡" },
  { value: "copac", label: "Copac căzut/periculos", icon: "🌳" },
  { value: "gunoi", label: "Gunoi necolectat", icon: "🗑️" },
  { value: "parcare", label: "Parcare ilegală", icon: "🚗" },
  { value: "stalpisori", label: "Montare stâlpișori anti-parcare", icon: "🪧" },
  { value: "canalizare", label: "Canalizare/inundație", icon: "💧" },
  { value: "semafor", label: "Semafor/semnalizare defect", icon: "🚦" },
  { value: "pietonal", label: "Traversare pietoni periculoasă", icon: "🚸" },
  { value: "graffiti", label: "Graffiti/vandalism", icon: "🎨" },
  { value: "mobilier", label: "Mobilier stradal stricat", icon: "🪑" },
  { value: "zgomot", label: "Zgomot excesiv/deranj", icon: "🔊" },
  { value: "animale", label: "Câini periculoși/animale", icon: "🐕" },
  { value: "transport", label: "Problemă transport public", icon: "🚌" },
  { value: "altele", label: "Altele", icon: "📝" },
] as const;

export const SECTOARE = [
  { id: "S1", label: "Sector 1" },
  { id: "S2", label: "Sector 2" },
  { id: "S3", label: "Sector 3" },
  { id: "S4", label: "Sector 4" },
  { id: "S5", label: "Sector 5" },
  { id: "S6", label: "Sector 6" },
] as const;

export const METRO_COLORS: Record<string, string> = {
  M1: "#F7941D",
  M2: "#005CA9",
  M3: "#E4022E",
  M4: "#00A650",
  M5: "#663399",
};

export const STATUS_COLORS: Record<string, string> = {
  nou: "#DC2626",
  "in-lucru": "#F59E0B",
  rezolvat: "#059669",
  respins: "#6B7280",
};

export const STATUS_LABELS: Record<string, string> = {
  nou: "Nou",
  "in-lucru": "În lucru",
  rezolvat: "Rezolvat",
  respins: "Respins",
};

export const SOURCE_COLORS: Record<string, string> = {
  "Buletin de București": "#2563EB",
  "B365.ro": "#059669",
  "Hotnews București": "#EAB308",
  "Digi24": "#DC2626",
  "Euronews România": "#8B5CF6",
  "G4Media": "#1F2937",
};

export const EMAIL_AUTORITATI = [
  "sesizari@pmb.ro",
  "dispecerat@pmb.ro",
  "prefectura@prefecturabucu.ro",
];

// Use getAuthoritiesFor(tip, sector) from @/lib/sesizari/authorities — this map has been replaced
