"use client";

import { ExternalLink } from "lucide-react";
import { SURSE } from "@/data/surse-statistici";

export function SourceCitation({ sourceKey }: { sourceKey: string }) {
  const sursa = SURSE[sourceKey];
  if (!sursa) return null;

  const isExternal = sursa.url.startsWith("http");

  return (
    <div className="mt-3 pt-3 border-t border-[var(--color-border)]">
      <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] font-semibold mb-1">
        Sursa
      </p>
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="text-[var(--color-text-muted)] truncate">
          {sursa.name} · {sursa.publisher} · {sursa.year}
        </span>
        <a
          href={sursa.url}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noreferrer" : undefined}
          className="shrink-0 text-[var(--color-primary)] hover:underline inline-flex items-center gap-0.5"
        >
          {isExternal ? (
            <>
              Link <ExternalLink size={10} />
            </>
          ) : (
            "Local"
          )}
        </a>
      </div>
    </div>
  );
}
