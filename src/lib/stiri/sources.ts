/**
 * Source-tier classification for the news aggregator.
 *
 * - /stiri (national view) shows ONLY articles from NATIONAL_SOURCES.
 * - /[judet]/stiri shows articles from NATIONAL_SOURCES *plus* the local
 *   houses mapped to that county in LOCAL_SOURCES_BY_COUNTY.
 *
 * Source names must match exactly the `source` field written by
 * `src/lib/stiri/rss.ts`.
 */

export const NATIONAL_SOURCES = [
  // Wire-service tier — mainstream daily coverage
  "Digi24",
  "Hotnews",
  "G4Media",
  "Mediafax",
  "News.ro",
  "Libertatea",
  "Adevărul",
  "Gândul",
  // Investigative + independent — higher editorial bar
  "PressOne",
  "Spotmedia",
  "Europa Liberă",
  "Recorder",
  // Business / specialist
  "Ziarul Financiar",
  // Long-tail aggregators
  "Ediția de Dimineață",
  "Știri din România",
] as const;

/**
 * Local news houses keyed by county ISO code. Only counties for which we
 * have a verified RSS feed appear here. Sources from rss.ts that are
 * regional but not yet mapped (rare) just won't show up on county pages.
 *
 * Counties without a dedicated paper still get the full national feed
 * — anything tagged with their county via detectCounties() also lands.
 */
export const LOCAL_SOURCES_BY_COUNTY: Record<string, string[]> = {
  // București + Ilfov metro share B365
  B: ["B365.ro"],
  IF: ["B365.ro"],
  // Alba
  AB: ["Alba24", "Ziarul Unirea"],
  // Arad
  AR: ["Aradon"],
  // Argeș
  AG: ["Jurnalul de Argeș"],
  // Bacău
  BC: ["Deșteptarea"],
  // Bihor
  BH: ["Bihon"],
  // Bistrița-Năsăud
  BN: ["Gazeta de Bistrița"],
  // Botoșani
  BT: ["Monitorul BT"],
  // Brăila
  BR: ["Obiectiv BR"],
  // Brașov
  BV: ["BizBrașov"],
  // Buzău
  BZ: ["Opinia Buzău"],
  // Cluj
  CJ: ["Monitorul CJ", "Știri de Cluj", "Actual de Cluj"],
  // Constanța
  CT: ["Telegraf", "Ziua de Constanța"],
  // Dolj
  DJ: ["Gazeta de Sud"],
  // Hunedoara
  HD: ["Replica HD"],
  // Iași
  IS: ["Ziarul de Iași", "BZI", "7Iași"],
  // Maramureș
  MM: ["eMaramureș"],
  // Mureș
  MS: ["Zi de Zi"],
  // Neamț
  NT: ["Monitorul NT"],
  // Prahova
  PH: ["Observatorul PH"],
  // Satu Mare
  SM: ["Gazeta Nord-Vest"],
  // Sibiu
  SB: ["Turnul Sfatului", "Tribuna"],
  // Suceava
  SV: ["Monitorul SV", "News Bucovina"],
  // Timiș
  TM: ["Opinia Timișoarei", "PressAlert", "TION"],
  // Vrancea
  VN: ["Monitorul VN"],
};

/**
 * Returns the list of source names allowed in a given view.
 *
 * - county undefined  → national view (5–7 national sources)
 * - county set        → national + locals for that county
 */
export function allowedSourcesForView(countyId?: string | null): string[] {
  const national = [...NATIONAL_SOURCES];
  if (!countyId) return national;
  const locals = LOCAL_SOURCES_BY_COUNTY[countyId.toUpperCase()] ?? [];
  return [...national, ...locals];
}
