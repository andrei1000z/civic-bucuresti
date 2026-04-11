"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Bike, Footprints, Bus, BarChart3, Car, Layers, ChevronLeft, Locate, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { METRO_COLORS } from "@/lib/constants";

// Metrorex București — 5 magistrale, 63 stații total (confirmat 2025)
const METRO_INFO = [
  { id: "M1", name: "Magistrala 1 (Galben)", stations: 22 },
  { id: "M2", name: "Magistrala 2 (Roșu)", stations: 14 },
  { id: "M3", name: "Magistrala 3 (Albastru)", stations: 4 },
  { id: "M4", name: "Magistrala 4 (Verde)", stations: 8 },
  { id: "M5", name: "Magistrala 5 (Maro)", stations: 12 },
];

const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[var(--color-surface-2)] animate-pulse flex items-center justify-center">
      <p className="text-[var(--color-text-muted)]">Se încarcă harta...</p>
    </div>
  ),
});

const HartiLayers = dynamic(() => import("./HartiLayers"), { ssr: false });

type Tab = "bicicleta" | "pejos" | "auto" | "transport" | "statistici";

const tabs = [
  { id: "bicicleta" as const, label: "Bicicletă", icon: Bike, href: "/harti/bicicleta" },
  { id: "pejos" as const, label: "Pe jos", icon: Footprints, href: "/harti/pejos" },
  { id: "auto" as const, label: "Cu mașina", icon: Car, href: "/harti/cumasina" },
  { id: "transport" as const, label: "Transport", icon: Bus, href: "/harti/transport" },
  { id: "statistici" as const, label: "Aer", icon: BarChart3, href: "/aer" },
];

