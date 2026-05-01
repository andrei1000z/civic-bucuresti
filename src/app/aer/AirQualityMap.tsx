"use client";

import { useEffect, useState, useCallback } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { RefreshCw, Layers, Navigation, X, Flame } from "lucide-react";
import type { UnifiedSensor, AirDataResponse } from "@/lib/aer/types";
import {
  getAqiColor,
  getAqiLevel,
  AQI_LEVELS,
  aqiFromPm25,
  aqiFromPm10,
} from "@/lib/aer/colors";

type Pollutant = "aqi" | "pm25" | "pm10";

/**
 * AQI value that drives marker color + popup highlight, picked
 * according to the user's pollutant selector. Falls back to the
 * raw AQI field when the chosen pollutant isn't reported by the
 * sensor — keeps the heatmap continuous instead of leaving holes
 * around stations that only publish one of the two fractions.
 */
function aqiFor(
  sensor: { aqi: number | null; pm25: number | null; pm10: number | null },
  pollutant: Pollutant,
): number | null {
  if (pollutant === "pm25") return aqiFromPm25(sensor.pm25) ?? sensor.aqi;
  if (pollutant === "pm10") return aqiFromPm10(sensor.pm10) ?? sensor.aqi;
  return sensor.aqi;
}
import { RO_CENTER, DEFAULT_ZOOM, REFRESH_INTERVAL } from "@/lib/aer/constants";
import { AirHeatGrid, type EstimationCell } from "./AirHeatGrid";

interface FireDetection {
  id: string;
  lat: number;
  lng: number;
  brightness: number | null;
  frp: number | null;
  confidence: "low" | "nominal" | "high" | "unknown";
  acquiredAt: string;
  daynight: "D" | "N" | null;
  instrument: string;
  satellite: string;
}

interface FiresResponse {
  fires: FireDetection[];
  meta: {
    total: number;
    lastUpdate: string;
  };
}

// Confidence → color so the eye separates a stray cooking-fire detection
// from a likely real wildfire. High = solid red, low = orange-amber.
function fireColor(c: FireDetection["confidence"]): string {
  switch (c) {
    case "high":
      return "#DC2626";
    case "nominal":
      return "#F97316";
    case "low":
      return "#EAB308";
    default:
      return "#94A3B8";
  }
}

function FlyToLocation({ target }: { target: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo(target, 12, { duration: 1 });
  }, [target, map]);
  return null;
}

