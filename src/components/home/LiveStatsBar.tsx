"use client";

import { useEffect, useState } from "react";
import { Activity, Clock, CheckCircle2, Megaphone, Wind } from "lucide-react";

interface LiveData {
  totalSesizari: number;
  inLucru: number;
  rezolvate: number;
  petitiiActive: number;
  // null când API returnează „indisponibil" — afișăm doar dacă avem date reale.
  aqi: number | null;
  aqiQuality: string | null;
}

/**
 * Ticker național — sesizări totale + în lucru + rezolvate (≥3 ca să nu
 * pară gol) + petiții active + calitatea aerului națională medie.
 *
 * Round 2026-04-29: scos AQI prefix-uit (înainte „AQI:"), scoase „Surse"
 * și „Actualizat realtime" (filler), adăugat petiții (feature nou).
 */
export function LiveStatsBar() {
  const [data, setData] = useState<LiveData | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchJson = async <T,>(url: string, fallback: T): Promise<T> => {
      try {
        const res = await fetch(url);
        if (!res.ok) return fallback;
        return (await res.json()) as T;
      } catch {
        return fallback;
      }
    };
    Promise.all([
      fetchJson<{ data: { total: number; today: number; inLucru: number; rezolvate?: number } | null }>(
        "/api/statistici/summary",
        { data: null },
      ),
      fetchJson<{ data: { aqi: number | null; quality: string | null } | null }>(
        "/api/statistici/aqi",
        { data: null },
      ),
      fetchJson<{ data: { active: number } | null }>(
        "/api/petitii/count",
        { data: { active: 0 } },
      ),
    ]).then(([summary, aqi, petitii]) => {
      if (cancelled) return;
      const s = summary.data ?? { total: 0, today: 0, inLucru: 0, rezolvate: 0 };
      // Doar dacă AQI-ul e număr valid (nu null) afișăm stat-ul. Altfel
      // SKIP — preferăm să nu arătăm „Date indisponibile" sau fake fallback.
      const aqiNum = typeof aqi.data?.aqi === "number" ? aqi.data.aqi : null;
      setData({
        totalSesizari: s.total,
        inLucru: s.inLucru,
        rezolvate: s.rezolvate ?? 0,
        petitiiActive: petitii.data?.active ?? 0,
        aqi: aqiNum,
        aqiQuality: aqiNum !== null ? aqi.data?.quality ?? null : null,
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Build stats list — fiecare stat conditional:
  //   - rezolvate: ≥3 (nu vrem 0/1/2 care arată ca neutilizat)
  //   - petiții active: ≥1
  //   - AQI: doar când avem număr valid (nu fake fallback, nu "Date indisponibile")
  const stats = data
    ? [
        {
          icon: Activity,
          text: `${data.totalSesizari.toLocaleString("ro-RO")} sesizări totale`,
          color: "text-emerald-500",
        },
        {
          icon: Clock,
          text: `${data.inLucru.toLocaleString("ro-RO")} sesizări în lucru`,
          color: "text-amber-500",
        },
        ...(data.rezolvate >= 3
          ? [
              {
                icon: CheckCircle2,
                text: `${data.rezolvate.toLocaleString("ro-RO")} sesizări rezolvate`,
                color: "text-green-600",
              },
            ]
          : []),
        ...(data.petitiiActive >= 1
          ? [
              {
                icon: Megaphone,
                text: `${data.petitiiActive.toLocaleString("ro-RO")} petiții active`,
                color: "text-purple-500",
              },
            ]
          : []),
        ...(data.aqi !== null && data.aqiQuality
          ? [
              {
                icon: Wind,
                text: `Calitatea aerului națională medie: ${data.aqi} (${data.aqiQuality})`,
                color: "text-sky-500",
              },
            ]
          : []),
      ]
    : [
        { icon: Activity, text: "Se încarcă statisticile live...", color: "text-[var(--color-text-muted)]" },
      ];

  return (
    <section
      aria-label="Statistici live Civia"
      className="bg-[var(--color-surface)] border-b border-[var(--color-border)] overflow-hidden"
      style={{ minHeight: "44px" }}
    >
      <div className="relative">
        <div className="flex animate-ticker whitespace-nowrap" aria-hidden="true">
          {[...stats, ...stats].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className="flex items-center gap-2 px-6 py-3 text-sm shrink-0 border-r border-[var(--color-border)]"
              >
                <Icon size={16} className={stat.color} aria-hidden="true" />
                <span className="text-[var(--color-text)]">{stat.text}</span>
              </div>
            );
          })}
        </div>
        <div className="sr-only">
          {stats.map((s, i) => (
            <span key={i}>
              {s.text}
              {i < stats.length - 1 ? ". " : ""}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