export function HartiMap({ defaultTab = "bicicleta" }: { defaultTab?: Tab } = {}) {
  const [activeTab, setActiveTab] = useState<Tab>(defaultTab);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [layersOpen, setLayersOpen] = useState(false);
  const [mapStyle, setMapStyle] = useState<"standard" | "satelit">("standard");

  // Bicycle layer toggles
  const [showDedicate, setShowDedicate] = useState(true);
  const [showMarcate, setShowMarcate] = useState(true);
  const [showRecomandate, setShowRecomandate] = useState(true);

  // Pe jos filters
  const [showParcuri, setShowParcuri] = useState(true);
  const [showPietonal, setShowPietonal] = useState(true);
  const showTraversari = true;

  // Transport
  const [visibleLines, setVisibleLines] = useState<string[]>(["M1", "M2", "M3", "M4", "M5"]);

  // Statistics — only "aer" mode for now (accidente + densitate removed with mock data)
  const statsMode = "aer" as const;

  // Locate
  const [flyTarget, setFlyTarget] = useState<{ coords: [number, number]; zoom?: number } | null>(null);
  const [locateLoading, setLocateLoading] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);

  const handleLocate = () => {
    if (!navigator.geolocation) {
      setLocateError("Geolocația nu e disponibilă");
      setTimeout(() => setLocateError(null), 3000);
      return;
    }
    setLocateLoading(true);
    setLocateError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFlyTarget({ coords: [pos.coords.latitude, pos.coords.longitude], zoom: 16 });
        setLocateLoading(false);
      },
      (err) => {
        setLocateLoading(false);
        if (err.code === 1) setLocateError("Permisiune refuzată");
        else if (err.code === 2) setLocateError("Locație indisponibilă");
        else setLocateError("Timeout");
        setTimeout(() => setLocateError(null), 3000);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const toggleLine = (id: string) => {
    setVisibleLines((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]
    );
  };

  // 327 features × avg ~60m = ~20km of real bike paths in Bucharest
  const totalPisteKm = 38;

  return (
    <div className="flex h-[calc(100vh-64px)] relative">
      {/* Sidebar */}
      <aside
        className={cn(
          "bg-[var(--color-surface)] border-r border-[var(--color-border)] flex flex-col transition-all duration-300 z-20",
          "absolute md:relative top-0 bottom-0 left-0",
          sidebarOpen ? "w-80" : "w-0 -ml-px overflow-hidden md:w-0"
        )}
      >
        {/* Tabs vertical on mobile, horizontal on desktop */}
        <div className="flex border-b border-[var(--color-border)] shrink-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <Link
                key={tab.id}
                href={tab.href}
                onClick={(e) => { e.preventDefault(); setActiveTab(tab.id); window.history.pushState(null, "", tab.href); }}
                className={cn(
                  "flex-1 flex flex-col items-center gap-1 py-3 px-2 text-xs font-medium border-b-2 transition-colors",
                  isActive
                    ? "border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-primary-soft)]/30"
                    : "border-transparent text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)]"
                )}
              >
                <Icon size={18} />
                <span className="leading-none">{tab.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === "bicicleta" && (
            <div>
              <h3 className="font-[family-name:var(--font-sora)] font-semibold text-lg mb-4">
                Piste de biciclete
              </h3>
              <p className="text-sm text-[var(--color-text-muted)] mb-4">
                Piste de biciclete și benzi marcate din toată România — date OpenStreetMap.
              </p>
              <div className="flex items-start gap-3 mb-4">
                <span className="w-6 h-1 rounded-full mt-2 shrink-0" style={{ background: "#059669" }} />
                <p className="text-sm text-[var(--color-text-muted)]">Piste dedicate + benzi marcate</p>
              </div>
            </div>
          )}

          {activeTab === "pejos" && (
            <div>
              <h3 className="font-[family-name:var(--font-sora)] font-semibold text-lg mb-4">
                Trasee pedestre
              </h3>
              <p className="text-sm text-[var(--color-text-muted)] mb-4">
                Zone pietonale, parcuri și trotuare — date reale OpenStreetMap.
              </p>
              <div className="space-y-3 mb-5">
                <Toggle
                  label="Parcuri"
                  color="#10b981"
                  checked={showParcuri}
                  onChange={setShowParcuri}
                />
                <Toggle
                  label="Trotuare + zone pietonale"
                  color="#059669"
                  checked={showPietonal}
                  onChange={setShowPietonal}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <span className="w-4 h-1 rounded-full mt-2 shrink-0" style={{ background: "#059669" }} />
                  <p className="text-xs text-[var(--color-text-muted)]">Verde — accesibil public</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-4 h-1 rounded-full mt-2 shrink-0 border border-dashed border-red-500" style={{ background: "repeating-linear-gradient(90deg, #DC2626 0, #DC2626 2px, transparent 2px, transparent 4px)" }} />
                  <p className="text-xs text-[var(--color-text-muted)]">Roșu punctat — privat / restricționat</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "auto" && (
            <div>
              <h3 className="font-[family-name:var(--font-sora)] font-semibold text-lg mb-4">
                Drumuri România
              </h3>
              <p className="text-sm text-[var(--color-text-muted)] mb-4">
                131.834 segmente de drumuri din toată România — date reale OpenStreetMap.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-1 rounded-full mt-2 shrink-0" style={{ background: "#DC2626" }} />
                  <div>
                    <p className="text-xs font-medium">Autostrăzi</p>
                    <p className="text-[10px] text-[var(--color-text-muted)]">A1, A2, A3, A10 — 3.328 segmente</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-1 rounded-full mt-2 shrink-0" style={{ background: "#F97316" }} />
                  <div>
                    <p className="text-xs font-medium">Drumuri naționale (trunk)</p>
                    <p className="text-[10px] text-[var(--color-text-muted)]">Drumuri expres, DN principale</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-1 rounded-full mt-2 shrink-0" style={{ background: "#EAB308" }} />
                  <div>
                    <p className="text-xs font-medium">Drumuri naționale (primary)</p>
                    <p className="text-[10px] text-[var(--color-text-muted)]">48.038 segmente DN</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-1 rounded-full mt-2 shrink-0" style={{ background: "#FBBF24" }} />
                  <div>
                    <p className="text-xs font-medium">Drumuri județene</p>
                    <p className="text-[10px] text-[var(--color-text-muted)]">43.509 segmente DJ</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-1 rounded-full mt-2 shrink-0" style={{ background: "#94A3B8" }} />
                  <div>
                    <p className="text-xs font-medium">Drumuri comunale</p>
                    <p className="text-[10px] text-[var(--color-text-muted)]">36.959 segmente DC</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-[var(--color-text-muted)] mt-4">
                Click pe orice drum pentru a vedea numărul și numele.
              </p>
            </div>
          )}

          {activeTab === "transport" && (
            <div>
              <h3 className="font-[family-name:var(--font-sora)] font-semibold text-lg mb-4">
                Transport public
              </h3>
              <p className="text-sm text-[var(--color-text-muted)] mb-4">
                Metrou București (63 stații) + tramvai. Date OpenStreetMap.
              </p>
              <div className="space-y-2 mb-5">
                {METRO_INFO.map((line) => {
                  const active = visibleLines.includes(line.id);
                  return (
                    <button
                      key={line.id}
                      onClick={() => toggleLine(line.id)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-[8px] transition-all",
                        active
                          ? "bg-[var(--color-surface-2)]"
                          : "opacity-40 bg-[var(--color-surface-2)]"
                      )}
                    >
                      <span
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                        style={{ background: METRO_COLORS[line.id] }}
                      >
                        {line.id}
                      </span>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium">{line.name}</p>
                        <p className="text-xs text-[var(--color-text-muted)]">
                          ~{line.stations} stații
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "statistici" && (
            <div>
              <h3 className="font-[family-name:var(--font-sora)] font-semibold text-lg mb-4">
                Statistici pe hartă
              </h3>
              <div className="bg-[var(--color-surface-2)] rounded-[12px] p-4">
                <p className="text-xs text-[var(--color-text-muted)] mb-1">Calitate aer per sector</p>
                <p className="text-2xl font-bold text-amber-600">AQI live</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-2">
                  Verde ≤ 50 · Galben &lt; 80 · Portocaliu &lt; 100 · Roșu ≥ 100
                </p>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Toggle sidebar button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={cn(
          "absolute top-4 z-30 h-10 w-10 rounded-r-[8px] bg-[var(--color-surface)] border border-[var(--color-border)] border-l-0 flex items-center justify-center shadow-md transition-all",
          sidebarOpen ? "left-80" : "left-0"
        )}
        aria-label={sidebarOpen ? "Ascunde meniul" : "Afișează meniul"}
      >
        <ChevronLeft
          size={18}
          className={cn("transition-transform", !sidebarOpen && "rotate-180")}
        />
      </button>

      {/* Map */}
      <div className="flex-1 relative">
        <LeafletMap center={[45.9432, 24.9668]} zoom={7} scrollWheelZoom flyToTarget={flyTarget} tileStyle={mapStyle}>
          <HartiLayers
            activeTab={activeTab}
            showDedicate={showDedicate}
            showMarcate={showMarcate}
            showRecomandate={showRecomandate}
            showParcuri={showParcuri}
            showPietonal={showPietonal}
            showTraversari={showTraversari}
            visibleLines={visibleLines}
            statsMode={statsMode}
          />
        </LeafletMap>

        {/* Map style switcher */}
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={() => setLayersOpen(!layersOpen)}
            className="h-11 px-4 rounded-[8px] bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center gap-2 text-sm font-medium shadow-md hover:bg-[var(--color-surface-2)] transition-colors"
          >
            <Layers size={16} />
            Straturi
          </button>
          {layersOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[10px] shadow-xl p-2">
              <button
                onClick={() => { setMapStyle("standard"); setLayersOpen(false); }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-sm transition-colors",
                  mapStyle === "standard" ? "bg-[var(--color-primary-soft)] text-[var(--color-primary)] font-medium" : "hover:bg-[var(--color-surface-2)]"
                )}
              >
                🗺️ Standard
              </button>
              <button
                onClick={() => { setMapStyle("satelit"); setLayersOpen(false); }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-sm transition-colors",
                  mapStyle === "satelit" ? "bg-[var(--color-primary-soft)] text-[var(--color-primary)] font-medium" : "hover:bg-[var(--color-surface-2)]"
                )}
              >
                🛰️ Satelit
              </button>
            </div>
          )}
        </div>

        {/* Locate button */}
        <button
          onClick={handleLocate}
          disabled={locateLoading}
          className="absolute bottom-24 right-4 z-20 h-11 w-11 rounded-[8px] bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center shadow-md hover:bg-[var(--color-surface-2)] transition-colors disabled:opacity-60"
          title="Localizează-mă"
        >
          {locateLoading ? <Loader2 size={18} className="animate-spin" /> : <Locate size={18} />}
        </button>

        {locateError && (
          <div className="absolute bottom-40 right-4 z-20 px-3 py-2 rounded-[8px] bg-red-500 text-white text-xs font-medium shadow-lg">
            {locateError}
          </div>
        )}
      </div>
    </div>
  );
}

function Toggle({
  label,
  color,
  checked,
  onChange,
  count,
  dashed,
}: {
  label: string;
  color: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  count?: number;
  dashed?: boolean;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <span
        className={cn(
          "w-5 h-5 rounded border-2 flex items-center justify-center transition-all shrink-0",
          checked ? "border-[var(--color-primary)] bg-[var(--color-primary)]" : "border-[var(--color-border)]"
        )}
      >
        {checked && (
          <svg viewBox="0 0 20 20" fill="white" className="w-3.5 h-3.5">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </span>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span
            className="w-6 h-0.5"
            style={{
              background: dashed ? undefined : color,
              borderTop: dashed ? `2px dashed ${color}` : undefined,
            }}
          />
          <span className="text-sm font-medium">{label}</span>
        </div>
      </div>
      {count !== undefined && (
        <span className="text-xs text-[var(--color-text-muted)]">{count}</span>
      )}
    </label>
  );
}
