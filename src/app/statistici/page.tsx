import type { Metadata } from "next";
import { Download, TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  AccidenteLunareChart,
  AccidentePeSectorChart,
  SesizariTipuriChart,
  SesizariLunareChart,
  SesizariPeSectorChart,
  AqiTrendChart,
  PunctualitateSTBChart,
  CalatoriMetrouChart,
  SpatiiVerziChart,
  CopaciInterventiiChart,
} from "@/components/charts/StatisticiCharts";
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
  title: "Statistici București",
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
          Statistici București
        </h1>
        <p className="text-lg text-[var(--color-text-muted)] max-w-3xl">
          Date agregate despre accidente, sesizări, calitatea aerului, transport și spații verzi.
          Actualizate lunar din surse publice.
        </p>
      </div>

      {/* Section 1: Accidente */}
      <Section title="Accidente rutiere" subtitle="Incidente raportate în București în 2025">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total 2024" value="5.432" delta="-8% YoY" trend="down" accent="#DC2626" />
          <StatCard label="Victime totale" value="298" delta="-12% YoY" trend="down" accent="#DC2626" />
          <StatCard label="Zone cu risc top" value="3" accent="#DC2626" />
          <StatCard label="Media/lună" value="452" delta="-3 vs 2023" trend="down" accent="#DC2626" />
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total sesizări" value="12.471" delta="+23% YoY" trend="up" accent="#2563EB" />
          <StatCard label="Rezolvate" value="8.912" delta="+31% YoY" trend="up" accent="#059669" />
          <StatCard label="Timp mediu" value="14.5 zile" delta="-3 zile" trend="down" accent="#8B5CF6" />
          <StatCard label="Pe teren azi" value="34" accent="#EAB308" />
        </div>
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
      <Section title="Calitate aer" subtitle="Indicele AQI per sector, date live">
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
            <strong>Observație:</strong> Recomandarea OMS este 9 mp spații verzi per locuitor. Sectorul 5 este sub acest prag cu 11.8 mp.
          </p>
        </div>
      </Section>
    </div>
  );
}
