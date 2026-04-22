"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";

const STORAGE_KEY = "civic_cookie_consent";
const CHANGE_EVENT = "civic:cookie-consent:reopen";

/**
 * Open the cookie banner programmatically — used by footer "Preferințe cookie" link
 * for GDPR consent retraction compliance.
 */
export function openCookiePreferences() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const consent = localStorage.getItem(STORAGE_KEY);
    if (!consent) setVisible(true);

    const reopen = () => setVisible(true);
    window.addEventListener(CHANGE_EVENT, reopen);
    return () => window.removeEventListener(CHANGE_EVENT, reopen);
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  };

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "dismissed");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-40 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] shadow-[var(--shadow-xl)] p-4 animate-fade-in-up">
      <div className="flex items-start gap-3">
        <Cookie size={20} className="text-[var(--color-primary)] mt-0.5 shrink-0" />
        <div className="flex-1 text-sm">
          <p className="font-semibold mb-1">Folosim doar cookies esențiale</p>
          <p className="text-xs text-[var(--color-text-muted)] mb-3">
            Strictul necesar pentru autentificare și salvarea temei (dark/light). Nu te trackăm, nu vindem date, nu avem reclame. Detalii în{" "}
            <Link href="/legal/confidentialitate" className="text-[var(--color-primary)] underline">
              politica de confidențialitate
            </Link>
            .
          </p>
          <div className="flex gap-2">
            <button
              onClick={accept}
              className="h-9 px-4 rounded-[8px] bg-[var(--color-primary)] text-white text-xs font-medium hover:bg-[var(--color-primary-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-primary)]"
            >
              Bine, continuă
            </button>
            <button
              onClick={dismiss}
              className="h-9 px-3 rounded-[8px] bg-[var(--color-surface-2)] text-xs font-medium hover:bg-[var(--color-border)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
            >
              Mai târziu
            </button>
          </div>
        </div>
        <button
          onClick={dismiss}
          className="w-9 h-9 -mt-1 -mr-1 rounded-full hover:bg-[var(--color-surface-2)] flex items-center justify-center shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          aria-label="Închide banner cookies"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
