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

// File upload limits — single source of truth, folosite în
// /api/upload route + PhotoUploader / ParkingProofUploader compress logic.
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB
export const COMPRESS_THRESHOLD_BYTES = 1.5 * 1024 * 1024; // 1.5 MB
export const MAX_IMAGE_DIMENSION = 1920;

// QR generator service — folosit în ShareMenu pentru sesizări.
// goqr.me e gratuit, fără tracking, returnează PNG (300x300 default).
export const QR_API_BASE_URL = "https://api.qrserver.com/v1/create-qr-code/";

// Categorii pentru petiții civice — listă predefinită ca admin să nu
// inventeze 100 de categorii diferite. Folosit în /admin/petitii dropdown.
export const PETITIE_CATEGORII = [
  { value: "Mediu", label: "Mediu și natură", icon: "🌳" },
  { value: "Transport", label: "Transport public și mobilitate", icon: "🚇" },
  { value: "Sănătate", label: "Sănătate publică", icon: "🏥" },
  { value: "Educație", label: "Educație", icon: "🎓" },
  { value: "Drepturi", label: "Drepturile cetățeanului", icon: "⚖️" },
  { value: "Locuințe", label: "Locuințe și urbanism", icon: "🏘️" },
  { value: "Siguranță", label: "Siguranță publică", icon: "🛡️" },
  { value: "Justiție", label: "Justiție și anti-corupție", icon: "⚖️" },
  { value: "Cultură", label: "Cultură și patrimoniu", icon: "🎭" },
  { value: "Tehnologie", label: "Tehnologie și open data", icon: "💻" },
  { value: "Animale", label: "Drepturile animalelor", icon: "🐾" },
  { value: "Egalitate", label: "Egalitate și non-discriminare", icon: "🤝" },
  { value: "Economie", label: "Economie și taxe", icon: "💰" },
  { value: "Altele", label: "Alte cauze civice", icon: "📝" },
] as const;

// ============================================================
// NAVIGATION — main links + "Mai mult" dropdown + date publice submenu
// ============================================================
export const NAV_LINKS = [
  { href: "/sesizari", label: "Sesizări" },
  { href: "/petitii", label: "Petiții" },
  { href: "/harti", label: "Hărți" },
  { href: "/stiri", label: "Știri" },
  { href: "/ghiduri", label: "Ghiduri" },
] as const;

// „Altele" dropdown — items secundare grupate. Fiecare entry poate fi:
//   - countyOnly: true → ascuns pe homepage național, vizibil doar pe /[judet]
//   - nationalOnly: true → URL absolut (nu se prepend-ează countySlug)
//   - default: prepend countySlug dacă e în county-context
//
// Round 2026-04-29: re-introduse statistici/aer/intreruperi/calendar/impact
// /autoritati/compara/cum-functioneaza la cererea user-ului — Sesizări +
// Petiții + Hărți + Știri + Ghiduri rămân top-level, restul intră aici.
export const NAV_MORE = [
  { href: "/statistici", label: "Statistici", icon: "📊" },
  { href: "/aer", label: "Calitatea aerului", icon: "🌬️" },
  { href: "/intreruperi", label: "Întreruperi programate", icon: "⚠️" },
  { href: "/autoritati", label: "Autorități publice", icon: "🏛️", nationalOnly: true },
  { href: "/calendar-civic", label: "Calendar civic", icon: "📅", nationalOnly: true },
  { href: "/compara", label: "Compară județe", icon: "⚖️", nationalOnly: true },
  { href: "/impact", label: "Impact local", icon: "🎯" },
  { href: "/cum-functioneaza", label: "Cum funcționează administrația", icon: "❓" },
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
  "Știri de Cluj": "#A855F7",
  "Știri din România": "#475569",
};
