import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Wind } from "lucide-react";
import { getCountyBySlug } from "@/data/counties";
import { getCountyStats } from "@/data/statistici-judete";
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
  const stats = getCountyStats(county.id);
  const aqiText = stats ? ` AQI mediu: ${stats.aqiMediu} (${stats.aqiQuality}).` : "";
  return {
    title: "Calitatea aerului",
    description: `Hartă interactivă cu calitatea aerului în timp real în ${county.name}.${aqiText} Date de la senzori: Sensor.Community, OpenAQ, WAQI.`,
    alternates: { canonical: `/${county.slug}/aer` },
  };
}

function aqiHex(aqi: number): string {
  if (aqi <= 50) return "#059669";
  if (aqi <= 80) return "#EAB308";
  if (aqi <= 100) return "#F97316";
  return "#DC2626";
}

export default async function AerPage({
  params,
}: {
  params: Promise<{ judet: string }>;
}) {
  const { judet } = await params;
  const county = getCountyBySlug(judet);
  const center = county ? ([...county.center] as [number, number]) : undefined;
  const stats = county ? getCountyStats(county.id) : null;

  return (
    <div className="relative">
      {/* Compact info bar — full-bleed map page can't afford a tall hero,
          but we still surface the county code chip + back-link + AQI
          summary so the page feels Civia-branded. */}
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
          {stats && (
            <>
              <span className="text-[var(--color-text-muted)]" aria-hidden="true">·</span>
              <span className="text-[var(--color-text-muted)] text-xs">
                AQI mediu anual:{" "}
                <span
                  className="font-bold tabular-nums"
                  style={{ color: aqiHex(stats.aqiMediu) }}
                >
                  {stats.aqiMediu}
                </span>{" "}
                ({stats.aqiQuality})
              </span>
            </>
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
