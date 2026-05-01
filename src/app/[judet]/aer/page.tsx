import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Wind } from "lucide-react";
import { getCountyBySlug } from "@/data/counties";
import { AerMapWrapper } from "@/app/aer/AerMapWrapper";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ judet: string }>;
}): Promise<Metadata> {
  const { judet } = await params;
  const county = getCountyBySlug(judet);
  if (!county) return {};
  return {
    title: "Calitatea aerului",
    description: `Hartă interactivă cu calitatea aerului în timp real în ${county.name}. Date de la senzori: Sensor.Community, OpenAQ, WAQI.`,
    alternates: { canonical: `/${county.slug}/aer` },
  };
}

export default async function AerPage({
  params,
}: {
  params: Promise<{ judet: string }>;
}) {
  const { judet } = await params;
  const county = getCountyBySlug(judet);
  const center = county ? ([...county.center] as [number, number]) : undefined;

  return (
    <div className="relative">
      {/* Compact info bar — full-bleed map page can't afford a tall hero,
          but we still surface the county code chip + back-link so the
          page feels Civia-branded. The annual-stat chip was removed
          because it conflicted with the live AQI shown in the
          AirQualityMap sidebar (75 Moderat anual vs 21 Bun live →
          users couldn't tell which one applied). The live number is
          the authoritative one for this surface. */}
      <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 py-2.5">
        <div className="container-narrow flex items-center gap-3 flex-wrap text-sm">
          {county && (
            <Link
              href={`/${county.slug}`}
              className="inline-flex items-center gap-1 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded"
            >
              <ArrowLeft size={11} aria-hidden="true" />
              {county.name}
            </Link>
          )}
          <span className="text-[var(--color-text-muted)]" aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1.5 font-[family-name:var(--font-sora)] font-bold text-base">
            <Wind size={14} className="text-[var(--color-primary)]" aria-hidden="true" />
            Calitatea aerului
          </span>
          {county && (
            <span
              className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)] tabular-nums"
              aria-hidden="true"
            >
              {county.id}
            </span>
          )}
          <span className="ml-auto text-[10px] text-[var(--color-text-muted)] hidden md:inline">
            Senzori live · Sensor.Community · OpenAQ · WAQI
          </span>
        </div>
      </div>
      <div className="h-[calc(100vh-64px-42px)]">
        <AerMapWrapper initialCenter={center} initialZoom={county ? 10 : undefined} />
      </div>
    </div>
  );
}
