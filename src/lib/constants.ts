export const SITE_NAME = "Civia";
export const SITE_TAGLINE = "Platforma civică a României";
export const SITE_DESCRIPTION =
  "Sesizări, calitatea aerului, hărți și ghiduri civice pentru orașul tău — într-un singur loc.";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://civia.ro";

// Romania geographic center + bounds
export const ROMANIA_CENTER: [number, number] = [45.9432, 24.9668];
export const ROMANIA_BOUNDS: [[number, number], [number, number]] = [
  [43.5, 20.2],
  [48.3, 30.0],
];

// București geographic center (fallback for București-specific features)
export const BUCHAREST_CENTER: [number, number] = [44.4268, 26.1025];
export const BUCHAREST_BOUNDS: [[number, number], [number, number]] = [
  [44.33, 25.97],
  [44.55, 26.25],
];

// ============================================================
// NAVIGATION — main links + "Mai mult" dropdown + date publice submenu
// ============================================================
export const NAV_LINKS = [
  { href: "/sesizari", label: "Sesizări" },
  { href: "/harti", label: "Hărți" },
  { href: "/statistici", label: "Statistici" },
  { href: "/stiri", label: "Știri" },
  { href: "/ghiduri", label: "Ghiduri" },
  { href: "/evenimente", label: "Evenimente" },
] as const;

// "Mai mult" dropdown — secondary routes including new P2/P3 highlights
export const NAV_MORE = [
  { href: "/impact", label: "Impact Civia", icon: "📊" },
  { href: "/calendar-civic", label: "Calendar civic", icon: "📅" },
  { href: "/aer", label: "Calitate aer", icon: "🌬️" },
  { href: "/bilete", label: "Bilete & Abonamente", icon: "🎫" },
  { href: "/istoric", label: "Istoric", icon: "📜" },
  { href: "/cum-functioneaza", label: "Administrația", icon: "🏛️" },
  { href: "/compara", label: "Compară județe", icon: "⚖️" },
] as const;

// Date publice — separate submenu for transparency dashboards
export const NAV_DATE_PUBLICE = [
  { href: "/buget", label: "Buget național", icon: "💰" },
  { href: "/siguranta", label: "Siguranță", icon: "🛡️" },
  { href: "/educatie", label: "Educație", icon: "🎓" },
  { href: "/sanatate", label: "Sănătate", icon: "❤️" },
] as const;

export const GHID_DROPDOWN = [
  { href: "/ghiduri/ghid-cetatean", label: "Drepturile cetățeanului", icon: "⚖️" },
  { href: "/ghiduri/ghid-sesizari", label: "Ghid sesizări", icon: "📮" },
  { href: "/ghiduri/ghid-legea-544", label: "Legea 544/2001", icon: "🔓" },
  { href: "/ghiduri/ghid-contestatie-amenda", label: "Contestare amendă", icon: "⚖️" },
  { href: "/ghiduri/ghid-ong", label: "Cum înființezi ONG", icon: "🤝" },
  { href: "/ghiduri/ghid-ajutor-social", label: "Ajutoare sociale", icon: "💰" },
  { href: "/ghiduri/ghid-dezbatere-publica", label: "Dezbatere publică", icon: "💬" },
  { href: "/ghiduri/ghid-biciclist", label: "Ghidul biciclistului", icon: "🚲" },
  { href: "/ghiduri/ghid-vara", label: "Ghid de vară", icon: "☀️" },
  { href: "/ghiduri/ghid-cutremur", label: "Ghid cutremur", icon: "🌍" },
  { href: "/ghiduri/ghid-transport", label: "Ghid transport", icon: "🚇" },
] as const;

// ============================================================
// SESIZARE TYPES + SECTORS (sectors = București only)
// ============================================================
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

// Sectoare — doar pentru municipiul București
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
  "Digi24": "#DC2626",
  "Hotnews": "#EAB308",
  "G4Media": "#1F2937",
  "Mediafax": "#0369A1",
  "News.ro": "#059669",
  "B365.ro": "#10B981",
  "Monitorul CJ": "#7C3AED",
  "Ziarul de Iași": "#6366F1",
  "Opinia Timișoarei": "#EC4899",
  "Știri Suceava": "#14B8A6",
  "Ediția de Dimineață": "#F59E0B",
  "Gazeta BT": "#8B5CF6",
};
