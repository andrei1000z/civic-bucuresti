import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";
import { ALL_COUNTIES } from "@/data/counties";
import { HartiMap } from "@/components/maps/HartiMap";

export const metadata: Metadata = {
  title: "Hărți România — mobilitate și infrastructură",
  description:
    "Hartă interactivă națională cu piste de biciclete, transport public, zone pietonale. Date din OpenStreetMap pentru toate județele.",
  alternates: { canonical: "/harti" },
};

export default function HartiPage() {
  return (
    <>
      <h1 className="sr-only">Hărți de mobilitate România — piste, transport, trasee</h1>

      {/* National map (București layers loaded) */}
      <div className="h-[calc(100vh-64px-48px)]">
        <HartiMap />
      </div>

      {/* Counties quick links */}
      <div className="bg-[var(--color-surface)] border-t border-[var(--color-border)] px-4 py-3">
        <div className="container-narrow flex items-center gap-3 overflow-x-auto no-scrollbar">
          <span className="text-xs text-[var(--color-text-muted)] shrink-0">Hărți per județ:</span>
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
            + toate județele →
          </Link>
        </div>
      </div>
    </>
  );
}
