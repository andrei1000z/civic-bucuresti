import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, Users, Wind, TreePine, Car, MapPin, ArrowRight } from "lucide-react";
import { getNationalTotals, getAllCountyIds } from "@/data/statistici-judete";
import { ALL_COUNTIES } from "@/data/counties";
import { getCountyStats } from "@/data/statistici-judete";

export const metadata: Metadata = {
  title: "Statistici România",
  description: "Statistici naționale: accidente rutiere, calitate aer, spații verzi, sesizări cetățeni — date din toate cele 42 de județe.",
  alternates: { canonical: "/statistici" },
};

export default function StatisticiPage() {
  const totals = getNationalTotals();

  // Top 5 counties by population
  const topByPop = ALL_COUNTIES
    .map((c) => ({ ...c, stats: getCountyStats(c.id) }))
    .sort((a, b) => b.stats.populatie - a.stats.populatie)
    .slice(0, 10);

  // Most polluted counties
  const topByAqi = ALL_COUNTIES
    .map((c) => ({ ...c, stats: getCountyStats(c.id) }))
    .sort((a, b) => b.stats.aqiMediu - a.stats.aqiMediu)
    .slice(0, 10);

  // Most accidents per capita
  const topByAccidents = ALL_COUNTIES
    .map((c) => {
      const s = getCountyStats(c.id);
      return { ...c, stats: s, perCapita: Math.round((s.accidenteTotal / s.populatie) * 100000) };
    })
    .sort((a, b) => b.perCapita - a.perCapita)
    .slice(0, 10);

  return (
    <div className="container-narrow py-12 md:py-16">
      <div className="mb-10">
        <h1 className="font-[family-name:var(--font-sora)] text-4xl md:text-5xl font-bold mb-3">
          Statistici România
        </h1>
        <p className="text-lg text-[var(--color-text-muted)] max-w-3xl mb-4">
          Date agregate din toate cele 42 de județe. Surse: INS, DRPCIV 2023, ANPM.
        </p>
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-[8px] p-3 text-xs text-amber-800 dark:text-amber-300">
          <strong>Notă:</strong> Datele despre accidente și sesizări per județ sunt estimări proporționale cu populația,
          bazate pe totaluri naționale DRPCIV 2023.
        </div>
      </div>

      {/* National totals */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-5 text-center">
          <Car size={24} className="mx-auto mb-2 text-red-500" />
          <p className="text-2xl md:text-3xl font-bold text-red-600">{totals.accidenteTotal.toLocaleString("ro-RO")}</p>
          <p className="text-xs text-[var(--color-text-muted)]">Accidente rutiere 2023</p>
        </div>
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-5 text-center">
          <Users size={24} className="mx-auto mb-2 text-red-500" />
          <p className="text-2xl md:text-3xl font-bold text-red-600">{totals.accidenteDecedati.toLocaleString("ro-RO")}</p>
          <p className="text-xs text-[var(--color-text-muted)]">Persoane decedate</p>
        </div>
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-5 text-center">
          <BarChart3 size={24} className="mx-auto mb-2 text-blue-500" />
          <p className="text-2xl md:text-3xl font-bold text-blue-600">{totals.sesizariTotal.toLocaleString("ro-RO")}</p>
          <p className="text-xs text-[var(--color-text-muted)]">Sesizări estimate</p>
        </div>
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-5 text-center">
          <MapPin size={24} className="mx-auto mb-2 text-amber-500" />
          <p className="text-2xl md:text-3xl font-bold text-amber-600">42</p>
          <p className="text-xs text-[var(--color-text-muted)]">Județe acoperite</p>
        </div>
      </div>

      {/* Top counties tables */}
      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        {/* By population */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-5">
          <h2 className="font-[family-name:var(--font-sora)] font-bold text-base mb-4 flex items-center gap-2">
            <Users size={18} className="text-blue-500" /> Top 10 — populație
          </h2>
          <div className="space-y-2">
            {topByPop.map((c, i) => (
              <Link key={c.id} href={`/${c.slug}/statistici`} className="flex items-center justify-between py-2 px-3 rounded-[8px] hover:bg-[var(--color-surface-2)] transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[var(--color-text-muted)] w-5 tabular-nums">{i + 1}.</span>
                  <span className="text-xs font-bold text-[var(--color-primary)] bg-[var(--color-primary-soft)] px-1.5 py-0.5 rounded">{c.id}</span>
                  <span className="text-sm font-medium">{c.name}</span>
                </div>
                <span className="text-sm tabular-nums font-semibold">{c.stats.populatie.toLocaleString("ro-RO")}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* By AQI (most polluted) */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-5">
          <h2 className="font-[family-name:var(--font-sora)] font-bold text-base mb-4 flex items-center gap-2">
            <Wind size={18} className="text-amber-500" /> Top 10 — AQI cel mai ridicat
          </h2>
          <div className="space-y-2">
            {topByAqi.map((c, i) => (
              <Link key={c.id} href={`/${c.slug}/statistici`} className="flex items-center justify-between py-2 px-3 rounded-[8px] hover:bg-[var(--color-surface-2)] transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[var(--color-text-muted)] w-5 tabular-nums">{i + 1}.</span>
                  <span className="text-xs font-bold text-[var(--color-primary)] bg-[var(--color-primary-soft)] px-1.5 py-0.5 rounded">{c.id}</span>
                  <span className="text-sm font-medium">{c.name}</span>
                </div>
                <span className="text-sm tabular-nums font-semibold" style={{
                  color: c.stats.aqiMediu <= 50 ? "#059669" : c.stats.aqiMediu <= 80 ? "#EAB308" : "#DC2626",
                }}>
                  AQI {c.stats.aqiMediu}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Accidents per capita */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-5 mb-12">
        <h2 className="font-[family-name:var(--font-sora)] font-bold text-base mb-4 flex items-center gap-2">
          <Car size={18} className="text-red-500" /> Top 10 — accidente la 100.000 locuitori
        </h2>
        <div className="grid sm:grid-cols-2 gap-2">
          {topByAccidents.map((c, i) => (
            <Link key={c.id} href={`/${c.slug}/statistici`} className="flex items-center justify-between py-2 px-3 rounded-[8px] hover:bg-[var(--color-surface-2)] transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-xs text-[var(--color-text-muted)] w-5 tabular-nums">{i + 1}.</span>
                <span className="text-xs font-bold text-[var(--color-primary)] bg-[var(--color-primary-soft)] px-1.5 py-0.5 rounded">{c.id}</span>
                <span className="text-sm font-medium">{c.name}</span>
              </div>
              <span className="text-sm tabular-nums font-semibold text-red-600">{c.perCapita}/100k</span>
            </Link>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-br from-[#1C4ED8] via-[#1e3a8a] to-[#0F172A] rounded-[16px] p-8 md:p-12 text-white text-center">
        <h2 className="font-[family-name:var(--font-sora)] text-2xl font-bold mb-3">
          Vezi statisticile pentru județul tău
        </h2>
        <p className="text-blue-100/80 mb-6">
          Fiecare județ are pagină proprie cu date detaliate: accidente, AQI, sesizări, spații verzi.
        </p>
        <Link
          href="/#county-picker"
          className="inline-flex items-center gap-2 h-12 px-7 rounded-[8px] bg-white text-[#1C4ED8] font-semibold hover:bg-white/90 transition-colors shadow-lg"
        >
          Alege județul <ArrowRight size={18} />
        </Link>
      </div>

      <p className="text-xs text-[var(--color-text-muted)] mt-6 text-center">
        Surse: INS Recensământ 2021, DRPCIV 2023, ANPM/calitateaer.ro · Ultima actualizare: aprilie 2026
      </p>
    </div>
  );
}
