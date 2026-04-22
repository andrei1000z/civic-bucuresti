"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration: number;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "info", duration = 4000) => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((prev) => [...prev, { id, type, message, duration }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const dismiss = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/*
        Toast stack — bottom-center on desktop, bottom-centered but
        respecting the iOS home-indicator safe area on mobile. The
        extra bottom offset keeps toasts clear of the MobileFab
        (which sits at bottom-right ~20px above the nav bar).

        role=status + aria-live=polite: new toasts are announced by
        screen readers without interrupting the current reading.
        We don't use aria-live=assertive because toasts here are
        confirmations, not critical warnings.
      */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="false"
        className="fixed left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 pointer-events-none"
        style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)" }}
      >
        {toasts.map((t) => {
          const Icon =
            t.type === "success" ? CheckCircle2 :
            t.type === "error" ? AlertCircle :
            t.type === "warning" ? AlertCircle : Info;
          const color =
            t.type === "success" ? "#059669" :
            t.type === "error" ? "#DC2626" :
            t.type === "warning" ? "#F59E0B" : "#2563EB";
          return (
            <div
              key={t.id}
              className="pointer-events-auto bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] shadow-[var(--shadow-xl)] px-4 py-3 flex items-start gap-3 min-w-[280px] max-w-[420px] animate-fade-in-up"
              style={{ borderLeftWidth: 4, borderLeftColor: color }}
            >
              <Icon size={18} style={{ color }} className="shrink-0 mt-0.5" aria-hidden="true" />
              <p className="flex-1 text-sm text-[var(--color-text)]">{t.message}</p>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                className="shrink-0 text-[var(--color-text-muted)] hover:text-[var(--color-text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded"
                aria-label="Închide notificarea"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Silent no-op when used outside ToastProvider (shouldn't happen in practice)
    return { toast: () => {} };
  }
  return ctx;
}
