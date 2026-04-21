// Scrubber for PUBLIC display of a sesizare's formal_text.
// Outgoing emails keep the real name + address (authorities need them for
// legal identification). But the website version must hide the home
// address always, and the author's name when hide_name is enabled.

export interface ScrubOptions {
  authorName: string | null;
  hideName: boolean;
}

const ADDRESS_REDACTED = "[adresă ascunsă]";
const NAME_REDACTED = "Cetățean anonim";

/**
 * Strips the home address (and optionally the author's name) from an
 * AI-generated or templated formal letter. Matches both openers we've
 * used:
 *   1. "Mă numesc {NAME}, locuiesc în {ADDRESS} și doresc..."  (new)
 *   2. "Subsemnatul(a) {NAME}, domiciliat(ă) în {ADDRESS}, ..."  (legacy)
 * Also redacts the signature line when hiding the name.
 */
export function scrubFormalTextForPublic(text: string, opts: ScrubOptions): string {
  if (!text) return text;
  let out = text;

  const nameRedacted = opts.hideName ? NAME_REDACTED : (opts.authorName?.trim() || "Cetățean");

  // 1. New opener: "Mă numesc X, locuiesc pe/în {ADDRESS} {tail}"
  // Match greedily up to the next separator that starts the next clause
  // ("și doresc", ".", "\n"). We replace the whole identity line to keep
  // the grammar clean.
  out = out.replace(
    /M[ăa]\s+numesc\s+([^,\n]+),\s*locuiesc\s+(?:pe|în)\s+([^\n]*?)(\s+(?:și|si)\s+doresc[^\n]*|\.$|(?=\n))/gim,
    (_m, _name: string, _addr: string, tail: string) => {
      const cleanTail = tail.trim();
      const suffix = cleanTail && cleanTail !== "."
        ? ` ${cleanTail}`
        : ` și doresc să vă aduc la cunoștință o problemă care necesită intervenția dumneavoastră.`;
      return `Mă numesc ${nameRedacted}, locuiesc în ${ADDRESS_REDACTED}${suffix}`;
    },
  );

  // 2. Legacy opener: "Subsemnatul X, domiciliat în Y, ..."
  out = out.replace(
    /Subsemnat(?:ul|a|ul\(a\)|a\/Subsemnatul)?\s+([^,\n]+),\s*domiciliat(?:\(?ă\)?|ă)?\s+(?:pe|în)\s+([^,\n]+)(,\s*[^\n]*)?/gim,
    (_m, _name: string, _addr: string, tail: string | undefined) => {
      return `Subsemnat(ul/a) ${nameRedacted}, domiciliat(ă) în ${ADDRESS_REDACTED}${tail ?? ""}`;
    },
  );

  // 3. Signature block (always uses the name). If hiding, redact it.
  if (opts.hideName) {
    out = out.replace(
      /(Cu\s+(?:respect|stim[ăa]),?\s*\n)[^\n]+/i,
      `$1${NAME_REDACTED}`,
    );
  }

  // 4. Any leftover literal occurrences of the real name mid-text —
  // e.g., the AI sometimes drops the name in a "Eu, {Name}," aside.
  // Only redact when hiding, and only when the name is ≥ 3 chars to
  // avoid false positives on common words.
  if (opts.hideName && opts.authorName && opts.authorName.trim().length >= 3) {
    const esc = opts.authorName.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    out = out.replace(new RegExp(`\\b${esc}\\b`, "g"), NAME_REDACTED);
  }

  return out;
}
