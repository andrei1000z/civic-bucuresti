/**
 * Pure formatting helpers pentru sesizare form input.
 *
 * Extras din SesizareForm.tsx pentru testabilitate (form e 1485 linii,
 * imposibil de rulat unit tests pe componenta întreagă).
 */

/** Capitalize each word: "ion POPESCU" → "Ion Popescu". */
export function capitalizeName(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/** Clean up address: trim, capitalize first letter. Restul rămâne neatins. */
export function formatAddress(addr: string): string {
  const trimmed = addr.trim();
  if (!trimmed) return trimmed;
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}
