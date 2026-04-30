"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Building2,
  Check,
  MapPin,
  Search,
  Users,
  Wind,
  X as CloseX,
} from "lucide-react";
import { ALL_COUNTIES } from "@/data/counties";
import { getCountyStats } from "@/data/statistici-judete";
import { aqiColor, aqiLabel } from "@/components/county/CountyStatCards";

interface Props {
  sesizariStats: Record<string, number>;
  authStats: Record<string, number>;
}

// Romanian-aware diacritic-stripper for the search input. Lets users
// type „bucuresti" (no diacritics) and still match „București".
function strip(s: string): string {
  return s
    .toLocaleLowerCase("ro-RO")
    .replace(/ă|â/g, "a")
    .replace(/î/g, "i")
    .replace(/ș|ş/g, "s")
    .replace(/ț|ţ/g, "t")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Client-side county grid that:
 *   - Highlights the currently-saved county (from localStorage/cookie)
 *   - Persists the new county to localStorage + cookie on click
 *   - Navigates to `/{slug}` (the main county flow), NOT `/judete/{id}` —
 *     the latter is kept as a legacy alternate URL for SEO but the
 *     primary "live in this county" experience is on the top-level route.
 *   - Filters live by name / county code as the user types
 */
export function JudeteGrid({ sesizariStats, authStats }: Props) {
  const [savedSlug, setSavedSlug] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("civia_county");
    if (raw) setSavedSlug(raw.toLowerCase());
  }, []);

  const persist = (slug: string) => {
    if (typeof window === "undefined") return;
    localStorage.setItem("civia_county", slug);
    // eslint-disable-next-line react-hooks/immutability -- assigning to document.cookie is the standard cookie API, not a "modification" of a JS object
    document.cookie = `county=${slug}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
  };

  const clear = () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("civia_county");
    document.cookie = "county=; path=/; max-age=0; SameSite=Lax";
    setSavedSlug(null);
  };

  // Romanian-collation alphabetical order, computed once.
  const sortedCounties = useMemo(
    () => [...ALL_COUNTIES].sort((a, b) => a.name.localeCompare(b.name, "ro")),
    [],
  );

  const filtered = useMemo(() => {
    const q = strip(query);
    if (!q) return sortedCounties;
    return sortedCounties.filter((c) => {
      const haystack = `${strip(c.name)} ${c.id.toLowerCase()} ${c.slug}`;
      return haystack.includes(q);
    });
  }, [query, sortedCounties]);

  const savedCounty = savedSlug
    ? ALL_COUNTIES.find((c) => c.slug === savedSlug)
    : null;

  return (
    <div>
      {savedCounty && (
        <div className="mb-6 flex flex-wrap items-center gap-3 bg-[var(--color-primary-soft)] border border-[var(--color-primary)]/20 rounded-[var(--radius-md)] px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Check size={16} className="text-[var(--color-primary)] shrink-0" aria-hidden="true" />
            <span>
              Județ salvat:{" "}
              <strong className="text-[var(--color-primary)]">
                {savedCounty.name}
              </strong>
              <span className="ml-2 text-[var(--color-text-muted)] text-xs">
                ({savedCounty.id})
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Link
              href={`/${savedCounty.slug}`}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[var(--radius-xs)] bg-[var(--color-primary)] text-white text-xs font-medium hover:bg-[var(--color-primary-hover)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
            >
              Mergi la județ <ArrowRight size={12} aria-hidden="true" />
            </Link>
            <button
              type="button"
              onClick={clear}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[var(--radius-xs)] bg-[var(--color-surface)] border border-[var(--color-border)] text-xs font-medium hover:border-[var(--color-primary)]/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
            >
              Șterge preferința
            </button>
          </div>
        </div>
      )}

      {/* Search bar */}
      <div className="relative mb-5">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Caută județ — Cluj, Iași, Bihor, BV…"
          aria-label="Caută județ după nume sau cod"
          className="w-full h-12 pl-10 pr-12 rounded-[var(--radius-xs)] bg-[var(--color-surface)] border border-[var(--color-border)] text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 inline-flex items-center justify-center rounded-full text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
            aria-label="Golește căutarea"
          >
            <CloseX size={14} aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-[var(--color-text-muted)] tabular-nums">
          {filtered.length} {filtered.length === 1 ? "județ" : "județe"}
          {query && ` găsit${filtered.length === 1 ? "" : "e"} pentru „${query}"`}
        </p>
        {query && filtered.length === 0 && (
          <p className="text-xs text-[var(--color-text-muted)]">
            Nimic. Încearcă alt nume sau codul județului.
          </p>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-[var(--color-surface)] border border-dashed border-[var(--color-border)] rounded-[var(--radius-md)]">
          <MapPin size={28} className="mx-auto text-[var(--color-text-muted)] mb-3" aria-hidden="true" />
          <p className="text-sm text-[var(--color-text-muted)]">
            Niciun județ nu se potrivește cu „{query}".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filtered.map((county) => {
            const sesizari = sesizariStats[county.id] ?? 0;
            const authorities = authStats[county.id] ?? 0;
            const stats = getCountyStats(county.id);
            const aqi = stats.aqiMediu;
            const aqiC = aqiColor(aqi);
            const aqiL = aqiLabel(aqi);
            const isSaved = savedSlug === county.slug;

            return (
              <Link
                key={county.id}
                href={`/${county.slug}`}
                onClick={() => persist(county.slug)}
                prefetch
                className={`group relative bg-[var(--color-surface)] border rounded-[var(--radius-md)] p-4 hover:border-[var(--color-primary)]/40 hover:shadow-[var(--shadow-3)] hover:-translate-y-0.5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 ${
                  isSaved
                    ? "border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20"
                    : "border-[var(--color-border)]"
                }`}
                aria-current={isSaved ? "true" : undefined}
                aria-label={`${county.name} — ${county.population.toLocaleString("ro-RO")} locuitori${sesizari > 0 ? `, ${sesizari} sesizări` : ""}${authorities > 0 ? `, ${authorities} autorități` : ""}`}
              >
                {isSaved && (
                  <span
                    className="absolute top-2 right-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--color-primary)] text-white"
                    aria-hidden="true"
                  >
                    <Check size={12} strokeWidth={3} />
                  </span>
                )}

                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[10px] font-bold text-[var(--color-primary)] bg-[var(--color-primary-soft)] px-2 py-0.5 rounded tabular-nums">
                    {county.id}
                  </span>
                  {!isSaved && (
                    <ArrowRight
                      size={12}
                      className="text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-hidden="true"
                    />
                  )}
                </div>

                <p className="font-semibold text-sm leading-tight mb-2 group-hover:text-[var(--color-primary)] transition-colors line-clamp-2">
                  {county.name}
                </p>

                {/* Population — primary signal, always shown */}
                <p className="text-[11px] text-[var(--color-text-muted)] tabular-nums mb-2 inline-flex items-center gap-1">
                  <Users size={10} aria-hidden="true" />
                  {county.population.toLocaleString("ro-RO")} loc.
                </p>

                {/* Live signals — only render when non-zero so empty
                    counties don't show as "0 sesizări 0 autorități" */}
                <div className="flex items-center gap-2 text-[10px] text-[var(--color-text-muted)] flex-wrap">
                  {sesizari > 0 && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[var(--color-surface-2)]">
                      📩 {sesizari}
                    </span>
                  )}
                  {authorities > 0 && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[var(--color-surface-2)]">
                      <Building2 size={9} aria-hidden="true" /> {authorities}
                    </span>
                  )}
                  <span
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full"
                    style={{ backgroundColor: `${aqiC}1a`, color: aqiC }}
                    title={`Calitatea aerului: ${aqiL} (AQI ${aqi})`}
                  >
                    <Wind size={9} aria-hidden="true" /> {aqi}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
