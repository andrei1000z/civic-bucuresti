"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  MapPin,
  Clock,
  Users,
  ExternalLink,
  List as ListIcon,
  Map as MapIcon,
  Locate,
  Loader2,
  Calendar,
  Share2,
} from "lucide-react";
import {
  type Interruption,
  type InterruptionType,
  TYPE_COLORS,
  TYPE_ICONS,
  TYPE_LABELS,
  STATUS_LABELS,
  STATUS_COLORS,
} from "@/data/intreruperi";

const IntreruperiMap = dynamic(() => import("./IntreruperiMap"), {
  ssr: false,
  loading: () => (
    <div className="relative w-full h-[500px] md:h-[600px] bg-[var(--color-surface-2)] overflow-hidden rounded-[12px]">
      <svg
        className="absolute inset-0 w-full h-full opacity-30"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <pattern id="gridIntr" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#gridIntr)" className="text-slate-400" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-[var(--color-primary)] border-t-transparent animate-spin" />
        <p className="text-sm font-medium">Se încarcă harta...</p>
      </div>
    </div>
  ),
});

type ViewMode = "list" | "map";
type TypeFilter = "toate" | InterruptionType;
type SortMode = "timp" | "distanta";

const TYPE_TABS: Array<{ value: TypeFilter; label: string }> = [
  { value: "toate", label: "Toate" },
  { value: "apa", label: "Apă" },
  { value: "caldura", label: "Caldură" },
  { value: "gaz", label: "Gaz" },
  { value: "electricitate", label: "Curent" },
  { value: "lucrari-strazi", label: "Stradă" },
];

// Haversine distance în km între 2 puncte lat/lng
function distanceKm(a: [number, number], b: [number, number]): number {
  const R = 6371;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  if (km < 10) return `${km.toFixed(1)}km`;
  return `${Math.round(km)}km`;
}

