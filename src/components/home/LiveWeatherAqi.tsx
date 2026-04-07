"use client";

import { useEffect, useState } from "react";
import { Wind, Droplets, Thermometer, Wind as WindIcon } from "lucide-react";
import { useCountyOptional } from "@/lib/county-context";

interface Weather {
  temp: number;
  feels_like: number;
  humidity: number | null;
  wind: number | null;
  code: number | null;
}

interface Aqi {
  aqi: number;
  quality: string;
}

// WMO weather codes → emoji + label (Romanian)
function weatherIcon(code: number | null): { emoji: string; label: string } {
  if (code === null) return { emoji: "☁️", label: "Cer" };
  if (code === 0) return { emoji: "☀️", label: "Senin" };
  if ([1, 2].includes(code)) return { emoji: "🌤️", label: "Parțial noros" };
  if (code === 3) return { emoji: "☁️", label: "Înorat" };
  if ([45, 48].includes(code)) return { emoji: "🌫️", label: "Ceață" };
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return { emoji: "🌧️", label: "Ploaie" };
  if ([66, 67, 71, 73, 75, 77, 85, 86].includes(code)) return { emoji: "🌨️", label: "Ninsoare" };
  if ([95, 96, 99].includes(code)) return { emoji: "⛈️", label: "Furtună" };
  return { emoji: "☁️", label: "Cer" };
}

function aqiColor(aqi: number): string {
  if (aqi <= 50) return "#059669";
  if (aqi < 80) return "#EAB308";
  if (aqi < 100) return "#F97316";
  return "#DC2626";
}

export function LiveWeatherAqi() {
  const county = useCountyOptional();
  const [weather, setWeather] = useState<Weather | null>(null);
  const [aqi, setAqi] = useState<Aqi | null>(null);

  useEffect(() => {
    const params = county?.center
      ? `?lat=${county.center[0]}&lng=${county.center[1]}`
      : "";
    const load = () => {
      Promise.all([
        fetch(`/api/weather${params}`).then((r) => r.json()).catch(() => null),
        fetch("/api/statistici/aqi").then((r) => r.json()).catch(() => null),
      ]).then(([w, a]) => {
        if (w?.data) setWeather(w.data);
        if (a?.data && a.data.aqi != null) setAqi({ aqi: a.data.aqi, quality: a.data.quality ?? "Moderat" });
      });
    };
    load();
    const id = setInterval(load, 10 * 60 * 1000);
    return () => clearInterval(id);
  }, [county]);

  if (!weather && !aqi) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs text-[var(--color-text-muted)]">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Se încarcă...
      </div>
    );
  }

  const wi = weatherIcon(weather?.code ?? null);

  return (
    <div className="inline-flex items-center gap-1 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-full px-3 py-1.5 text-xs font-medium">
      {weather && (
        <>
          <span className="text-base leading-none" title={wi.label}>{wi.emoji}</span>
          <span className="font-bold text-[var(--color-text)]">{weather.temp}°</span>
          {weather.feels_like !== weather.temp && (
            <span className="text-[10px] text-[var(--color-text-muted)]">
              resimțit {weather.feels_like}°
            </span>
          )}
        </>
      )}
      {weather && aqi && <span className="text-[var(--color-border)]">·</span>}
      {aqi && (
        <>
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: aqiColor(aqi.aqi) }}
            aria-hidden
          />
          <span className="text-[var(--color-text)]">AQI {aqi.aqi}</span>
        </>
      )}
    </div>
  );
}

// Larger version for homepage use
export function LiveWeatherCard() {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [aqi, setAqi] = useState<Aqi | null>(null);

  useEffect(() => {
    const load = () => {
      Promise.all([
        fetch("/api/weather").then((r) => r.json()).catch(() => null),
        fetch("/api/statistici/aqi").then((r) => r.json()).catch(() => null),
      ]).then(([w, a]) => {
        if (w?.data) setWeather(w.data);
        if (a?.data && a.data.aqi != null) setAqi({ aqi: a.data.aqi, quality: a.data.quality ?? "Moderat" });
      });
    };
    load();
    const id = setInterval(load, 10 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const wi = weatherIcon(weather?.code ?? null);

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">
            București · acum
          </p>
          <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
            se actualizează la 10 min
          </p>
        </div>
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mt-1" aria-label="live" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[var(--color-surface-2)] rounded-[8px] p-3">
          <div className="flex items-center gap-2 text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-semibold mb-1">
            <Thermometer size={12} /> Temperatura
          </div>
          <p className="text-2xl font-bold flex items-baseline gap-1">
            {weather ? <>{weather.temp}°<span className="text-sm font-normal text-[var(--color-text-muted)]">C</span></> : "—"}
          </p>
          {weather && (
            <p className="text-[10px] text-[var(--color-text-muted)] mt-1">
              {wi.emoji} {wi.label} · resimțit {weather.feels_like}°
            </p>
          )}
        </div>
        <div className="bg-[var(--color-surface-2)] rounded-[8px] p-3">
          <div className="flex items-center gap-2 text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-semibold mb-1">
            <Wind size={12} /> Calitate aer
          </div>
          <p className="text-2xl font-bold flex items-baseline gap-1" style={{ color: aqi ? aqiColor(aqi.aqi) : undefined }}>
            {aqi ? <>{aqi.aqi}<span className="text-sm font-normal text-[var(--color-text-muted)]">AQI</span></> : "—"}
          </p>
          {aqi && (
            <p className="text-[10px] text-[var(--color-text-muted)] mt-1">{aqi.quality}</p>
          )}
        </div>
        {weather?.humidity != null && (
          <div className="bg-[var(--color-surface-2)] rounded-[8px] p-3">
            <div className="flex items-center gap-2 text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-semibold mb-1">
              <Droplets size={12} /> Umiditate
            </div>
            <p className="text-xl font-bold">{weather.humidity}%</p>
          </div>
        )}
        {weather?.wind != null && (
          <div className="bg-[var(--color-surface-2)] rounded-[8px] p-3">
            <div className="flex items-center gap-2 text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-semibold mb-1">
              <WindIcon size={12} /> Vânt
            </div>
            <p className="text-xl font-bold">{weather.wind} <span className="text-xs font-normal text-[var(--color-text-muted)]">km/h</span></p>
          </div>
        )}
      </div>
      <p className="text-[9px] text-[var(--color-text-muted)] mt-3 text-center">
        Date: open-meteo.com · aqi.openaq.org
      </p>
    </div>
  );
}
