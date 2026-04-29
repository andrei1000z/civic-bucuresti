export const SITE_NAME = "Civia";
export const SITE_TAGLINE = "Sesizări civice gratuite, cu AI";
export const SITE_DESCRIPTION =
  "Trimite o sesizare formală la primărie în 2 minute. AI-ul scrie textul, alegem autoritatea corectă, tu urmărești răspunsul. Gratuit, pentru toate cele 42 de județe.";
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
  // Evenimente disabled 2026-04-29 (user request: „renunțăm deocamdată").
  // Pentru a re-activa: uncomment + verifică Navbar/Footer/sitemap.
  // { href: "/evenimente", label: "Evenimente" },
] as const;

// "Mai mult" dropdown — secondary routes.
// `countyOnly: true` = hidden on the national/homepage dropdown; only appears
// when the user is inside a county context (prefixed with /{slug}).
// Bilete, Istoric, Administrația are county-specific (local transport, local
// mayoral history, local administration) — they make no sense without a
// county to scope them to.
// NAV_MORE — golit drastic la cererea user-ului 2026-04. Itemele
// removate (impact, autoritati, calendar-civic, cum-functioneaza,
// compara, aer, intreruperi, date publice) erau redundante:
//   - Impact e accesibil din /sesizari deja
//   - Autorități contacte se afișează automat la sesizare după ce pui
//     adresa (resolver-ul găsește autoritatea competentă)
//   - Aerul + Întreruperile sunt acum pe /harti ca tab-uri
//   - Date publice (buget/sănătate/educație/siguranță) sunt link-uri
//     interne; user-ii ajung la ele din statistici/sesizari
//
// Rămân doar item-urile pur county-specific care n-au alt loc bun:
//   - Bilete (transport public local)
//   - Istoric primari (per-județ)
export const NAV_MORE = [
  { href: "/bilete", label: "Bilete și abonamente transport", icon: "🎫", countyOnly: true },
  { href: "/istoric", label: "Istoricul primarilor", icon: "📜", countyOnly: true },
] as const;

// Date publice eliminate din nav — accesibile direct via URL sau din
// /statistici (county-scoped). Lista rămâne ca export gol pentru
// compatibilitate cu codul care le importa.
export const NAV_DATE_PUBLICE: Array<{ href: string; label: string; icon: string }> = [];

export const GHID_DROPDOWN = [
  // Ordered by urgency / usefulness: sesizări (the core action) first,
  // then emergency guides (cutremur), then rights (amendă / 544), then
  // civic-engagement (ONG / dezbatere), then practical (bilete / vară).
  { href: "/ghiduri/ghid-sesizari", label: "Cum faci o sesizare eficientă", icon: "📮" },
  { href: "/ghiduri/ghid-contestatie-amenda", label: "Cum contești o amendă", icon: "⚖️" },
  { href: "/ghiduri/ghid-legea-544", label: "Cere informații publice (Legea 544)", icon: "🔓" },
  { href: "/ghiduri/ghid-cetatean", label: "Drepturile cetățeanului", icon: "📜" },
  { href: "/ghiduri/ghid-ajutor-social", label: "Ajutoare sociale de la stat", icon: "💰" },
  { href: "/ghiduri/ghid-ong", label: "Cum înființezi un ONG", icon: "🤝" },
  { href: "/ghiduri/ghid-dezbatere-publica", label: "Dezbateri publice (Legea 52)", icon: "💬" },
  { href: "/ghiduri/ghid-cutremur", label: "Pregătire cutremur", icon: "🌍" },
  { href: "/ghiduri/ghid-vara", label: "Ghid de caniculă și vară", icon: "☀️" },
  { href: "/ghiduri/ghid-transport", label: "Transport public", icon: "🚇" },
  { href: "/ghiduri/ghid-biciclist", label: "Ghidul biciclistului", icon: "🚲" },
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
  // Amânat — portocaliu-burnt, distinct de „în lucru" (galben activ).
  // Folosit când autoritatea răspunde „vom analiza în cadrul unui proiect
  // mai amplu" — nici rezolvat, nici respins.
  amanata: "#C2410C",
};

export const STATUS_LABELS: Record<string, string> = {
  nou: "Nou",
  "in-lucru": "În lucru",
  rezolvat: "Rezolvat",
  respins: "Respins",
  amanata: "Amânat",
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
