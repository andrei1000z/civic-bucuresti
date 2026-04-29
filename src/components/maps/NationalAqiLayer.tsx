"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CircleMarker, Popup, useMapEvent } from "react-leaflet";
import { Map as LeafletMap } from "leaflet";
import { AirHeatGrid } from "@/app/aer/AirHeatGrid";
import type { UnifiedSensor, AirDataResponse } from "@/lib/aer/types";
import { getAqiColor } from "@/lib/aer/colors";

interface Props {
  /** When set, the heatmap is clipped to this lat/lng box and only
   *  sensors inside (with a small 0.3° buffer) are drawn. Used to
   *  render only the active county on /[judet]/harti. */
  clipBounds?: [[number, number], [number, number]];
  /** Display name of the active county — used in the zoom-out CTA. */
  countyName?: string;
}

export function NationalAqiLayer({ clipBounds, countyName }: Props) {
  const [sensors, setSensors] = useState<UnifiedSensor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ctrl = new AbortController();
    fetch("/api/aer", { signal: ctrl.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((j: AirDataResponse) => {
        if (j.sensors) setSensors(j.sensors);
      })
      .catch(() => {
        // Swallow — best-effort overlay; UI stays clean.
      })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, []);

  if (loading || sensors.length === 0) return null;

  // Filter sensors to a buffered version of clipBounds so the IDW edges
  // smooth across the county boundary without flat horizontal cutoffs.
  const visibleSensors = clipBounds
    ? sensors.filter((s) => {
        const [[latMin, lngMin], [latMax, lngMax]] = clipBounds;
        const buf = 0.3; // ~33km buffer
        return (
          s.lat >= latMin - buf &&
          s.lat <= latMax + buf &&
          s.lng >= lngMin - buf &&
          s.lng <= lngMax + buf
        );
      })
    : sensors;

  return (
    <>
      <AirHeatGrid sensors={visibleSensors} clipBounds={clipBounds} />

      {/* Sensor markers on top */}
      {visibleSensors
        .filter((s) => s.aqi != null)
        .map((s) => (
          <CircleMarker
            key={s.id}
            center={[s.lat, s.lng]}
            radius={3}
            pathOptions={{
              fillColor: getAqiColor(s.aqi!),
              fillOpacity: 1,
              color: "#fff",
              weight: 0.5,
              opacity: 0.6,
            }}
          >
            <Popup>
              <div style={{ minWidth: 150 }}>
                <b>AQI: {Math.round(s.aqi!)}</b>
                <br />
                <span style={{ fontSize: 11, color: "#64748b" }}>
                  {s.pm25 != null && `PM2.5: ${s.pm25.toFixed(1)} · `}
                  {s.pm10 != null && `PM10: ${s.pm10.toFixed(1)}`}
                </span>
                <br />
                <span style={{ fontSize: 10, color: "#94a3b8" }}>{s.source}</span>
              </div>
            </Popup>
          </CircleMarker>
        ))}

      {/* Zoom-out CTA — surfaces only when we're county-scoped and the
          user has zoomed out enough that the heatmap looks like a small
          colored island in a sea of grey. Click takes them to /harti. */}
      {clipBounds && <ZoomOutCta countyName={countyName} />}
    </>
  );
}

function ZoomOutCta({ countyName }: { countyName?: string }) {
  const [show, setShow] = useState(false);

  // Listen to zoom changes — show CTA when zoomed out below 8 (county-
  // level views are 10+, so 8 means user is panning out toward Romania).
  useMapEvent("zoomend", (e) => {
    const map = (e.target as unknown) as LeafletMap;
    setShow(map.getZoom() <= 8);
  });

  if (!show) return null;

  return (
    <div className="leaflet-top leaflet-right pointer-events-none" style={{ marginTop: 70 }}>
      <div className="leaflet-control pointer-events-auto">
        <Link
          href="/harti"
          className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-white/85 dark:bg-black/65 backdrop-blur-xl ring-1 ring-white/40 ring-inset shadow-[0_8px_24px_-6px_rgba(0,0,0,0.35)] text-xs font-semibold text-[var(--color-text)] hover:bg-white dark:hover:bg-black/80 transition-colors"
        >
          <span aria-hidden="true">🇷🇴</span>
          Vezi calitatea aerului pe toată țara{countyName ? ` (acum: ${countyName})` : ""}
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
}
