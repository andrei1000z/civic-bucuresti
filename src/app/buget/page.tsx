import type { Metadata } from "next";
import Link from "next/link";
import { Wallet, TrendingUp, AlertTriangle, ExternalLink, ArrowRight } from "lucide-react";
import { BUGET_NATIONAL, BUGET_CHELTUIELI_2025, DATE_PUBLICE_SNAPSHOT } from "@/data/date-publice";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SimpleBar } from "@/components/date-publice/SimpleBar";
import { DatasetJsonLd } from "@/components/FaqJsonLd";
import { LastUpdated } from "@/components/data/LastUpdated";
import { formatDecimal } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Bugetul României — unde merg banii din taxele noastre",
  description:
    "Venituri, cheltuieli și deficit bugetar România 2020–2026. Câți bani strânge statul, pe ce îi cheltuie, cât împrumutăm. Date oficiale Ministerul Finanțelor + INS, vizualizate simplu.",
  alternates: { canonical: "/buget" },
};

export const revalidate = 604800; // 1 week — static dataset

export default function BugetPage() {
  // BUGET_NATIONAL is a hardcoded, non-empty dataset — assertions are safe
  // and document the invariant under noUncheckedIndexedAccess.
  const latest = BUGET_NATIONAL[BUGET_NATIONAL.length - 1]!;
  const prev = BUGET_NATIONAL[BUGET_NATIONAL.length - 2]!;
  const deficitTrend = latest.deficitProcPib - prev.deficitProcPib;

  return (
    <div className="container-narrow py-12 md:py-16">
      <DatasetJsonLd
        name="Buget național România"
        description="Execuție bugetară România: venituri, cheltuieli, deficit % PIB, evoluție 2020-2026. Surse: Ministerul Finanțelor, INS."
        url="https://civia.ro/buget"
        keywords={["buget", "romania", "fisc", "deficit", "pib", "transparenta"]}
      />
      <Badge className="mb-4">Transparență fiscală</Badge>
      <h1 className="font-[family-name:var(--font-sora)] text-4xl md:text-5xl font-bold mb-4 flex items-center gap-3">
        <Wallet size={40} className="text-[var(--color-primary)]" aria-hidden="true" />
        Banii tăi, pe românește
      </h1>
      <p className="text-lg text-[var(--color-text-muted)] max-w-3xl mb-10 leading-relaxed">
        Din fiecare leu plătit la taxe, unde ajunge? Cât strânge statul, cât cheltuie, cât împrumută. Cifre oficiale de la Ministerul Finanțelor și INS, explicate fără jargon financiar.
      </p>

      {/* KEY NUMBERS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <Card className="text-center">
          <div className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
            Venituri {latest.year}
          </div>
          <div className="text-2xl md:text-3xl font-bold text-emerald-600">
            {formatDecimal(latest.venituri, 1)} <span className="text-sm">mld lei</span>
          </div>
        </Card>
        <Card className="text-center">
          <div className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
            Cheltuieli {latest.year}
          </div>
          <div className="text-2xl md:text-3xl font-bold text-[var(--color-primary)]">
            {formatDecimal(latest.cheltuieli, 1)} <span className="text-sm">mld lei</span>
          </div>
        </Card>
        <Card className="text-center">
          <div className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
            Deficit / PIB
          </div>
          <div className="text-2xl md:text-3xl font-bold text-red-600">
            {formatDecimal(latest.deficitProcPib, 1)}%
          </div>
          <div
            className={`text-[10px] mt-1 ${
              deficitTrend > 0 ? "text-red-600" : "text-emerald-600"
            }`}
            title={
              deficitTrend > 0
                ? `Deficitul a crescut cu ${formatDecimal(Math.abs(deficitTrend), 1)} puncte procentuale față de ${prev.year}`
                : `Deficitul a scăzut cu ${formatDecimal(Math.abs(deficitTrend), 1)} puncte procentuale față de ${prev.year}`
            }
          >
            <span aria-hidden="true">{deficitTrend > 0 ? "▲" : "▼"}</span>{" "}
            {formatDecimal(Math.abs(deficitTrend), 1)} pp vs {prev.year}
          </div>
        </Card>
        <Card className="text-center">
          <div className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
            PIB estimat
          </div>
          <div className="text-2xl md:text-3xl font-bold text-[var(--color-primary)]">
            {formatDecimal(latest.pib / 1000, 2)} <span className="text-sm">trilion lei</span>
          </div>
        </Card>
      </div>

      {/* EVOLUȚIE */}
      <section className="mb-10">
        <h2 className="font-[family-name:var(--font-sora)] text-2xl font-bold mb-4 flex items-center gap-2">
          <TrendingUp size={22} className="text-[var(--color-primary)]" aria-hidden="true" />
          Evoluția deficitului 2020-2026 (% din PIB)
        </h2>
        <Card>
          <SimpleBar
            data={BUGET_NATIONAL.map((b) => ({
              label: String(b.year),
              value: b.deficitProcPib,
              sub: `Ven: ${formatDecimal(b.venituri, 0)} vs Chelt: ${formatDecimal(b.cheltuieli, 0)} mld`,
              color: b.deficitProcPib > 7 ? "#DC2626" : b.deficitProcPib > 4 ? "#F59E0B" : "#10B981",
            }))}
            format={(v) => `${formatDecimal(v, 1)}%`}
            max={10}
          />
        </Card>
        <div className="mt-3 p-3 rounded-[var(--radius-xs)] bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-xs flex gap-2 items-start">
          <AlertTriangle size={14} className="text-amber-600 mt-0.5 shrink-0" aria-hidden="true" />
          <p className="text-[var(--color-text-muted)]">
            România e singurul stat UE în procedura de deficit excesiv din 2020. Limita Pactului
            de Stabilitate e 3% din PIB — depășită în fiecare an. Plan ajustare agreat cu
            Comisia Europeană prin 2029-2031.
          </p>
        </div>
      </section>

      {/* UNDE MERG BANII */}
      <section className="mb-10">
        <h2 className="font-[family-name:var(--font-sora)] text-2xl font-bold mb-4">
          Unde merg banii publici în {latest.year}
        </h2>
        <Card>
          <SimpleBar
            data={BUGET_CHELTUIELI_2025.map((c) => ({
              label: c.categorie,
              value: c.procent,
              sub: `${formatDecimal(c.mldLei, 1)} mld lei`,
              color: c.color,
            }))}
            format={(v) => `${formatDecimal(v, 1)}%`}
            max={35}
          />
        </Card>
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="text-[var(--color-text-muted)] self-center">Vezi detaliat:</span>
          <Link href="/sanatate" className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-950/40 transition-colors">
            ❤️ Sănătate
          </Link>
          <Link href="/educatie" className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-950/40 transition-colors">
            🎓 Educație
          </Link>
          <Link href="/siguranta" className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-950/20 text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-950/40 transition-colors">
            🛡️ Ordine publică
          </Link>
        </div>
      </section>

      {/* CONTEXT */}
      <section className="mb-10">
        <h2 className="font-[family-name:var(--font-sora)] text-2xl font-bold mb-4">
          Context — de ce contează
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Card accentColor="#DC2626">
            <h3 className="font-bold mb-2">Dobânzile mănâncă totul</h3>
            <p className="text-sm text-[var(--color-text-muted)]">
              Din cauza deficitului masiv, România plătește 60+ mld lei/an doar dobânzile
              datoriei publice — echivalentul întregului buget al sănătății. Fiecare leu
              împrumutat astăzi înseamnă mai puțini bani pentru școli, spitale, drumuri mâine.
            </p>
          </Card>
          <Card accentColor="#F59E0B">
            <h3 className="font-bold mb-2">Pensii & salarii — 40% din buget</h3>
            <p className="text-sm text-[var(--color-text-muted)]">
              Cheltuielile cu asigurările sociale și salariile bugetarilor depășesc 40% din
              buget. Creșterile frecvente de salarii/pensii fără acoperire în venituri sunt
              principalul motor al deficitului structural.
            </p>
          </Card>
          <Card accentColor="#10B981">
            <h3 className="font-bold mb-2">PNRR — 28 mld euro până în 2026</h3>
            <p className="text-sm text-[var(--color-text-muted)]">
              Planul Național de Redresare și Reziliență e sursa majoră de investiții —
              autostrăzi, căi ferate, digitalizare, energie verde. Banii vin ca împrumut
              (14.9 mld €) + grant (13.6 mld €) de la UE.
            </p>
          </Card>
          <Card accentColor="#3B82F6">
            <h3 className="font-bold mb-2">Colectare slabă a TVA</h3>
            <p className="text-sm text-[var(--color-text-muted)]">
              România are cel mai mare „VAT gap" din UE (~35% pierdut prin evaziune) — aproximativ
              30 mld lei/an. Digitalizarea ANAF (e-Factura, SAF-T, e-TVA) ar putea reduce
              semnificativ această pierdere.
            </p>
          </Card>
        </div>
      </section>

      {/* SOURCES */}
      <section className="p-6 rounded-[var(--radius-card)] bg-[var(--color-surface-2)]">
        <h3 className="font-bold mb-3">Surse</h3>
        <ul className="text-sm space-y-2">
          <li>
            <a
              href="https://mfinante.gov.ro"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-primary)] hover:underline inline-flex items-center gap-1"
            >
              Ministerul Finanțelor — execuție bugetară <ExternalLink size={12} />
            </a>
          </li>
          <li>
            <a
              href="https://insse.ro"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-primary)] hover:underline inline-flex items-center gap-1"
            >
              INS — PIB și agregate macroeconomice <ExternalLink size={12} />
            </a>
          </li>
          <li>
            <a
              href="https://data.gov.ro"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-primary)] hover:underline inline-flex items-center gap-1"
            >
              data.gov.ro — date publice în format deschis <ExternalLink size={12} />
            </a>
          </li>
          <li>
            <a
              href="https://ec.europa.eu/economy_finance/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-primary)] hover:underline inline-flex items-center gap-1"
            >
              Comisia Europeană — criteriile Pactului de Stabilitate <ExternalLink size={12} />
            </a>
          </li>
        </ul>
      </section>

      <div className="mt-10 text-center">
        <Link
          href="/ghiduri/ghid-legea-544"
          className="inline-flex items-center gap-2 text-[var(--color-primary)] hover:underline font-medium"
        >
          Cum obții execuția bugetară detaliată a primăriei tale <ArrowRight size={16} />
        </Link>
      </div>

      <LastUpdated
        date={DATE_PUBLICE_SNAPSHOT.lastUpdated}
        sources={["Ministerul Finanțelor", "INS", "BNR"]}
        note="Cifrele 2026 sunt proiecții din bugetul aprobat decembrie 2025."
      />
    </div>
  );
}
