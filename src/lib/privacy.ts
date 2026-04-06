/**
 * Strip private info from text before public display.
 * Removes:
 *   - "domiciliat(ă) în [ADDRESS]" → "domiciliat(ă) în [adresă protejată]"
 *   - Phone numbers (07xx, +407xx)
 *   - Email addresses
 *   - Apartment/bloc/scara/etaj details
 */

export function stripPrivateAddress(text: string): string {
  if (!text) return text;

  let result = text;

  // Remove "domiciliat(ă) în [address until next comma or period]"
  // Pattern: domiciliat/domiciliată în ANYTHING, | domiciliat/domiciliată în ANYTHING.
  result = result.replace(
    /domiciliat[ăa]?\s+în\s+[^,.]+[,.]/gi,
    "domiciliat(ă) în [adresă protejată],"
  );

  // Also catch "Subsemnatul X, domiciliat în Y, mă adresez"
  // Already handled by the above regex

  // Strip standalone address patterns: "Str. X nr. Y, bl. Z, sc. A, et. B, ap. C"
  // Replace apartment/block/scara/etaj details
  result = result.replace(
    /\b(bl\.?\s*\w+[\s,]*|sc\.?\s*\w+[\s,]*|et\.?\s*\w+[\s,]*|ap\.?\s*\d+[\s,]*)/gi,
    ""
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

  // Clean up multiple spaces/commas left by removals
  result = result.replace(/,\s*,/g, ",").replace(/\s{2,}/g, " ").trim();

  return result;
}

/**
 * Strip private info for short preview (listing cards).
 * More aggressive — removes the entire opening paragraph.
 */
export function stripForPreview(formalText: string): string {
  if (!formalText) return "";

  // Remove everything before "Vă aduc la cunoștință" (the problem description paragraph)
  // Use [\s\S]* instead of /s flag for dotAll (avoids ES2018 target requirement)
  const match = formalText.match(/Vă aduc la cunoștință[^.]*\.\s*([\s\S]*)/);
  if (match) {
    return stripPrivateAddress(match[1].replace(/\n+/g, " ").trim());
  }

  // Fallback: strip the first two paragraphs (greeting + identification)
  const paragraphs = formalText.split(/\n\n+/);
  const relevantText = paragraphs.slice(2).join(" ").replace(/\n+/g, " ").trim();
  return stripPrivateAddress(relevantText || formalText.slice(0, 200));
}
