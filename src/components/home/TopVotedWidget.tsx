"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { TrendingUp, ThumbsUp, MapPin, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { STATUS_COLORS, STATUS_LABELS, SESIZARE_TIPURI } from "@/lib/constants";

interface Row {
  id: string;
  code: string;
  titlu: string;
  locatie: string;
  sector: string;
  tip: string;
  status: string;
  voturi_net: number;
  nr_comentarii: number;
}

export function TopVotedWidget() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 6s hard timeout — if the API hangs (Supabase pause, network),
    // skeleton-ul nu trebuie să rămână veșnic; mai bine ascundem secțiunea
    // și layout-ul de homepage rămâne stabil.
    const ctrl = new AbortController();
    const timeoutId = setTimeout(() => ctrl.abort(), 6000);

    fetch("/api/sesizari/top-voted?limit=5", { signal: ctrl.signal })
      .then((r) => r.json())
      .then((j) => setRows(j.data ?? []))
      .catch(() => setRows([]))
      .finally(() => {
        clearTimeout(timeoutId);
        setLoading(false);
      });

    return () => {
      clearTimeout(timeoutId);
      ctrl.abort();
    };
  }, []);

  // Hide the whole section only when we've confirmed there's nothing
  // to show. While loading we render skeletons so the page doesn't
  // shuffle its layout mid-paint, and the hero→CTA flow below stays
  // in the same place.
  if (!loading && rows.length === 0) return null;

  return (
    <section className="py-16">
      <div className="container-narrow">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400 text-xs font-semibold mb-2">
              <TrendingUp size={12} aria-hidden="true" />
              PRESIUNE PUBLICĂ
            </div>
            <h2 className="font-[family-name:var(--font-sora)] text-3xl md:text-4xl font-bold mb-1">
              Problemele pe care le vrem rezolvate
            </h2>
            <p className="text-[var(--color-text-muted)]">
              Cele mai votate sesizări încă nerezolvate. Fiecare vot e un cetățean care cere răspuns — autoritățile le văd.
            </p>
          </div>
          <Link
            href="/sesizari"
            className="hidden md:flex items-center gap-2 text-sm font-medium text-[var(--color-primary)] hover:gap-3 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded"
          >
            Toate sesizările <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>

        {loading && (
          <div className="space-y-3" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] animate-pulse"
              >
                <div className="shrink-0 w-12 h-12 rounded-[12px] bg-[var(--color-surface-2)]" />
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="h-3 w-24 rounded bg-[var(--color-surface-2)]" />
                  <div className="h-4 w-3/4 rounded bg-[var(--color-surface-2)]" />
                  <div className="h-3 w-1/2 rounded bg-[var(--color-surface-2)]" />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-3">
          {rows.map((s, i) => {
            const tipIcon = SESIZARE_TIPURI.find((t) => t.value === s.tip)?.icon ?? "📝";
            return (
              <Link
                key={s.id}
                href={`/sesizari/${s.code}`}
                className="flex items-center gap-4 p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] hover:border-[var(--color-primary)]/40 hover:shadow-[var(--shadow-md)] transition-all group focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
                aria-label={`#${i + 1}: ${s.titlu}, ${s.voturi_net} voturi, ${s.nr_comentarii} ${s.nr_comentarii === 1 ? "comentariu" : "comentarii"}`}
              >
                <div className="shrink-0 w-12 h-12 rounded-[12px] bg-gradient-to-br from-red-500 to-orange-600 text-white flex flex-col items-center justify-center" aria-hidden="true">
                  <ThumbsUp size={14} strokeWidth={2.5} />
                  <span className="text-xs font-bold leading-none mt-0.5 tabular-nums">{s.voturi_net}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-bold text-[var(--color-text-muted)] tabular-nums">#{i + 1}</span>
                    <Badge bgColor={STATUS_COLORS[s.status]} color="white">
                      {STATUS_LABELS[s.status]}
                    </Badge>
                    <Badge variant="neutral" className="text-[10px]">
                      <span aria-hidden="true">{tipIcon}</span> {s.sector}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-sm md:text-base truncate group-hover:text-[var(--color-primary)]">
                    {s.titlu}
                  </h3>
                  <p className="text-xs text-[var(--color-text-muted)] truncate flex items-center gap-1 mt-0.5">
                    <MapPin size={11} aria-hidden="true" />
                    {s.locatie} · {s.nr_comentarii} {s.nr_comentarii === 1 ? "comentariu" : "comentarii"}
                  </p>
                </div>
                <ArrowRight size={18} className="shrink-0 text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] group-hover:translate-x-1 transition-all" aria-hidden="true" />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
