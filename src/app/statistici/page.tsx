import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Download, TrendingUp, TrendingDown, Minus } from "lucide-react";

// Lazy-load recharts-based components — saves ~170KB from initial JS bundle
const ChartLoading = () => (
  <div className="h-[260px] rounded-[8px] bg-[var(--color-surface-2)] animate-pulse" />
);
const AccidenteLunareChart = dynamic(() => import("@/components/charts/StatisticiCharts").then((m) => ({ default: m.AccidenteLunareChart })), { loading: ChartLoading });
const AccidentePeSectorChart = dynamic(() => import("@/components/charts/StatisticiCharts").then((m) => ({ default: m.AccidentePeSectorChart })), { loading: ChartLoading });
const SesizariTipuriChart = dynamic(() => import("@/components/charts/StatisticiCharts").then((m) => ({ default: m.SesizariTipuriChart })), { loading: ChartLoading });
const SesizariLunareChart = dynamic(() => import("@/components/charts/StatisticiCharts").then((m) => ({ default: m.SesizariLunareChart })), { loading: ChartLoading });
const SesizariPeSectorChart = dynamic(() => import("@/components/charts/StatisticiCharts").then((m) => ({ default: m.SesizariPeSectorChart })), { loading: ChartLoading });
const AqiTrendChart = dynamic(() => import("@/components/charts/StatisticiCharts").then((m) => ({ default: m.AqiTrendChart })), { loading: ChartLoading });
const PunctualitateSTBChart = dynamic(() => import("@/components/charts/StatisticiCharts").then((m) => ({ default: m.PunctualitateSTBChart })), { loading: ChartLoading });
const CalatoriMetrouChart = dynamic(() => import("@/components/charts/StatisticiCharts").then((m) => ({ default: m.CalatoriMetrouChart })), { loading: ChartLoading });
const SpatiiVerziChart = dynamic(() => import("@/components/charts/StatisticiCharts").then((m) => ({ default: m.SpatiiVerziChart })), { loading: ChartLoading });
const CopaciInterventiiChart = dynamic(() => import("@/components/charts/StatisticiCharts").then((m) => ({ default: m.CopaciInterventiiChart })), { loading: ChartLoading });
import {
  aqiPeSector,
  accidenteLunareSource,
  accidentePeSectorSource,
  sesizariTipuriSource,
  sesizariLunareSource,
  sesizariPeSectorSource,
  aqiTrendSource,
  punctualitateSTBSource,
  calatoriMetrouSource,
  spatiiVerziSource,
  copaciInterventiiSource,
} from "@/data/statistici";
import { SourceCitation } from "@/components/statistici/SourceCitation";
import { LiveAqiWidget } from "@/components/statistici/LiveAqiWidget";
import { SectorScorecard } from "@/components/statistici/SectorScorecard";

export const metadata: Metadata = {
  title: "Statistici",
  description: "Date și grafice despre accidente, sesizări, calitate aer, transport, spații verzi.",
  alternates: { canonical: "/statistici" },
};

function StatCard({
  label,
  value,
  delta,
  trend,
  accent,
}: {
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down" | "stable";
  accent?: string;
}) {
  const Icon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor = trend === "up" ? "text-emerald-600" : trend === "down" ? "text-red-600" : "text-gray-500";
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-5">
      <p className="text-xs text-[var(--color-text-muted)] mb-1 uppercase tracking-wider">{label}</p>
      <p className="text-3xl font-bold" style={{ color: accent }}>
        {value}
      </p>
      {delta && (
        <div className={`flex items-center gap-1 text-xs mt-2 ${trendColor}`}>
          <Icon size={14} />
          <span className="font-medium">{delta}</span>
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  subtitle,
  exportHref,
  children,
}: {
  title: string;
  subtitle?: string;
  exportHref?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-16">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="font-[family-name:var(--font-sora)] text-2xl md:text-3xl font-bold mb-1">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-[var(--color-text-muted)]">{subtitle}</p>
          )}
        </div>
        {exportHref && (
          <a
            href={exportHref}
            download
            className="hidden md:flex items-center gap-2 h-9 px-3 rounded-[8px] bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] transition-colors"
            title="Descarcă CSV"
          >
            <Download size={14} />
            Export CSV
          </a>
        )}
      </div>
      {children}
    </section>
  );
}

function ChartCard({
  title,
  children,
  sourceKey,
}: {
  title: string;
  children: React.ReactNode;
  sourceKey?: string;
}) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-5">
      <h3 className="font-semibold text-sm mb-4 text-[var(--color-text-muted)] uppercase tracking-wider">
        {title}
      </h3>
      {children}
      {sourceKey && <SourceCitation sourceKey={sourceKey} />}
    </div>
  );
}

