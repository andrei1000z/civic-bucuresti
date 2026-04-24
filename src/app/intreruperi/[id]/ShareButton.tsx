"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

export function ShareButton({
  id,
  title,
  text,
}: {
  id: string;
  title: string;
  text: string;
}) {
  const [copied, setCopied] = useState(false);

  const handle = async () => {
    const url = `${window.location.origin}/intreruperi/${id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        /* user cancelled */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <button
      onClick={handle}
      className="inline-flex items-center gap-2 h-10 px-4 rounded-[8px] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-sm font-medium hover:bg-[var(--color-surface)] transition-colors"
    >
      {copied ? <Check size={14} className="text-emerald-500" /> : <Share2 size={14} />}
      {copied ? "Link copiat" : "Distribuie"}
    </button>
  );
}
