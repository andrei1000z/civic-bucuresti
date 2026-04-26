"use client";

import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import { useEffect, useMemo, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Locate, Loader2 } from "lucide-react";
import {
  type Interruption,
  TYPE_COLORS,
  TYPE_ICONS,
  TYPE_LABELS,
  STATUS_LABELS,
} from "@/data/intreruperi";

function createIcon(type: Interruption["type"], status: Interruption["status"]): L.DivIcon {
  const color = TYPE_COLORS[type];
  const emoji = TYPE_ICONS[type];
  const pulse = status === "in-desfasurare";
  return L.divIcon({
    html: `<div style="position:relative">
      ${pulse ? `<span style="position:absolute;inset:-8px;border-radius:50%;background:${color};opacity:0.35;animation:cviaPulse 1.6s infinite"></span>` : ""}
      <div style="
        position:relative;
        width:36px;height:36px;
        background:${color};
        border:3px solid white;
        border-radius:50%;
        box-shadow:0 2px 8px rgba(0,0,0,0.3);
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:16px;">${emoji}</div>
    </div>`,
    className: "interruption-marker",
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
}

function createMeIcon(): L.DivIcon {
  return L.divIcon({
    html: `<div style="position:relative;width:20px;height:20px">
      <span style="position:absolute;inset:-10px;border-radius:50%;background:#3B82F6;opacity:0.25;animation:cviaPulse 1.6s infinite"></span>
      <div style="
        position:relative;
        width:20px;height:20px;
        background:#3B82F6;
        border:3px solid white;
        border-radius:50%;
        box-shadow:0 2px 8px rgba(59,130,246,0.5);">
      </div>
    </div>`,
    className: "me-marker",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

function timeRangeLabel(startAt: string, endAt: string): string {
  const s = new Date(startAt);
  const e = new Date(endAt);
  const fmt = (d: Date) =>
    d.toLocaleString("ro-RO", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Bucharest",
    });
  return `${fmt(s)} — ${fmt(e)}`;
}

// Recenter map when user location arrives
function RecenterOn({ coords }: { coords: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (!coords) return;
    map.flyTo(coords, 13, { duration: 0.8 });
  }, [coords, map]);
  return null;
}

// Auto-fit bounds when items change
function FitBounds({ items, me }: { items: Interruption[]; me: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    const withCoords = items.filter(
      (i): i is Interruption & { lat: number; lng: number } =>
        typeof i.lat === "number" && typeof i.lng === "number",
    );
    const points: [number, number][] = withCoords.map((i) => [i.lat, i.lng]);
    if (me) points.push(me);
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0]!, 13);
      return;
    }
    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
  }, [items, me, map]);
  return null;
}

