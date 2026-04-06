"use client";

import { useEffect, useState } from "react";
import { Circle } from "react-leaflet";

/**
 * Heatmap of sesizari density. Fetches all public sesizari coords,
 * bins them into a grid, and renders density circles.
 */
export function SesizariHeatLayer() {
  const [cells, setCells] = useState<{ lat: number; lng: number; count: number }[]>([]);

  useEffect(() => {
    fetch("/api/public/sesizari?limit=500")
      .then((r) => r.json())
      .then((j) => {
        const rows = (j.data ?? []) as { lat: number; lng: number }[];
        if (rows.length === 0) return;

        // Bin into 0.005° grid (~500m cells)
        const bins = new Map<string, { lat: number; lng: number; count: number }>();
        for (const r of rows) {
          const latBin = Math.round(r.lat / 0.005) * 0.005;
          const lngBin = Math.round(r.lng / 0.005) * 0.005;
          const key = `${latBin.toFixed(4)},${lngBin.toFixed(4)}`;
          const existing = bins.get(key);
          if (existing) {
            existing.count++;
          } else {
            bins.set(key, { lat: latBin, lng: lngBin, count: 1 });
          }
        }
        setCells(Array.from(bins.values()));
      })
      .catch(() => {});
  }, []);

  if (cells.length === 0) return null;

  const maxCount = Math.max(...cells.map((c) => c.count));

  return (
    <>
      {cells.map((c, i) => {
        const intensity = c.count / maxCount;
        const color = intensity > 0.7 ? "#DC2626" : intensity > 0.4 ? "#F97316" : intensity > 0.2 ? "#EAB308" : "#3b82f6";
        return (
          <Circle
            key={i}
            center={[c.lat, c.lng]}
            radius={250 + intensity * 300}
            pathOptions={{
              color,
              fillColor: color,
              fillOpacity: 0.15 + intensity * 0.35,
              weight: 0,
              stroke: false,
            }}
          />
        );
      })}
    </>
  );
}
