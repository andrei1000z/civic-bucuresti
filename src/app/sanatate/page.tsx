import type { Metadata } from "next";
import Link from "next/link";
import { Heart, ExternalLink, ArrowRight, TrendingDown } from "lucide-react";
import { SANATATE_NATIONALA, TOP_SPITALE_PUBLICE, DATE_PUBLICE_SNAPSHOT } from "@/data/date-publice";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SimpleBar } from "@/components/date-publice/SimpleBar";
import { DatasetJsonLd } from "@/components/FaqJsonLd";
import { LastUpdated } from "@/components/data/LastUpdated";

export const metadata: Metadata = {
  title: "Sănătate — sistem medical România",
  description:
    "Speranță de viață, mortalitate infantilă, medici per capita, top spitale publice. Date oficiale INS și OMS.",
  alternates: { canonical: "/sanatate" },
};

export const revalidate = 604800;

export default function SanatatePage() {
  const latest = SANATATE_NATIONALA[SANATATE_NATIONALA.length - 1]!;

  return (
    <div className="container-narrow py-12 md:py-16">
      <DatasetJsonLd
        name="Sănătate România — statistici sistem medical"
        description="Speranță viață, mortalitate infantilă, medici per capita, top spitale publice, context UE."
        url="https://civia.ro/sanatate"
        keywords={["sanatate", "medicina", "spitale", "romania", "statistici"]}
      />
      <Badge className="mb-4">Sănătate publică</Badge>
      <h1 className="font-[family-name:var(--font-sora)] text-4xl md:text-5xl font-bold mb-4 flex items-center gap-3">
        <Heart size={40} className="text-[var(--color-primary)]" />
        Sănătatea în România
      </h1>
      <p className="text-lg text-[var(--color-text-muted)] max-w-3xl mb-10 leading-relaxed">
        Sistemul medical românesc — în cifre. Speranță de viață, acces la servicii, top
        spitalele publice. Date INS, MS și Eurostat.
      </p>

      {/* KEY NUMBERS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <Card className="text-center">
          <div className="text-xs uppercase text-[var(--color-text-muted)] mb-2">Speranță viață</div>
          <div className="text-2xl md:text-3xl font-bold text-[var(--color-primary)]">
            {latest.sperantaViataAni.toFixed(1)} <span className="text-sm">ani</span>
          </div>
        </Card>
        <Card className="text-center">
          <div className="text-xs uppercase text-[var(--color-text-muted)] mb-2">
            Mort. infantilă
          </div>
          <div className="text-2xl md:text-3xl font-bold text-red-600">
            {latest.mortInfantilaLa1000.toFixed(1)}
            <span className="text-sm">‰</span>
          </div>
          <div className="text-[10px] text-[var(--color-text-muted)] mt-1">la 1000 nou-născuți</div>
        </Card>
        <Card className="text-center">
          <div className="text-xs uppercase text-[var(--color-text-muted)] mb-2">Medici / 1000</div>
          <div className="text-2xl md:text-3xl font-bold text-[var(--color-primary)]">
            {latest.mediciLa1000Loc.toFixed(2)}
          </div>
        </Card>
        <Card className="text-center">
          <div className="text-xs uppercase text-[var(--color-text-muted)] mb-2">
            % din PIB (sănătate)
          </div>
          <div className="text-2xl md:text-3xl font-bold text-amber-600">
            {latest.cheltuialaPibProc.toFixed(1)}%
          </div>
        </Card>
      </div>

      {/* EVOLUTION */}
      <section className="mb-10">
        <h2 className="font-[family-name:var(--font-sora)] text-2xl font-bold mb-4">
          Speranța de viață — evoluție
        </h2>
        <Card>
          <SimpleBar
            data={SANATATE_NATIONALA.map((s) => ({
              label: String(s.year),
              value: s.sperantaViataAni,
              color: s.sperantaViataAni > 75 ? "#10B981" : "#F59E0B",
            }))}
            format={(v) => `${v.toFixed(1)} ani`}
            max={85}
          />
        </Card>
        <p className="text-xs text-[var(--color-text-muted)] mt-2 flex items-start gap-2">
          <TrendingDown size={14} className="text-red-600 shrink-0 mt-0.5" />
          Scăderea din 2020-2021 se datorează pandemiei COVID-19. România a pierdut ~2 ani de
          speranță de viață la apogeu.
        </p>
      </section>

      {/* TOP HOSPITALS */}
      <section className="mb-10">
        <h2 className="font-[family-name:var(--font-sora)] text-2xl font-bold mb-4">
          Top spitale publice din România
        </h2>
        <div className="space-y-2">
          {TOP_SPITALE_PUBLICE.map((s) => (
            <Card key={s.rang} className="flex items-center gap-3 sm:gap-4 py-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-full bg-gradient-to-br from-red-500 to-rose-600 text-white font-bold flex items-center justify-center text-sm sm:text-base">
                {s.rang}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm sm:text-base leading-tight line-clamp-2 sm:line-clamp-1 sm:truncate">
                  {s.nume}
                </div>
                <div className="text-[11px] sm:text-xs text-[var(--color-text-muted)] mt-0.5 line-clamp-1">
                  {s.specializare}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-bold text-[var(--color-primary)] text-sm sm:text-base tabular-nums">
                  {s.paturi}
                </div>
                <div className="text-[10px] text-[var(--color-text-muted)] truncate max-w-[80px]">
                  {s.oras}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* CONTEXT */}
      <section className="mb-10">
        <h2 className="font-[family-name:var(--font-sora)] text-2xl font-bold mb-4">Context</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Card accentColor="#DC2626">
            <h3 className="font-bold mb-2">Exodul medicilor</h3>
            <p className="text-sm text-[var(--color-text-muted)]">
              România a pierdut peste 30.000 de medici în 20 de ani (exod către Germania,
              Franța, Marea Britanie, Italia). Deficit major în specialitățile anestezie,
              radiologie, pediatrie.
            </p>
          </Card>
          <Card accentColor="#F59E0B">
            <h3 className="font-bold mb-2">Plățile informale</h3>
            <p className="text-sm text-[var(--color-text-muted)]">
              Deși interzise legal, plățile informale către personalul medical ating ~20% din
              cheltuielile totale ale pacienților. Cea mai afectată specialitate: obstetrica-ginecologie.
            </p>
          </Card>
          <Card accentColor="#3B82F6">
            <h3 className="font-bold mb-2">CNAS — subfinanțare cronică</h3>
            <p className="text-sm text-[var(--color-text-muted)]">
              Fondul național de sănătate colectează ~6% din PIB, dar cheltuielile reale
              depășesc 6.5% — diferența e acoperită din buget. Servicii de urgență, oncologie
              și dializa au cele mai lungi liste de așteptare.
            </p>
          </Card>
          <Card accentColor="#10B981">
            <h3 className="font-bold mb-2">Spitale noi — PNRR</h3>
            <p className="text-sm text-[var(--color-text-muted)]">
              Planul Național de Redresare prevede construcția a 25 de spitale noi și reabilitarea
              a peste 200 până în 2026. Execuția e lentă — în 2025 doar ~15% din proiecte erau
              în execuție activă.
            </p>
          </Card>
        </div>
      </section>

      <section className="p-6 rounded-[var(--radius-card)] bg-[var(--color-surface-2)] mb-8">
        <h3 className="font-bold mb-3">Surse</h3>
        <ul className="text-sm space-y-2">
          <li>
            <a href="https://www.ms.ro" target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] hover:underline inline-flex items-center gap-1">
              Ministerul Sănătății <ExternalLink size={12} />
            </a>
          </li>
          <li>
            <a href="https://www.cnas.ro" target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] hover:underline inline-flex items-center gap-1">
              Casa Națională de Asigurări de Sănătate <ExternalLink size={12} />
            </a>
          </li>
          <li>
            <a href="https://ec.europa.eu/eurostat" target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] hover:underline inline-flex items-center gap-1">
              Eurostat — date comparative UE <ExternalLink size={12} />
            </a>
          </li>
        </ul>
      </section>

      <div className="text-center">
        <Link
          href="/educatie"
          className="inline-flex items-center gap-2 text-[var(--color-primary)] hover:underline font-medium"
        >
          Vezi și statistici despre educație <ArrowRight size={16} />
        </Link>
      </div>

      <LastUpdated
        date={DATE_PUBLICE_SNAPSHOT.lastUpdated}
        sources={["INS", "OMS", "Ministerul Sănătății"]}
      />
    </div>
  );
}
