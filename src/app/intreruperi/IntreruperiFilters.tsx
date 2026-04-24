"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  MapPin,
  Clock,
  Users,
  ExternalLink,
  List as ListIcon,
  Map as MapIcon,
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
    <div className="w-full h-[500px] bg-[var(--color-surface-2)] animate-pulse rounded-[12px] flex items-center justify-center">
      <p className="text-[var(--color-text-muted)] text-sm">Se încarcă harta...</p>
    </div>
  ),
});

type ViewMode = "list" | "map";
type TypeFilter = "toate" | InterruptionType;

const TYPE_TABS: Array<{ value: TypeFilter; label: string }> = [
  { value: "toate", label: "Toate" },
  { value: "apa", label: "Apă" },
  { value: "caldura", label: "Caldură" },
  { value: "gaz", label: "Gaz" },
  { value: "electricitate", label: "Curent" },
  { value: "lucrari-strazi", label: "Stradă" },
];

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

  const counties = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => set.add(i.county));
    return Array.from(set).sort();
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((i) => {
      if (type !== "toate" && i.type !== type) return false;
      if (county !== "toate" && i.county !== county) return false;
      return true;
    });
  }, [items, type, county]);

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
        <p className="text-center text-sm text-[var(--color-text-muted)] py-12">
          Nicio întrerupere cu filtrele curente.
        </p>
      ) : view === "map" ? (
        <IntreruperiMap items={filtered} />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((i) => (
            <InterruptionCard key={i.id} item={i} />
          ))}
        </div>
      )}

      <p className="text-center text-xs text-[var(--color-text-muted)] mt-6">
        {filtered.length} {filtered.length === 1 ? "întrerupere" : "întreruperi"}
      </p>
    </div>
  );
}

function InterruptionCard({ item }: { item: Interruption }) {
  return (
    <article
      className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-5 hover:border-[var(--color-primary)]/40 hover:shadow-[var(--shadow-md)] transition-all min-w-0"
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
            <p className="text-[10px] uppercase tracking-wider font-semibold text-[var(--color-text-muted)]">
              {TYPE_LABELS[item.type]}
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
        {item.sourceUrl && (
          <Link
            href={item.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--color-primary)] hover:underline shrink-0"
          >
            Anunț original <ExternalLink size={10} />
          </Link>
        )}
      </div>
    </article>
  );
}
