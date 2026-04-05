"use client";

import { useEffect, useState } from "react";
import { Wind, Loader2 } from "lucide-react";

interface AqiData {
  aqi: number;
  pm25: number;
  source: string;
  quality: string;
  stations: number;
}

function aqiColor(aqi: number): string {
  if (aqi < 50) return "#059669";
  if (aqi < 100) return "#EAB308";
  if (aqi < 150) return "#F97316";
  if (aqi < 200) return "#DC2626";
  return "#7C2D12";
}

export function LiveAqiWidget({ compact = false }: { compact?: boolean }) {
  const [data, setData] = useState<AqiData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/statistici/aqi")
      .then((r) => r.json())
      .then((j) => setData(j.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-4 flex items-center justify-center min-h-[80px]">
        <Loader2 size={20} className="animate-spin text-[var(--color-text-muted)]" />
      </div>
    );
  }

  if (!data) return null;

  const color = aqiColor(data.aqi);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Wind size={14} style={{ color }} />
        <span className="text-sm font-medium">AQI {data.aqi}</span>
        <span className="text-xs text-[var(--color-text-muted)]">— {data.quality}</span>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-semibold">
          Calitate aer acum
        </p>
        <Wind size={16} style={{ color }} />
      </div>
      <div className="flex items-baseline gap-3">
        <p className="text-4xl font-bold" style={{ color }}>
          {data.aqi}
        </p>
        <p className="text-sm text-[var(--color-text-muted)]">AQI</p>
      </div>
      <p className="text-sm font-medium mt-1" style={{ color }}>
        {data.quality}
      </p>
      <p className="text-xs text-[var(--color-text-muted)] mt-2">
        PM2.5: {data.pm25} µg/m³ · sursa: {data.source}
        {data.stations > 0 && ` · ${data.stations} stații`}
      </p>
    </div>
  );
}
