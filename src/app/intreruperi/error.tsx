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
     
    console.error("[intreruperi]", error);
  }, [error]);

  return (
    <div className="container-narrow py-16 text-center">
      <AlertTriangle size={48} className="mx-auto mb-4 text-amber-500" />
      <h1 className="font-[family-name:var(--font-sora)] text-2xl font-bold mb-2">
        Nu putem încărca întreruperile acum
      </h1>
      <p className="text-sm text-[var(--color-text-muted)] mb-6 max-w-md mx-auto">
        Catalogul are o problemă temporară. Încearcă din nou — cele mai multe
        greșeli se rezolvă la reîncărcare.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 h-10 px-5 rounded-[8px] bg-[var(--color-primary)] text-white font-medium hover:bg-[var(--color-primary-hover)] transition-colors"
        >
          <RefreshCw size={14} /> Încearcă din nou
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 h-10 px-5 rounded-[8px] bg-[var(--color-surface)] border border-[var(--color-border)] text-sm font-medium hover:bg-[var(--color-surface-2)] transition-colors"
        >
          <ArrowLeft size={14} /> Pagina principală
        </Link>
      </div>
    </div>
  );
}
