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

      {/* Counties quick links */}
      <div className="bg-[var(--color-surface)] border-t border-[var(--color-border)] px-4 py-3">
        <div className="container-narrow flex items-center gap-3 overflow-x-auto no-scrollbar">
          <span className="text-xs text-[var(--color-text-muted)] shrink-0">Zoom pe județul tău:</span>
          {ALL_COUNTIES.slice(0, 15).map((c) => (
            <Link
              key={c.id}
              href={`/${c.slug}/harti`}
              className="text-xs text-[var(--color-primary)] hover:underline shrink-0"
            >
              {c.name}
            </Link>
          ))}
          <Link href="/judete" className="text-xs text-[var(--color-primary)] hover:underline shrink-0 font-medium">
            Vezi toate cele 42 de județe →
          </Link>
        </div>
      </div>
    </>
  );
}
