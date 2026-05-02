import type { Metadata } from "next";
import Link from "next/link";
import { ALL_COUNTIES } from "@/data/counties";
import { HartiMap } from "@/components/maps/HartiMap";

export const metadata: Metadata = {
  title: "Hărți interactive ale României — cum te miști în oraș",
  description:
    "Piste de biciclete, trotuare, drumuri, transport public, stații, calitatea aerului live — toate pe o singură hartă interactivă, cu date de la OpenStreetMap + senzori europeni de aer.",
  alternates: { canonical: "/harti" },
};

// Pure shell — Leaflet/HartiMap fac client-side data fetch. ISR 24h.
export const revalidate = 86400;

export default function HartiPage() {
  return (
    <>
      <h1 className="sr-only">Hărți interactive ale României — biciclete, trotuare, transport, aer</h1>

      {/* National map (București layers loaded) */}
      <div className="h-[calc(100vh-64px-48px)]">
        <HartiMap />
      </div>

      {/* Counties quick links — full 42-county strip with sticky
          label, soft fade at the right edge to hint scrollability,
          and county-code chips for compactness. */}
      <div className="relative bg-[var(--color-surface)] border-t border-[var(--color-border)]">
        <div className="container-narrow flex items-stretch overflow-hidden">
          <span className="shrink-0 inline-flex items-center text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-semibold pr-4 border-r border-[var(--color-border)] mr-4">
            Zoom pe județ
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-2.5 -mr-4 pr-12">
            {ALL_COUNTIES.map((c) => (
              <Link
                key={c.id}
                href={`/${c.slug}/harti`}
                title={c.name}
                className="shrink-0 inline-flex items-center gap-1 px-2 h-7 rounded-full bg-[var(--color-bg)] border border-[var(--color-border)] text-[11px] font-medium text-[var(--color-text)] hover:bg-[var(--color-primary-soft)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
              >
                <span className="font-bold tabular-nums text-[var(--color-primary)]">
                  {c.id}
                </span>
                <span className="text-[var(--color-text-muted)]">{c.name}</span>
              </Link>
            ))}
          </div>
          {/* Right-edge fade so the scroll affordance is visible */}
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[var(--color-surface)] to-transparent pointer-events-none" />
        </div>
      </div>
    </>
  );
}
