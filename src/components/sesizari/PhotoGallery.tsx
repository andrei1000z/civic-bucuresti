"use client";

import { useState } from "react";
import { Image as ImgIcon, Download } from "lucide-react";
import { ImageLightbox } from "@/components/ImageLightbox";

interface Props {
  urls: string[];
  title?: string;
}

export function PhotoGallery({ urls, title = "Foto" }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const validUrls = urls.filter((u) => u.startsWith("http"));
  if (validUrls.length === 0) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {urls.map((_, i) => (
          <div
            key={i}
            className="aspect-video rounded-[8px] bg-[var(--color-surface-2)] flex items-center justify-center"
          >
            <ImgIcon size={24} className="text-[var(--color-text-muted)]" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {validUrls.map((url, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setOpenIndex(i)}
            className="group relative aspect-video rounded-[8px] bg-[var(--color-surface-2)] overflow-hidden hover:ring-2 hover:ring-[var(--color-primary)] transition-all"
            aria-label={`Deschide ${title} ${i + 1}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={`${title} ${i + 1}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <span className="text-white opacity-0 group-hover:opacity-100 text-xs font-medium bg-black/60 rounded-full px-3 py-1 transition-opacity">
                Click pentru mărire
              </span>
            </div>
            {/* Download button */}
            <a
              href={url}
              download
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-black/80 transition-all"
              aria-label="Salvează imaginea"
            >
              <Download size={13} />
            </a>
          </button>
        ))}
      </div>

      {openIndex !== null && (
        <ImageLightbox
          urls={validUrls}
          initialIndex={openIndex}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </>
  );
}
