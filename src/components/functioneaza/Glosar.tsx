"use client";

import { useState } from "react";
import { ChevronDown, BookOpen } from "lucide-react";
import { GLOSAR } from "@/data/pmb-structura";
import { cn } from "@/lib/utils";

export function Glosar() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-5">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen size={18} className="text-[var(--color-primary)]" />
        <h3 className="font-[family-name:var(--font-sora)] font-semibold">Glosar abrevieri</h3>
      </div>
      <div className="space-y-2">
        {GLOSAR.map((g) => {
          const isOpen = openId === g.shortForm;
          return (
            <div key={g.shortForm} className="border border-[var(--color-border)] rounded-[8px] overflow-hidden">
              <button
                onClick={() => setOpenId(isOpen ? null : g.shortForm)}
                className="w-full flex items-center justify-between p-3 hover:bg-[var(--color-surface-2)] transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-[var(--color-primary)] text-sm shrink-0 w-12">
                    {g.shortForm}
                  </span>
                  <span className="text-sm font-medium">{g.term}</span>
                </div>
                <ChevronDown size={14} className={cn("transition-transform", isOpen && "rotate-180")} />
              </button>
              {isOpen && (
                <div className="px-3 pb-3 pl-[4.25rem] text-xs text-[var(--color-text-muted)] leading-relaxed">
                  {g.definition}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
