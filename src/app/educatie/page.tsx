import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap, ArrowRight, ExternalLink, TrendingUp } from "lucide-react";
import { BAC_STATS, TOP_LICEE_2025 } from "@/data/date-publice";
import { ALL_COUNTIES } from "@/data/counties";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SimpleBar } from "@/components/date-publice/SimpleBar";
import { DatasetJsonLd } from "@/components/FaqJsonLd";

export const metadata: Metadata = {
  title: "Educație — statistici BAC, licee și învățământ",
  description:
    "Promovabilitate Bacalaureat, clasament top licee România, cheltuieli cu educația. Date oficiale MEN și INS.",
  alternates: { canonical: "/educatie" },
};

export const revalidate = 604800;

function countyName(id: string): string {
  return ALL_COUNTIES.find((c) => c.id === id)?.name ?? id;
}

function countySlug(id: string): string {
  return ALL_COUNTIES.find((c) => c.id === id)?.slug ?? id.toLowerCase();
}

export default function EducatiePage() {
  const latest = BAC_STATS[BAC_STATS.length - 1];

  return (
    <div className="container-narrow py-12 md:py-16">
      <DatasetJsonLd
        name="Educație România — BAC + top licee"
        description="Promovabilitate Bacalaureat pe ani, top 10 licee, abandon școlar, context comparativ UE."
        url="https://civia.ro/educatie"
        keywords={["educatie", "bac", "licee", "romania", "invatamant"]}
      />
      <Badge className="mb-4">Educație</Badge>
      <h1 className="font-[family-name:var(--font-sora)] text-4xl md:text-5xl font-bold mb-4 flex items-center gap-3">
        <GraduationCap size={40} className="text-[var(--color-primary)]" />
        Educația în România
      </h1>
      <p className="text-lg text-[var(--color-text-muted)] max-w-3xl mb-10 leading-relaxed">
        Rezultatele Bacalaureatului, top liceelor și cum se compară România cu UE. Date de la
        Ministerul Educației și INS.
      </p>

      {/* KEY NUMBERS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <Card className="text-center">
          <div className="text-xs uppercase text-[var(--color-text-muted)] mb-2">
            Promovabilitate BAC {latest.year}
          </div>
          <div className="text-3xl md:text-4xl font-bold text-emerald-600">
            {latest.promovabilitate.toFixed(1)}%
          </div>
        </Card>
        <Card className="text-center">
          <div className="text-xs uppercase text-[var(--color-text-muted)] mb-2">Prezenți</div>
          <div className="text-2xl md:text-3xl font-bold text-[var(--color-primary)]">
            {(latest.prezenti / 1000).toFixed(0)}k
          </div>
        </Card>
        <Card className="text-center">
          <div className="text-xs uppercase text-[var(--color-text-muted)] mb-2">Note de 10</div>
          <div className="text-2xl md:text-3xl font-bold text-amber-600">
            {latest.note10}
          </div>
        </Card>
        <Card className="text-center">
          <div className="text-xs uppercase text-[var(--color-text-muted)] mb-2">Medii ≥ 6</div>
          <div className="text-2xl md:text-3xl font-bold text-[var(--color-primary)]">
            {((latest.note6plus / latest.prezenti) * 100).toFixed(0)}%
          </div>
        </Card>
      </div>

      {/* EVOLUTION */}
      <section className="mb-10">
        <h2 className="font-[family-name:var(--font-sora)] text-2xl font-bold mb-4 flex items-center gap-2">
          <TrendingUp size={22} className="text-[var(--color-primary)]" />
          Promovabilitatea BAC — evoluție
        </h2>
        <Card>
          <SimpleBar
            data={BAC_STATS.map((b) => ({
              label: String(b.year),
              value: b.promovabilitate,
              sub: `${b.note10} de 10`,
              color: b.promovabilitate > 75 ? "#10B981" : b.promovabilitate > 65 ? "#F59E0B" : "#DC2626",
            }))}
            format={(v) => `${v.toFixed(1)}%`}
            max={100}
          />
        </Card>
      </section>

      {/* TOP LICEE */}
      <section className="mb-10">
        <h2 className="font-[family-name:var(--font-sora)] text-2xl font-bold mb-4">
          Top 10 licee din România (BAC {latest.year})
        </h2>
        <div className="space-y-2">
          {TOP_LICEE_2025.map((l) => (
            <Link key={l.rang} href={`/${countySlug(l.county)}`} className="block">
              <Card hover className="flex items-center gap-3 sm:gap-4 py-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white font-bold flex items-center justify-center text-sm sm:text-base">
                  {l.rang}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm sm:text-base leading-tight line-clamp-2 sm:line-clamp-1 sm:truncate">
                    {l.nume}
                  </div>
                  <div className="text-[11px] sm:text-xs text-[var(--color-text-muted)] mt-0.5 truncate">
                    {l.oras} · {countyName(l.county)} →
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-emerald-600 text-sm sm:text-base tabular-nums">
                    {l.promovabilitate.toFixed(1)}%
                  </div>
                  <div className="text-[10px] text-[var(--color-text-muted)] tabular-nums">
                    {l.mediaAdmitere.toFixed(2)}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* CONTEXT */}
      <section className="mb-10">
        <h2 className="font-[family-name:var(--font-sora)] text-2xl font-bold mb-4">Context</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Card accentColor="#DC2626">
            <h3 className="font-bold mb-2">Abandonul școlar — cel mai mare din UE</h3>
            <p className="text-sm text-[var(--color-text-muted)]">
              România are ~16% abandon școlar timpuriu (tineri 18-24 fără liceu) — aproape
              dublu față de media UE (9.6%). Cel mai afectat: mediul rural și comunitățile rome.
            </p>
          </Card>
          <Card accentColor="#F59E0B">
            <h3 className="font-bold mb-2">3% din PIB pentru educație — nerespectat</h3>
            <p className="text-sm text-[var(--color-text-muted)]">
              Legea educației prevede alocarea a minim 6% din PIB pentru educație, dar bugetul
              real e constant sub 3.5%. Cel mai mic procent din UE după Irlanda.
            </p>
          </Card>
          <Card accentColor="#3B82F6">
            <h3 className="font-bold mb-2">Inegalitatea urban-rural</h3>
            <p className="text-sm text-[var(--color-text-muted)]">
              Promovabilitatea BAC în mediul urban depășește 85%, dar în rural e sub 55%.
              Diferența reflectă calitatea diferită a profesorilor, infrastructura și accesul
              la meditații.
            </p>
          </Card>
          <Card accentColor="#10B981">
            <h3 className="font-bold mb-2">Olimpiade — forță națională</h3>
            <p className="text-sm text-[var(--color-text-muted)]">
              România rămâne în top 5 mondial la olimpiadele de matematică, informatică și fizică.
              Performanța e concentrată în ~20 de licee de top, majoritatea din orașe mari.
            </p>
          </Card>
        </div>
      </section>

      <section className="p-6 rounded-[var(--radius-card)] bg-[var(--color-surface-2)] mb-8">
        <h3 className="font-bold mb-3">Surse</h3>
        <ul className="text-sm space-y-2">
          <li>
            <a href="https://www.edu.ro" target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] hover:underline inline-flex items-center gap-1">
              Ministerul Educației Naționale <ExternalLink size={12} />
            </a>
          </li>
          <li>
            <a href="https://bacalaureat.edu.ro" target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] hover:underline inline-flex items-center gap-1">
              Platforma oficială BAC <ExternalLink size={12} />
            </a>
          </li>
          <li>
            <a href="https://insse.ro" target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] hover:underline inline-flex items-center gap-1">
              INS — statistici învățământ <ExternalLink size={12} />
            </a>
          </li>
        </ul>
      </section>

      <div className="text-center">
        <Link
          href="/sanatate"
          className="inline-flex items-center gap-2 text-[var(--color-primary)] hover:underline font-medium"
        >
          Vezi și statistici despre sănătate <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
