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
  "Digi24",
  "Hotnews",
  "G4Media",
  "Mediafax",
  "News.ro",
  "Ediția de Dimineață",
  "Știri din România",
] as const;

/**
 * Local news houses keyed by county ISO code. Only counties for which we
 * have a verified RSS feed appear here. Sources from rss.ts that are
 * regional but not yet mapped (rare) just won't show up on county pages.
 */
export const LOCAL_SOURCES_BY_COUNTY: Record<string, string[]> = {
  // București + Ilfov (Bucharest metro reads B365 either way)
  B: ["B365.ro"],
  IF: ["B365.ro"],
  // Cluj
  CJ: ["Monitorul CJ", "Știri de Cluj"],
  // Iași
  IS: ["Ziarul de Iași"],
  // Timiș
  TM: ["Opinia Timișoarei"],
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
