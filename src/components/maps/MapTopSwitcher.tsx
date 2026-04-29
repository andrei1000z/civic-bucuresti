"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SwitcherTab<T extends string> {
  id: T;
  label: string;
  icon: LucideIcon;
}

interface Props<T extends string> {
  tabs: ReadonlyArray<SwitcherTab<T>>;
  active: T;
  onChange: (id: T) => void;
}

/**
 * Floating top-center segmented switcher — liquid-glass pill that holds
 * a smoothly-sliding "water-drop" indicator behind the active tab.
 *
 * The indicator is a single absolutely-positioned span. We measure each
 * tab's offsetLeft + offsetWidth via refs and animate `transform` +
 * `width` with a long cubic-bezier so it feels like a droplet flowing
 * across the surface (iOS Liquid Glass aesthetic). The bezier
 * (0.4, 1.4, 0.5, 1) overshoots slightly for the squish, then settles.
 */
export function MapTopSwitcher<T extends string>({ tabs, active, onChange }: Props<T>) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicator, setIndicator] = useState<{ x: number; w: number } | null>(null);

  const measure = () => {
    const btn = tabRefs.current[active];
    const wrap = containerRef.current;
    if (!btn || !wrap) return;
    const wrapRect = wrap.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    setIndicator({
      x: btnRect.left - wrapRect.left,
      w: btnRect.width,
    });
  };

  // Measure right after layout so the indicator never lags one frame.
  useLayoutEffect(() => {
    measure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, tabs.length]);

  // Re-measure on resize so the pill stays glued during viewport changes.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 z-30 max-w-[calc(100%-1rem)]">
      <div
        ref={containerRef}
        role="tablist"
        aria-label="Selectează tipul de hartă"
        className={cn(
          "pointer-events-auto relative flex items-center gap-1 p-1 rounded-full",
          // Truly translucent liquid-glass: low alpha bg + heavy blur so
          // the map color genuinely bleeds through. Multi-layer shadow
          // gives the floating-glass feel without a solid surface.
          "backdrop-blur-2xl backdrop-saturate-200",
          "bg-white/[0.07] dark:bg-white/[0.06]",
          "ring-1 ring-white/25 ring-inset",
          "shadow-[0_10px_32px_-8px_rgba(0,0,0,0.45),0_2px_6px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.35),inset_0_-1px_0_rgba(0,0,0,0.18)]",
          "overflow-x-auto no-scrollbar",
        )}
      >
        {/* Sliding water-drop indicator (renders behind tabs, above bg).
            transform + width animate together with a slow over-shooting
            cubic-bezier so the drop appears to "flow" between tabs. */}
        {indicator && (
          <span
            aria-hidden="true"
            className={cn(
              "absolute top-1 bottom-1 rounded-full pointer-events-none",
              // Slightly brighter than the rail so the active drop pops
              "bg-white/40 dark:bg-white/30",
              "ring-1 ring-white/55 ring-inset",
              "backdrop-blur-md backdrop-saturate-200",
              "shadow-[0_6px_18px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.55),inset_0_-1px_0_rgba(0,0,0,0.12)]",
              // Inner crescent highlight — sells the curved water surface
              "before:absolute before:inset-x-2 before:top-[2px] before:h-1/2 before:rounded-full",
              "before:bg-gradient-to-b before:from-white/65 before:via-white/15 before:to-transparent",
              "before:opacity-90 before:pointer-events-none",
            )}
            style={{
              transform: `translateX(${indicator.x}px)`,
              width: `${indicator.w}px`,
              // Long, slightly over-shooting cubic-bezier — gives the drop a
              // brief "stretch" feel as it flows between tabs (iOS Liquid
              // Glass aesthetic). Width and transform share the same easing
              // so the morph stays in sync.
              transition:
                "transform 620ms cubic-bezier(0.34, 1.56, 0.45, 1), width 620ms cubic-bezier(0.34, 1.56, 0.45, 1)",
            }}
          />
        )}

        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[tab.id] = el;
              }}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.id)}
              className={cn(
                "shrink-0 relative z-10 inline-flex items-center justify-center gap-1.5 h-10 px-3 sm:px-4 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white",
                isActive
                  ? "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]"
                  : "text-white/75 hover:text-white",
              )}
            >
              <Icon size={15} aria-hidden="true" />
              <span className="hidden min-[420px]:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
