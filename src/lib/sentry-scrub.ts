// Scrub PII from Sentry events before they leave the process.
// Redacts email, Romanian phone numbers, and sesizare codes (6-char
// uppercase alphanumeric) from message strings, exception values,
// breadcrumb messages, and request bodies.

import type { ErrorEvent } from "@sentry/nextjs";

const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.-]+/g;
const PHONE_RE = /\+?40\s?\d{2,3}[\s-]?\d{3}[\s-]?\d{3,4}/g;
const CODE_RE = /\b[A-Z0-9]{6}\b/g;

function redact(input: string): string {
  return input
    .replace(EMAIL_RE, "[email]")
    .replace(PHONE_RE, "[phone]")
    .replace(CODE_RE, "[code]");
}

function redactValue(val: unknown): unknown {
  if (typeof val === "string") return redact(val);
  if (Array.isArray(val)) return val.map(redactValue);
  if (val && typeof val === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(val)) out[k] = redactValue(v);
    return out;
  }
  return val;
}

export function scrubSentryEvent(event: ErrorEvent): ErrorEvent | null {
  if (event.message) event.message = redact(event.message);
  if (event.exception?.values) {
    for (const ex of event.exception.values) {
      if (ex.value) ex.value = redact(ex.value);
    }
  }
  if (event.breadcrumbs) {
    for (const b of event.breadcrumbs) {
      if (b.message) b.message = redact(b.message);
      if (b.data) b.data = redactValue(b.data) as typeof b.data;
    }
  }
  if (event.request) {
    if (typeof event.request.data === "string") {
      event.request.data = redact(event.request.data);
    } else if (event.request.data) {
      event.request.data = redactValue(event.request.data);
    }
    if (event.request.query_string && typeof event.request.query_string === "string") {
      event.request.query_string = redact(event.request.query_string);
    }
  }
  if (event.extra) event.extra = redactValue(event.extra) as typeof event.extra;
  return event;
}
