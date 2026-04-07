"use client";

import { useEffect, useState } from "react";
import { CircleMarker, Popup } from "react-leaflet";

interface Sensor {
  id: string;
  lat: number;
  lng: number;
  aqi: number | null;
  pm25: number | null;
  pm10: number | null;
  source: string;
}

function aqiColor(aqi: number): string {
  if (aqi <= 50) return "#059669";
  if (aqi <= 100) return "#EAB308";
  if (aqi <= 150) return "#F97316";
  return "#DC2626";
}

function aqiLabel(aqi: number): string {
  if (aqi <= 50) return "Bun";
  if (aqi <= 100) return "Moderat";
  if (aqi <= 150) return "Nesănătos (grupe sensibile)";
  return "Nesănătos";
}

export function NationalAqiLayer() {
  const [sensors, setSensors] = useState<Sensor[]>([]);

  useEffect(() => {
    fetch("/api/aer")
      .then((r) => r.json())
      .then((j) => {
        if (j.sensors) setSensors(j.sensors);
      })
      .catch(() => {});
  }, []);

  return (
    <>
      {sensors
        .filter((s) => s.aqi != null)
        .map((s) => (
          <CircleMarker
            key={s.id}
            center={[s.lat, s.lng]}
            radius={8}
            pathOptions={{
              fillColor: aqiColor(s.aqi!),
              fillOpacity: 0.8,
              color: aqiColor(s.aqi!),
              weight: 1,
              opacity: 0.9,
            }}
          >
            <Popup>
              <div style={{ minWidth: 150 }}>
                <b>AQI: {Math.round(s.aqi!)}</b> — {aqiLabel(s.aqi!)}
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
