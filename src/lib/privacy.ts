/**
 * Strip private info from text before public display.
 * Removes:
 *   - "domiciliat(ă) în [ADDRESS], mă adresez" → "[adresă protejată], mă adresez"
 *   - Full "Subsemnatul X, domiciliat în Y" identification block
 *   - Phone numbers (07xx, +407xx)
 *   - Email addresses
 *   - Apartment/bloc/scara/etaj details
 */

export function stripPrivateAddress(text: string): string {
  if (!text) return text;

  let result = text;

  // AGGRESSIVE: Replace the ENTIRE identification sentence.
  // Pattern: "Subsemnat(ul/a) NUME, domiciliat(ă) în ADRESA, mă adresez..."
  // → "Mă adresez..."
  result = result.replace(
    /Subsemnat[ua]\(?[aă]?\)?\s+[^,]+,\s*domiciliat[ăa]?\(?[ăa]?\)?\s+în\s+[^,]+(?:,\s*(?:bl\.?\s*\w+|sc\.?\s*\w+|et\.?\s*\w+|ap\.?\s*\d+|nr\.?\s*[\w-]+|sector\s*\d)[^,]*)*,\s*/gi,
    ""
  );

  // Catch remaining "domiciliat(ă) în ADDRESS" that wasn't part of Subsemnatul pattern
  // Match from "domiciliat" all the way to "mă adresez" or end of sentence
  result = result.replace(
    /domiciliat[ăa]?\(?[ăa]?\)?\s+în\s+[^.]+?\s*(?=mă adresez|$)/gi,
    "[adresă protejată] "
  );

  // Strip any remaining standalone address fragments: Str. X nr. Y, bl. Z, ap. W
  result = result.replace(
    /\b(?:str\.?|strada|bd\.?|bdul\.?|bulevardul|calea|aleea|șos\.?|șoseaua|splaiul|piața|intrarea)\s+[^,.\n]+(?:,\s*(?:nr\.?\s*[\w-]+|bl\.?\s*[\w-]+|sc\.?\s*\w+|et\.?\s*\w+|ap\.?\s*\d+|sector\s*\d)[^,.\n]*)*/gi,
    "[adresă protejată]"
  );

  // Strip phone numbers (Romanian format)
  result = result.replace(
    /(\+?40|0)\s*7\d{2}[\s.-]?\d{3}[\s.-]?\d{3}/g,
    "[telefon protejat]"
  );

  // Strip email addresses
  result = result.replace(
    /[\w.+-]+@[\w.-]+\.\w{2,}/g,
    "[email protejat]"
  );

  // Clean up double spaces, orphan commas, leading commas
  result = result
    .replace(/,\s*,/g, ",")
    .replace(/^\s*,\s*/gm, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  return result;
}

/**
 * Strip private info for short preview (listing cards).
 * More aggressive — removes the entire opening paragraph.
 */
export function stripForPreview(formalText: string): string {
  if (!formalText) return "";

  // Remove everything before "Vă aduc la cunoștință" (the problem description paragraph)
  const match = formalText.match(/Vă aduc la cunoștință([\s\S]*)/);
  if (match) {
    return stripPrivateAddress(match[0].replace(/\n+/g, " ").trim());
  }

  // Fallback: strip the first two paragraphs (greeting + identification)
  const paragraphs = formalText.split(/\n\n+/);
  const relevantText = paragraphs.slice(2).join(" ").replace(/\n+/g, " ").trim();
  return stripPrivateAddress(relevantText || formalText.slice(0, 200));
}
