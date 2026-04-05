"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="container-narrow py-16 md:py-24 max-w-lg text-center">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
        <AlertTriangle size={36} className="text-red-600 dark:text-red-400" />
      </div>
      <h1 className="font-[family-name:var(--font-sora)] text-3xl md:text-4xl font-bold mb-2">
        Ceva a mers prost
      </h1>
      <p className="text-[var(--color-text-muted)] mb-1">
        Am întâmpinat o eroare neașteptată. Încearcă să reîncarci pagina.
      </p>
      {error.digest && (
        <p className="text-xs font-mono text-[var(--color-text-muted)] mb-6">ref: {error.digest}</p>
      )}
      <div className="flex gap-3 justify-center mt-6">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 h-11 px-5 rounded-[8px] bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-colors"
        >
          <RotateCcw size={16} />
          Încearcă din nou
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 h-11 px-5 rounded-[8px] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-sm font-medium hover:bg-[var(--color-surface)] transition-colors"
        >
          <Home size={16} />
          Acasă
        </Link>
      </div>
    </div>
  );
}
