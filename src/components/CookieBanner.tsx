"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";

const STORAGE_KEY = "civic_cookie_consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const consent = localStorage.getItem(STORAGE_KEY);
    if (!consent) setVisible(true);
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
          <p className="font-semibold mb-1">Folosim cookies esențiale</p>
          <p className="text-xs text-[var(--color-text-muted)] mb-3">
            Doar pentru autentificare și preferințe tema. Fără tracking. Vezi{" "}
            <Link href="/legal/confidentialitate" className="text-[var(--color-primary)] underline">
              politica de confidențialitate
            </Link>
            .
          </p>
          <div className="flex gap-2">
            <button
              onClick={accept}
              className="h-9 px-4 rounded-[8px] bg-[var(--color-primary)] text-white text-xs font-medium hover:bg-[var(--color-primary-hover)]"
            >
              Am înțeles
            </button>
            <button
              onClick={dismiss}
              className="h-9 px-3 rounded-[8px] bg-[var(--color-surface-2)] text-xs font-medium hover:bg-[var(--color-border)]"
            >
              Închide
            </button>
          </div>
        </div>
        <button
          onClick={dismiss}
          className="w-6 h-6 rounded-full hover:bg-[var(--color-surface-2)] flex items-center justify-center shrink-0"
          aria-label="Închide"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
