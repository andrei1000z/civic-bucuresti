"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Canonical hydration-safe pattern: server SSR + first client paint
  // arată skeleton-ul (mounted=false), după mount comutăm la theme detected.
  // setState în effect e INTENȚIONAT aici — alternativa e SSR/CSR mismatch.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <button
        type="button"
        className="w-10 h-10 rounded-[var(--radius-button)] bg-[var(--color-surface-2)]"
        aria-label="Schimbă tema"
        disabled
      />
    );
  }

  const current = resolvedTheme ?? theme;
  const isDark = current === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative w-10 h-10 rounded-[var(--radius-button)] bg-[var(--color-surface-2)] hover:bg-[var(--color-surface)] border border-[var(--color-border)] transition-all flex items-center justify-center text-[var(--color-text)]"
      aria-label={isDark ? "Activează modul luminos" : "Activează modul întunecat"}
      title={isDark ? "Mod luminos" : "Mod întunecat"}
    >
      {isDark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
    </button>
  );
}