export default function StatisticiPage() {
  return (
    <div className="container-narrow py-12 md:py-16">
      <div className="mb-10">
        <h1 className="font-[family-name:var(--font-sora)] text-4xl md:text-5xl font-bold mb-3">
          Statistici
        </h1>
        <p className="text-lg text-[var(--color-text-muted)] max-w-3xl">
          Date agregate despre accidente, sesizări, calitatea aerului, transport și spații verzi.
          Actualizate lunar din surse publice.
        </p>
      </div>

      {/* Section 1: Accidente */}
      <Section title="Accidente rutiere" subtitle="Date DRPCIV 2023 — cele mai recente publicate">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total 2023" value="1.847" delta="-4% vs 2022" trend="down" accent="#DC2626" />
          <StatCard label="Victime rănite" value="1.284" delta="-7% vs 2022" trend="down" accent="#DC2626" />
          <StatCard label="Media/lună" value="154" accent="#DC2626" />
          <StatCard label="Sursă" value="DRPCIV" accent="#64748B" />
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <ChartCard title="Accidente pe luni (ultimul an)" sourceKey={accidenteLunareSource}>
            <AccidenteLunareChart />
          </ChartCard>
          <ChartCard title="Accidente pe sector" sourceKey={accidentePeSectorSource}>
            <AccidentePeSectorChart />
          </ChartCard>
        </div>
      </Section>

      {/* Section 2: Sesizări */}
      <Section title="Sesizări cetățeni" subtitle="Probleme raportate de bucureșteni" exportHref="/api/sesizari/export?limit=1000">
        <div className="mb-6">
          <SectorScorecard />
        </div>
        {/* Sector scorecard above is live from DB — don't duplicate hardcoded numbers here */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <ChartCard title="Distribuție tipuri de probleme" sourceKey={sesizariTipuriSource}>
            <SesizariTipuriChart />
          </ChartCard>
          <ChartCard title="Depuse vs rezolvate (ultimele 6 luni)" sourceKey={sesizariLunareSource}>
            <SesizariLunareChart />
          </ChartCard>
        </div>
        <ChartCard title="Sesizări pe sectoare" sourceKey={sesizariPeSectorSource}>
          <SesizariPeSectorChart />
        </ChartCard>
      </Section>

      {/* Section 3: Calitate aer */}
      <Section title="Calitate aer" subtitle="Indicele AQI per sector — date orientative, actualizate periodic">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
          {aqiPeSector.map((sector) => {
            const color =
              sector.aqi < 50
                ? "#059669"
                : sector.aqi < 80
                ? "#EAB308"
                : sector.aqi < 100
                ? "#F97316"
                : "#DC2626";
            return (
              <div
                key={sector.sector}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-4 text-center"
              >
                <p className="text-xs text-[var(--color-text-muted)] mb-2">{sector.sector}</p>
                <p className="text-3xl font-bold" style={{ color }}>
                  {sector.aqi}
                </p>
                <p className="text-[10px] text-[var(--color-text-muted)] mt-1 leading-tight">
                  {sector.quality}
                </p>
              </div>
            );
          })}
        </div>
        <div className="mb-3 text-xs text-[var(--color-text-muted)]">
          AQI mediu pe sectoare · sursa: <a href="https://www.calitateaer.ro" target="_blank" rel="noreferrer" className="text-[var(--color-primary)] hover:underline">calitateaer.ro</a>
        </div>
        <div className="grid lg:grid-cols-[1fr_280px] gap-6">
          <ChartCard title="Evoluție AQI mediu ultimele 30 zile" sourceKey={aqiTrendSource}>
            <AqiTrendChart />
          </ChartCard>
          <LiveAqiWidget />
        </div>
      </Section>

      {/* Section 4: Transport public */}
      <Section title="Transport public" subtitle="Punctualitate STB și volum călători metrou">
        <div className="grid lg:grid-cols-2 gap-6">
          <ChartCard title="Punctualitate STB (%) per linie" sourceKey={punctualitateSTBSource}>
            <PunctualitateSTBChart />
          </ChartCard>
          <ChartCard title="Călători metrou/zi per magistrală" sourceKey={calatoriMetrouSource}>
            <CalatoriMetrouChart />
          </ChartCard>
        </div>
      </Section>

      {/* Section 5: Spatii verzi */}
      <Section title="Parcuri și spații verzi" subtitle="mp per locuitor pe sector">
        <div className="grid lg:grid-cols-2 gap-6">
          <ChartCard title="mp spații verzi per locuitor" sourceKey={spatiiVerziSource}>
            <SpatiiVerziChart />
          </ChartCard>
          <ChartCard title="Copaci: plantați vs tăiați pe ani" sourceKey={copaciInterventiiSource}>
            <CopaciInterventiiChart />
          </ChartCard>
        </div>
        <div className="mt-6 bg-amber-50 dark:bg-amber-950/20 border-l-4 border-amber-400 rounded-[12px] p-4 text-sm">
          <p className="text-amber-900 dark:text-amber-200">
            <strong>Observație:</strong> Recomandarea minimă OMS este 9 mp spații verzi per locuitor. Toate sectoarele depășesc acest prag, dar Sectorul 5 are cel mai puțin (11.8 mp) — sub media europeană de ~25 mp/locuitor.
          </p>
        </div>
      </Section>
    </div>
  );
}
