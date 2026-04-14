// Analytics container — mounts Plausible (script) + CiviaTracker (custom, Redis-backed).
// Plausible keeps the historical aggregate; CiviaTracker feeds /admin/analytics.

import { CiviaTracker, trackCustomEvent } from "@/components/analytics/CiviaTracker";

export function Analytics() {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  const api = process.env.NEXT_PUBLIC_PLAUSIBLE_API;

  return (
    <>
      {domain && (
        <script
          defer
          data-domain={domain}
          data-api={api ?? "https://plausible.io/api/event"}
          src="https://plausible.io/js/script.js"
        />
      )}
      <CiviaTracker />
    </>
  );
}

// Helper to fire custom events. Pushes to both Plausible (if loaded) and the
// Civia backend so each event shows up in /admin/analytics.
export function trackEvent(name: string, props?: Record<string, string | number>) {
  if (typeof window === "undefined") return;
  const plausible = (
    window as unknown as {
      plausible?: (name: string, opts?: { props?: Record<string, string | number> }) => void;
    }
  ).plausible;
  if (plausible) plausible(name, { props });
  trackCustomEvent(name, props ?? {});
}
