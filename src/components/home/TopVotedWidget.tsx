"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ThumbsUp, MapPin, ArrowRight } from "lucide-react";
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

// Pure list component — parent owns the section + heading. Earlier this
// widget self-wrapped in <section>+<h2>, which double-wrapped on the
// homepage and broke vertical rhythm (two h2s, two py-16 paddings).
export function TopVotedWidget() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 6s hard timeout — if the API hangs (Supabase pause, network),
    // the empty-state placeholder takes over and layout stays put.
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

  const isEmpty = !loading && rows.length === 0;

  if (loading) {
    return (
      <div className="space-y-3" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] animate-pulse"
          >
            <div className="shrink-0 w-12 h-12 rounded-[var(--radius-md)] bg-[var(--color-surface-2)]" />
            <div className="flex-1 min-w-0 space-y-2">
              <div className="h-3 w-24 rounded bg-[var(--color-surface-2)]" />
              <div className="h-4 w-3/4 rounded bg-[var(--color-surface-2)]" />
              <div className="h-3 w-1/2 rounded bg-[var(--color-surface-2)]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="flex items-center justify-center min-h-[200px] p-6 bg-[var(--color-surface)] border border-dashed border-[var(--color-border)] rounded-[var(--radius-md)] text-center">
        <div>
          <p className="text-sm font-medium text-[var(--color-text)]">
            Nicio sesizare votată încă
          </p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            Trimite prima ta sesizare și votează ce contează pentru tine.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {rows.map((s, i) => {
        const tipIcon = SESIZARE_TIPURI.find((t) => t.value === s.tip)?.icon ?? "📝";
        return (
          <Link
            key={s.id}
            href={`/sesizari/${s.code}`}
            className="flex items-center gap-4 p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] shadow-[var(--shadow-1)] hover:border-[var(--color-primary)]/40 hover:shadow-[var(--shadow-3)] transition-all group focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
            aria-label={`#${i + 1}: ${s.titlu}, ${s.voturi_net} voturi, ${s.nr_comentarii} ${s.nr_comentarii === 1 ? "comentariu" : "comentarii"}`}
          >
            <div
              className="shrink-0 w-12 h-12 rounded-[var(--radius-md)] bg-gradient-to-br from-[var(--color-primary)] to-emerald-800 text-white flex flex-col items-center justify-center"
              aria-hidden="true"
            >
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
            <ArrowRight
              size={18}
              className="shrink-0 text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] group-hover:translate-x-1 transition-all"
              aria-hidden="true"
            />
          </Link>
        );
      })}
    </div>
  );
}
