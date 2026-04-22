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
      const s = summary.data ?? { total: 0, today: 0, inLucru: 0 };
      setData({
        sesizariAzi: s.today,
        sesizariInLucru: s.inLucru,
        aqi: aqi.data?.aqi ?? 65,
        aqiQuality: aqi.data?.quality ?? "Moderat",
        totalSesizari: s.total,
      });
    });
  }, []);

  const stats = data
    ? [
        { icon: AlertCircle, text: `${data.sesizariAzi} sesizări noi azi`, color: "text-red-500" },
        { icon: Clock, text: `${data.sesizariInLucru} în lucru acum`, color: "text-amber-500" },
        { icon: Wind, text: `AQI: ${data.aqi} — ${data.aqiQuality}`, color: "text-sky-500" },
        { icon: Activity, text: `${data.totalSesizari} sesizări totale`, color: "text-emerald-500" },
        { icon: TrendingUp, text: "Live de pe platformă", color: "text-blue-500" },
        { icon: Thermometer, text: "Bucuresti — live", color: "text-purple-500" },
      ]
    : [
        { icon: AlertCircle, text: "Se încarcă date live...", color: "text-gray-400" },
      ];

  return (
    <section className="bg-[var(--color-surface)] border-b border-[var(--color-border)] overflow-hidden">
      <div className="relative">
        <div className="flex animate-ticker whitespace-nowrap">
          {[...stats, ...stats].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className="flex items-center gap-2 px-6 py-3 text-sm shrink-0 border-r border-[var(--color-border)]"
              >
                <Icon size={16} className={stat.color} />
                <span className="text-[var(--color-text)]">{stat.text}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
