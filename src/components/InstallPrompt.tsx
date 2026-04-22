"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "civia_install_dismissed";

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

  // Listen for install prompt
  useEffect(() => {
    if (typeof window === "undefined") return;
    // Respect user dismissal (shows again after 30 days)
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10);
      if (Date.now() - dismissedAt < 30 * 24 * 60 * 60 * 1000) return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show after a short delay so it doesn't surprise users on page load
      setTimeout(() => setVisible(true), 2500);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setVisible(false);
  };

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setVisible(false);
  };

  if (!visible || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-[90] animate-fade-in-up">
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] shadow-[var(--shadow-xl)] p-4 flex items-start gap-3">
        <div className="shrink-0 w-10 h-10 rounded-[8px] bg-gradient-to-br from-[var(--color-primary)] to-indigo-900 flex items-center justify-center text-white">
          <Download size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm mb-0.5">Pune Civia pe ecranul de start</p>
          <p className="text-xs text-[var(--color-text-muted)] mb-3">
            Click rapid din home screen, fără bara de browser. Ghidurile civice rămân disponibile offline — util la dezastre și unde n-ai semnal.
          </p>
          <div className="flex gap-2">
            <button
              onClick={install}
              className="h-9 px-3 rounded-[8px] bg-[var(--color-primary)] text-white text-xs font-medium hover:bg-[var(--color-primary-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-primary)]"
            >
              Adaugă pe ecran
            </button>
            <button
              onClick={dismiss}
              className="h-9 px-3 rounded-[8px] bg-[var(--color-surface-2)] text-[var(--color-text-muted)] text-xs font-medium hover:bg-[var(--color-border)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
            >
              Nu acum
            </button>
          </div>
        </div>
        <button
          onClick={dismiss}
          className="shrink-0 text-[var(--color-text-muted)] hover:text-[var(--color-text)] -mt-1 -mr-1 p-1"
          aria-label="Închide"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
