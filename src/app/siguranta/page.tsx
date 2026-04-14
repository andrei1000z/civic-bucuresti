import type { Metadata } from "next";
import Link from "next/link";
import { ShieldAlert, TrendingDown, TrendingUp, Minus, ExternalLink } from "lucide-react";
import { CRIMINALITATE, TOP_SIGURANTA_JUDETE, DATE_PUBLICE_SNAPSHOT } from "@/data/date-publice";
import { ALL_COUNTIES } from "@/data/counties";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SimpleBar } from "@/components/date-publice/SimpleBar";
import { DatasetJsonLd } from "@/components/FaqJsonLd";
import { LastUpdated } from "@/components/data/LastUpdated";

export const metadata: Metadata = {
  title: "Siguranță publică & criminalitate — statistici România",
  description:
    "Date oficiale despre criminalitate în România. Evoluție 2019-2024 pe tipuri de infracțiuni și pe județe.",
  alternates: { canonical: "/siguranta" },
};

export const revalidate = 604800;

function countyName(id: string): string {
  return ALL_COUNTIES.find((c) => c.id === id)?.name ?? id;
}

export default function SigurantaPage() {
  const latest = CRIMINALITATE[CRIMINALITATE.length - 1];

  return (
    <div className="container-narrow py-12 md:py-16">
      <DatasetJsonLd
        name="Criminalitate România — statistici oficiale"
        description="Date oficiale Poliția Română: tipuri de infracțiuni, evoluție temporală, rate pe județe."
        url="https://civia.ro/siguranta"
        keywords={["criminalitate", "politie", "siguranta", "romania", "statistici"]}
      />
      <Badge className="mb-4">Siguranță publică</Badge>
      <h1 className="font-[family-name:var(--font-sora)] text-4xl md:text-5xl font-bold mb-4 flex items-center gap-3">
        <ShieldAlert size={40} className="text-[var(--color-primary)]" />
        Criminalitate în România
      </h1>
      <p className="text-lg text-[var(--color-text-muted)] max-w-3xl mb-10 leading-relaxed">
        Infracțiuni sesizate Poliției Române pe tipuri și evoluție în timp. Datele exclud
        infracțiuni ne-raportate (&quot;cifra neagră&quot;) care se estimează la 30-50% în funcție de categorie.
      </p>

      {/* KEY NUMBERS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <Card className="text-center">
          <div className="text-xs uppercase text-[var(--color-text-muted)] mb-2">Total {latest.year}</div>
          <div className="text-2xl md:text-3xl font-bold text-[var(--color-primary)]">
            {(latest.totalInfractiuni / 1000).toFixed(0)}k
          </div>
        </Card>
        <Card className="text-center">
          <div className="text-xs uppercase text-[var(--color-text-muted)] mb-2">Violente</div>
          <div className="text-2xl md:text-3xl font-bold text-red-600">
            {(latest.violente / 1000).toFixed(1)}k
          </div>
        </Card>
        <Card className="text-center">
          <div className="text-xs uppercase text-[var(--color-text-muted)] mb-2">Patrimoniu</div>
          <div className="text-2xl md:text-3xl font-bold text-amber-600">
            {(latest.patrimoniu / 1000).toFixed(0)}k
          </div>
        </Card>
        <Card className="text-center">
          <div className="text-xs uppercase text-[var(--color-text-muted)] mb-2">Droguri</div>
          <div className="text-2xl md:text-3xl font-bold text-violet-600">
            {(latest.droguri / 1000).toFixed(1)}k
          </div>
        </Card>
      </div>

      {/* EVOLUTION */}
      <section className="mb-10">
        <h2 className="font-[family-name:var(--font-sora)] text-2xl font-bold mb-4">
          Evoluție 2019-2024
        </h2>
        <Card>
          <SimpleBar
            data={CRIMINALITATE.map((c) => ({
              label: String(c.year),
              value: c.totalInfractiuni,
              sub: `${((c.violente / c.totalInfractiuni) * 100).toFixed(0)}% violente`,
              color: "#DC2626",
            }))}
            format={(v) => `${(v / 1000).toFixed(0)}k`}
          />
        </Card>
      </section>

      {/* BY TYPE */}
      <section className="mb-10">
        <h2 className="font-[family-name:var(--font-sora)] text-2xl font-bold mb-4">
          Distribuție pe tipuri ({latest.year})
        </h2>
        <Card>
          <SimpleBar
            data={[
              { label: "Infracțiuni de patrimoniu (furt, tâlhărie)", value: latest.patrimoniu, color: "#F59E0B" },
              { label: "Infracțiuni cu violență", value: latest.violente, color: "#DC2626" },
              { label: "Accidente rutiere cu răniți", value: latest.rutiere, color: "#3B82F6" },
              { label: "Evaziune fiscală", value: latest.evazFiscala, color: "#8B5CF6" },
              { label: "Trafic & consum droguri", value: latest.droguri, color: "#10B981" },
            ]}
            format={(v) => v.toLocaleString("ro-RO")}
          />
        </Card>
      </section>

      {/* BY COUNTY */}
      <section className="mb-10">
        <h2 className="font-[family-name:var(--font-sora)] text-2xl font-bold mb-4">
          Rata infracționalității pe județe (la 1000 locuitori)
        </h2>
        <Card>
          <SimpleBar
            data={TOP_SIGURANTA_JUDETE.sort((a, b) => b.rata - a.rata).map((c) => ({
              label: countyName(c.county),
              value: c.rata,
              sub: c.trend === "up" ? "↑" : c.trend === "down" ? "↓" : "→",
              color: c.rata > 35 ? "#DC2626" : c.rata > 25 ? "#F59E0B" : "#10B981",
            }))}
            format={(v) => v.toFixed(1)}
            max={50}
          />
        </Card>
        <p className="mt-3 text-xs text-[var(--color-text-muted)]">
          Rata mai mare NU înseamnă neapărat zonă periculoasă. Bucureștiul concentrează mai
          multe tipuri de infracțiuni fiscale, financiare și rutiere decât alte județe.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="text-[var(--color-text-muted)] self-center">Explorează:</span>
          <Link
            href="/compara"
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)] hover:opacity-80 transition-opacity"
          >
            ⚖️ Compară 2 județe
          </Link>
          <Link
            href="/statistici"
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:bg-[var(--color-surface)] transition-colors"
          >
            📊 Statistici naționale
          </Link>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="font-[family-name:var(--font-sora)] text-2xl font-bold mb-4">Context</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Card accentColor="#DC2626">
            <h3 className="font-bold mb-2">Violența domestică — mult sub-raportată</h3>
            <p className="text-sm text-[var(--color-text-muted)]">
              Doar 1 din 10 cazuri de violență domestică ajunge să fie raportat poliției, conform
              estimărilor ONG-urilor specializate. Numărul real este de aproximativ 10× mai mare
              decât cifrele oficiale.
            </p>
          </Card>
          <Card accentColor="#F59E0B">
            <h3 className="font-bold mb-2">Evaziune fiscală — miliarde de lei</h3>
            <p className="text-sm text-[var(--color-text-muted)]">
              Deși numărul de infracțiuni de evaziune fiscală pare mic (10k+), valoarea totală a
              prejudiciului depășește 30 mld lei/an. Majoritatea cazurilor se prescriu sau se
              finalizează cu acord.
            </p>
          </Card>
          <Card accentColor="#3B82F6">
            <h3 className="font-bold mb-2">Accidentele rutiere — unde pierdem cei mai mulți</h3>
            <p className="text-sm text-[var(--color-text-muted)]">
              România are una dintre cele mai mari rate de mortalitate rutieră din UE — ~95 decese
              la 1 milion locuitori, dublu față de media europeană. Cauze principale: drumuri
              proaste, viteză excesivă, alcool la volan.
            </p>
          </Card>
          <Card accentColor="#10B981">
            <h3 className="font-bold mb-2">Criminalitatea generală — stabilă</h3>
            <p className="text-sm text-[var(--color-text-muted)]">
              Spre deosebire de percepția publică, totalul infracțiunilor raportate e relativ
              stabil în ultimii 5 ani. Creșterile vizibile sunt mai ales la infracțiunile
              informatice (phishing, fraudă bancară).
            </p>
          </Card>
        </div>
      </section>

      <section className="p-6 rounded-[var(--radius-card)] bg-[var(--color-surface-2)]">
        <h3 className="font-bold mb-3">Surse</h3>
        <ul className="text-sm space-y-2">
          <li>
            <a href="https://www.politiaromana.ro" target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] hover:underline inline-flex items-center gap-1">
              Poliția Română — rapoarte anuale <ExternalLink size={12} />
            </a>
          </li>
          <li>
            <a href="https://www.mai.gov.ro" target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] hover:underline inline-flex items-center gap-1">
              Ministerul de Interne — statistici operative <ExternalLink size={12} />
            </a>
          </li>
          <li>
            <a href="https://insse.ro" target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] hover:underline inline-flex items-center gap-1">
              INS — populația de referință pentru rate <ExternalLink size={12} />
            </a>
          </li>
        </ul>
      </section>

      <LastUpdated
        date={DATE_PUBLICE_SNAPSHOT.lastUpdated}
        sources={["Poliția Română", "Ministerul de Interne", "INS"]}
      />
    </div>
  );
}
