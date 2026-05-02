"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const AirQualityMap = dynamic(() => import("./AirQualityMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--color-surface-2)] via-[var(--color-surface)] to-[var(--color-surface-2)]" role="status" aria-live="polite">
      <div className="text-center">
        <Loader2 size={28} className="motion-safe:animate-spin mx-auto mb-3 text-[var(--color-primary)]" aria-hidden="true" />
        <p className="text-sm text-[var(--color-text-muted)]">Se încarcă harta calității aerului…</p>
      </div>
    </div>
  ),
});

export function AerMapWrapper({
  initialCenter,
  initialZoom,
}: {
  initialCenter?: [number, number];
  initialZoom?: number;
} = {}) {
  return <AirQualityMap initialCenter={initialCenter} initialZoom={initialZoom} />;
}
