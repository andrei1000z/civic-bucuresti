// Privacy-respecting analytics (Plausible) — only loads if NEXT_PUBLIC_PLAUSIBLE_DOMAIN is set

export function Analytics() {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  const api = process.env.NEXT_PUBLIC_PLAUSIBLE_API;
  if (!domain) return null;

  return (
    <script
      defer
      data-domain={domain}
      data-api={api ?? "https://plausible.io/api/event"}
      src="https://plausible.io/js/script.js"
    />
  );
}

// Helper to track custom events (click "Trimite Gmail", "AI improve", etc)
// Usage: trackEvent("Submit Sesizare", { tip: "groapa" })
export function trackEvent(name: string, props?: Record<string, string | number>) {
  if (typeof window === "undefined") return;
  const plausible = (window as unknown as { plausible?: (name: string, opts?: { props?: Record<string, string | number> }) => void }).plausible;
  if (plausible) plausible(name, { props });
}
