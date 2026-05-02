"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Phone, Mail, ExternalLink, X, ChevronDown } from "lucide-react";

// Pagination — render this many cards on first paint. Past metering
// showed /autoritati was a 1 MB HTML payload because all 340 cards
// (42 județe + ~298 orașe) rendered to HTML upfront. Sliced to 30
// initial drops first paint to ~85 KB; "Vezi mai multe" reveals the
// rest in batches. Active search/filter bypasses pagination — when
// the user is hunting, they want to see all matches.
const PAGE_SIZE = 30;

export interface Row {
  kind: "judet" | "oras";
  id: string;
  slug: string;
  name: string;
  countyName: string;
  primarieEmail?: string;
  primariePhone?: string;
  plEmail?: string;
  plPhone?: string;
  href: string;
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

export function AutoritatiSearch({ rows }: { rows: Row[] }) {
  const [query, setQuery] = useState("");
  const [kindFilter, setKindFilter] = useState<"all" | "judet" | "oras">("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Build unique county list for the type filter label counts
  const counts = useMemo(() => {
    const j = rows.filter((r) => r.kind === "judet").length;
    const o = rows.filter((r) => r.kind === "oras").length;
    return { judet: j, oras: o, all: rows.length };
  }, [rows]);

  const filtered = useMemo(() => {
    const q = normalize(query);
    return rows.filter((r) => {
      if (kindFilter !== "all" && r.kind !== kindFilter) return false;
      if (!q) return true;
      const hay = normalize(`${r.name} ${r.countyName} ${r.id}`);
      return hay.includes(q);
    });
  }, [query, rows, kindFilter]);

  // Pagination only applies when there's no active search/filter —
  // when the user is hunting, hiding matches behind a "show more"
  // button is hostile UX.
  const isHunting = query.length > 0 || kindFilter !== "all";
  const visible = isHunting ? filtered : filtered.slice(0, visibleCount);
  const hasMore = !isHunting && visibleCount < filtered.length;

  return (
    <div>
      <div className="relative mb-6">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Caută județ (ex: Cluj, Timiș, Argeș)…"
          aria-label="Caută autoritate"
          className="w-full h-12 pl-10 pr-10 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Șterge căutarea"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          >
            <X size={14} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Type filter — Toate / Județe / Orașe */}
      <div
        role="tablist"
        aria-label="Filtrează după tip"
        className="inline-flex items-center gap-1 mb-5 p-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-sm)]"
      >
        <FilterTab
          active={kindFilter === "all"}
          onClick={() => setKindFilter("all")}
          label="Toate"
          count={counts.all}
        />
        <FilterTab
          active={kindFilter === "judet"}
          onClick={() => setKindFilter("judet")}
          label="Județe"
          count={counts.judet}
        />
        <FilterTab
          active={kindFilter === "oras"}
          onClick={() => setKindFilter("oras")}
          label="Orașe"
          count={counts.oras}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] shadow-[var(--shadow-1)] p-10 text-center">
          <div className="text-5xl mb-3 opacity-60" aria-hidden="true">
            🔎
          </div>
          <p className="text-base font-semibold mb-1">
            Niciun rezultat pentru „{query}"
          </p>
          <p className="text-sm text-[var(--color-text-muted)] mb-4">
            Încearcă alt cuvânt — caută după nume județ (ex: „Cluj"), cod
            („CJ") sau oraș specific („Onești").
          </p>
          <button
            type="button"
            onClick={() => setQuery("")}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-[var(--radius-xs)] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-sm font-medium hover:bg-[var(--color-surface)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          >
            Șterge căutarea
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {visible.map((row) => (
            <article
              key={row.id}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] shadow-[var(--shadow-1)] p-4 hover:border-[var(--color-primary)]/50 hover:shadow-[var(--shadow-2)] transition-all"
            >
              <div className="flex items-start justify-between mb-3 gap-2">
                <div className="min-w-0">
                  <h3 className="font-[family-name:var(--font-sora)] font-semibold text-base truncate">
                    {row.name}
                  </h3>
                  {row.kind === "oras" && (
                    <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                      oraș · {row.countyName}
                    </p>
                  )}
                </div>
                {row.kind === "judet" ? (
                  <span
                    className="text-[10px] uppercase tracking-wider font-semibold text-[var(--color-text-muted)] bg-[var(--color-bg)] px-2 py-0.5 rounded shrink-0"
                    aria-label={`Cod județ ${row.id}`}
                  >
                    {row.id}
                  </span>
                ) : (
                  <span
                    className="text-[10px] uppercase tracking-wider font-semibold text-[var(--color-primary)] bg-[var(--color-primary-soft)] px-2 py-0.5 rounded shrink-0"
                    aria-label="Oraș"
                  >
                    oraș
                  </span>
                )}
              </div>

              {/* Primărie contact */}
              {(row.primarieEmail || row.primariePhone) && (
                <div className="mb-3">
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-[var(--color-text-muted)] mb-1">
                    Primărie
                  </p>
                  <div className="flex flex-col gap-1">
                    {row.primarieEmail && (
                      <a
                        href={`mailto:${row.primarieEmail}`}
                        className="inline-flex items-center gap-1.5 text-xs text-[var(--color-primary)] hover:underline break-all"
                      >
                        <Mail size={11} className="shrink-0" aria-hidden="true" />
                        {row.primarieEmail}
                      </a>
                    )}
                    {row.primariePhone && (
                      <a
                        href={`tel:${row.primariePhone.replace(/[^\d+]/g, "")}`}
                        className="inline-flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
                      >
                        <Phone size={11} className="shrink-0" aria-hidden="true" />
                        {row.primariePhone}
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Poliția Locală contact */}
              {(row.plEmail || row.plPhone) && (
                <div className="mb-3">
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-[var(--color-text-muted)] mb-1">
                    Poliția Locală
                  </p>
                  <div className="flex flex-col gap-1">
                    {row.plEmail && (
                      <a
                        href={`mailto:${row.plEmail}`}
                        className="inline-flex items-center gap-1.5 text-xs text-[var(--color-primary)] hover:underline break-all"
                      >
                        <Mail size={11} className="shrink-0" aria-hidden="true" />
                        {row.plEmail}
                      </a>
                    )}
                    {row.plPhone && (
                      <a
                        href={`tel:${row.plPhone.replace(/[^\d+]/g, "")}`}
                        className="inline-flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
                      >
                        <Phone size={11} className="shrink-0" aria-hidden="true" />
                        {row.plPhone}
                      </a>
                    )}
                  </div>
                </div>
              )}

              <Link
                href={row.href}
                className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-primary)] hover:underline mt-1"
              >
                Toate instituțiile <ExternalLink size={10} aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      )}

      {hasMore && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            className="inline-flex items-center gap-2 h-11 px-5 rounded-[var(--radius-sm)] bg-[var(--color-surface)] border border-[var(--color-border)] text-sm font-medium hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-surface-2)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          >
            <ChevronDown size={14} aria-hidden="true" />
            Vezi încă {Math.min(PAGE_SIZE, filtered.length - visibleCount)} de autorități
            <span className="text-[var(--color-text-muted)] tabular-nums">
              ({filtered.length - visibleCount} rămase)
            </span>
          </button>
        </div>
      )}

      <p
        className="text-center text-xs text-[var(--color-text-muted)] mt-6"
        aria-live="polite"
        aria-atomic="true"
      >
        {isHunting
          ? `${filtered.length} ${filtered.length === 1 ? "rezultat" : "rezultate"}`
          : `Afișate ${visible.length} din ${filtered.length}`}
      </p>
    </div>
  );
}

function FilterTab({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`px-3 h-8 rounded-[var(--radius-xs)] text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] ${
        active
          ? "bg-[var(--color-surface)] text-[var(--color-primary)] shadow-sm"
          : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
      }`}
    >
      {label}
      <span className="ml-1.5 text-[10px] opacity-70 tabular-nums">{count}</span>
    </button>
  );
}
