import type { Metadata } from "next";
import { getCountyBySlug } from "@/data/counties";
import { getCountyStats } from "@/data/statistici-judete";
import { AerMapWrapper } from "@/app/aer/AerMapWrapper";

export const dynamic = "force-dynamic";

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
      {/* AQI info bar */}
      {stats && (
        <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 py-2.5 flex items-center justify-between text-sm">
          <div className="flex items-center gap-3">
            <span className="font-[family-name:var(--font-sora)] font-bold text-base">
              {county?.name}
            </span>
            <span className="text-[var(--color-text-muted)]">·</span>
            <span className="text-[var(--color-text-muted)]">
              AQI mediu anual:{" "}
              <span
                className="font-bold"
                style={{
                  color:
                    stats.aqiMediu <= 50 ? "#059669" :
                    stats.aqiMediu <= 80 ? "#EAB308" :
                    stats.aqiMediu <= 100 ? "#F97316" : "#DC2626",
                }}
              >
                {stats.aqiMediu}
              </span>{" "}
              ({stats.aqiQuality})
            </span>
          </div>
          <span className="text-xs text-[var(--color-text-muted)] hidden md:inline">
            Senzori live · Sensor.Community · OpenAQ · WAQI
          </span>
        </div>
      )}
      <div className="h-[calc(100vh-64px-42px)]">
        <AerMapWrapper initialCenter={center} initialZoom={county ? 10 : undefined} />
      </div>
    </div>
  );
}
