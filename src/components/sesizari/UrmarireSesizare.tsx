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
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-6 mb-6">
        <h3 className="font-[family-name:var(--font-sora)] font-semibold text-lg mb-4">
          Urmărește sesizarea ta
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={cod}
            onChange={(e) => setCod(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Cod sesizare (ex: 00001)"
            className="flex-1 h-11 px-4 rounded-[8px] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
          <button
            onClick={handleSearch}
            disabled={loading || cod.length < 3}
            className="h-11 px-5 rounded-[8px] bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-hover)] disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            Caută
          </button>
        </div>
        {error && (
          <p className="text-sm text-red-500 mt-3">{error}</p>
        )}
      </div>

      {result && (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-6">
          <div className="mb-5 pb-5 border-b border-[var(--color-border)]">
            <p className="text-xs text-[var(--color-text-muted)] mb-1">Cod sesizare</p>
            <p className="font-mono font-semibold">{result.sesizare.code}</p>
            <p className="text-sm mt-2">{result.sesizare.titlu}</p>
            <Link
              href={`/sesizari/${result.sesizare.code}`}
              className="inline-flex items-center gap-1 text-xs text-[var(--color-primary)] hover:underline mt-2"
            >
              Vezi detalii <ArrowRight size={12} />
            </Link>
          </div>
          {result.timeline.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)]">Nu există evenimente în istoric.</p>
          ) : (
            <ol className="relative border-l-2 border-[var(--color-border)] ml-3 space-y-6">
              {result.timeline.map((step, i) => {
                const isLast = i === result.timeline.length - 1;
                return (
                  <li key={step.id} className="ml-8">
                    <span
                      className={cn(
                        "absolute -left-[13px] w-6 h-6 rounded-full flex items-center justify-center",
                        "bg-[var(--color-secondary)] text-white"
                      )}
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
                      <Clock size={11} />
                      {formatDateTime(step.created_at)}
                    </p>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      )}
    </div>
  );
}
