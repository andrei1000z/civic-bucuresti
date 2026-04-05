"use client";

import { useState, useEffect } from "react";
import { Award, Clock, TrendingUp } from "lucide-react";

interface SectorStats {
  sector: string;
  total: number;
  rezolvate: number;
  in_lucru: number;
  noi: number;
  percent_rezolvate: number;
  avg_days: number | null;
}

function scoreColor(percent: number): string {
  if (percent >= 70) return "#059669";
  if (percent >= 50) return "#EAB308";
  if (percent >= 30) return "#F97316";
  return "#DC2626";
}

function scoreLabel(percent: number): string {
  if (percent >= 70) return "Activ";
  if (percent >= 50) return "Moderat";
  if (percent >= 30) return "Slab";
  return "Inactiv";
}

export function SectorScorecard() {
  const [stats, setStats] = useState<SectorStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/statistici/scorecard")
      .then((r) => r.json())
      .then((j) => setStats(j.data ?? []))
      .catch(() => setStats([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="h-48 bg-[var(--color-surface)] rounded-[12px] animate-pulse" />;
  }

  const sorted = [...stats].sort((a, b) => b.percent_rezolvate - a.percent_rezolvate);
  const best = sorted.find((s) => s.total > 0);

  return (
    <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-6">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
        <div>
          <h3 className="font-[family-name:var(--font-sora)] font-bold text-xl mb-1">
            📊 Scorecard primării de sector
          </h3>
          <p className="text-xs text-[var(--color-text-muted)]">
            Cât de active sunt primăriile în rezolvarea sesizărilor
          </p>
        </div>
        {best && best.total > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-[8px] bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
            <Award size={14} />
            Top: {best.sector} ({best.percent_rezolvate}%)
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {stats.map((s) => {
          const color = scoreColor(s.percent_rezolvate);
          return (
            <div
              key={s.sector}
              className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[12px] p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="font-bold text-sm">{s.sector}</p>
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: `${color}20`, color }}
                >
                  {scoreLabel(s.percent_rezolvate)}
                </span>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <p className="text-3xl font-bold" style={{ color }}>{s.percent_rezolvate}%</p>
                <p className="text-xs text-[var(--color-text-muted)]">rezolvate</p>
              </div>
              <div className="h-1.5 bg-[var(--color-surface-2)] rounded-full overflow-hidden mb-3">
                <div
                  className="h-full transition-all"
                  style={{ width: `${s.percent_rezolvate}%`, background: color }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-[var(--color-text-muted)]">
                <span className="flex items-center gap-1">
                  <TrendingUp size={10} />
                  {s.total} total
                </span>
                {s.avg_days != null && (
                  <span className="flex items-center gap-1">
                    <Clock size={10} />
                    ~{s.avg_days}z
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
