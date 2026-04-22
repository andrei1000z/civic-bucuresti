// Helpers specific to the "parcare ilegală" (illegal parking) flow.
// The spec wants a legally bulletproof email, so the template, plate
// normalizer, and jurisdiction types live in one place.

export type ParkingJurisdiction = "trotuar" | "banda";

export const PARKING_JURISDICTION_OPTIONS = [
  {
    value: "trotuar" as const,
    label: "Trotuar / Trecere de pietoni / Spațiu verde",
    short: "pe trotuar",
    hint: "Ruta: Poliția Locală — sancționează staționarea pe trotuar, zebră, spațiu verde.",
  },
  {
    value: "banda" as const,
    label: "O bandă de circulație / Intersecție mare / Linie tramvai",
    short: "pe banda de circulație",
    hint: "Ruta: Brigada Rutieră (bpr@b.politiaromana.ro) — sancționează blocarea traficului și a liniei de tramvai.",
  },
] as const;

// Romanian license plate patterns — loose enough to accept both
// permanent plates (B 123 ABC) and temporary / county plates (CJ 01 ABC,
// CL 123 ABC, B 01 AAA, etc). The OCR output is noisy so we normalize
// spaces and uppercase everything before matching.
const PLATE_RE =
  /\b([A-Z]{1,2})\s*[- ]?\s*(\d{2,3})\s*[- ]?\s*([A-Z]{2,3})\b/;

export function normalizePlate(raw: string): string {
  return raw
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Pull the first plausible Romanian plate number out of noisy OCR output.
 * Returns null if nothing looks like a plate. Accepts the slightly odd
 * spacing Tesseract emits on cropped mobile photos.
 */
export function extractPlate(ocrText: string): string | null {
  const norm = normalizePlate(ocrText);
  const m = norm.match(PLATE_RE);
  if (!m) return null;
  return `${m[1]} ${m[2]} ${m[3]}`;
}

const LUNI_RO = [
  "ianuarie", "februarie", "martie", "aprilie", "mai", "iunie",
  "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie",
];

function formatRoDate(d = new Date()): string {
  return `${d.getDate()} ${LUNI_RO[d.getMonth()]} ${d.getFullYear()}`;
}

function formatRoTime(d = new Date()): string {
  return d.toTimeString().slice(0, 5);
}

export interface ParkingLegalInput {
  authorityName: string; // "Poliția Locală Sector 3" etc
  authorName: string;
  authorAddress: string;
  plate: string;
  jurisdiction: ParkingJurisdiction;
  /** Human-readable location text. Falls back to GPS if empty. */
  locatie: string;
  lat?: number | null;
  lng?: number | null;
  observedAt?: Date;
  photoCount?: number;
}

/**
 * Builds the legal email body the user specified — structured, citing
 * OUG 195/2002, demanding identification of the driver (art. 39) and a
 * registration number for the complaint. The plate is wrapped in
 * [[BOLD]]...[[/BOLD]] markers so downstream mail-client builders can
 * optionally convert them (most mailto: bodies are plain text, so the
 * markers are stripped there). Gmail HTML links could substitute <b>.
 */
export function buildParkingLegalText(input: ParkingLegalInput): string {
  const when = input.observedAt ?? new Date();
  const data = formatRoDate(when);
  const ora = formatRoTime(when);
  const jurOption = PARKING_JURISDICTION_OPTIONS.find((o) => o.value === input.jurisdiction);
  const jurisdictionText = jurOption?.short ?? "pe domeniul public";

  const locationSpec = input.locatie?.trim()
    ? input.locatie.trim()
    : input.lat != null && input.lng != null
      ? `coordonatele GPS ${input.lat.toFixed(5)}, ${input.lng.toFixed(5)}`
      : "locul semnalat în sesizare";

  const gpsLine =
    input.lat != null && input.lng != null && input.locatie?.trim()
      ? ` (coordonate GPS ${input.lat.toFixed(5)}, ${input.lng.toFixed(5)})`
      : "";

  const evidence =
    (input.photoCount ?? 0) > 0
      ? `Atașez probele fotografice nemodificate, care conțin metadatele originale.`
      : `Probele fotografice pot fi transmise la cerere.`;

  const plateMarker = `[[BOLD]]${input.plate}[[/BOLD]]`;

  return `Către ${input.authorityName},

Mă numesc ${input.authorName}, locuiesc în ${input.authorAddress} și vă semnalez o încălcare a OUG 195/2002 privind regimul circulației pe drumurile publice.

În data de ${data}, la ora ${ora}, autovehiculul cu numărul de înmatriculare ${plateMarker} staționa neregulamentar ${jurisdictionText}, la adresa ${locationSpec}${gpsLine}.

Menționez că vehiculul era părăsit de conducătorul auto — este vorba despre staționare, nu oprire.

${evidence} Solicit identificarea conducătorului auto conform art. 39 din OUG 195/2002 și sancționarea acestuia potrivit legii.

Vă rog să-mi comunicați numărul de înregistrare al prezentei sesizări, conform OG 27/2002, pentru a putea urmări progresul soluționării.

Cu stimă,
${input.authorName}
${data}`;
}

// Bolarzi / stâlpișori upsell letter — sent as a separate email to
// ASPMB (or the local administrator) citing prior reports in the area as
// proof of a systemic problem. Plain text, ready for mailto:.
export interface BolarziUpsellInput {
  authorName: string;
  authorAddress: string;
  locatie: string;
  lat?: number | null;
  lng?: number | null;
  priorReportCount: number;
  priorReportCodes: string[];
}

export function buildBolarziRequest(input: BolarziUpsellInput): string {
  const today = formatRoDate();
  const refs = input.priorReportCodes.slice(0, 10).join(", ");
  const gps =
    input.lat != null && input.lng != null
      ? ` (coordonate GPS ${input.lat.toFixed(5)}, ${input.lng.toFixed(5)})`
      : "";

  return `Către Administrația Străzilor București,

Mă numesc ${input.authorName}, locuiesc în ${input.authorAddress} și solicit, în interes public, montarea de stâlpișori de protecție (bolarzi anti-parcare) pe ${input.locatie}${gps}.

Solicitarea este motivată de recurența încălcărilor: în zona indicată au fost înregistrate deja ${input.priorReportCount} sesizări pentru parcare neregulamentară pe civia.ro, cu codurile: ${refs}. Repetiția problemei demonstrează că sancționarea individuală a conducătorilor auto nu soluționează cauza — lipsa unei bariere fizice.

Conform OUG 195/2002 și HCGMB privind siguranța pietonilor, vă solicit:

1. Analiza tehnică a zonei și identificarea soluției potrivite (stâlpișori metalici, jardiniere cu protecție, gard scurt).
2. Implementarea protecției fizice în termen de maximum 60 de zile de la data înregistrării.
3. Comunicarea unui număr de înregistrare al prezentei cereri, conform OG 27/2002, pentru urmărirea progresului.

Vă mulțumesc pentru atenția acordată.

Cu stimă,
${input.authorName}
${today}`;
}
