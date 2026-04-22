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

  const sameCounty = a === b;
  const href = sameCounty ? "/compara" : `/compara/${a}/${b}`;

  // Filter the second dropdown so the user can't pick the same
  // county twice from the UI side. They *can* still match via the
  // first dropdown's onChange, so the button-level guard below is
  // the last line of defence.
  const countiesForB = counties.filter((c) => c.slug !== a);

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
            onChange={(e) => {
              const next = e.target.value;
              setA(next);
              // Avoid the same-county trap by bouncing B to the
              // first different option if the user steers A into B.
              if (next === b) {
                const alternative = counties.find((c) => c.slug !== next);
                if (alternative) setB(alternative.slug);
              }
            }}
            className="w-full h-12 px-3 rounded-[8px] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          >
            {counties.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name} ({c.id})
              </option>
            ))}
          </select>
        </div>

        <div className="text-2xl text-center text-[var(--color-text-muted)] self-center sm:pb-2" aria-hidden="true">
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
            {countiesForB.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name} ({c.id})
              </option>
            ))}
          </select>
        </div>
      </div>

      <Link
        href={href}
        prefetch={!sameCounty}
        aria-disabled={sameCounty}
        tabIndex={sameCounty ? -1 : 0}
        onClick={(e) => { if (sameCounty) e.preventDefault(); }}
        className={`mt-6 inline-flex items-center justify-center gap-2 w-full h-12 rounded-[var(--radius-button)] bg-[var(--color-primary)] text-white font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-primary)] ${
          sameCounty ? "opacity-50 pointer-events-none cursor-not-allowed" : "hover:bg-[var(--color-primary-hover)]"
        }`}
      >
        Compară <ArrowRight size={18} />
      </Link>

      {sameCounty && (
        <p className="mt-2 text-xs text-[var(--color-text-muted)] text-center">
          Alege două județe diferite pentru comparație.
        </p>
      )}
    </div>
  );
}
