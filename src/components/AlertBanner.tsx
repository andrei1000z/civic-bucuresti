"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, X, Info, AlertOctagon } from "lucide-react";

interface AlertPayload {
  id: string;
  type: string;
  severity: "info" | "warning" | "critical";
  title: string;
  message: string;
  link?: string;
  source: string;
}

const DISMISSED_KEY = "civia:alerts:dismissed";

function loadDismissed(): Set<string> {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function saveDismissed(ids: Set<string>) {
  try {
    localStorage.setItem(DISMISSED_KEY, JSON.stringify([...ids]));
  } catch {
    /* quota */
  }
}

const SEVERITY_STYLES: Record<string, { bg: string; text: string; icon: typeof Info }> = {
  critical: {
    bg: "bg-red-600 dark:bg-red-700",
    text: "text-white",
    icon: AlertOctagon,
  },
  warning: {
    bg: "bg-amber-500 dark:bg-amber-600",
    text: "text-white",
    icon: AlertTriangle,
  },
  info: {
    bg: "bg-blue-600 dark:bg-blue-700",
    text: "text-white",
    icon: Info,
  },
};

export function AlertBanner() {
  const [alert, setAlert] = useState<AlertPayload | null>(null);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    setDismissed(loadDismissed());

    let cancelled = false;
    fetch("/api/alerts")
      .then((r) => r.json())
      .then((j) => {
        if (!cancelled && j.data) setAlert(j.data as AlertPayload);
      })
      .catch(() => {});

    // Re-check every 5 minutes for new alerts
    const interval = setInterval(() => {
      fetch("/api/alerts")
        .then((r) => r.json())
        .then((j) => {
          if (!cancelled) setAlert(j.data as AlertPayload | null);
        })
        .catch(() => {});
    }, 5 * 60_000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (!alert || dismissed.has(alert.id)) return null;

  const style = SEVERITY_STYLES[alert.severity] ?? SEVERITY_STYLES.info!;
  const Icon = style.icon;

  const dismiss = () => {
    const next = new Set(dismissed);
    next.add(alert.id);
    setDismissed(next);
    saveDismissed(next);
  };

  const body = (
    <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center sm:gap-3">
      <span className="font-bold text-sm">{alert.title}</span>
      <span className="text-sm opacity-90 truncate">{alert.message}</span>
    </div>
  );

  return (
    <div className={`${style.bg} ${style.text} sticky top-0 z-[60] shadow-md`}>
      <div className="container-narrow flex items-center gap-3 py-2.5">
        <Icon size={18} className="shrink-0" />
        {alert.link ? (
          <Link href={alert.link} className="flex-1 min-w-0 hover:opacity-90 transition-opacity">
            {body}
          </Link>
        ) : (
          body
        )}
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 w-9 h-9 sm:w-8 sm:h-8 -mr-2 rounded-full hover:bg-white/20 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          aria-label="Închide această alertă"
          title="Închide alerta"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
