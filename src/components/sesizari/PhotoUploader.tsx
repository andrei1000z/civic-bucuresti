"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, Loader2, ChevronLeft, ChevronRight } from "lucide-react";

interface PhotoUploaderProps {
  urls: string[];
  onChange: (urls: string[]) => void;
  max?: number;
}

const MAX_BYTES = 5 * 1024 * 1024;
const COMPRESS_THRESHOLD = 1.5 * 1024 * 1024;
const MAX_DIMENSION = 1920;

async function compressImage(file: File): Promise<File> {
  if (file.size <= COMPRESS_THRESHOLD) return file;
  if (!file.type.startsWith("image/")) return file;
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let w = img.width, h = img.height;
        if (w > MAX_DIMENSION || h > MAX_DIMENSION) {
          const ratio = Math.min(MAX_DIMENSION / w, MAX_DIMENSION / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(file);
        ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob((blob) => {
          if (!blob) return resolve(file);
          resolve(new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" }));
        }, "image/jpeg", 0.82);
      };
      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

export function PhotoUploader({ urls, onChange, max = 5 }: PhotoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFiles = useCallback(async (files: File[]) => {
    const toUpload = files.slice(0, max - urls.length);
    if (toUpload.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const compressed = await Promise.all(toUpload.map(compressImage));
      for (const f of compressed) {
        if (f.size > MAX_BYTES) throw new Error(`"${f.name}" e prea mare (max 5MB).`);
      }
      const fd = new FormData();
      compressed.forEach((f) => fd.append("files", f));
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const text = await res.text();
      let json;
      try { json = JSON.parse(text); } catch {
        throw new Error(`Eroare server (${res.status}).`);
      }
      if (!res.ok) throw new Error(json.error || "Upload failed");
      onChange([...urls, ...(json.data.urls as string[])]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Eroare la upload");
    } finally {
      setUploading(false);
    }
  }, [urls, max, onChange]);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    uploadFiles(Array.from(e.target.files));
    e.target.value = "";
  };

  // Drag & drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
    if (files.length > 0) uploadFiles(files);
  };

  // Paste
  const handlePaste = useCallback((e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    const files: File[] = [];
    for (const item of Array.from(items)) {
      if (item.type.startsWith("image/")) {
        const f = item.getAsFile();
        if (f) files.push(f);
      }
    }
    if (files.length > 0) {
      e.preventDefault();
      uploadFiles(files);
    }
  }, [uploadFiles]);

  // Listen for paste on the upload zone
  const zoneRef = useRef<HTMLDivElement>(null);

  const canAdd = urls.length < max;

  return (
    <div
      ref={zoneRef}
      onPaste={(e) => handlePaste(e.nativeEvent)}
      tabIndex={0}
      className="outline-none"
    >
      {canAdd && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-1.5 h-24 rounded-[8px] border-2 border-dashed cursor-pointer transition-colors ${
            dragging
              ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)]"
              : "border-[var(--color-border)] hover:border-[var(--color-primary)]"
          } text-sm text-[var(--color-text-muted)]`}
        >
          {uploading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Se încarcă...</span>
            </>
          ) : (
            <>
              <Upload size={18} />
              <span>Încarcă, trage sau lipește poze ({urls.length}/{max})</span>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFiles}
            disabled={uploading}
          />
        </div>
      )}

      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}

      {urls.length > 0 && (
        <div className="grid grid-cols-5 gap-2 mt-3">
          {urls.map((url, i) => (
            <div
              key={i}
              className="aspect-square rounded-[8px] bg-[var(--color-surface-2)] relative overflow-hidden group cursor-pointer"
              onClick={() => setLightbox(i)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onChange(urls.filter((_, j) => j !== i)); }}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20"
            onClick={() => setLightbox(null)}
          >
            <X size={24} />
          </button>

          {lightbox > 0 && (
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20"
              onClick={(e) => { e.stopPropagation(); setLightbox(lightbox - 1); }}
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {lightbox < urls.length - 1 && (
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20"
              onClick={(e) => { e.stopPropagation(); setLightbox(lightbox + 1); }}
            >
              <ChevronRight size={24} />
            </button>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={urls[lightbox]}
            alt={`Foto ${lightbox + 1}`}
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-[8px]"
            onClick={(e) => e.stopPropagation()}
          />

          <p className="absolute bottom-4 text-white/60 text-xs">
            {lightbox + 1} / {urls.length}
          </p>
        </div>
      )}
    </div>
  );
}
