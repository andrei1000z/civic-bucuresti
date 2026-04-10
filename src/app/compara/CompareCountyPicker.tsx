"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface CountyOption {
  id: string;
  name: string;
  slug: string;
}

export function CompareCountyPicker({ counties }: { counties: CountyOption[] }) {
  const [a, setA] = useState<string>(counties[0]?.slug ?? "b");
  const [b, setB] = useState<string>(counties[1]?.slug ?? "cj");

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] p-6 max-w-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-4 items-end">
        <div>
          <label htmlFor="county-a" className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
            Județul A
          </label>
          <select
            id="county-a"
            value={a}
            onChange={(e) => setA(e.target.value)}
            className="w-full h-12 px-3 rounded-[8px] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          >
            {counties.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name} ({c.id})
              </option>
            ))}
          </select>
        </div>

        <div className="text-2xl text-center text-[var(--color-text-muted)] self-center sm:pb-2">
          vs
        </div>

        <div>
          <label htmlFor="county-b" className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
            Județul B
          </label>
          <select
            id="county-b"
            value={b}
            onChange={(e) => setB(e.target.value)}
            className="w-full h-12 px-3 rounded-[8px] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          >
            {counties.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name} ({c.id})
              </option>
            ))}
          </select>
        </div>
      </div>

      <Link
        href={`/compara/${a}/${b}`}
        prefetch
        className={`mt-6 inline-flex items-center justify-center gap-2 w-full h-12 rounded-[var(--radius-button)] bg-[var(--color-primary)] text-white font-semibold transition-colors ${
          a === b ? "opacity-50 pointer-events-none" : "hover:bg-[var(--color-primary-hover)]"
        }`}
      >
        Compară <ArrowRight size={18} />
      </Link>

      {a === b && (
        <p className="mt-2 text-xs text-[var(--color-text-muted)] text-center">
          Alege două județe diferite pentru comparație.
        </p>
      )}
    </div>
  );
}
