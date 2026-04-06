/**
 * Strip ONLY the address from formal text, keeping everything else intact
 * (name, paragraph structure, line breaks, signature).
 *
 * "domiciliată în Str. Țintasului 17-19, ap 14, mă adresez"
 *   → "domiciliată în [adresă protejată], mă adresez"
 */

export function stripPrivateAddress(text: string): string {
  if (!text) return text;

  let result = text;

  // Replace the address between "domiciliat(ă) în" and ", mă adresez"
  // This keeps the name + "domiciliată în" prefix + ", mă adresez" suffix
  result = result.replace(
    /(domiciliat[ăa]?\(?[ăa]?\)?\s+în\s+)([^]*?)(,\s*mă adresez)/gi,
    "$1[adresă protejată]$3"
  );

  // Fallback: if "mă adresez" pattern didn't match, catch simpler patterns
  // "domiciliată în ADDR, ADDR, ADDR." (ends with period)
  result = result.replace(
    /(domiciliat[ăa]?\(?[ăa]?\)?\s+în\s+)((?:(?!\[adresă)[^.])+)(\.)/gi,
    "$1[adresă protejată]$3"
  );

  // Strip phone numbers (Romanian format)
  result = result.replace(
    /(\+?40|0)\s*7\d{2}[\s.-]?\d{3}[\s.-]?\d{3}/g,
    "[telefon protejat]"
  );

  // Strip email addresses from body text (but not the signature name)
  result = result.replace(
    /[\w.+-]+@[\w.-]+\.\w{2,}/g,
    "[email protejat]"
  );

  return result;
}

/**
 * Strip private info for short preview (listing cards).
 * More aggressive — shows only the problem description paragraph.
 */
export function stripForPreview(formalText: string): string {
  if (!formalText) return "";

  // Extract the problem paragraph: "Vă aduc la cunoștință ... accidente."
  const match = formalText.match(/Vă aduc la cunoștință([\s\S]*?)(?=Vă propun|Vă mulțumesc|Cu respect|$)/);
  if (match) {
    return match[0].replace(/\n+/g, " ").trim();
  }

  // Fallback: skip first 2 paragraphs, show the rest
  const paragraphs = formalText.split(/\n\n+/);
  if (paragraphs.length > 2) {
    return paragraphs[2].replace(/\n+/g, " ").trim();
  }

  return stripPrivateAddress(formalText.replace(/\n+/g, " ").slice(0, 200));
}
