"use client";

import { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, Download } from "lucide-react";

interface Props {
  urls: string[];
  initialIndex?: number;
  onClose: () => void;
}

export function ImageLightbox({ urls, initialIndex = 0, onClose }: Props) {
  const [index, setIndex] = useState(initialIndex);

  const prev = useCallback(() => setIndex((i) => (i - 1 + urls.length) % urls.length), [urls.length]);
  const next = useCallback(() => setIndex((i) => (i + 1) % urls.length), [urls.length]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [prev, next, onClose]);

  if (urls.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <a
          href={urls[index]}
          download
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          aria-label="Salvează"
          title="Salvează imaginea"
        >
          <Download size={20} />
        </a>
        <button
          onClick={onClose}
          className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
          aria-label="Închide (Esc)"
        >
          <X size={22} />
        </button>
      </div>
      {urls.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
            aria-label="Înapoi (←)"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
            aria-label="Înainte (→)"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={urls[index]}
        alt={`Imagine ${index + 1}`}
        className="max-w-full max-h-[90vh] object-contain rounded-[8px]"
        onClick={(e) => e.stopPropagation()}
      />
      {urls.length > 1 && (
        <p className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-medium backdrop-blur">
          {index + 1} / {urls.length}
        </p>
      )}
    </div>
  );
}
