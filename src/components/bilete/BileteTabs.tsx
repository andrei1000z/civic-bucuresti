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
      <div className="flex gap-2 mb-8 border-b border-[var(--color-border)] overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={cn(
                "flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap",
                isActive
                  ? "border-current"
                  : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              )}
              style={isActive ? { color: tab.color } : undefined}
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: tab.color }}
              />
              {tab.label}
            </button>
          );
        })}
      </div>
      <div>
        {active === "stb" && stbContent}
        {active === "metrorex" && metrorexContent}
        {active === "ilfov" && ilfovContent}
      </div>
    </div>
  );
}
