"use client";

import dynamic from "next/dynamic";
import { MapPin, Construction } from "lucide-react";

const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[var(--color-surface-2)] animate-pulse flex items-center justify-center">
      <p className="text-[var(--color-text-muted)]">Se încarcă harta...</p>
    </div>
  ),
});

export function CountyMapPlaceholder({
  countyName,
  center,
}: {
  countyName: string;
  center: [number, number];
}) {
  return (
    <div className="relative h-[calc(100vh-64px)]">
      <LeafletMap center={center} zoom={10} />

      {/* Overlay card */}
      <div className="absolute top-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-[1000] bg-[var(--color-surface)]/95 backdrop-blur-md border border-[var(--color-border)] rounded-[12px] p-6 shadow-[var(--shadow-lg)]">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-[var(--color-primary-soft)] flex items-center justify-center">
            <MapPin size={20} className="text-[var(--color-primary)]" />
          </div>
          <div>
            <h2 className="font-[family-name:var(--font-sora)] font-bold text-lg">{countyName}</h2>
            <p className="text-xs text-[var(--color-text-muted)]">Hartă de mobilitate</p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 rounded-[8px] bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
          <Construction size={16} className="text-amber-600 shrink-0" />
          <p className="text-xs text-amber-800 dark:text-amber-300">
            Datele detaliate de mobilitate (piste biciclete, trasee transport public) sunt disponibile momentan doar pentru București.
            Pentru {countyName} este afișată harta de bază OpenStreetMap.
          </p>
        </div>

        <p className="mt-3 text-xs text-[var(--color-text-muted)]">
          Vrei să contribui cu date pentru {countyName}?{" "}
          <a href="https://github.com/andrei1000z/civic-bucuresti" target="_blank" rel="noreferrer" className="text-[var(--color-primary)] hover:underline">
            Află cum
          </a>
        </p>
      </div>
    </div>
  );
}
