"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
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
 * Animation strategy: we drive the indicator with the Web Animations
 * API rather than CSS transitions. CSS transitions get collapsed when
 * React commits two state updates inside a single layout-effect tick
 * (the browser only paints the final position, so the indicator
 * teleports instead of glides). WAAPI runs the animation explicitly,
 * regardless of React's render timing.
 *
 * Each slide also threads a mid-keyframe with a slight horizontal
 * scale (1.18) so the drop visibly *stretches* in the direction of
 * travel and settles back to scaleX(1) at the destination — the iOS
 * Liquid Glass "morph" feel.
 */
export function MapTopSwitcher<T extends string>({ tabs, active, onChange }: Props<T>) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const indicatorRef = useRef<HTMLSpanElement | null>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const prevActiveRef = useRef<T | null>(null);
  const prevPosRef = useRef<{ x: number; w: number } | null>(null);

  const moveIndicator = () => {
    const btn = tabRefs.current[active];
    const wrap = containerRef.current;
    const ind = indicatorRef.current;
    if (!btn || !wrap || !ind) return;
    const wrapRect = wrap.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    const newX = btnRect.left - wrapRect.left;
    const newW = btnRect.width;

    const prev = prevPosRef.current;
    const isFirst = prevActiveRef.current === null || !prev;

    if (isFirst) {
      // First mount: snap to position with no animation.
      ind.style.transform = `translateX(${newX}px)`;
      ind.style.width = `${newW}px`;
      prevPosRef.current = { x: newX, w: newW };
      prevActiveRef.current = active;
      return;
    }

    // Skip if nothing moved (e.g. resize but same active tab and same
    // measurements).
    if (prev.x === newX && prev.w === newW) return;

    // Mid-frame: slight scaleX stretch in the direction of travel,
    // averaged position. Sells the "water drop morphing across glass"
    // effect from iOS Liquid Glass controls.
    const midX = (prev.x + newX) / 2;
    const midW = Math.max(prev.w, newW) * 1.05;

    // Cancel any in-flight animation so rapid clicks don't queue up.
    ind.getAnimations?.().forEach((a) => a.cancel());

    ind.animate(
      [
        {
          transform: `translateX(${prev.x}px) scaleX(1)`,
          width: `${prev.w}px`,
          easing: "cubic-bezier(0.65, 0, 0.35, 1)",
        },
        {
          transform: `translateX(${midX}px) scaleX(1.18)`,
          width: `${midW}px`,
          offset: 0.5,
          easing: "cubic-bezier(0.65, 0, 0.35, 1)",
        },
        {
          transform: `translateX(${newX}px) scaleX(1)`,
          width: `${newW}px`,
        },
      ],
      {
        duration: 720,
        easing: "cubic-bezier(0.65, 0, 0.35, 1)",
        fill: "forwards",
      },
    );

    // Mirror end-state on the element so subsequent measurements + the
    // post-animation static rendering land on the right values.
    ind.style.transform = `translateX(${newX}px)`;
    ind.style.width = `${newW}px`;

    prevPosRef.current = { x: newX, w: newW };
    prevActiveRef.current = active;
  };

  // useLayoutEffect for the *initial* mount — measures synchronously so
  // the indicator never paints at the wrong position. The animation
  // path uses WAAPI which doesn't depend on the React render cadence,
  // so layout vs effect timing doesn't matter once we're past first
  // paint.
  useLayoutEffect(() => {
    moveIndicator();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, tabs.length]);

  // Re-position on resize so the pill stays glued during viewport
  // changes. We call the static "snap" path (cancel + style assign)
  // directly to avoid re-running the slide animation on every resize
  // pixel.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onResize = () => {
      const btn = tabRefs.current[active];
      const wrap = containerRef.current;
      const ind = indicatorRef.current;
      if (!btn || !wrap || !ind) return;
      const wrapRect = wrap.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      const newX = btnRect.left - wrapRect.left;
      const newW = btnRect.width;
      ind.getAnimations?.().forEach((a) => a.cancel());
      ind.style.transform = `translateX(${newX}px)`;
      ind.style.width = `${newW}px`;
      prevPosRef.current = { x: newX, w: newW };
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [active]);

  return (
    <div className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 z-30 max-w-[calc(100%-1rem)]">
      <div
        ref={containerRef}
        role="tablist"
        aria-label="Selectează tipul de hartă"
        className={cn(
          "pointer-events-auto relative flex items-center gap-1 p-1 rounded-full",
          // Liquid-glass surface: visible but still translucent.
          "backdrop-blur-2xl backdrop-saturate-200",
          "bg-white/[0.12] dark:bg-white/[0.10]",
          "ring-1 ring-white/30 ring-inset",
          "shadow-[0_10px_32px_-8px_rgba(0,0,0,0.45),0_2px_6px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.4),inset_0_-1px_0_rgba(0,0,0,0.18)]",
          "overflow-x-auto no-scrollbar",
        )}
      >
        {/* Sliding water-drop indicator. WAAPI drives transform + width
            through a 3-keyframe slide that stretches mid-flight (iOS
            Liquid Glass aesthetic). Initial inline style avoids a flash
            at translateX(0) on first paint. */}
        <span
          ref={indicatorRef}
          aria-hidden="true"
          className={cn(
            "absolute top-1 bottom-1 rounded-full pointer-events-none",
            "bg-white/45 dark:bg-white/35",
            "ring-1 ring-white/60 ring-inset",
            "backdrop-blur-md backdrop-saturate-200",
            "shadow-[0_6px_18px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.6),inset_0_-1px_0_rgba(0,0,0,0.12)]",
            "before:absolute before:inset-x-2 before:top-[2px] before:h-1/2 before:rounded-full",
            "before:bg-gradient-to-b before:from-white/70 before:via-white/15 before:to-transparent",
            "before:opacity-90 before:pointer-events-none",
            "will-change-transform",
          )}
          style={{
            transform: "translateX(0)",
            width: "0",
            // Origin set explicitly so scaleX stretches symmetrically
            // around the drop's center instead of the left edge.
            transformOrigin: "center",
          }}
        />

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
                "shrink-0 relative z-10 inline-flex items-center justify-center gap-1.5 h-10 px-3 sm:px-4 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white",
                isActive
                  ? "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]"
                  : "text-white/70 hover:text-white",
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
