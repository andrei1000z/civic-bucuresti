// Input sanitizers for the analytics tracking pipeline.
// Extracted so they can be unit-tested in isolation from the route handler.

/**
 * Generic string sanitizer: trims, cuts control chars, enforces max length.
 * Used for free-form user input (eventType, pathname, UTM, error messages).
 */
export function sanitizeStr(val: unknown, maxLen = 100): string {
  if (typeof val !== "string") return "";
  return val
    .slice(0, maxLen)
    .replace(/[\n\r\t\0]/g, "")
    .trim();
}

/**
 * Redis hash-field-safe sanitizer. In addition to sanitizeStr's cleanup,
 * strips characters that could collide with our `namespace:key:field` format:
 * `: * ? [ ] { }`.
 */
export function sanitizeKey(val: unknown, maxLen = 100): string {
  return sanitizeStr(val, maxLen).replace(/[:*?[\]{}]/g, "");
}

/**
 * ID sanitizer for visitor IDs, user IDs, and similar identifiers.
 * Only allows alphanumeric, dash, and underscore. Hard cap at 64 chars.
 */
export function sanitizeId(val: unknown): string {
  if (typeof val !== "string") return "";
  return val.slice(0, 64).replace(/[^a-zA-Z0-9\-_]/g, "");
}
