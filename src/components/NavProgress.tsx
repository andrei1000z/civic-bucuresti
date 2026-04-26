"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Lightweight top-of-page loading indicator. Fires on every pathname
 * change (SPA nav) and fades out once the new route has committed.
 * No external dep — a single pseudo-determinate bar animated with
 * CSS keyframes. Hidden for users who prefer reduced motion.
 */
export function NavProgress() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Respect motion preference — just skip the indicator for folks
    // who turned animations off.
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    // setState aici e intenționat: pulse pe schimbarea pathname-ului.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(true);
    // Pathname already changed by the time this effect fires, so the
    // "loading" perception window is short. 400ms felt right in testing
    // — fast enough to not linger, long enough to register.
    const timer = setTimeout(() => setVisible(false), 400);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div
      aria-hidden
      className={`fixed top-0 left-0 right-0 h-[2px] z-[200] pointer-events-none transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className="h-full bg-[var(--color-primary)]"
        style={{
          animation: visible ? "civia-navprogress 0.6s ease-out" : "none",
          transformOrigin: "left center",
        }}
      />
      <style>{`
        @keyframes civia-navprogress {
          0%   { transform: scaleX(0); }
          60%  { transform: scaleX(0.7); }
          100% { transform: scaleX(1); }
        }
      `}</style>
    </div>
  );
}
