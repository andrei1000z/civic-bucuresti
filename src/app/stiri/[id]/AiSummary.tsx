"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

export function AiSummary({
  stireId,
  initialSummary,
  fallbackText,
}: {
  stireId: string;
  initialSummary: string | null;
  fallbackText: string;
}) {
  const [summary, setSummary] = useState<string | null>(initialSummary);
  // If the server already produced a summary (common case) skip the client fetch entirely.
  const [loading, setLoading] = useState(!initialSummary);

  useEffect(() => {
    if (initialSummary) return; // Server already generated — nothing to do

    // Fallback path only: server failed to generate (timeout / cold start).
    // Hit the API route which has its own cache + rate limit.
    let cancelled = false;
    fetch(`/api/stiri/${stireId}/synthesize`)
      .then((r) => r.json())
      .then((j) => {
        if (!cancelled && j.data?.summary) {
          setSummary(j.data.summary);
        }
      })
      .catch(() => {
        if (!cancelled) setSummary(fallbackText);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [stireId, initialSummary, fallbackText]);

  if (loading) {
    return (
      <div className="flex items-center gap-3 py-4">
        <Loader2 size={16} className="animate-spin text-violet-500" />
        <p className="text-sm text-[var(--color-text-muted)]">
          Se generează sinteza AI...
        </p>
      </div>
    );
  }

  if (!summary) {
    return (
      <p className="text-sm text-[var(--color-text-muted)] italic">
        {fallbackText || "Nu am putut genera o sinteză pentru acest articol."}
      </p>
    );
  }

  return (
    <div className="prose-civic text-sm leading-relaxed whitespace-pre-wrap">
      {summary.split("\n").map((paragraph, i) => {
        if (!paragraph.trim()) return null;

        // Bold headings (lines starting with **)
        if (paragraph.startsWith("**") && paragraph.endsWith("**")) {
          return (
            <h3 key={i} className="font-[family-name:var(--font-sora)] font-bold text-base mt-4 mb-2 text-[var(--color-text)]">
              {paragraph.replace(/\*\*/g, "")}
            </h3>
          );
        }

        // Section headers like "De ce contează:"
        if (paragraph.match(/^(De ce contează|Context|Cifre cheie|Ce urmează)/i)) {
          return (
            <h3 key={i} className="font-[family-name:var(--font-sora)] font-bold text-sm mt-4 mb-1 text-violet-700 dark:text-violet-400">
              {paragraph}
            </h3>
          );
        }

        return (
          <p key={i} className="mb-2 text-[var(--color-text)]">
            {paragraph}
          </p>
        );
      })}
    </div>
  );
}
