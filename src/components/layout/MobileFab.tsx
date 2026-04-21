"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useCountyOptional } from "@/lib/county-context";
import { ALL_COUNTIES } from "@/data/counties";

/**
 * Floating action button that pins a "Fă sesizare" shortcut to the bottom
 * of the mobile viewport on every page except the form itself. Appears
 * only after a short scroll so it doesn't overlap the hero CTA on
 * landing. Uses county context so the button lands on the right flow.
 */
export function MobileFab() {
  const pathname = usePathname();
  const county = useCountyOptional();
  const [visible, setVisible] = useState(false);

  const pathSlug = pathname.match(/^\/([a-z]{1,2})(?:\/|$)/)?.[1] ?? null;
  const validated = pathSlug && ALL_COUNTIES.some((c) => c.slug === pathSlug) ? pathSlug : null;
  const countySlug = county?.slug ?? validated;
  const target = countySlug ? `/${countySlug}/sesizari` : "/b/sesizari";

  // Hide on the form itself + admin/auth pages to avoid CTA duplication.
  const hidden =
    /\/sesizari\/?$/.test(pathname) ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/cont");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onScroll = () => setVisible(window.scrollY > 120);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (hidden) return null;

  return (
    <Link
      href={target}
      aria-label="Fă sesizare"
      className={`lg:hidden fixed bottom-20 right-4 z-40 inline-flex items-center gap-2 h-12 px-5 rounded-full bg-[var(--color-primary)] text-white font-semibold shadow-[var(--shadow-xl)] transition-all duration-200 ${
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-20 opacity-0 pointer-events-none"
      }`}
    >
      <Plus size={18} strokeWidth={2.5} />
      Fă sesizare
    </Link>
  );
}
