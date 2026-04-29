"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor, Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Theme picker pentru /cont — 3 opțiuni: light / dark / system. Mai
 * detaliat decât simplul ThemeToggle (next-themes setTheme cu default
 * "system"). Hydration-safe via mounted check.
 */
export function ThemeSettings() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-20 rounded-[var(--radius-xs)] bg-[var(--color-surface-2)] animate-pulse"
            aria-hidden="true"
          />
        ))}
      </div>
    );
  }

  const options = [
    { value: "light", label: "Luminos", icon: Sun },
    { value: "dark", label: "Întunecat", icon: Moon },
    { value: "system", label: "Sistem", icon: Monitor },
  ] as const;

  return (
    <div className="grid grid-cols-3 gap-2">
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = theme === opt.value;
        const isResolved = !isActive && opt.value === resolvedTheme && theme === "system";
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => setTheme(opt.value)}
            aria-pressed={isActive}
            className={cn(
              "relative flex flex-col items-center justify-center gap-1.5 h-20 rounded-[var(--radius-xs)] border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]",
              isActive
                ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
                : "border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-2)]",
            )}
          >
            <Icon size={20} aria-hidden="true" />
            <span className="text-xs font-medium">{opt.label}</span>
            {isActive && (
              <Check
                size={12}
                className="absolute top-1.5 right-1.5 text-[var(--color-primary)]"
                aria-hidden="true"
              />
            )}
            {isResolved && (
              <span className="absolute bottom-1 right-1 text-[9px] text-[var(--color-text-muted)] uppercase">
                activ
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
