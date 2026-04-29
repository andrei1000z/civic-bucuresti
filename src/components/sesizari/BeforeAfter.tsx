"use client";

import { useState } from "react";
import { ImageLightbox } from "@/components/ImageLightbox";
import { formatDateTime } from "@/lib/utils";

interface Props {
  beforeUrl: string;
  afterUrl: string;
  resolvedAt: string | null;
}

export function BeforeAfter({ beforeUrl, afterUrl, resolvedAt }: Props) {
  const [lightbox, setLightbox] = useState<{ urls: string[]; index: number } | null>(null);

  return (
    <>
      <section className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-900 rounded-[var(--radius-md)] p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-xs font-semibold">
            ✓ Rezolvat
          </span>
          {resolvedAt && (
            <span className="text-xs text-[var(--color-text-muted)]">
              {formatDateTime(resolvedAt)}
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <figure>
            <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
              Înainte
            </p>
            <button
              type="button"
              onClick={() => setLightbox({ urls: [beforeUrl, afterUrl], index: 0 })}
              aria-label={`Vezi poza „înainte" la mărime mare`}
              className="aspect-video w-full rounded-[8px] overflow-hidden bg-[var(--color-surface-2)] block group relative focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={beforeUrl}
                alt="Starea problemei înainte de rezolvare"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                loading="lazy"
              />
              <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full" aria-hidden="true">
                BEFORE
              </span>
            </button>
          </figure>
          <figure>
            <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
              După
            </p>
            <button
              type="button"
              onClick={() => setLightbox({ urls: [beforeUrl, afterUrl], index: 1 })}
              aria-label={`Vezi poza „după" la mărime mare`}
              className="aspect-video w-full rounded-[8px] overflow-hidden bg-[var(--color-surface-2)] block group relative focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={afterUrl}
                alt="Starea după rezolvare — dovadă vizuală"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                loading="lazy"
              />
              <span className="absolute top-2 left-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full" aria-hidden="true">
                AFTER
              </span>
            </button>
          </figure>
        </div>
      </section>

      {lightbox && (
        <ImageLightbox
          urls={lightbox.urls}
          initialIndex={lightbox.index}
          onClose={() => setLightbox(null)}
        />
      )}
    </>
  );
}
