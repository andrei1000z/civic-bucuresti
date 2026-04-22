"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Building2, Shield, Check, AlertCircle } from "lucide-react";

interface Row {
  kind: "judet";
  id: string;
  slug: string;
  name: string;
  countyName: string;
  hasPrimarie: boolean;
  hasPl: boolean;
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
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Caută județ (ex: Cluj, Timiș, Argeș)…"
          aria-label="Caută autoritate"
          className="w-full h-12 pl-10 pr-4 rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface)] text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-sm text-[var(--color-text-muted)] py-8">
          Niciun rezultat pentru „{query}". Încearcă cu altceva.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((row) => (
            <Link
              key={row.id}
              href={row.href}
              className="group bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[10px] p-4 hover:border-[var(--color-primary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-[family-name:var(--font-sora)] font-semibold text-base group-hover:text-[var(--color-primary)] transition-colors">
                  {row.name}
                </h3>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--color-text-muted)] bg-[var(--color-bg)] px-2 py-0.5 rounded">
                  {row.id}
                </span>
              </div>
              <div className="flex flex-col gap-1.5 text-xs">
                <Badge
                  icon={Building2}
                  label="Primărie"
                  ok={row.hasPrimarie}
                />
                <Badge
                  icon={Shield}
                  label="Poliția Locală"
                  ok={row.hasPl}
                />
              </div>
            </Link>
          ))}
        </div>
      )}

      <p className="text-center text-xs text-[var(--color-text-muted)] mt-6">
        {filtered.length} {filtered.length === 1 ? "rezultat" : "rezultate"}
      </p>
    </div>
  );
}

function Badge({
  icon: Icon,
  label,
  ok,
}: {
  icon: React.ElementType;
  label: string;
  ok: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[var(--color-text-muted)]">
      <Icon size={12} className="shrink-0" />
      {label}
      {ok ? (
        <Check size={12} className="text-[var(--color-primary)] shrink-0" aria-label="Email verificat" />
      ) : (
        <AlertCircle size={12} className="text-amber-500 shrink-0" aria-label="Doar telefon / website" />
      )}
    </span>
  );
}
