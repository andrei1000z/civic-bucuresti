/**
 * Post-processor for AI-generated synthesis output (sinteza Civia).
 *
 * Catches the kinds of mistakes Groq's Romanian output reliably makes
 * even with a strict prompt:
 *   - paragraphs / bullets that start lowercase
 *   - stray trailing whitespace, multiple blank lines
 *   - section titles missing the trailing colon (`Pe scurt` → `Pe scurt:`)
 *   - dangling `**` markers from a truncated bold span
 *   - "etc." / inline ellipsis spacing weirdness
 *
 * The component that renders the output (`AiSummary`) parses bullets +
 * bold via regex and is sensitive to leading whitespace, so we keep
 * the structure 1:1 with the LLM's output and only edit characters in
 * place.
 *
 * The function is pure, testable, and SAFE to run twice (idempotent).
 */

const SECTION_TITLES_NEED_COLON = [
  "Pe scurt",
  "Ce cere petiția",
  "De ce contează",
  "Cifre cheie",
  "Context",
  "Ce urmează",
  "Programul",
  "Detalii",
] as const;

// `\b` is ASCII-only in JS regex without the `u` flag, which means
// titles ending in a Romanian diacritic (e.g. „contează") wouldn't
// match. We anchor the alternation to a fixed list of known titles
// so the literal match itself is precise enough — no `\b` needed.
const SECTION_TITLE_REGEX = new RegExp(
  `^(${SECTION_TITLES_NEED_COLON.map((t) =>
    t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  ).join("|")})\\s*[:\\.]*\\s*$`,
  "i",
);

/**
 * Capitalize the first character that is a Unicode letter, leaving any
 * leading punctuation / emoji / whitespace alone. Romanian-aware via
 * String#toLocaleUpperCase("ro-RO") so „șărac" → „Șărac" (with the
 * comma below — not the cedilla above).
 */
function capitalizeFirstLetter(s: string): string {
  // Match the first run of optional non-letter junk (whitespace, **, „, etc.)
  // followed by the first actual letter. Use a Unicode property class.
  // No `s` (dotAll) flag — we operate on single lines only, so `.` never
  // needs to match newlines. Avoiding it keeps tsconfig target compatible
  // (the flag requires ES2018+, the project targets ES2017).
  const m = s.match(/^([^\p{L}]*)(\p{L})(.*)$/u);
  if (!m) return s;
  const [, prefix, first, rest] = m;
  return `${prefix}${first!.toLocaleUpperCase("ro-RO")}${rest}`;
}

/** Strip a single dangling `**` at the very end of a line. */
function fixDanglingBold(line: string): string {
  // Count opening vs closing `**` — if odd count, a span is dangling.
  // We then drop the LAST stray marker since the LLM tends to emit it
  // at the right edge of a clipped bullet.
  const matches = line.match(/\*\*/g);
  if (!matches) return line;
  if (matches.length % 2 === 0) return line;
  // Strip the last occurrence
  const lastIdx = line.lastIndexOf("**");
  if (lastIdx === -1) return line;
  return line.slice(0, lastIdx) + line.slice(lastIdx + 2);
}

/** Normalize a section-header line so it ends with a single `:`. */
function normalizeSectionTitle(line: string): string {
  if (!SECTION_TITLE_REGEX.test(line)) return line;
  return line.replace(/\s*[:.]*\s*$/, ":");
}

/**
 * Apply all fixes to a single non-empty line. Bullet markers (`-`, `*`)
 * and bold wrappers (`**foo**`) are preserved.
 */
export function polishSynthesisLine(rawLine: string): string {
  const line = rawLine.replace(/[\t ]+/g, " ").replace(/ +$/g, "");
  if (!line.trim()) return "";

  const bulletMatch = line.match(/^([-*])\s+(.*)$/);
  if (bulletMatch) {
    const marker = bulletMatch[1] ?? "-";
    const rest = bulletMatch[2] ?? "";
    let fixed = fixDanglingBold(capitalizeFirstLetter(rest))
      .trimEnd()
      .replace(/\s+([.,;:!?])/g, "$1");
    fixed = fixed.replace(/([,;])(\p{L})/gu, "$1 $2");
    fixed = fixed.replace(/([.!?])(\p{Lu})/gu, "$1 $2");
    return `${marker} ${fixed}`;
  }

  // Whole-line bold heading — preserve the `**…**` wrapper while
  // capitalizing the inner text.
  const wholeBold = line.match(/^\*\*\s*(.+?)\s*\*\*\s*:?\s*$/);
  if (wholeBold && wholeBold[1]) {
    const inner = capitalizeFirstLetter(wholeBold[1]);
    return `**${inner}**`;
  }

  let fixed = capitalizeFirstLetter(line);
  fixed = fixDanglingBold(fixed).trimEnd();
  fixed = normalizeSectionTitle(fixed);
  // Tighten whitespace before punctuation: Groq sometimes emits
  // "12 , dintre care …" or "Pe scurt :".
  fixed = fixed.replace(/\s+([.,;:!?])/g, "$1");
  // …and ensure a trailing space after a sentence-ending punctuation
  // when the next character is a letter (Groq sometimes renders the
  // input as ",nicio" after we collapsed " ," → ","). We don't add a
  // space after ":" when it's at end-of-line (used for section
  // headers).
  fixed = fixed.replace(/([,;])(\p{L})/gu, "$1 $2");
  fixed = fixed.replace(/([.!?])(\p{Lu})/gu, "$1 $2");
  return fixed;
}

/**
 * Run the full polish pass on a multi-line synthesis string. Drops
 * runs of more than one consecutive empty line (the renderer treats
 * them as paragraph breaks; doubles add ugly gaps).
 */
export function polishSynthesis(raw: string): string {
  if (!raw) return raw;
  const lines = raw.replace(/\r\n?/g, "\n").split("\n");
  const out: string[] = [];
  let lastWasBlank = false;

  for (const rawLine of lines) {
    const polished = polishSynthesisLine(rawLine);
    const isBlank = polished.trim() === "";
    if (isBlank) {
      if (lastWasBlank) continue;
      out.push("");
      lastWasBlank = true;
    } else {
      out.push(polished);
      lastWasBlank = false;
    }
  }

  // Drop leading + trailing blank lines.
  while (out.length && out[0]!.trim() === "") out.shift();
  while (out.length && out[out.length - 1]!.trim() === "") out.pop();

  return out.join("\n");
}
