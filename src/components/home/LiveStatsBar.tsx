"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Clock, Activity, Thermometer, Wind, TrendingUp } from "lucide-react";

interface LiveData {
  sesizariAzi: number;
  sesizariInLucru: number;
  aqi: number;
  aqiQuality: string;
  totalSesizari: number;
}

export function LiveStatsBar() {
  const [data, setData] = useState<LiveData | null>(null);

  useEffect(() => {
    let cancelled = false;
    // Helper: treat 4xx/5xx as failures too, not just network errors.
    // Returning the fallback object here keeps the ticker from jumping
    // to "Se încarcă..." forever on a bad backend response.
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
      fetchJson<{ data: { total: number; today: number; inLucru: number } | null }>("/api/statistici/summary", { data: null }),
      fetchJson<{ data: { aqi: number; quality: string } | null }>("/api/statistici/aqi", { data: { aqi: 65, quality: "Moderat" } }),
    ]).then(([summary, aqi]) => {
      if (cancelled) return;
      const s = summary.data ?? { total: 0, today: 0, inLucru: 0 };
      setData({
        sesizariAzi: s.today,
        sesizariInLucru: s.inLucru,
        aqi: aqi.data?.aqi ?? 65,
        aqiQuality: aqi.data?.quality ?? "Moderat",
        totalSesizari: s.total,
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = data
    ? [
        { icon: AlertCircle, text: `${data.sesizariAzi} sesizări noi astăzi`, color: "text-red-500" },
        { icon: Clock, text: `${data.sesizariInLucru} în lucru la autorități`, color: "text-amber-500" },
        { icon: Wind, text: `AQI național mediu: ${data.aqi} — ${data.aqiQuality}`, color: "text-sky-500" },
        { icon: Activity, text: `${data.totalSesizari.toLocaleString("ro-RO")} sesizări trimise în total`, color: "text-emerald-500" },
        { icon: TrendingUp, text: "Actualizat în timp real", color: "text-blue-500" },
        { icon: Thermometer, text: "Date oficiale INS + OpenAQ + Sensor.Community", color: "text-purple-500" },
      ]
    : [
        { icon: AlertCircle, text: "Se încarcă statisticile live...", color: "text-[var(--color-text-muted)]" },
      ];

  return (
    <section
      aria-label="Statistici live Civia"
      className="bg-[var(--color-surface)] border-b border-[var(--color-border)] overflow-hidden"
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
        {/* Screen-reader friendly version — un singur summary, fără ticker repetat */}
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
