"use client";

import { Search as SearchIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { InputHTMLAttributes } from "react";

interface SearchBarProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export function SearchBar({ className, placeholder = "Caută...", ...props }: SearchBarProps) {
  return (
    <div className={cn("relative", className)}>
      <SearchIcon
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none"
        size={18}
      />
      <input
        type="search"
        placeholder={placeholder}
        className={cn(
          "w-full h-11 pl-10 pr-4 rounded-[var(--radius-button)]",
          "bg-[var(--color-surface)] border border-[var(--color-border)]",
          "text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)]",
          "focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
        )}
        {...props}
      />
    </div>
  );
}
