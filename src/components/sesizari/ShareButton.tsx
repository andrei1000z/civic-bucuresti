"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function ShareButton({ code, size = "sm" }: { code: string; size?: "sm" | "md" }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/sesizari/${code}`;

    // Try native share first
    if (navigator.share) {
      try {
        await navigator.share({ url, title: `Sesizare ${code}` });
        return;
      } catch {
        // User cancelled — fall through to copy
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: prompt
      window.prompt("Copiază link-ul:", url);
    }
  };

  const iconSize = size === "sm" ? 12 : 14;
  const px = size === "sm" ? "px-2 py-1" : "px-2.5 py-1.5";

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-live="polite"
      className={cn(
        "inline-flex items-center gap-1 rounded-[var(--radius-xs)] text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]",
        px,
        copied
          ? "bg-emerald-500 text-white"
          : "bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:bg-[var(--color-border)] hover:text-[var(--color-text)]"
      )}
      aria-label={copied ? "Link copiat în clipboard" : "Distribuie sesizarea"}
    >
      {copied ? <Check size={iconSize} aria-hidden="true" /> : <Share2 size={iconSize} aria-hidden="true" />}
      <span>{copied ? "Copiat" : "Share"}</span>
    </button>
  );
}
