"use client";

import { useState } from "react";
import { Newspaper, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface RefreshResult {
  total?: number;
  inserted?: number;
  deleted?: number;
  perFeed?: Array<{ source: string; count: number; ok: boolean }>;
}

/**
 * Admin trigger pentru POST /api/stiri/fetch.
 *
 * Endpoint-ul cere fie Bearer CRON_SECRET (Vercel cron), fie sesiune admin
 * (verificat server-side). Cum admin-ul e deja autentificat când vede pagina
 * asta, fetch-ul cu credentials trece prin authorize() pe ramura admin.
 */
export function RefreshStiriButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RefreshResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch("/api/stiri/fetch", {
        method: "POST",
        credentials: "same-origin",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      setResult(json.data ?? {});
    } catch (e) {
      setError(e instanceof Error ? e.message : "Eroare");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={refresh}
        disabled={loading}
        aria-busy={loading}
        className="flex items-center gap-3 p-4 rounded-[var(--radius-xs)] bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] text-left w-full"
      >
        {loading ? (
          <Loader2 size={20} className="text-emerald-500 animate-spin" aria-hidden="true" />
        ) : (
          <Newspaper size={20} className="text-emerald-500" aria-hidden="true" />
        )}
        <div className="min-w-0 flex-1">
          <p className="font-medium text-sm">
            {loading ? "Se reîncarcă feed-urile RSS..." : "Reîncarcă feed-urile RSS"}
          </p>
          <p className="text-xs text-[var(--color-text-muted)]">
            Forțează un fetch imediat al tuturor surselor
          </p>
        </div>
      </button>

      {result && (
        <div role="status" className="flex items-start gap-2 p-3 rounded-[var(--radius-xs)] bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-xs">
          <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="text-emerald-900 dark:text-emerald-300">
            <p className="font-semibold">
              {result.total ?? 0} articole · {result.inserted ?? 0} noi · {result.deleted ?? 0} șterse (vechi)
            </p>
            {result.perFeed && result.perFeed.length > 0 && (
              <ul className="mt-1 space-y-0.5 font-mono text-[10px]">
                {result.perFeed.map((p) => (
                  <li key={p.source} className={p.ok && p.count > 0 ? "" : "text-amber-700 dark:text-amber-400"}>
                    {p.ok ? (p.count > 0 ? "✓" : "⚠") : "✗"} {p.source}: {p.count}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {error && (
        <div role="alert" className="flex items-start gap-2 p-3 rounded-[var(--radius-xs)] bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-400">
          <AlertCircle size={14} className="shrink-0 mt-0.5" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
