"use client";

import { useEffect, useState } from "react";
import { CircleMarker, Popup } from "react-leaflet";
import { AirHeatGrid } from "@/app/aer/AirHeatGrid";
import type { UnifiedSensor, AirDataResponse } from "@/lib/aer/types";
import { getAqiColor } from "@/lib/aer/colors";

export function NationalAqiLayer() {
  const [sensors, setSensors] = useState<UnifiedSensor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/aer")
      .then((r) => r.json())
      .then((j: AirDataResponse) => {
        if (j.sensors) setSensors(j.sensors);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || sensors.length === 0) return null;

  return (
    <>
      {/* Dense heatmap grid — 120×120 = 14,400 points covering all Romania */}
      <AirHeatGrid sensors={sensors} />

      {/* Sensor markers on top */}
      {sensors
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
    </>
  );
}