// Relative time: „În 2h", „Mâine 08:00", „Ieri"
function relativeTime(iso: string): string {
  const t = new Date(iso).getTime();
  const now = Date.now();
  const diffMin = Math.round((t - now) / 60_000);
  if (diffMin < 0) {
    const ago = -diffMin;
    if (ago < 60) return `acum ${ago} min`;
    if (ago < 24 * 60) return `acum ${Math.round(ago / 60)}h`;
    return `acum ${Math.round(ago / 1440)} zile`;
  }
  if (diffMin < 60) return `în ${diffMin} min`;
  if (diffMin < 24 * 60) return `în ${Math.round(diffMin / 60)}h`;
  const d = new Date(t);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(d);
  start.setHours(0, 0, 0, 0);
  const days = Math.round((start.getTime() - today.getTime()) / 86_400_000);
  if (days === 1) return `mâine ${d.toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })}`;
  if (days < 7) return d.toLocaleDateString("ro-RO", { weekday: "long", hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("ro-RO", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

function timeRangeLabel(startAt: string, endAt: string): string {
  const s = new Date(startAt);
  const e = new Date(endAt);
  const sameDay = s.toDateString() === e.toDateString();
  const fmt = (d: Date) =>
    d.toLocaleString("ro-RO", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  if (sameDay) {
    return `${fmt(s)} — ${e.toLocaleString("ro-RO", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }
  return `${fmt(s)} — ${fmt(e)}`;
}

function durationLabel(startAt: string, endAt: string): string {
  const ms = new Date(endAt).getTime() - new Date(startAt).getTime();
  const h = Math.round(ms / 3_600_000);
  if (h < 24) return `${h}h`;
  const d = Math.round(h / 24);
  return `${d} ${d === 1 ? "zi" : "zile"}`;
}

export function IntreruperiFilters({ items }: { items: Interruption[] }) {
  const [view, setView] = useState<ViewMode>("list");
  const [type, setType] = useState<TypeFilter>("toate");
  const [county, setCounty] = useState<string>("toate");
  const [sort, setSort] = useState<SortMode>("timp");
  const [me, setMe] = useState<[number, number] | null>(null);
  const [locating, setLocating] = useState(false);

  // Warm permission check — dacă user-ul a acordat deja, cerem fix cached
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    const nav = navigator as Navigator & {
      permissions?: { query: (q: { name: PermissionName }) => Promise<PermissionStatus> };
    };
    if (!nav.permissions?.query) return;
    nav.permissions
      .query({ name: "geolocation" as PermissionName })
      .then((status) => {
        if (status.state !== "granted") return;
        navigator.geolocation.getCurrentPosition(
          (pos) => setMe([pos.coords.latitude, pos.coords.longitude]),
          () => { /* ignore */ },
          { enableHighAccuracy: false, timeout: 3000, maximumAge: 300_000 },
        );
      })
      .catch(() => { /* ignore */ });
  }, []);

  const requestMe = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setMe([pos.coords.latitude, pos.coords.longitude]);
        setLocating(false);
        setSort("distanta");
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
    );
  };

  const counties = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => set.add(i.county));
    return Array.from(set).sort();
  }, [items]);

  const filtered = useMemo(() => {
    let list = items.filter((i) => {
      if (type !== "toate" && i.type !== type) return false;
      if (county !== "toate" && i.county !== county) return false;
      return true;
    });

    if (sort === "distanta" && me) {
      list = [...list].sort((a, b) => {
        const da =
          a.lat != null && a.lng != null ? distanceKm(me, [a.lat, a.lng]) : Infinity;
        const db =
          b.lat != null && b.lng != null ? distanceKm(me, [b.lat, b.lng]) : Infinity;
        return da - db;
      });
    } else {
      list = [...list].sort((a, b) => {
        if (a.status === "in-desfasurare" && b.status !== "in-desfasurare") return -1;
        if (a.status !== "in-desfasurare" && b.status === "in-desfasurare") return 1;
        return new Date(a.startAt).getTime() - new Date(b.startAt).getTime();
      });
    }
    return list;
  }, [items, type, county, sort, me]);

  return (
    <div>
      {/* Filter bar */}
      <div className="sticky top-16 z-20 bg-[var(--color-bg)]/95 backdrop-blur-sm -mx-4 px-4 py-3 mb-5 border-b border-[var(--color-border)]">
        <div className="flex flex-wrap items-center gap-2">
          <div
            role="tablist"
            aria-label="Filtrează după tip"
            className="inline-flex items-center gap-1 p-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[10px] overflow-x-auto max-w-full no-scrollbar"
          >
            {TYPE_TABS.map((t) => {
              const count = t.value === "toate"
                ? items.length
                : items.filter((i) => i.type === t.value).length;
              return (
                <button
                  key={t.value}
                  onClick={() => setType(t.value)}
                  role="tab"
                  aria-selected={type === t.value}
                  className={`shrink-0 px-3 h-8 rounded-[8px] text-xs font-medium transition-colors inline-flex items-center gap-1.5 ${
                    type === t.value
                      ? "bg-[var(--color-primary)] text-white shadow-sm"
                      : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)]"
                  }`}
                >
                  {t.value !== "toate" && <span>{TYPE_ICONS[t.value]}</span>}
                  {t.label}
                  <span className="opacity-70 text-[10px]">{count}</span>
                </button>
              );
            })}
          </div>

          <select
            value={county}
            onChange={(e) => setCounty(e.target.value)}
            aria-label="Filtrează după județ"
            className="h-10 px-3 rounded-[8px] bg-[var(--color-surface)] border border-[var(--color-border)] text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          >
            <option value="toate">Toate județele</option>
            {counties.map((c) => (
              <option key={c} value={c}>
                {c === "B" ? "București" : c}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => {
              if (!me) requestMe();
              else setSort((s) => (s === "distanta" ? "timp" : "distanta"));
            }}
            disabled={locating}
            aria-pressed={sort === "distanta"}
            title={me ? "Sortează după distanța de la tine" : "Localizează-mă"}
            className={`inline-flex items-center gap-1.5 h-10 px-3 rounded-[8px] border text-xs font-medium transition-colors ${
              sort === "distanta" && me
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border)] hover:border-[var(--color-primary)]/40"
            } ${locating ? "opacity-60" : ""}`}
          >
            {locating ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Locate size={13} />
            )}
            {me ? (sort === "distanta" ? "Distanță" : "Timp") : "Aproape de mine"}
          </button>

          <div className="ml-auto inline-flex rounded-[8px] bg-[var(--color-surface)] border border-[var(--color-border)] p-0.5">
            <button
              onClick={() => setView("list")}
              aria-pressed={view === "list"}
              className={`px-3 h-9 rounded-[6px] text-xs font-medium transition-colors inline-flex items-center gap-1.5 ${
                view === "list"
                  ? "bg-[var(--color-primary)] text-white"
                  : "text-[var(--color-text-muted)]"
              }`}
            >
              <ListIcon size={13} /> Listă
            </button>
            <button
              onClick={() => setView("map")}
              aria-pressed={view === "map"}
              className={`px-3 h-9 rounded-[6px] text-xs font-medium transition-colors inline-flex items-center gap-1.5 ${
                view === "map"
                  ? "bg-[var(--color-primary)] text-white"
                  : "text-[var(--color-text-muted)]"
              }`}
            >
              <MapIcon size={13} /> Hartă
            </button>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[16px] p-10 text-center">
          <div className="text-5xl mb-3 opacity-60" aria-hidden="true">
            🔎
          </div>
          <p className="text-base font-semibold mb-1">
            Nicio întrerupere cu aceste filtre
          </p>
          <p className="text-sm text-[var(--color-text-muted)] mb-4">
            Resetează filtrele să vezi tot ce e activ acum.
          </p>
          <button
            onClick={() => {
              setType("toate");
              setCounty("toate");
            }}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-[8px] bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-colors"
          >
            Resetează filtrele →
          </button>
        </div>
      ) : view === "map" ? (
        <IntreruperiMap items={filtered} />
      ) : (
        <GroupedList items={filtered} me={me} />
      )}

      <p className="text-center text-xs text-[var(--color-text-muted)] mt-6">
        {filtered.length} {filtered.length === 1 ? "întrerupere" : "întreruperi"}
      </p>
    </div>
  );
}

function groupByDay(
  items: Interruption[],
): Array<{ label: string; items: Interruption[] }> {
  const buckets = new Map<string, Interruption[]>();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const item of items) {
    const start = new Date(item.startAt);
    start.setHours(0, 0, 0, 0);
    const days = Math.round((start.getTime() - today.getTime()) / 86_400_000);
    let key: string;
    if (days < 0) key = "Deja în curs";
    else if (days === 0) key = "Astăzi";
    else if (days === 1) key = "Mâine";
    else if (days < 7)
      key = start.toLocaleDateString("ro-RO", { weekday: "long", day: "numeric", month: "short" });
    else
      key = start.toLocaleDateString("ro-RO", { day: "numeric", month: "long" });

    const arr = buckets.get(key) ?? [];
    arr.push(item);
    buckets.set(key, arr);
  }
  return Array.from(buckets.entries()).map(([label, items]) => ({ label, items }));
}

function GroupedList({
  items,
  me,
}: {
  items: Interruption[];
  me: [number, number] | null;
}) {
  const groups = useMemo(() => groupByDay(items), [items]);
  return (
    <div className="space-y-6">
      {groups.map((g) => (
        <section key={g.label}>
          <h3 className="text-xs uppercase tracking-wider font-semibold text-[var(--color-text-muted)] mb-3 flex items-center gap-2">
            <span
              className={
                g.label === "Astăzi" || g.label === "Deja în curs"
                  ? "inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse"
                  : "inline-block w-2 h-2 rounded-full bg-[var(--color-primary)]"
              }
              aria-hidden="true"
            />
            {g.label} <span className="opacity-60 normal-case">· {g.items.length}</span>
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {g.items.map((i) => {
              const dist =
                me && i.lat != null && i.lng != null
                  ? distanceKm(me, [i.lat, i.lng])
                  : null;
              return <InterruptionCard key={i.id} item={i} distanceKm={dist} />;
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

function InterruptionCard({
  item,
  distanceKm: dist,
}: {
  item: Interruption;
  distanceKm: number | null;
}) {
  const isActive = item.status === "in-desfasurare";
  const isUpcoming = item.status === "programat";
  const startRelative = isUpcoming ? relativeTime(item.startAt) : null;
  const endRelative = isActive ? `se termină ${relativeTime(item.endAt)}` : null;

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    const url = `${window.location.origin}/intreruperi/${item.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${TYPE_ICONS[item.type]} ${TYPE_LABELS[item.type]} — ${item.addresses[0] ?? ""}`,
          text: item.reason,
          url,
        });
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  return (
    <Link
      href={`/intreruperi/${item.id}`}
      className="block bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-5 hover:border-[var(--color-primary)]/40 hover:shadow-[var(--shadow-md)] transition-all min-w-0"
      style={{ borderLeftWidth: "4px", borderLeftColor: TYPE_COLORS[item.type] }}
    >
      <div className="flex items-start justify-between gap-2 mb-3 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="inline-flex items-center justify-center w-8 h-8 rounded-[8px] text-lg shrink-0"
            style={{
              backgroundColor: TYPE_COLORS[item.type] + "20",
              color: TYPE_COLORS[item.type],
            }}
            aria-hidden="true"
          >
            {TYPE_ICONS[item.type]}
          </span>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider font-semibold text-[var(--color-text-muted)] flex items-center gap-1">
              {TYPE_LABELS[item.type]}
              {dist != null && (
                <span className="text-blue-500 font-bold normal-case tracking-normal">
                  · {formatDistance(dist)}
                </span>
              )}
            </p>
            <p className="font-semibold text-sm line-clamp-2">{item.reason}</p>
          </div>
        </div>
        <span
          className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap shrink-0"
          style={{
            backgroundColor: STATUS_COLORS[item.status] + "20",
            color: STATUS_COLORS[item.status],
          }}
        >
          {STATUS_LABELS[item.status]}
        </span>
      </div>

      {(startRelative || endRelative) && (
        <div
          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full mb-3 ${
            isActive
              ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
              : "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
          }`}
        >
          <Clock size={10} />
          {isActive ? endRelative : `începe ${startRelative}`}
        </div>
      )}

      {item.excerpt && (
        <p className="text-sm text-[var(--color-text)] mb-3 line-clamp-2">
          {item.excerpt}
        </p>
      )}

      <div className="flex flex-col gap-1.5 text-xs text-[var(--color-text-muted)] mb-3">
        <div className="flex items-start gap-1.5 min-w-0">
          <MapPin size={12} className="shrink-0 mt-0.5" />
          <div className="min-w-0">
            {item.addresses.slice(0, 3).map((addr, i) => (
              <div key={i} className="truncate">
                {addr}
              </div>
            ))}
            {item.addresses.length > 3 && (
              <div className="text-[var(--color-text-muted)] italic">
                + alte {item.addresses.length - 3} adrese
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock size={12} className="shrink-0" />
          <span>
            {timeRangeLabel(item.startAt, item.endAt)}
            <span className="ml-1 opacity-70">
              · {durationLabel(item.startAt, item.endAt)}
            </span>
          </span>
        </div>
        {item.affectedPopulation != null && item.affectedPopulation > 0 && (
          <div className="flex items-center gap-1.5">
            <Users size={12} className="shrink-0" />
            <span>~{item.affectedPopulation.toLocaleString("ro-RO")} persoane</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)] gap-2 min-w-0">
        <span className="text-[11px] text-[var(--color-text-muted)] truncate min-w-0 flex-1">
          {item.provider}
          {item.sector && ` · ${item.sector}`}
        </span>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleShare}
            aria-label="Distribuie"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
          >
            <Share2 size={11} />
          </button>
          <a
            href={`/api/intreruperi/${item.id}/ics`}
            onClick={(e) => e.stopPropagation()}
            aria-label="Adaugă în calendar"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
            title="Descarcă în calendar (ICS)"
          >
            <Calendar size={11} />
          </a>
          {(item.sourceEntryUrl || item.sourceUrl) && (
            <a
              href={item.sourceEntryUrl || item.sourceUrl!}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--color-primary)] hover:underline"
              title={
                item.sourceEntryUrl
                  ? "Anunțul oficial exact (PDF/pagină)"
                  : `Lista ${item.provider} cu toate anunțurile`
              }
            >
              {item.sourceEntryUrl ? "PDF oficial" : "Vezi la provider"}{" "}
              <ExternalLink size={10} />
            </a>
          )}
        </div>
      </div>
    </Link>
  );
}
