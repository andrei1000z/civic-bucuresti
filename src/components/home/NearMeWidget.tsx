"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Navigation, Loader2, AlertCircle } from "lucide-react";
import { STATUS_COLORS, STATUS_LABELS, SESIZARE_TIPURI } from "@/lib/constants";
import { timeAgo } from "@/lib/utils";
import type { SesizareFeedRow } from "@/lib/supabase/types";

/**
 * Compute bounding-box to filter by radius (approx, no PostGIS needed).
 * 1° lat ≈ 111km, 1° lng ≈ 111*cos(lat) km
 */
function boundsFromRadius(lat: number, lng: number, radiusKm: number) {
  const latDelta = radiusKm / 111;
  const lngDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));
  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLng: lng - lngDelta,
    maxLng: lng + lngDelta,
  };
}

function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function NearMeWidget() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nearby, setNearby] = useState<(SesizareFeedRow & { distance: number })[] | null>(null);

  const findNearby = () => {
    if (!("geolocation" in navigator)) {
      setError("Geolocația nu e disponibilă în browserul tău.");
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const bounds = boundsFromRadius(lat, lng, 2); // 2km radius
        try {
          const res = await fetch(`/api/public/sesizari?limit=100`);
          const json = await res.json();
          const rows = (json.data ?? []) as SesizareFeedRow[];
          const withDist = rows
            .filter(
              (r) =>
                r.lat >= bounds.minLat &&
                r.lat <= bounds.maxLat &&
                r.lng >= bounds.minLng &&
                r.lng <= bounds.maxLng
            )
            .map((r) => ({ ...r, distance: distanceKm(lat, lng, r.lat, r.lng) }))
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 5);
          setNearby(withDist);
        } catch {
          setError("Nu s-au putut încărca sesizările.");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setError("Ai refuzat accesul la locație.");
        } else {
          setError("Nu ți-am putut afla locația.");
        }
      },
      { timeout: 10_000, maximumAge: 60_000 }
    );
  };

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="font-[family-name:var(--font-sora)] font-bold text-lg mb-1">
            Sesizări lângă tine
          </h3>
          <p className="text-sm text-[var(--color-text-muted)]">
            Vezi ce raportează cetățenii în raza de 2km.
          </p>
        </div>
        <button
          onClick={findNearby}
          disabled={loading}
          className="shrink-0 inline-flex items-center gap-2 h-9 px-3 rounded-[8px] bg-[var(--color-primary)] text-white text-xs font-medium hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
        >
          {loading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Navigation size={14} />
          )}
          Găsește
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-[8px] bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-sm text-red-700 dark:text-red-400">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {nearby && nearby.length === 0 && !error && (
        <p className="text-sm text-[var(--color-text-muted)] italic">
          Nicio sesizare activă în raza de 2km. Frumos cartier!
        </p>
      )}

      {nearby && nearby.length > 0 && (
        <ul className="space-y-2">
          {nearby.map((s) => {
            const tipIcon = SESIZARE_TIPURI.find((t) => t.value === s.tip)?.icon ?? "📝";
            return (
              <li key={s.id}>
                <Link
                  href={`/sesizari/${s.code}`}
                  className="flex items-start gap-3 p-3 -mx-3 rounded-[8px] hover:bg-[var(--color-surface-2)] transition-colors group"
                >
                  <span
                    className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm"
                    style={{ backgroundColor: `${STATUS_COLORS[s.status]}20` }}
                  >
                    {tipIcon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm line-clamp-1 group-hover:text-[var(--color-primary)] transition-colors">
                      {s.titlu}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] mt-0.5">
                      <MapPin size={10} />
                      <span>{s.distance.toFixed(1)} km</span>
                      <span>·</span>
                      <span>{timeAgo(s.created_at)}</span>
                    </div>
                  </div>
                  <span
                    className="shrink-0 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `${STATUS_COLORS[s.status]}20`,
                      color: STATUS_COLORS[s.status],
                    }}
                  >
                    {STATUS_LABELS[s.status]}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
