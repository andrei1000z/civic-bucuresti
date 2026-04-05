"use client";

import { useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";

interface PhotoUploaderProps {
  urls: string[];
  onChange: (urls: string[]) => void;
  max?: number;
}

const MAX_BYTES = 5 * 1024 * 1024; // 5MB per file (server limit)
const COMPRESS_THRESHOLD = 1.5 * 1024 * 1024; // compress if > 1.5MB
const MAX_DIMENSION = 1920; // max width or height for compressed image

/**
 * Client-side image compression — keeps photos under ~1.5MB by resizing
 * to MAX_DIMENSION and re-encoding as JPEG @ 0.82 quality.
 */
async function compressImage(file: File): Promise<File> {
  if (file.size <= COMPRESS_THRESHOLD) return file;
  if (!file.type.startsWith("image/")) return file;

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let w = img.width;
        let h = img.height;
        if (w > MAX_DIMENSION || h > MAX_DIMENSION) {
          const ratio = Math.min(MAX_DIMENSION / w, MAX_DIMENSION / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(file);
        ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob(
          (blob) => {
            if (!blob) return resolve(file);
            resolve(new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" }));
          },
          "image/jpeg",
          0.82
        );
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

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files).slice(0, max - urls.length);
    if (files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      // Client-side compression first
      const compressed = await Promise.all(files.map(compressImage));

      // Validate sizes after compression
      for (const f of compressed) {
        if (f.size > MAX_BYTES) {
          throw new Error(`Poza "${f.name}" e prea mare (${(f.size / 1024 / 1024).toFixed(1)}MB). Maxim 5MB.`);
        }
      }

      const fd = new FormData();
      compressed.forEach((f) => fd.append("files", f));
      const res = await fetch("/api/upload", { method: "POST", body: fd });

      // Guard against HTML error responses (413, 500) — Next.js/Vercel may send HTML not JSON
      const text = await res.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch {
        if (res.status === 413) throw new Error("Pozele sunt prea mari. Încearcă mai puține sau mai mici.");
        if (res.status === 401) throw new Error("Trebuie să te autentifici pentru a încărca poze.");
        throw new Error(`Eroare server (${res.status}). Încearcă din nou.`);
      }
      if (!res.ok) throw new Error(json.error || "Upload failed");
      onChange([...urls, ...(json.data.urls as string[])]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Eroare la upload");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeAt = (idx: number) => {
    onChange(urls.filter((_, i) => i !== idx));
  };

  const canAdd = urls.length < max;

  return (
    <div>
      {canAdd && (
        <label className="flex items-center justify-center gap-2 h-24 rounded-[8px] border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-primary)] cursor-pointer transition-colors text-sm text-[var(--color-text-muted)]">
          {uploading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Se încarcă...</span>
            </>
          ) : (
            <>
              <Upload size={18} />
              <span>Încarcă poze ({urls.length}/{max})</span>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFiles}
            disabled={uploading}
          />
        </label>
      )}
      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
      {urls.length > 0 && (
        <div className="grid grid-cols-5 gap-2 mt-3">
          {urls.map((url, i) => (
            <div key={i} className="aspect-square rounded-[8px] bg-[var(--color-surface-2)] relative overflow-hidden group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" loading="lazy" decoding="async" />
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
