"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, CheckCircle2, Circle as CircleIcon, Clock, Loader2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/utils";
import type { SesizareFeedRow, SesizareTimelineRow } from "@/lib/supabase/types";

const EVENT_LABELS: Record<string, string> = {
  depusa: "Sesizare depusă",
  inregistrata: "Înregistrată la registratură",
  rutata: "Trimisă la direcție",
  in_teren: "Inspector pe teren",
  rezolvat: "Problemă rezolvată",
  respins: "Sesizare respinsă",
};

interface Result {
  sesizare: SesizareFeedRow;
  timeline: SesizareTimelineRow[];
}

export function UrmarireSesizare() {
  const [cod, setCod] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (cod.length < 3) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`/api/sesizari/${encodeURIComponent(cod.trim())}`);
      const text = await res.text();
      let json;
      try { json = JSON.parse(text); } catch {
        throw new Error("Sesizarea nu a fost găsită. Verifică codul.");
      }
      if (!res.ok) throw new Error(json.error || "Nu am găsit sesizarea");
      if (!json.data?.sesizare) throw new Error("Sesizarea nu a fost găsită.");
      setResult({ sesizare: json.data.sesizare, timeline: json.data.timeline ?? [] });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Eroare căutare");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <form
        className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-6 mb-6"
        onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
      >
        <label htmlFor="urm-cod" className="font-[family-name:var(--font-sora)] font-semibold text-lg mb-4 block">
          Urmărește sesizarea ta
        </label>
        <div className="flex gap-2">
          <input
            id="urm-cod"
            type="text"
            value={cod}
            onChange={(e) => setCod(e.target.value)}
            placeholder="Cod sesizare (ex: 00001)"
            autoComplete="off"
            inputMode="text"
            spellCheck={false}
            aria-describedby={error ? "urm-error" : undefined}
            aria-invalid={!!error}
            className="flex-1 h-11 px-4 rounded-[8px] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] font-mono"
          />
          <button
            type="submit"
            disabled={loading || cod.length < 3}
            aria-busy={loading}
            className="h-11 px-5 rounded-[8px] bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-hover)] disabled:opacity-50 transition-colors flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-primary)]"
          >
            {loading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Search size={16} aria-hidden="true" />}
            Caută
          </button>
        </div>
        {error && (
          <p id="urm-error" role="alert" className="text-sm text-red-500 mt-3">{error}</p>
        )}
      </form>

      {result && (
        <section
          aria-label="Rezultat căutare"
          className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-6 animate-fade-in-up"
        >
          <div className="mb-5 pb-5 border-b border-[var(--color-border)]">
            <p className="text-xs text-[var(--color-text-muted)] mb-1">Cod sesizare</p>
            <p className="font-mono font-semibold" aria-label={`Cod ${result.sesizare.code}`}>{result.sesizare.code}</p>
            <p className="text-sm mt-2">{result.sesizare.titlu}</p>
            <Link
              href={`/sesizari/${result.sesizare.code}`}
              className="inline-flex items-center gap-1 text-xs text-[var(--color-primary)] hover:underline mt-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded"
            >
              Vezi detalii <ArrowRight size={12} aria-hidden="true" />
            </Link>
          </div>
          {result.timeline.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)] italic">
              Sesizarea există dar nu are încă evenimente în istoric. Status-ul se actualizează când autoritatea dă feedback.
            </p>
          ) : (
            <ol
              className="relative border-l-2 border-[var(--color-border)] ml-3 space-y-6"
              aria-label={`Istoric ${result.timeline.length} ${result.timeline.length === 1 ? "eveniment" : "evenimente"}`}
            >
              {result.timeline.map((step, i) => {
                const isLast = i === result.timeline.length - 1;
                return (
                  <li key={step.id} className="ml-8">
                    <span
                      className={cn(
                        "absolute -left-[13px] w-6 h-6 rounded-full flex items-center justify-center",
                        "bg-[var(--color-secondary)] text-white"
                      )}
                      aria-hidden="true"
                    >
                      {isLast ? <CircleIcon size={10} /> : <CheckCircle2 size={14} />}
                    </span>
                    <p className="font-medium text-sm">
                      {EVENT_LABELS[step.event_type] ?? step.event_type}
                    </p>
                    {step.description && (
                      <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{step.description}</p>
                    )}
                    <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-1 mt-0.5">
                      <Clock size={11} aria-hidden="true" />
                      <time dateTime={step.created_at}>{formatDateTime(step.created_at)}</time>
                    </p>
                  </li>
                );
              })}
            </ol>
          )}
        </section>
      )}
    </div>
  );
}
