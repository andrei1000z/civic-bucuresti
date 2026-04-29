"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ArrowRight, Users, Building2, Check } from "lucide-react";
import { ALL_COUNTIES } from "@/data/counties";

interface Props {
  sesizariStats: Record<string, number>;
  authStats: Record<string, number>;
}

/**
 * Client-side county grid that:
 *   - Highlights the currently-saved county (from localStorage/cookie)
 *   - Persists the new county to localStorage + cookie on click
 *   - Navigates to `/{slug}` (the main county flow), NOT `/judete/{id}` —
 *     the latter is kept as a legacy alternate URL for SEO but the
 *     primary "live in this county" experience is on the top-level route.
 */
export function JudeteGrid({ sesizariStats, authStats }: Props) {
  const [savedSlug, setSavedSlug] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("civia_county");
    if (raw) setSavedSlug(raw.toLowerCase());
  }, []);

  const persist = (slug: string) => {
    if (typeof window === "undefined") return;
    localStorage.setItem("civia_county", slug);
    // eslint-disable-next-line react-hooks/immutability -- assigning to document.cookie is standard cookie API, not "modification"
    document.cookie = `county=${slug}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
  };

  const clear = () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("civia_county");
     
    document.cookie = "county=; path=/; max-age=0; SameSite=Lax";
    setSavedSlug(null);
  };

  const counties = [...ALL_COUNTIES].sort((a, b) =>
    a.name.localeCompare(b.name, "ro"),
  );

  return (
    <div>
      {savedSlug && (
        <div className="mb-6 flex flex-wrap items-center gap-3 bg-[var(--color-primary-soft)] border border-[var(--color-primary)]/20 rounded-[var(--radius-md)] px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Check size={16} className="text-[var(--color-primary)] shrink-0" />
            <span>
              Județ salvat:{" "}
              <strong className="text-[var(--color-primary)]">
                {ALL_COUNTIES.find((c) => c.slug === savedSlug)?.name ?? savedSlug.toUpperCase()}
              </strong>
            </span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Link
              href={`/${savedSlug}`}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[var(--radius-xs)] bg-[var(--color-primary)] text-white text-xs font-medium hover:bg-[var(--color-primary-hover)] transition-colors"
            >
              Mergi la județ <ArrowRight size={12} />
            </Link>
            <button
              onClick={clear}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[var(--radius-xs)] bg-[var(--color-surface)] border border-[var(--color-border)] text-xs font-medium hover:border-[var(--color-primary)]/40 transition-colors"
            >
              Șterge preferința
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {counties.map((county) => {
          const sesizari = sesizariStats[county.id] ?? 0;
          const authorities = authStats[county.id] ?? 0;
          const isSaved = savedSlug === county.slug;

          return (
            <Link
              key={county.id}
              href={`/${county.slug}`}
              onClick={() => persist(county.slug)}
              prefetch
              className={`group relative bg-[var(--color-surface)] border rounded-[var(--radius-md)] p-4 hover:border-[var(--color-primary)]/40 hover:shadow-[var(--shadow-md)] transition-all ${
                isSaved
                  ? "border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20"
                  : "border-[var(--color-border)]"
              }`}
              aria-current={isSaved ? "true" : undefined}
            >
              {isSaved && (
                <span className="absolute top-2 right-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--color-primary)] text-white">
                  <Check size={12} strokeWidth={3} />
                </span>
              )}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[var(--color-primary)] bg-[var(--color-primary-soft)] px-2 py-0.5 rounded">
                  {county.id}
                </span>
                {!isSaved && (
                  <ArrowRight
                    size={12}
                    className="text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                )}
              </div>
              <p className="font-semibold text-sm mb-2 group-hover:text-[var(--color-primary)] transition-colors">
                {county.name}
              </p>
              <div className="flex items-center gap-3 text-[10px] text-[var(--color-text-muted)]">
                {sesizari > 0 && (
                  <span className="flex items-center gap-1">
                    <Users size={10} /> {sesizari}
                  </span>
                )}
                {authorities > 0 && (
                  <span className="flex items-center gap-1">
                    <Building2 size={10} /> {authorities}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
