"use client";

import dynamic from "next/dynamic";

const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[var(--color-surface-2)] animate-pulse rounded-[var(--radius-md)] flex items-center justify-center">
      <p className="text-[var(--color-text-muted)] text-sm">Se încarcă harta...</p>
    </div>
  ),
});

const EvenimentMarker = dynamic(() => import("./EvenimentMarker"), { ssr: false });

interface EvenimentMapProps {
  coords: [number, number];
  label: string;
  color: string;
  zoom?: number;
  height?: string;
}

export function EvenimentMap({ coords, label, color, zoom = 15, height = "400px" }: EvenimentMapProps) {
  return (
    <div
      style={{ height }}
      className="w-full rounded-[var(--radius-md)] overflow-hidden border border-[var(--color-border)]"
    >
      <LeafletMap center={coords} zoom={zoom}>
        <EvenimentMarker coords={coords} label={label} color={color} />
      </LeafletMap>
    </div>
  );
}
