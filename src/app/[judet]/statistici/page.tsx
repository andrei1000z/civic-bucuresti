import type { Metadata } from "next";
import Link from "next/link";
import dynamic from "next/dynamic";
import { getCountyBySlug, ALL_COUNTIES } from "@/data/counties";
import { getCountyStats } from "@/data/statistici-judete";
import { TrendingUp, TrendingDown, Minus, Users, MapPin, Building2, TreePine, Wind, Car, Award } from "lucide-react";
import { SITE_URL } from "@/lib/constants";

const ChartLoading = () => (
  <div className="h-[260px] rounded-[8px] bg-[var(--color-surface-2)] animate-pulse" />
);

const AccidenteLunareCountyChart = dynamic(
  () => import("@/components/charts/CountyCharts").then((m) => ({ default: m.AccidenteLunareCountyChart })),
  { loading: ChartLoading }
);
const SesizariTipuriCountyChart = dynamic(
  () => import("@/components/charts/CountyCharts").then((m) => ({ default: m.SesizariTipuriCountyChart })),
  { loading: ChartLoading }
);
const GenericBarChart = dynamic(
  () => import("@/components/charts/CountyCharts").then((m) => ({ default: m.GenericBarChart })),
  { loading: ChartLoading }
);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ judet: string }>;
}): Promise<Metadata> {
  const { judet } = await params;
  const county = getCountyBySlug(judet);
  if (!county) return {};
  return {
    title: "Statistici",
    description: `Statistici reale pentru ${county.name}: accidente rutiere, calitate aer, spații verzi, transport și sesizări.`,
    alternates: { canonical: `/${county.slug}/statistici` },
  };
}

function StatCard({
  label,
  value,
  delta,
  trend,
  accent,
  icon: Icon,
}: {
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down" | "stable";
  accent?: string;
  icon?: React.ElementType;
}) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor = trend === "up" ? "text-emerald-600" : trend === "down" ? "text-red-600" : "text-gray-500";
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-5">
      <div className="flex items-center gap-2 mb-2">
        {Icon && <Icon size={14} className="text-[var(--color-text-muted)]" />}
        <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-3xl font-bold" style={{ color: accent }}>
        {value}
      </p>
      {delta && (
        <div className={`flex items-center gap-1 text-xs mt-2 ${trendColor}`}>
          <TrendIcon size={14} />
          <span className="font-medium">{delta}</span>
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-16">
      <div className="mb-6">
        <h2 className="font-[family-name:var(--font-sora)] text-2xl md:text-3xl font-bold mb-1">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-[var(--color-text-muted)]">{subtitle}</p>
        )}
      </div>
      {children}
    </section>
  );
}

function ChartCard({
  title,
  source,
  children,
}: {
  title: string;
  source?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-5">
      <h3 className="font-semibold text-sm mb-4 text-[var(--color-text-muted)] uppercase tracking-wider">
        {title}
      </h3>
      {children}
      {source && (
        <p className="mt-3 text-[10px] text-[var(--color-text-muted)]">
          Sursă: {source}
        </p>
      )}
    </div>
  );
}

