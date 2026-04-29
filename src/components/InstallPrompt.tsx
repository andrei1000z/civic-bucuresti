"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "civia_install_dismissed";
const VISIT_COUNT_KEY = "civia_visit_count";
// Conversion 1.5% (5 din 335 prompts) — prea agresiv. Strategie nouă:
// nu mai arătăm prompt-ul la prima vizită, doar de la a 3-a încolo, când
// userul a demonstrat interes real. Acceptarea ar trebui să crească
// pentru că oamenii „familiar" cu produsul instalează cu convingere.
const MIN_VISITS_BEFORE_PROMPT = 3;

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  // Register the service worker once
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    // Only register in production to avoid dev-mode caching headaches
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // silent fail — SW is progressive enhancement
    });
  }, []);

  // Increment visit counter on every mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const count = parseInt(localStorage.getItem(VISIT_COUNT_KEY) ?? "0", 10) + 1;
      localStorage.setItem(VISIT_COUNT_KEY, String(count));
    } catch { /* quota ignored */ }
  }, []);

  // Listen for install prompt
  useEffect(() => {
    if (typeof window === "undefined") return;
    // Respect user dismissal (shows again after 30 days)
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10);
      if (Date.now() - dismissedAt < 30 * 24 * 60 * 60 * 1000) return;
    }

    // Visit-count gate — don't bother first-time visitors
    const visitCount = parseInt(localStorage.getItem(VISIT_COUNT_KEY) ?? "0", 10);
    if (visitCount < MIN_VISITS_BEFORE_PROMPT) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show after longer delay (5s) so it doesn't surprise — the user
      // had time to start engaging cu pagina înainte să apară popup.
      setTimeout(() => setVisible(true), 5000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    // Track outcome separately for conversion analytics
    if (typeof window !== "undefined") {
      import("@/components/analytics/CiviaTracker").then(({ trackCustomEvent }) => {
        trackCustomEvent(
          choice.outcome === "accepted" ? "pwa-install-accepted" : "pwa-install-dismissed",
        );
      }).catch(() => { /* ignore */ });
    }
    setDeferredPrompt(null);
    setVisible(false);
  };

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    // Track that user actively dismissed (vs. just ignored)
    import("@/components/analytics/CiviaTracker").then(({ trackCustomEvent }) => {
      trackCustomEvent("pwa-install-dismissed-before-show");
    }).catch(() => { /* ignore */ });
    setVisible(false);
  };

  if (!visible || !deferredPrompt) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="install-prompt-title"
      className="fixed left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-[90] animate-fade-in-up"
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)" }}
    >
      <div className="glass-surface-strong rounded-[var(--radius-lg)] shadow-[var(--shadow-4)] p-4 flex items-start gap-3">
        <div className="shrink-0 w-10 h-10 rounded-[var(--radius-xs)] bg-gradient-to-br from-[var(--color-primary)] to-indigo-900 flex items-center justify-center text-white">
          <Download size={18} aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <p id="install-prompt-title" className="font-semibold text-sm mb-0.5">Pune Civia pe ecranul de start</p>
          <p className="text-xs text-[var(--color-text-muted)] mb-3">
            Click rapid din home screen, fără bara de browser. Ghidurile civice rămân disponibile offline — util la dezastre și unde n-ai semnal.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={install}
              className="h-9 px-3 rounded-[var(--radius-xs)] bg-[var(--color-primary)] text-white text-xs font-medium hover:bg-[var(--color-primary-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-primary)] transition-colors"
            >
              Adaugă pe ecran
            </button>
            <button
              type="button"
              onClick={dismiss}
              className="h-9 px-3 rounded-[var(--radius-xs)] bg-[var(--color-surface-2)] text-[var(--color-text-muted)] text-xs font-medium hover:bg-[var(--color-border)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] transition-colors"
            >
              Nu acum
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 text-[var(--color-text-muted)] hover:text-[var(--color-text)] -mt-1 -mr-1 p-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          aria-label="Închide promptul de instalare"
        >
          <X size={14} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