export default function IntreruperiMap({ items }: { items: Interruption[] }) {
  const [me, setMe] = useState<[number, number] | null>(null);
  const [meAccuracy, setMeAccuracy] = useState<number | null>(null);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);

  const withCoords = useMemo(
    () =>
      items.filter(
        (i): i is Interruption & { lat: number; lng: number } =>
          typeof i.lat === "number" && typeof i.lng === "number",
      ),
    [items],
  );

  const center = useMemo<[number, number]>(() => {
    if (me) return me;
    if (withCoords.length === 0) return [45.9432, 24.9668];
    const sum = withCoords.reduce(
      (acc, i) => ({ lat: acc.lat + i.lat, lng: acc.lng + i.lng }),
      { lat: 0, lng: 0 },
    );
    return [sum.lat / withCoords.length, sum.lng / withCoords.length];
  }, [withCoords, me]);

  const zoom = withCoords.length > 1 ? 7 : 13;

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocateError("GPS indisponibil în browser");
      return;
    }
    setLocating(true);
    setLocateError(null);

    // Instant: try cached first
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setMe([pos.coords.latitude, pos.coords.longitude]);
        setMeAccuracy(pos.coords.accuracy);
      },
      () => { /* fall through to high-accuracy */ },
      { enableHighAccuracy: false, timeout: 2000, maximumAge: 60_000 },
    );

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setMe([pos.coords.latitude, pos.coords.longitude]);
        setMeAccuracy(pos.coords.accuracy);
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        if (err.code === 1) setLocateError("Permisiune refuzată — activează locația.");
        else setLocateError("Nu am putut obține locația.");
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 0 },
    );
  };

  return (
    <div className="relative">
      {/* Keyframes pentru pulse — injected la nivel de document */}
      <style jsx global>{`
        @keyframes cviaPulse {
          0% { transform: scale(0.6); opacity: 0.6; }
          100% { transform: scale(1.8); opacity: 0; }
        }
      `}</style>

      <div className="w-full h-[500px] md:h-[600px] rounded-[12px] overflow-hidden border border-[var(--color-border)] relative z-0">
        <MapContainer
          center={center}
          zoom={zoom}
          scrollWheelZoom={true}
          touchZoom={true}
          doubleClickZoom={true}
          zoomControl={true}
          style={{ width: "100%", height: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
          />
          <FitBounds items={items} me={me} />
          {me && <RecenterOn coords={me} />}

          {withCoords.map((i) => (
            <Marker key={i.id} position={[i.lat, i.lng]} icon={createIcon(i.type, i.status)}>
              <Popup maxWidth={320}>
                <div className="text-sm">
                  <p className="font-semibold mb-1 flex items-center gap-1 flex-wrap">
                    <span>{TYPE_ICONS[i.type]}</span> {TYPE_LABELS[i.type]}
                    <span
                      className="ml-auto text-[10px] font-normal uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                      style={{
                        color: TYPE_COLORS[i.type],
                        background: TYPE_COLORS[i.type] + "22",
                      }}
                    >
                      {STATUS_LABELS[i.status]}
                    </span>
                  </p>
                  <p className="font-medium mb-1 text-sm">{i.reason}</p>
                  <p className="text-xs text-slate-600 mb-2">
                    {i.addresses.slice(0, 2).join(" · ")}
                    {i.addresses.length > 2 && ` + ${i.addresses.length - 2}`}
                  </p>
                  <p className="text-[11px] text-slate-500 mb-2">
                    🕒 {timeRangeLabel(i.startAt, i.endAt)}
                    {i.affectedPopulation != null && i.affectedPopulation > 0 && (
                      <>
                        <br />
                        👥 ~{i.affectedPopulation.toLocaleString("ro-RO")} persoane
                      </>
                    )}
                  </p>
                  <p className="text-[11px] text-slate-500 flex items-center justify-between gap-2">
                    <span>{i.provider}</span>
                    <a
                      href={`/intreruperi/${i.id}`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      Detalii →
                    </a>
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* User location marker + accuracy circle */}
          {me && (
            <>
              <Marker position={me} icon={createMeIcon()}>
                <Popup>
                  <p className="text-sm font-medium">Locația ta</p>
                  {meAccuracy != null && (
                    <p className="text-xs text-slate-500">±{Math.round(meAccuracy)}m precizie</p>
                  )}
                </Popup>
              </Marker>
              {meAccuracy != null && meAccuracy < 500 && (
                <Circle
                  center={me}
                  radius={meAccuracy}
                  pathOptions={{ color: "#3B82F6", fillColor: "#3B82F6", fillOpacity: 0.1, weight: 1 }}
                />
              )}
            </>
          )}
        </MapContainer>
      </div>

      {/* Locate me button (floating) */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
        <button
          type="button"
          onClick={requestLocation}
          disabled={locating}
          aria-label="Localizează-mă pe hartă"
          title="Localizează-mă pe hartă"
          className="w-10 h-10 rounded-full bg-white text-slate-900 shadow-md border border-slate-300 flex items-center justify-center hover:bg-slate-50 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          {locating ? (
            <Loader2 size={18} className="animate-spin" aria-hidden="true" />
          ) : (
            <Locate size={18} className={me ? "text-blue-600" : ""} aria-hidden="true" />
          )}
        </button>
        {me && meAccuracy != null && (
          <span className="text-[10px] bg-white/95 backdrop-blur-sm border border-slate-300 rounded px-1.5 py-0.5 text-slate-600 tabular-nums shadow-sm">
            ±{Math.round(meAccuracy)}m
          </span>
        )}
      </div>

      {locateError && (
        <p className="text-xs text-amber-600 mt-2 text-center">{locateError}</p>
      )}

      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-10 bg-white/95 backdrop-blur-sm border border-slate-300 rounded-[8px] px-3 py-2 shadow-md">
        <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-1.5">
          Legendă
        </p>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
          {(["apa", "caldura", "gaz", "electricitate", "lucrari-strazi"] as const).map((t) => (
            <span key={t} className="inline-flex items-center gap-1.5 text-slate-700">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: TYPE_COLORS[t] }}
              />
              {TYPE_LABELS[t]}
            </span>
          ))}
          {me && (
            <span className="inline-flex items-center gap-1.5 text-blue-600 font-medium">
              <span className="w-3 h-3 rounded-full bg-blue-500 shrink-0" />
              Tu
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