export default async function StatisticiPage({
  params,
}: {
  params: Promise<{ judet: string }>;
}) {
  const { judet } = await params;
  const county = getCountyBySlug(judet);
  if (!county) return null;

  const stats = getCountyStats(county.id);
  if (!stats) return null;

  // AQI color
  const aqiColor =
    stats.aqiMediu < 50 ? "#059669" :
    stats.aqiMediu < 80 ? "#EAB308" :
    stats.aqiMediu < 100 ? "#F97316" : "#DC2626";

  // Cleanliness grade: A-E based on AQI + green spaces
  const gradeScore = (stats.aqiMediu <= 40 ? 3 : stats.aqiMediu <= 60 ? 2 : stats.aqiMediu <= 80 ? 1 : 0)
    + (stats.spatiiVerziMpPerLocuitor >= 35 ? 2 : stats.spatiiVerziMpPerLocuitor >= 20 ? 1 : 0);
  const grades = [
    { grade: "E", color: "#DC2626", label: "Critic" },
    { grade: "D", color: "#F97316", label: "Slab" },
    { grade: "C", color: "#EAB308", label: "Moderat" },
    { grade: "B", color: "#059669", label: "Bun" },
    { grade: "A", color: "#059669", label: "Foarte bun" },
    { grade: "A+", color: "#059669", label: "Excelent" },
  ];
  const gradeInfo = grades[Math.min(gradeScore, grades.length - 1)];

  // Neighbors data
  const neighbors = stats.judeteVecine ?? [];

  // Dataset JSON-LD
  const datasetJsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: `Statistici ${county.name} — Civia`,
    description: `Date statistice pentru ${county.name}: accidente rutiere, calitate aer, spații verzi, sesizări.`,
    url: `${SITE_URL}/${county.slug}/statistici`,
    spatialCoverage: { "@type": "Place", name: county.name },
    temporalCoverage: "2023/2024",
    creator: { "@type": "Organization", name: "Civia", url: SITE_URL },
    license: "https://creativecommons.org/licenses/by/4.0/",
  };

  return (
    <div className="container-narrow py-12 md:py-16">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-[family-name:var(--font-sora)] text-4xl md:text-5xl font-bold mb-3">
          Statistici — {county.name}
        </h1>
        <p className="text-lg text-[var(--color-text-muted)] max-w-3xl mb-4">
          Date din surse oficiale: INS, DRPCIV, ANPM. Actualizate cu cele mai recente cifre disponibile.
        </p>
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-[8px] p-3 text-xs text-amber-800 dark:text-amber-300">
          <strong>Notă:</strong> Datele despre accidente și sesizări per județ sunt estimări proporționale cu populația,
          bazate pe totaluri naționale DRPCIV 2023. Cifrele exacte pe județ se actualizează când DRPCIV publică detaliile.
          Populația și suprafețele sunt din Recensământul INS 2021.
        </div>
      </div>

      {/* Overview cards */}
      <Section title="Informații generale" subtitle={`Date oficiale INS — Recensământul 2021 + actualizări 2023`}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Populație" value={stats.populatie.toLocaleString("ro-RO")} icon={Users} accent="#6366F1" />
          <StatCard label="Suprafață" value={`${stats.suprafataKmp.toLocaleString("ro-RO")} km²`} icon={MapPin} accent="#6366F1" />
          <StatCard label="Densitate" value={`${stats.densitate} loc/km²`} icon={Building2} accent="#6366F1" />
          <StatCard
            label="Primar reședință"
            value={stats.primarName}
            icon={Building2}
            accent="#64748B"
          />
        </div>
      </Section>

      {/* Accidente rutiere */}
      <Section title="Accidente rutiere" subtitle="Sursa: DRPCIV / INS — date 2023">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Total accidente"
            value={stats.accidenteTotal.toLocaleString("ro-RO")}
            delta={stats.accidenteDelta}
            trend="down"
            accent="#DC2626"
            icon={Car}
          />
          <StatCard
            label="Persoane rănite"
            value={stats.accidenteRaniti.toLocaleString("ro-RO")}
            accent="#DC2626"
            icon={Car}
          />
          <StatCard
            label="Persoane decedate"
            value={stats.accidenteDecedati.toLocaleString("ro-RO")}
            accent="#DC2626"
            icon={Car}
          />
          <StatCard
            label="Accidente / 100k loc."
            value={Math.round((stats.accidenteTotal / stats.populatie) * 100000).toLocaleString("ro-RO")}
            accent="#F97316"
          />
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <ChartCard title="Evoluție lunară accidente 2023" source="DRPCIV / INS">
            <AccidenteLunareCountyChart data={stats.accidenteLunare} />
          </ChartCard>
          <ChartCard title="Tipuri sesizări cetățeni" source="Civia + surse locale">
            <SesizariTipuriCountyChart data={stats.sesizariTipuri} />
          </ChartCard>
        </div>
      </Section>

      {/* Calitate aer */}
      <Section title="Calitate aer" subtitle="Sursa: ANPM / calitateaer.ro — medie anuală 2023–2024">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-6 text-center">
            <Wind size={24} className="mx-auto mb-2 text-[var(--color-text-muted)]" />
            <p className="text-xs text-[var(--color-text-muted)] mb-2">AQI mediu</p>
            <p className="text-4xl font-bold" style={{ color: aqiColor }}>
              {stats.aqiMediu}
            </p>
            <p className="text-xs mt-1" style={{ color: aqiColor }}>
              {stats.aqiQuality}
            </p>
          </div>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-6 text-center">
            <TreePine size={24} className="mx-auto mb-2 text-[var(--color-text-muted)]" />
            <p className="text-xs text-[var(--color-text-muted)] mb-2">Spații verzi</p>
            <p className="text-4xl font-bold text-emerald-600">
              {stats.spatiiVerziMpPerLocuitor}
            </p>
            <p className="text-xs mt-1 text-[var(--color-text-muted)]">
              mp / locuitor
            </p>
          </div>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-6 text-center col-span-2 md:col-span-1">
            <p className="text-xs text-[var(--color-text-muted)] mb-2">Transport public</p>
            <p className="text-lg font-bold text-[var(--color-text)]">
              {stats.transportPublicOperator}
            </p>
            <p className="text-xs mt-1 text-[var(--color-text-muted)]">
              {stats.hasMetrou ? "Cu metrou" : "Fără metrou"}
              {stats.hasSTB ? " · STB" : ""}
            </p>
          </div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-950/20 border-l-4 border-blue-400 rounded-[12px] p-4 text-sm">
          <p className="text-blue-900 dark:text-blue-200">
            Pentru date în timp real, consultă{" "}
            <a href={`/${county.slug}/aer`} className="font-medium underline">
              harta calității aerului
            </a>{" "}
            cu senzori live din {county.name}.
          </p>
        </div>
      </Section>

      {/* Sesizări */}
      <Section title="Sesizări cetățeni" subtitle="Date Civia + surse locale">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <StatCard
            label="Total sesizări"
            value={stats.sesizariTotal.toLocaleString("ro-RO")}
            accent="#2563EB"
          />
          <StatCard
            label="Rezolvate"
            value={stats.sesizariRezolvate.toLocaleString("ro-RO")}
            accent="#059669"
            delta={`${Math.round((stats.sesizariRezolvate / stats.sesizariTotal) * 100)}% rată rezolvare`}
            trend="up"
          />
          <StatCard
            label="Primar"
            value={`${stats.primarName} (${stats.primarPartid})`}
            accent="#64748B"
          />
        </div>
      </Section>

      {/* Cleanliness grade */}
      <Section title="Grad de curățenie" subtitle="Calculat din calitatea aerului + spațiile verzi per locuitor">
        <div className="flex items-center gap-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-6">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-3xl shrink-0"
            style={{ backgroundColor: gradeInfo.color }}
          >
            {gradeInfo.grade}
          </div>
          <div>
            <p className="font-[family-name:var(--font-sora)] text-xl font-bold" style={{ color: gradeInfo.color }}>
              {gradeInfo.label}
            </p>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              AQI mediu: {stats.aqiMediu} · Spații verzi: {stats.spatiiVerziMpPerLocuitor} m²/locuitor
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mt-2">
              Scorul combină calitatea aerului (ANPM) cu suprafața spațiilor verzi (INS).
              Media OMS recomandă minim 9 m²/locuitor și AQI sub 50.
            </p>
          </div>
        </div>
      </Section>

      {/* Neighbor comparison */}
      {neighbors.length > 0 && (
        <Section title="Context regional" subtitle="Comparație cu județele vecine">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-5">
            <div className="space-y-2">
              {[{ name: county.name, populatie: stats.populatie, isCurrent: true }, ...neighbors.map(n => ({ ...n, isCurrent: false }))].map((n) => {
                const maxPop = Math.max(stats.populatie, ...neighbors.map(v => v.populatie));
                const width = Math.max(15, (n.populatie / maxPop) * 100);
                const slug = !n.isCurrent ? ALL_COUNTIES.find(c => c.name === n.name)?.slug : null;
                const Wrapper = slug ? Link : "div" as unknown as typeof Link;
                return (
                  <Wrapper
                    key={n.name}
                    href={slug ? `/${slug}/statistici` : "#"}
                    className={`flex items-center gap-3 py-2 px-3 rounded-[8px] ${!n.isCurrent ? "hover:bg-[var(--color-surface-2)]" : "bg-[var(--color-primary-soft)]"} transition-colors`}
                  >
                    <span className="text-sm font-medium w-32 shrink-0 truncate">
                      {n.isCurrent ? `📍 ${n.name}` : n.name}
                    </span>
                    <div className="flex-1 h-5 bg-[var(--color-surface-2)] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${width}%`,
                          backgroundColor: n.isCurrent ? "var(--color-primary)" : "#94A3B8",
                        }}
                      />
                    </div>
                    <span className="text-xs tabular-nums text-[var(--color-text-muted)] w-24 text-right shrink-0">
                      {n.populatie.toLocaleString("ro-RO")} loc.
                    </span>
                  </Wrapper>
                );
              })}
            </div>
          </div>
        </Section>
      )}

      {/* Dataset JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetJsonLd) }}
      />

      {/* Footer note */}
      <div className="mt-8 bg-[var(--color-surface-2)] rounded-[12px] p-4 text-xs text-[var(--color-text-muted)]">
        <p>
          <strong>Surse:</strong> Institutul Național de Statistică (INS), Direcția Regim Permise de Conducere și Înmatriculare a Vehiculelor (DRPCIV),
          Agenția Națională pentru Protecția Mediului (ANPM), calitateaer.ro.
          Datele sunt cele mai recente disponibile public (2023–2024).
        </p>
        <p className="mt-2">
          <strong>Ultima actualizare date:</strong> aprilie 2026
        </p>
      </div>
    </div>
  );
}
