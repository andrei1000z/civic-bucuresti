"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BileteTabsProps {
  stbContent: ReactNode;
  metrorexContent: ReactNode;
  ilfovContent: ReactNode;
}

const tabs = [
  { id: "stb", label: "STB", color: "#DC2626" },
  { id: "metrorex", label: "Metrorex", color: "#2563EB" },
  { id: "ilfov", label: "Ilfov / Voluntari", color: "#059669" },
] as const;

export function BileteTabs({ stbContent, metrorexContent, ilfovContent }: BileteTabsProps) {
  const [active, setActive] = useState<"stb" | "metrorex" | "ilfov">("stb");

  return (
    <div>
      <div
        className="flex gap-2 mb-8 border-b border-[var(--color-border)] overflow-x-auto no-scrollbar"
        role="tablist"
        aria-label="Operator transport public"
      >
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`bilete-panel-${tab.id}`}
              id={`bilete-tab-${tab.id}`}
              onClick={() => setActive(tab.id)}
              className={cn(
                "flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 rounded-t-[8px]",
                isActive
                  ? "border-current"
                  : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              )}
              style={isActive ? { color: tab.color } : undefined}
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: tab.color }}
                aria-hidden="true"
              />
              {tab.label}
            </button>
          );
        })}
      </div>
      <div
        role="tabpanel"
        id={`bilete-panel-${active}`}
        aria-labelledby={`bilete-tab-${active}`}
      >
        {active === "stb" && stbContent}
        {active === "metrorex" && metrorexContent}
        {active === "ilfov" && ilfovContent}
      </div>
    </div>
  );
}
