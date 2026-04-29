import type { Metadata } from "next";
import Link from "next/link";
import { Heart, ExternalLink, ArrowRight, TrendingDown } from "lucide-react";
import { SANATATE_NATIONALA, TOP_SPITALE_PUBLICE, DATE_PUBLICE_SNAPSHOT } from "@/data/date-publice";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SimpleBar } from "@/components/date-publice/SimpleBar";
import { DatasetJsonLd } from "@/components/FaqJsonLd";
import { LastUpdated } from "@/components/data/LastUpdated";
import { formatDecimal } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Sistemul medical românesc — în cifre reale",
  description:
    "Speranță de viață, mortalitate infantilă, medici per capita, top spitalele publice. Comparație cu Uniunea Europeană. Date oficiale INS, Ministerul Sănătății, Eurostat.",
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
      <h1 className="font-[family-name:var(--font-sora)] text-4xl md:text-5xl font-extrabold mb-4 flex items-center gap-3">
        <Heart size={40} className="text-[var(--color-primary)]" aria-hidden="true" />
        Cât trăim și cum trăim
      </h1>
      <p className="text-lg text-[var(--color-text-muted)] max-w-3xl mb-10 leading-relaxed">
        Speranța de viață, accesul la medici, topul spitalelor publice și cum se compară sistemul nostru cu restul UE. Date agregate de la INS, Ministerul Sănătății și Eurostat — fără filtre, fără ascunzișuri.
      </p>

      {/* KEY NUMBERS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <Card className="text-center" title={`Speranța medie de viață la naștere în ${latest.year}: ${formatDecimal(latest.sperantaViataAni, 1)} ani`}>
          <div className="text-xs uppercase text-[var(--color-text-muted)] mb-2">Speranță viață</div>
          <div className="text-2xl md:text-3xl font-bold text-[var(--color-primary)]">
            {formatDecimal(latest.sperantaViataAni, 1)} <span className="text-sm">ani</span>
          </div>
          <div className="text-[10px] text-[var(--color-text-muted)] mt-1">la naștere · {latest.year}</div>
        </Card>
        <Card className="text-center" title={`${formatDecimal(latest.mortInfantilaLa1000, 1)} decese la 1000 nou-născuți în primul an de viață`}>
          <div className="text-xs uppercase text-[var(--color-text-muted)] mb-2">
            Mortalitate infantilă
          </div>
          <div className="text-2xl md:text-3xl font-bold text-red-600">
            {formatDecimal(latest.mortInfantilaLa1000, 1)}
            <span className="text-sm" aria-hidden="true">‰</span>
            <span className="sr-only"> la mie</span>
          </div>
          <div className="text-[10px] text-[var(--color-text-muted)] mt-1">la 1000 nou-născuți</div>
        </Card>
        <Card className="text-center" title={`${formatDecimal(latest.mediciLa1000Loc, 2)} medici la 1000 locuitori — sub media UE de ~3,7`}>
          <div className="text-xs uppercase text-[var(--color-text-muted)] mb-2">Medici / 1000 loc</div>
          <div className="text-2xl md:text-3xl font-bold text-[var(--color-primary)]">
            {formatDecimal(latest.mediciLa1000Loc, 2)}
          </div>
          <div className="text-[10px] text-[var(--color-text-muted)] mt-1">media UE: ~3,7</div>
        </Card>
        <Card className="text-center" title={`${formatDecimal(latest.cheltuialaPibProc, 1)}% din PIB cheltuit pe sănătate publică — sub media UE de ~10%`}>
          <div className="text-xs uppercase text-[var(--color-text-muted)] mb-2">
            Cheltuieli sănătate
          </div>
          <div className="text-2xl md:text-3xl font-bold text-amber-600">
            {formatDecimal(latest.cheltuialaPibProc, 1)}%
          </div>
          <div className="text-[10px] text-[var(--color-text-muted)] mt-1">din PIB · media UE ~10%</div>
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
              sub: s.year === 2020 || s.year === 2021 ? "↓ pandemie COVID-19" : undefined,
              color: s.sperantaViataAni > 75 ? "#10B981" : "#F59E0B",
            }))}
            format={(v) => `${formatDecimal(v, 1)} ani`}
            max={85}
          />
        </Card>
        <p className="text-xs text-[var(--color-text-muted)] mt-2 flex items-start gap-2">
          <TrendingDown size={14} className="text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
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
