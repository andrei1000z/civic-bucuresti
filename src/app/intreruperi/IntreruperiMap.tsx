"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  type Interruption,
  TYPE_COLORS,
  TYPE_ICONS,
  TYPE_LABELS,
  STATUS_LABELS,
} from "@/data/intreruperi";

// Icon colorat in funcție de tipul întreruperii
function createIcon(type: Interruption["type"]): L.DivIcon {
  const color = TYPE_COLORS[type];
  const emoji = TYPE_ICONS[type];
  return L.divIcon({
    html: `<div style="
      width: 36px;
      height: 36px;
      background: ${color};
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
    ">${emoji}</div>`,
    className: "interruption-marker",
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
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
    });
  return `${fmt(s)} — ${fmt(e)}`;
}

interface FitBoundsProps {
  items: Interruption[];
}

function FitBounds({ items }: FitBoundsProps) {
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || items.length === 0) return;
    const withCoords = items.filter(
      (i): i is Interruption & { lat: number; lng: number } =>
        typeof i.lat === "number" && typeof i.lng === "number",
    );
    if (withCoords.length === 0) return;
    const bounds = L.latLngBounds(withCoords.map((i) => [i.lat, i.lng]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
  }, [items]);

  // Hack ca să obținem ref la Map instance printr-un handler care rulează
  // imediat după mount
  return (
    <div
      ref={(el) => {
        if (!el) return;
        const leaflet = el.closest(".leaflet-container") as HTMLElement & {
          _leaflet_id?: number;
        };
        if (leaflet) {
          // @ts-expect-error — _leafletMap e set la nivel intern de react-leaflet
          mapRef.current = leaflet._leaflet_map ?? null;
        }
      }}
      style={{ display: "none" }}
    />
  );
}

export default function IntreruperiMap({ items }: { items: Interruption[] }) {
  const withCoords = useMemo(
    () =>
      items.filter(
        (i): i is Interruption & { lat: number; lng: number } =>
          typeof i.lat === "number" && typeof i.lng === "number",
      ),
    [items],
  );

  const center = useMemo<[number, number]>(() => {
    if (withCoords.length === 0) return [45.9432, 24.9668]; // centrul RO
    // Centru pe media coordonatelor
    const sum = withCoords.reduce(
      (acc, i) => ({ lat: acc.lat + i.lat, lng: acc.lng + i.lng }),
      { lat: 0, lng: 0 },
    );
    return [sum.lat / withCoords.length, sum.lng / withCoords.length];
  }, [withCoords]);

  // Zoom inițial: dacă toate în România, zoom mai larg
  const zoom = withCoords.length > 1 ? 7 : 13;

  return (
    <div className="w-full h-[500px] md:h-[600px] rounded-[12px] overflow-hidden border border-[var(--color-border)] relative z-0">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
        />
        <FitBounds items={withCoords} />
        {withCoords.map((i) => (
          <Marker key={i.id} position={[i.lat, i.lng]} icon={createIcon(i.type)}>
            <Popup maxWidth={320}>
              <div className="text-sm">
                <p className="font-semibold mb-1 flex items-center gap-1">
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
                  {i.sourceUrl && (
                    <a
                      href={i.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Anunț →
                    </a>
                  )}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
