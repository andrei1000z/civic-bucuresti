import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShieldAlert, AlertTriangle, TrendingUp, MapPin, ExternalLink, ArrowRight } from "lucide-react";
import { getCountyBySlug } from "@/data/counties";
import { getCountyStats } from "@/data/statistici-judete";
import { CRIMINALITATE } from "@/data/date-publice";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SimpleBar } from "@/components/date-publice/SimpleBar";
import { DatasetJsonLd } from "@/components/FaqJsonLd";
import { LastUpdated } from "@/components/data/LastUpdated";

export const revalidate = 604800; // 1 week

export async function generateMetadata({
  params,
}: {
  params: Promise<{ judet: string }>;
}): Promise<Metadata> {
  const { judet } = await params;
  const county = getCountyBySlug(judet);
  if (!county) return {};
  return {
    title: `Siguranță publică — ${county.name}`,
    description: `Accidente rutiere, populație, rata criminalității în ${county.name}. Date oficiale DRPCIV, Poliția Română și INS.`,
    alternates: { canonical: `/${county.slug}/siguranta` },
  };
}

export default async function CountySigurantaPage({
  params,
}: {
  params: Promise<{ judet: string }>;
}) {
  const { judet } = await params;
  const county = getCountyBySlug(judet);
  if (!county) notFound();

  const stats = getCountyStats(county.id);
  // Ultimul an național criminalitate — dataset hardcodat, nu poate fi gol
  const latest = CRIMINALITATE[CRIMINALITATE.length - 1]!;
  const populatieRo = 19100000;
  // Projected county share of national violence / property crime
  const shareRatio = stats.populatie / populatieRo;
  const violenteCounty = latest ? Math.round(latest.violente * shareRatio) : 0;
  const patrimoniuCounty = latest ? Math.round(latest.patrimoniu * shareRatio) : 0;

  // Rata accidentelor la 100.000 locuitori (DRPCIV)
  const rataAccidente = stats.populatie > 0 ? Math.round((stats.accidenteTotal / stats.populatie) * 100000) : 0;
  const rataDecese = stats.populatie > 0 ? Math.round((stats.accidenteDecedati / stats.populatie) * 100000 * 10) / 10 : 0;

  return (
    <div className="container-narrow py-12 md:py-16">
      <DatasetJsonLd
        name={`Siguranță publică — ${county.name}`}
        description={`Accidente rutiere și rata criminalității în ${county.name}.`}
        url={`https://civia.ro/${county.slug}/siguranta`}
        keywords={["siguranta", county.name.toLowerCase(), "accidente", "criminalitate"]}
      />

      <Link
        href={`/${county.slug}`}
        className="inline-flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] mb-6 transition-colors"
      >
        ← {county.name}
      </Link>

      <Badge className="mb-4" variant="primary">🛡️ Siguranță publică</Badge>
      <h1 className="font-[family-name:var(--font-sora)] text-4xl md:text-5xl font-bold mb-4 leading-tight">
        Siguranță în <span className="text-[var(--color-primary)]">{county.name}</span>
      </h1>
      <p className="text-lg text-[var(--color-text-muted)] max-w-3xl mb-10 leading-relaxed">
        Accidente rutiere, rata criminalității și context local. Datele vin din raport DRPCIV,
        Poliția Română și Institutul Național de Statistică.
      </p>

      {/* Big numbers */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
        <Card className="text-center">
          <div className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
            Accidente totale
          </div>
          <div className="text-3xl md:text-4xl font-bold text-[var(--color-primary)]">
            {stats.accidenteTotal.toLocaleString("ro-RO")}
          </div>
          <div className="text-xs text-[var(--color-text-muted)] mt-1">pe an</div>
        </Card>
        <Card className="text-center">
          <div className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
            Decedați
          </div>
          <div className="text-3xl md:text-4xl font-bold text-red-600">
            {stats.accidenteDecedati.toLocaleString("ro-RO")}
          </div>
          <div className="text-xs text-[var(--color-text-muted)] mt-1">{rataDecese}/100k loc</div>
        </Card>
        <Card className="text-center">
          <div className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
            Răniți
          </div>
          <div className="text-3xl md:text-4xl font-bold text-amber-600">
            {stats.accidenteRaniti.toLocaleString("ro-RO")}
          </div>
          <div className="text-xs text-[var(--color-text-muted)] mt-1">{stats.accidenteDelta}</div>
        </Card>
        <Card className="text-center">
          <div className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
            Rata accidente
          </div>
          <div className="text-3xl md:text-4xl font-bold text-[var(--color-primary)]">
            {rataAccidente}
          </div>
          <div className="text-xs text-[var(--color-text-muted)] mt-1">/100k locuitori</div>
        </Card>
      </div>

      {/* Monthly distribution */}
      {stats.accidenteLunare && stats.accidenteLunare.length > 0 && (
        <section className="mb-12">
          <h2 className="font-[family-name:var(--font-sora)] text-2xl md:text-3xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp size={24} className="text-[var(--color-primary)]" />
            Distribuție lunară accidente
          </h2>
          <Card>
            <SimpleBar
              data={stats.accidenteLunare.map((m) => ({ label: m.month, value: m.value, color: "#DC2626" }))}
              format={(v: number) => v.toLocaleString("ro-RO")}
            />
            <p className="text-xs text-[var(--color-text-muted)] mt-4 italic">
              Vara (iunie–august) concentrează maximum accidentelor din cauza traficului de vacanță.
            </p>
          </Card>
        </section>
      )}

      {/* Criminalitate proiectată */}
      <section className="mb-12">
        <h2 className="font-[family-name:var(--font-sora)] text-2xl md:text-3xl font-bold mb-3 flex items-center gap-2">
          <AlertTriangle size={24} className="text-amber-600" />
          Criminalitate — estimare locală
        </h2>
        <p className="text-sm text-[var(--color-text-muted)] mb-6 max-w-3xl">
          Infracțiunile detaliate pe județ nu sunt publicate de Poliția Română. Estimările de mai jos
          sunt proiecții ale datelor naționale {latest?.year ?? ""} ponderate cu populația județului
          ({(shareRatio * 100).toFixed(1)}% din total România).
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <div className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-2">Infracțiuni violente (estimat)</div>
            <div className="text-3xl font-bold text-red-600">{violenteCounty.toLocaleString("ro-RO")}</div>
            <div className="text-xs text-[var(--color-text-muted)] mt-1">
              lovituri, vătămări, omor · {latest?.year ?? ""}
            </div>
          </Card>
          <Card>
            <div className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-2">Infracțiuni patrimoniu (estimat)</div>
            <div className="text-3xl font-bold text-amber-600">{patrimoniuCounty.toLocaleString("ro-RO")}</div>
            <div className="text-xs text-[var(--color-text-muted)] mt-1">
              furt, tâlhărie, distrugere · {latest?.year ?? ""}
            </div>
          </Card>
        </div>
      </section>

      {/* Context local */}
      <Card className="mb-12 bg-gradient-to-br from-[var(--color-primary-soft)] to-transparent">
        <div className="flex items-start gap-3">
          <MapPin size={24} className="text-[var(--color-primary)] shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-lg mb-2">Context {county.name}</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-[var(--color-text-muted)] text-xs">Populație</div>
                <div className="font-semibold">{stats.populatie.toLocaleString("ro-RO")}</div>
              </div>
              <div>
                <div className="text-[var(--color-text-muted)] text-xs">Suprafață</div>
                <div className="font-semibold">{stats.suprafataKmp.toLocaleString("ro-RO")} km²</div>
              </div>
              <div>
                <div className="text-[var(--color-text-muted)] text-xs">Densitate</div>
                <div className="font-semibold">{stats.densitate} loc/km²</div>
              </div>
              <div>
                <div className="text-[var(--color-text-muted)] text-xs">Primar</div>
                <div className="font-semibold">{stats.primarName}</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Resources */}
      <section className="mb-12">
        <h3 className="font-semibold mb-3">Surse oficiale</h3>
        <ul className="space-y-2 text-sm">
          <li>
            <a href="https://www.politiaromana.ro" target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] hover:underline inline-flex items-center gap-1">
              Poliția Română — rapoarte anuale <ExternalLink size={12} />
            </a>
          </li>
          <li>
            <a href={`https://${county.slug}.politiaromana.ro`} target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] hover:underline inline-flex items-center gap-1">
              IPJ {county.name} — site local <ExternalLink size={12} />
            </a>
          </li>
          <li>
            <Link href="/siguranta" className="text-[var(--color-primary)] hover:underline inline-flex items-center gap-1">
              Dashboard național siguranță <ArrowRight size={12} />
            </Link>
          </li>
        </ul>
      </section>

      <LastUpdated
        date="2026-04-10"
        sources={["DRPCIV", "Poliția Română", "INS"]}
        note="Accidentele sunt raportate pe județ. Criminalitatea detaliată e proiecție ponderată populație — cifrele exacte nu sunt publicate de autorități."
      />
    </div>
  );
}