export default function AirQualityMap({
  initialCenter,
  initialZoom,
}: {
  initialCenter?: [number, number];
  initialZoom?: number;
} = {}) {
  const [sensors, setSensors] = useState<UnifiedSensor[]>([]);
  const [meta, setMeta] = useState<AirDataResponse["meta"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null);
  const [selectedPollutant, setSelectedPollutant] = useState<Pollutant>("aqi");
  const [showSources, setShowSources] = useState<Record<string, boolean>>({
    "sensor-community": true,
    openaq: true,
    waqi: true,
    uradmonitor: true,
  });
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showMarkers, setShowMarkers] = useState(true);
  // Fires from NASA FIRMS (VIIRS, last 24h). Same red flame markers
  // visible on iqair.com/romania. Loaded in parallel with sensors.
  const [fires, setFires] = useState<FireDetection[]>([]);
  const [showFires, setShowFires] = useState(true);
  // AI-augmented estimation grid covering all of Romania (≈400 cells
  // at 0.25°). Fed to AirHeatGrid as a fallback so regions with no
  // real sensor in range still get a reasonable color instead of
  // staying transparent.
  const [estimationCells, setEstimationCells] = useState<EstimationCell[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const [aerRes, firesRes, gridRes] = await Promise.all([
        fetch("/api/aer"),
        fetch("/api/aer/fires").catch(() => null),
        fetch("/api/aer/grid").catch(() => null),
      ]);
      if (aerRes.ok) {
        const data = (await aerRes.json()) as AirDataResponse;
        setSensors(data.sensors);
        setMeta(data.meta);
        setLastFetch(new Date());
      }
      if (firesRes && firesRes.ok) {
        const fdata = (await firesRes.json()) as FiresResponse;
        setFires(fdata.fires);
      }
      if (gridRes && gridRes.ok) {
        const gdata = (await gridRes.json()) as { cells: EstimationCell[] };
        setEstimationCells(gdata.cells);
      }
    } catch {
      // network — keep stale data visible, next tick will retry
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Only poll while the tab is visible. Previously the setInterval
    // fired every REFRESH_INTERVAL ms (≥1 min) regardless — a mobile
    // user who pinned the tab in the background burned battery + ate
    // their mobile data plan on refresh calls they'd never see.
    let id: ReturnType<typeof setInterval> | null = null;
    const start = () => {
      if (id) return;
      id = setInterval(fetchData, REFRESH_INTERVAL);
    };
    const stop = () => {
      if (!id) return;
      clearInterval(id);
      id = null;
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        start();
        // One catch-up fetch on becoming visible again so the map
        // doesn't display data that's 10+ minutes stale.
        fetchData();
      } else {
        stop();
      }
    };
    if (document.visibilityState === "visible") start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [fetchData]);

  const handleLocate = () => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setFlyTarget([pos.coords.latitude, pos.coords.longitude]),
      () => {},
      { timeout: 8000 }
    );
  };

  const filteredSensors = sensors.filter((s) => showSources[s.source] !== false);

  // Top 10 most polluted, ranked by whichever pollutant the user has
  // selected. Falls through to raw AQI when the chosen fraction isn't
  // reported, mirroring marker-color behaviour.
  const top10 = [...filteredSensors]
    .map((s) => ({ sensor: s, aqi: aqiFor(s, selectedPollutant) }))
    .filter((x) => x.aqi != null)
    .sort((a, b) => (b.aqi ?? 0) - (a.aqi ?? 0))
    .slice(0, 10);

  return (
    <div className="flex h-full relative">
      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer
          center={initialCenter ?? RO_CENTER}
          zoom={initialZoom ?? DEFAULT_ZOOM}
          className="w-full h-full"
          zoomControl={true}
          scrollWheelZoom={true}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
          />
          <FlyToLocation target={flyTarget} />

          {/* Heatmap grid layer (below markers). Sensor IDW for
              high-resolution accuracy where coverage is dense; the
              estimation grid fills the gaps so the whole country
              gets colored instead of leaving big transparent
              regions. */}
          {showHeatmap && filteredSensors.length > 0 && (
            <AirHeatGrid
              sensors={filteredSensors}
              estimationCells={estimationCells}
            />
          )}

          {/* Station markers — colored by the user-selected pollutant
              (AQI, PM2.5, or PM10). Official sensors get a larger
              radius so a single .gov.ro station isn't lost in a sea of
              hobbyist Sensor.Community dots. The previously-shipped
              "always-on dot" loop was a duplicate render that ignored
              the visibility toggle and stacked another circle on top
              of every marker; removed. */}
          {showMarkers && filteredSensors.map((sensor) => {
            const aqi = aqiFor(sensor, selectedPollutant);
            const color = getAqiColor(aqi);
            const radius = sensor.isOfficial ? 8 : 5;
            const pollutantLabel =
              selectedPollutant === "pm25"
                ? "PM2.5 AQI"
                : selectedPollutant === "pm10"
                ? "PM10 AQI"
                : "AQI";

            return (
              <CircleMarker
                key={sensor.id}
                center={[sensor.lat, sensor.lng]}
                radius={radius}
                pathOptions={{
                  color: "#fff",
                  weight: 2,
                  fillColor: color,
                  fillOpacity: 0.85,
                }}
              >
                <Popup maxWidth={280}>
                  <div className="text-xs space-y-2 min-w-[200px]">
                    <div className="flex items-center justify-between">
                      <span
                        className="inline-block px-2 py-0.5 rounded-full text-white font-bold text-xs"
                        style={{ backgroundColor: color }}
                      >
                        {pollutantLabel} {aqi ?? "—"}
                      </span>
                      <span className="text-[10px] text-[var(--color-text-muted)] capitalize">{sensor.source}</span>
                    </div>
                    {sensor.stationName && (
                      <p className="font-semibold text-sm">{sensor.stationName}</p>
                    )}
                    <div className="grid grid-cols-2 gap-1 text-[11px]">
                      {sensor.pm25 != null && <span>PM2.5: <strong>{sensor.pm25.toFixed(1)}</strong> µg/m³</span>}
                      {sensor.pm10 != null && <span>PM10: <strong>{sensor.pm10.toFixed(1)}</strong> µg/m³</span>}
                      {sensor.no2 != null && <span>NO₂: <strong>{sensor.no2.toFixed(1)}</strong></span>}
                      {sensor.o3 != null && <span>O₃: <strong>{sensor.o3.toFixed(1)}</strong></span>}
                      {sensor.temperature != null && <span>🌡️ {sensor.temperature.toFixed(1)}°C</span>}
                      {sensor.humidity != null && <span>💧 {sensor.humidity.toFixed(0)}%</span>}
                    </div>
                    {sensor.sensorType && (
                      <p className="text-[10px] text-[var(--color-text-muted)]">Senzor: {sensor.sensorType}</p>
                    )}
                    <p className="text-[10px] text-[var(--color-text-muted)]">
                      Actualizat: {new Date(sensor.updatedAt).toLocaleTimeString("ro-RO")}
                    </p>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}

          {/* Active fires from NASA FIRMS (Suomi NPP / VIIRS, last 24h).
              Stacked over sensors so a wildfire near a sensor still
              reads as a wildfire, not as bad PM2.5 ambiguity. */}
          {showFires &&
            fires.map((fire) => {
              const c = fireColor(fire.confidence);
              return (
                <CircleMarker
                  key={fire.id}
                  center={[fire.lat, fire.lng]}
                  radius={fire.confidence === "high" ? 9 : 7}
                  pathOptions={{
                    color: "#fff",
                    weight: 2,
                    fillColor: c,
                    fillOpacity: 0.85,
                  }}
                >
                  <Popup>
                    <div className="min-w-[220px]">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className="w-7 h-7 rounded-full grid place-items-center text-white shrink-0"
                          style={{ backgroundColor: c }}
                          aria-hidden="true"
                        >
                          <Flame size={14} />
                        </span>
                        <div className="min-w-0">
                          <p className="font-bold text-sm">Incendiu activ</p>
                          <p className="text-[10px] uppercase tracking-wider text-slate-500">
                            Încredere{" "}
                            {fire.confidence === "high"
                              ? "ridicată"
                              : fire.confidence === "nominal"
                              ? "normală"
                              : fire.confidence === "low"
                              ? "scăzută"
                              : "necunoscută"}
                          </p>
                        </div>
                      </div>
                      <dl className="text-xs space-y-1 text-slate-700">
                        {fire.frp !== null && (
                          <div className="flex justify-between gap-3">
                            <dt className="text-slate-500">Putere radiată</dt>
                            <dd className="font-semibold tabular-nums">
                              {fire.frp.toFixed(1)} MW
                            </dd>
                          </div>
                        )}
                        {fire.brightness !== null && (
                          <div className="flex justify-between gap-3">
                            <dt className="text-slate-500">Temperatură</dt>
                            <dd className="font-semibold tabular-nums">
                              {fire.brightness.toFixed(0)} K
                            </dd>
                          </div>
                        )}
                        <div className="flex justify-between gap-3">
                          <dt className="text-slate-500">Detectat</dt>
                          <dd className="font-semibold tabular-nums">
                            <time dateTime={fire.acquiredAt}>
                              {new Date(fire.acquiredAt).toLocaleString("ro-RO", {
                                timeZone: "Europe/Bucharest",
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </time>{" "}
                            {fire.daynight === "N" ? "🌙" : "☀️"}
                          </dd>
                        </div>
                        <div className="flex justify-between gap-3">
                          <dt className="text-slate-500">Sursă</dt>
                          <dd className="font-semibold">NASA FIRMS · {fire.instrument}</dd>
                        </div>
                      </dl>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
        </MapContainer>

        {/* Overlay controls */}
        <div className="absolute top-4 left-14 z-[var(--z-fab)] flex gap-2">
          <button
            onClick={handleLocate}
            className="h-10 w-10 rounded-[var(--radius-xs)] bg-[var(--color-surface)] border border-[var(--color-border)] shadow-md flex items-center justify-center hover:bg-[var(--color-surface-2)]"
            title="Locația mea"
          >
            <Navigation size={16} />
          </button>
          <button
            onClick={fetchData}
            disabled={loading}
            className="h-10 px-3 rounded-[var(--radius-xs)] bg-[var(--color-surface)] border border-[var(--color-border)] shadow-md flex items-center gap-2 text-xs font-medium hover:bg-[var(--color-surface-2)] disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => setShowFires((v) => !v)}
            aria-pressed={showFires}
            className={`h-10 px-3 rounded-[var(--radius-xs)] shadow-md flex items-center gap-2 text-xs font-medium transition-colors ${
              showFires
                ? "bg-rose-500 text-white border border-rose-600 hover:bg-rose-600"
                : "bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] hover:bg-[var(--color-surface-2)]"
            }`}
            title={
              showFires
                ? `Ascunde incendiile NASA FIRMS · ${fires.length} active`
                : "Afișează incendiile active din ultimele 24h"
            }
          >
            <Flame size={14} className={showFires ? "" : "text-rose-500"} />
            <span className="tabular-nums">{fires.length}</span>
          </button>
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="h-10 w-10 rounded-[var(--radius-xs)] bg-[var(--color-surface)] border border-[var(--color-border)] shadow-md flex items-center justify-center hover:bg-[var(--color-surface-2)] lg:hidden"
          >
            <Layers size={16} />
          </button>
        </div>

        {/* Loading indicator */}
        {loading && sensors.length === 0 && (
          <div className="absolute inset-0 z-[30] flex items-center justify-center bg-black/20 backdrop-blur-sm">
            <div className="bg-[var(--color-surface)] rounded-[var(--radius-md)] p-6 shadow-xl text-center">
              <RefreshCw size={24} className="animate-spin mx-auto mb-3 text-[var(--color-primary)]" />
              <p className="text-sm font-medium">Se încarcă senzorii...</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">Agregăm date din mai multe surse</p>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        } fixed right-0 top-16 bottom-0 w-[340px] lg:w-[360px] lg:relative lg:translate-x-0 z-[45] bg-[var(--color-surface)] border-l border-[var(--color-border)] overflow-y-auto transition-transform duration-200`}
      >
        <div className="p-5 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-[family-name:var(--font-sora)] font-bold text-lg">Calitatea aerului</h2>
              <p className="text-xs text-[var(--color-text-muted)]">
                {meta ? `${meta.total} senzori · AQI mediu: ${meta.avgAqi ?? "—"}` : "Se încarcă..."}
              </p>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
              <X size={18} />
            </button>
          </div>

          {/* AQI Overview */}
          {meta?.avgAqi != null && (
            <div
              className="rounded-[var(--radius-md)] p-4 text-center"
              style={{ backgroundColor: `${getAqiColor(meta.avgAqi)}20` }}
            >
              <p className="text-4xl font-bold" style={{ color: getAqiColor(meta.avgAqi) }}>
                {meta.avgAqi}
              </p>
              <p className="text-sm font-medium mt-1">{getAqiLevel(meta.avgAqi).label}</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">Media România</p>
            </div>
          )}

          {/* Pollutant selector */}
          <div>
            <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
              Colorează după
            </p>
            <div className="flex gap-1">
              {(["aqi", "pm25", "pm10"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedPollutant(p)}
                  className={`flex-1 h-8 rounded-[6px] text-xs font-medium transition-colors ${
                    selectedPollutant === p
                      ? "bg-[var(--color-primary)] text-white"
                      : "bg-[var(--color-surface-2)] text-[var(--color-text-muted)]"
                  }`}
                >
                  {p === "aqi" ? "AQI" : p === "pm25" ? "PM2.5" : "PM10"}
                </button>
              ))}
            </div>
          </div>

          {/* Layer toggles */}
          <div>
            <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
              Straturi
            </p>
            <div className="space-y-2 mb-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={showHeatmap} onChange={(e) => setShowHeatmap(e.target.checked)} className="w-4 h-4 rounded accent-[var(--color-primary)]" />
                <span className="text-sm flex-1">Heatmap interpolare</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={showMarkers} onChange={(e) => setShowMarkers(e.target.checked)} className="w-4 h-4 rounded accent-[var(--color-primary)]" />
                <span className="text-sm flex-1">Markere senzori</span>
              </label>
            </div>
          </div>

          {/* Source toggles — only sources that have at least one
              live sensor right now. Hiding zero-count rows ("Openaq 0",
              "Uradmonitor 0") keeps the panel honest; an upstream
              with no readable stations isn't a useful filter and
              makes the page look broken. */}
          <div>
            <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
              Surse de date
            </p>
            <div className="space-y-2">
              {Object.entries(meta?.bySource ?? {})
                .filter(([, count]) => (count ?? 0) > 0)
                .map(([source, count]) => (
                  <label key={source} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showSources[source] !== false}
                      onChange={(e) => setShowSources((prev) => ({ ...prev, [source]: e.target.checked }))}
                      className="w-4 h-4 rounded accent-[var(--color-primary)]"
                    />
                    <span className="text-sm flex-1 capitalize">{source.replace("-", " ")}</span>
                    <span className="text-xs text-[var(--color-text-muted)]">{count}</span>
                  </label>
                ))}
            </div>
          </div>

          {/* Legend */}
          <div>
            <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
              Legendă AQI
            </p>
            <div className="space-y-1">
              {AQI_LEVELS.map((level) => (
                <div key={level.min} className="flex items-center gap-2 text-xs">
                  <span
                    className="w-4 h-4 rounded-full shrink-0"
                    style={{ backgroundColor: level.color }}
                  />
                  <span className="flex-1">{level.label}</span>
                  <span className="text-[var(--color-text-muted)]">
                    {level.min}–{level.max}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top 10 most polluted */}
          {top10.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
                Top 10 — Cei mai poluați
              </p>
              <div className="space-y-1">
                {top10.map(({ sensor: s, aqi }, i) => (
                  <button
                    key={s.id}
                    onClick={() => setFlyTarget([s.lat, s.lng])}
                    className="w-full flex items-center gap-2 p-2 rounded-[6px] hover:bg-[var(--color-surface-2)] transition-colors text-left"
                  >
                    <span className="text-xs font-bold text-[var(--color-text-muted)] w-5">{i + 1}.</span>
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: getAqiColor(aqi) }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">
                        {s.stationName || `${s.lat.toFixed(2)}, ${s.lng.toFixed(2)}`}
                      </p>
                      <p className="text-[10px] text-[var(--color-text-muted)] capitalize">{s.source}</p>
                    </div>
                    <span className="text-xs font-bold" style={{ color: getAqiColor(aqi) }}>
                      {aqi}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Last update */}
          <div className="pt-3 border-t border-[var(--color-border)]">
            <p className="text-[10px] text-[var(--color-text-muted)] text-center">
              Actualizat: {lastFetch?.toLocaleTimeString("ro-RO") ?? "—"}
              <br />
              Se reîmprospătează automat la 5 minute
            </p>
            <p className="text-[9px] text-[var(--color-text-muted)] text-center mt-2">
              Date: Sensor.Community · OpenAQ · WAQI/AQICN
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
