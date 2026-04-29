"use client";

import Link from "next/link";
import { Wind, RotateCcw, ArrowLeft } from "lucide-react";

export default function AerError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div role="alert" aria-live="assertive" className="container-narrow py-16 md:py-24 max-w-lg text-center">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
        <Wind size={36} className="text-sky-600 dark:text-sky-400" aria-hidden="true" />
      </div>
      <h1 className="font-[family-name:var(--font-sora)] text-2xl md:text-3xl font-bold mb-2">
        Datele despre aer nu se pot încărca
      </h1>
      <p className="text-[var(--color-text-muted)] mb-6">
        Sursele OpenAQ sau Sensor.Community sunt temporar indisponibile. Datele se actualizează la fiecare oră — reîncearcă în câteva minute.
      </p>
      <div className="flex gap-3 justify-center flex-wrap">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 h-11 px-5 rounded-[var(--radius-xs)] bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-primary)]"
        >
          <RotateCcw size={16} aria-hidden="true" />
          Reîncearcă
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 h-11 px-5 rounded-[var(--radius-xs)] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-sm font-medium hover:bg-[var(--color-surface)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Acasă
        </Link>
      </div>
    </div>
  );
}
