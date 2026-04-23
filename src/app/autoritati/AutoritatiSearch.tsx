"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Phone, Mail, ExternalLink, X } from "lucide-react";

export interface Row {
  kind: "judet";
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

  const filtered = useMemo(() => {
    const q = normalize(query);
    if (!q) return rows;
    return rows.filter((r) => {
      const hay = normalize(`${r.name} ${r.countyName} ${r.id}`);
      return hay.includes(q);
    });
  }, [query, rows]);

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
          className="w-full h-12 pl-10 pr-10 rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface)] text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            aria-label="Șterge căutarea"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)] transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-sm text-[var(--color-text-muted)] py-8">
          Niciun rezultat pentru „{query}". Încearcă cu altceva.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((row) => (
            <article
              key={row.id}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[10px] p-4 hover:border-[var(--color-primary)]/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-[family-name:var(--font-sora)] font-semibold text-base">
                  {row.name}
                </h3>
                <span
                  className="text-[10px] uppercase tracking-wider font-semibold text-[var(--color-text-muted)] bg-[var(--color-bg)] px-2 py-0.5 rounded"
                  aria-label={`Cod județ ${row.id}`}
                >
                  {row.id}
                </span>
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

      <p className="text-center text-xs text-[var(--color-text-muted)] mt-6">
        {filtered.length} {filtered.length === 1 ? "rezultat" : "rezultate"}
      </p>
    </div>
  );
}
