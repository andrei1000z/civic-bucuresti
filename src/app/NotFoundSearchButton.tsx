"use client";

import { Search } from "lucide-react";

export function NotFoundSearchButton() {
  return (
    <button
      type="button"
      onClick={() => {
        if (typeof document !== "undefined") {
          document.dispatchEvent(new CustomEvent("open-command-palette"));
        }
      }}
      className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-[8px] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-sm font-medium hover:bg-[var(--color-surface)] transition-colors"
    >
      <Search size={16} />
      Caută pe site <kbd className="text-[10px] px-1.5 py-0.5 bg-[var(--color-border)] rounded font-mono">Ctrl K</kbd>
    </button>
  );
}
