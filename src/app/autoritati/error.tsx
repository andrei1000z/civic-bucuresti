"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[autoritati]", error);
  }, [error]);

  return (
    <div role="alert" aria-live="assertive" className="container-narrow py-16 text-center">
      <AlertTriangle size={48} className="mx-auto mb-4 text-amber-500" aria-hidden="true" />
      <h1 className="font-[family-name:var(--font-sora)] text-2xl font-bold mb-2">
        Catalogul autorităților nu se poate încărca
      </h1>
      <p className="text-sm text-[var(--color-text-muted)] mb-6 max-w-md mx-auto">
        Probabil o eroare temporară. Reîncearcă — sau întoarce-te la pagina
        principală.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 h-10 px-5 rounded-[8px] bg-[var(--color-primary)] text-white font-medium hover:bg-[var(--color-primary-hover)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-primary)]"
        >
          <RefreshCw size={14} aria-hidden="true" /> Reîncearcă
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 h-10 px-5 rounded-[8px] bg-[var(--color-surface)] border border-[var(--color-border)] text-sm font-medium hover:bg-[var(--color-surface-2)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
        >
          <ArrowLeft size={14} aria-hidden="true" /> Pagina principală
        </Link>
      </div>
    </div>
  );
}
