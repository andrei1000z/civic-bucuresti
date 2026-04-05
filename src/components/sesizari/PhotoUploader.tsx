"use client";

import { useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";

interface PhotoUploaderProps {
  urls: string[];
  onChange: (urls: string[]) => void;
  max?: number;
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
      const fd = new FormData();
      files.forEach((f) => fd.append("files", f));
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");
      onChange([...urls, ...(json.data.urls as string[])]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload error");
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
            // eslint-disable-next-line @next/next/no-img-element
            <div key={i} className="aspect-square rounded-[8px] bg-[var(--color-surface-2)] relative overflow-hidden group">
              <img src={url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
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
