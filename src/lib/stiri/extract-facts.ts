/**
 * Heuristic extractor that pulls structured "key facts" from the news
 * article body + AI summary. Used by the interactive panel on the news
 * detail page (StireFacts) to render animated stat cards.
 *
 * Patterns are tuned for Romanian; misses gracefully and returns at most
 * the configured cap.
 */

export interface ExtractedFact {
  emoji: string;
  value: number;
  formattedValue: string;
  /** Singular/plural noun ("țări", "experți", ...) or label */
  label: string;
  /** Original snippet for context/highlight (~80 chars) */
  context?: string;
}

export interface ExtractedDateRange {
  startISO: string;
  endISO: string;
  /** Human-readable label, e.g. "4–17 mai 2026" */
  label: string;
  /** Days between today and start (negative if past, 0 if today, positive if future) */
  daysUntilStart: number;
  /** Total number of days in the event */
  durationDays: number;
}

// Romanian plural noun grammar inserts "de" between a number and most nouns
// when the count is >= 20 (or 0–19 for some): "26 de țări", "92 de experți",
// "800 de experiențe". The optional `(?:de\s+)?` group catches both forms.
const NUMERIC_PATTERNS: { regex: RegExp; emoji: string }[] = [
  { regex: /\b(\d+(?:[.,]\d+)?)\s+(?:de\s+)?(țări|state)\b/gi, emoji: "🌍" },
  { regex: /\b(\d+(?:[.,]\d+)?)\s+(?:de\s+)?(experți|specialiști|invitați|profesori|jurnaliști)\b/gi, emoji: "👥" },
  { regex: /\b(\d+(?:[.,]\d+)?)\s+(?:de\s+)?(experiențe|workshop-uri|sesiuni|evenimente|activități|ateliere|conferințe)\b/gi, emoji: "✨" },
  { regex: /\b(\d+(?:[.,]\d+)?)\s+(?:de\s+)?(stații|secții|locuri|centre|spitale|școli|sedii)\b/gi, emoji: "📍" },
  { regex: /\b(\d+(?:[.,]\d+)?)\s+(?:de\s+)?(persoane|cetățeni|români|locuitori|vizitatori|participanți|spectatori)\b/gi, emoji: "👤" },
  { regex: /\b(\d+(?:[.,]\d+)?)\s*(?:de\s+)?(milioane?\s+(?:lei|euro|€))/gi, emoji: "💰" },
  { regex: /\b(\d+(?:[.,]\d+)?)\s*(km|kilometri)\b/gi, emoji: "📏" },
  { regex: /\b(\d+(?:[.,]\d+)?)\s*%/g, emoji: "📊" },
  { regex: /\b(\d+(?:[.,]\d+)?)\s+(?:de\s+)?(ani|luni|săptămâni|zile|ore)\b/gi, emoji: "⏱️" },
  { regex: /\bpeste\s+(\d+(?:[.,]\d+)?)/gi, emoji: "📈" },
];

const RO_MONTHS = [
  "ianuarie", "februarie", "martie", "aprilie", "mai", "iunie",
  "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie",
];

function monthIndex(name: string): number {
  return RO_MONTHS.indexOf(name.toLowerCase());
}

function shortMonth(idx: number): string {
  return RO_MONTHS[idx]?.slice(0, 3) ?? "";
}

function parseNumber(s: string): number {
  return Number(s.replace(/\./g, "").replace(",", "."));
}

function snippet(text: string, index: number, len = 80): string {
  const start = Math.max(0, index - 20);
  const end = Math.min(text.length, index + len);
  return text.slice(start, end).trim();
}

export function extractFacts(rawText: string, cap = 6): ExtractedFact[] {
  const seen = new Set<string>();
  const facts: ExtractedFact[] = [];

  // Track which numeric values have been claimed by a labeled pattern, so
  // the generic "peste X" catch-all doesn't double up the same number.
  const claimedValues = new Set<number>();

  for (const { regex, emoji } of NUMERIC_PATTERNS) {
    // Reset state for each pattern (regexes are shared across calls).
    regex.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = regex.exec(rawText)) !== null) {
      const valueStr = m[1];
      const label = (m[2] ?? "").trim();
      if (!valueStr) continue;
      const value = parseNumber(valueStr);
      if (!Number.isFinite(value)) continue;

      // Dedupe: same emoji + value + label
      const key = `${emoji}|${value}|${label}`;
      if (seen.has(key)) continue;

      // Skip generic "peste X" (📈) if a labeled pattern already grabbed
      // this value — the labeled card is more informative.
      if (emoji === "📈" && claimedValues.has(value)) continue;

      seen.add(key);
      if (label) claimedValues.add(value);

      facts.push({
        emoji,
        value,
        formattedValue: formatNumber(value),
        label: label || "menționate",
        context: snippet(rawText, m.index),
      });

      if (facts.length >= cap * 2) break; // Hard cap before sort
    }
    if (facts.length >= cap * 2) break;
  }

  // Sort by "newsworthiness" — prefer larger numbers first, with a small
  // boost for non-percentage / non-time labels (those are usually less
  // visually striking).
  facts.sort((a, b) => {
    const boost = (f: ExtractedFact) =>
      f.emoji === "📊" || f.emoji === "⏱️" ? 0.5 : 1;
    return b.value * boost(b) - a.value * boost(a);
  });

  return facts.slice(0, cap);
}

export function extractDateRange(rawText: string): ExtractedDateRange | null {
  // Pattern: "4 și 17 mai 2026" / "4-17 mai 2026" / "între 4 și 17 mai 2026"
  const re = new RegExp(
    `(?:între\\s+|de\\s+la\\s+)?(\\d{1,2})\\s*(?:[-–—]|și|si|la)\\s*(\\d{1,2})\\s+(${RO_MONTHS.join("|")})\\s+(\\d{4})`,
    "i",
  );
  const m = rawText.match(re);
  if (!m) return null;

  const day1 = Number(m[1]);
  const day2 = Number(m[2]);
  const month = monthIndex(m[3] ?? "");
  const year = Number(m[4]);
  if (month < 0 || !day1 || !day2 || !year) return null;

  const start = new Date(year, month, day1);
  const end = new Date(year, month, day2);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  if (end.getTime() < start.getTime()) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysUntilStart = Math.round(
    (start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
  const durationDays =
    Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  return {
    startISO: start.toISOString(),
    endISO: end.toISOString(),
    label: `${day1}–${day2} ${shortMonth(month)} ${year}`,
    daysUntilStart,
    durationDays,
  };
}

function formatNumber(n: number): string {
  if (Number.isInteger(n)) return n.toLocaleString("ro-RO");
  return n.toLocaleString("ro-RO", { maximumFractionDigits: 1 });
}
