import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Wallet, ArrowRight, ExternalLink, Info } from "lucide-react";
import { getCountyBySlug } from "@/data/counties";
import { getCountyStats } from "@/data/statistici-judete";
import { BUGET_NATIONAL, BUGET_CHELTUIELI_2025 } from "@/data/date-publice";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SimpleBar } from "@/components/date-publice/SimpleBar";
import { DatasetJsonLd } from "@/components/FaqJsonLd";
import { LastUpdated } from "@/components/data/LastUpdated";

export const revalidate = 604800;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ judet: string }>;
}): Promise<Metadata> {
  const { judet } = await params;
  const county = getCountyBySlug(judet);
  if (!county) return {};
  return {
    title: `Buget proiectat — ${county.name}`,
    description: `Execuție bugetară proiectată pentru județul ${county.name} pe baza ponderii de populație în bugetul național.`,
    alternates: { canonical: `/${county.slug}/buget` },
  };
}

export default async function CountyBugetPage({
  params,
}: {
  params: Promise<{ judet: string }>;
}) {
  const { judet } = await params;
  const county = getCountyBySlug(judet);
  if (!county) notFound();

  const stats = getCountyStats(county.id);
  const populatieRo = 19100000;
  const shareRatio = stats.populatie / populatieRo;

  const latest = BUGET_NATIONAL[BUGET_NATIONAL.length - 1]!;
  const currentYear = BUGET_NATIONAL.find((b) => b.year === 2025) ?? latest;

  // Projected county slice
  const countyVenituri = currentYear ? currentYear.venituri * shareRatio : 0;
  const countyCheltuieli = currentYear ? currentYear.cheltuieli * shareRatio : 0;
  const countyDeficit = countyCheltuieli - countyVenituri;
  const pibCountyEst = currentYear ? currentYear.pib * shareRatio : 0;
  const pibPerCapita = stats.populatie > 0 ? (pibCountyEst * 1_000_000_000) / stats.populatie : 0;

  const fmtMld = (n: number) => `${n.toFixed(1)} mld lei`;
  const fmtPerCapita = (n: number) =>
    `${Math.round(n).toLocaleString("ro-RO")} lei`;

  // Cheltuieli proiectate per categorie
  const countyCheltuieliBreakdown = BUGET_CHELTUIELI_2025.map((c) => ({
    ...c,
    countyMld: c.mldLei * shareRatio,
  }));

  return (
    <div className="container-narrow py-12 md:py-16">
      <DatasetJsonLd
        name={`Buget proiectat — ${county.name}`}
        description={`Estimare execuție bugetară pentru ${county.name} bazată pe ponderea populației în bugetul național.`}
        url={`https://civia.ro/${county.slug}/buget`}
        keywords={["buget", county.name.toLowerCase(), "finante publice", "estimare"]}
      />

      <Link
        href={`/${county.slug}`}
        className="inline-flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] mb-6 transition-colors"
      >
        ← {county.name}
      </Link>

      <Badge className="mb-4" variant="primary">💰 Buget proiectat</Badge>
      <h1 className="font-[family-name:var(--font-sora)] text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
        Buget în <span className="text-[var(--color-primary)]">{county.name}</span>
      </h1>
      <p className="text-lg text-[var(--color-text-muted)] max-w-3xl mb-6 leading-relaxed">
        Proiecție a execuției bugetare naționale pentru {county.name}, ponderată cu populația județului
        ({(shareRatio * 100).toFixed(1)}% din România).
      </p>

      {/* Disclaimer */}
      <div className="mb-10 p-4 rounded-[var(--radius-md)] border border-amber-500/30 bg-amber-500/5 flex items-start gap-3">
        <Info size={18} className="text-amber-600 shrink-0 mt-0.5" />
        <div className="text-sm text-[var(--color-text-muted)]">
          <strong className="text-[var(--color-text)]">Sunt estimări.</strong> Execuția bugetară
          reală a primăriei tale se obține prin cerere Legea 544/2001. Cifrele afișate sunt
          proiecția populației × buget național, nu date reale pe județ.
        </div>
      </div>

      {/* Big numbers */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
        <Card className="text-center">
          <div className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
            Venituri proiectate
          </div>
          <div className="text-2xl md:text-3xl font-bold text-emerald-600">{fmtMld(countyVenituri)}</div>
          <div className="text-xs text-[var(--color-text-muted)] mt-1">{currentYear?.year ?? ""}</div>
        </Card>
        <Card className="text-center">
          <div className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
            Cheltuieli proiectate
          </div>
          <div className="text-2xl md:text-3xl font-bold text-[var(--color-primary)]">{fmtMld(countyCheltuieli)}</div>
          <div className="text-xs text-[var(--color-text-muted)] mt-1">{currentYear?.year ?? ""}</div>
        </Card>
        <Card className="text-center">
          <div className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
            Deficit proiectat
          </div>
          <div className="text-2xl md:text-3xl font-bold text-red-600">{fmtMld(countyDeficit)}</div>
          <div className="text-xs text-[var(--color-text-muted)] mt-1">{currentYear?.deficitProcPib}% PIB</div>
        </Card>
        <Card className="text-center">
          <div className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
            PIB per capita
          </div>
          <div className="text-2xl md:text-3xl font-bold text-[var(--color-primary)]">{fmtPerCapita(pibPerCapita)}</div>
          <div className="text-xs text-[var(--color-text-muted)] mt-1">estimare</div>
        </Card>
      </div>

      {/* Cheltuieli pe categorii */}
      <section className="mb-12">
        <h2 className="font-[family-name:var(--font-sora)] text-2xl md:text-3xl font-bold mb-6 flex items-center gap-2">
          <Wallet size={24} className="text-[var(--color-primary)]" />
          Unde se duc banii (proiecție {county.name})
        </h2>
        <Card>
          <SimpleBar
            data={countyCheltuieliBreakdown.map((c) => ({
              label: `${c.categorie} (${c.procent}%)`,
              value: Math.round(c.countyMld * 10) / 10,
              color: c.color,
            }))}
            format={(v: number) => `${v} mld lei`}
          />
        </Card>
      </section>

      {/* Context */}
      <Card className="mb-12 bg-gradient-to-br from-[var(--color-primary-soft)] to-transparent">
        <h3 className="font-bold text-lg mb-3">Cum obții cifrele reale ale primăriei {county.name}</h3>
        <p className="text-sm text-[var(--color-text-muted)] mb-4">
          Legea 544/2001 te obligă primăria să îți pună la dispoziție bugetul local și execuția bugetară
          în maximum 30 de zile de la cerere. Folosește template-ul Civia.
        </p>
        <Link
          href="/ghiduri/ghid-legea-544"
          className="inline-flex items-center gap-2 h-10 px-4 rounded-[var(--radius-button)] bg-[var(--color-primary)] text-white text-sm font-semibold hover:bg-[var(--color-primary-hover)]"
        >
          Deschide ghidul L544 <ArrowRight size={14} />
        </Link>
      </Card>

      {/* Resources */}
      <section className="mb-12">
        <h3 className="font-semibold mb-3">Surse oficiale</h3>
        <ul className="space-y-2 text-sm">
          <li>
            <a href="https://mfinante.gov.ro" target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] hover:underline inline-flex items-center gap-1">
              Ministerul Finanțelor — execuție bugetară <ExternalLink size={12} />
            </a>
          </li>
          <li>
            <a href="https://data.gov.ro" target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] hover:underline inline-flex items-center gap-1">
              data.gov.ro — seturi deschise <ExternalLink size={12} />
            </a>
          </li>
          <li>
            <Link href="/buget" className="text-[var(--color-primary)] hover:underline inline-flex items-center gap-1">
              Dashboard național buget <ArrowRight size={12} />
            </Link>
          </li>
        </ul>
      </section>

      <LastUpdated
        date="2026-04-10"
        sources={["Ministerul Finanțelor", "INS", "BNR"]}
        note="Cifrele sunt proiecții ponderate cu populația județului. Pentru date reale ale primăriei, folosește cerere Legea 544/2001."
      />
    </div>
  );
}
