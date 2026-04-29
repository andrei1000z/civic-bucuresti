import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GraduationCap, ArrowRight, ExternalLink } from "lucide-react";
import { getCountyBySlug } from "@/data/counties";
import { BAC_STATS } from "@/data/date-publice";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
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
    title: `Educație — ${county.name}`,
    description: `Resurse educaționale, Inspectoratul Școlar ${county.name}, statistici BAC naționale.`,
    alternates: { canonical: `/${county.slug}/educatie` },
  };
}

export default async function CountyEducatiePage({
  params,
}: {
  params: Promise<{ judet: string }>;
}) {
  const { judet } = await params;
  const county = getCountyBySlug(judet);
  if (!county) notFound();

  const latestBac = BAC_STATS[BAC_STATS.length - 1]!;

  return (
    <div className="container-narrow py-12 md:py-16">
      <Link
        href={`/${county.slug}`}
        className="inline-flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] mb-6 transition-colors"
      >
        ← {county.name}
      </Link>

      <Badge className="mb-4" variant="primary">🎓 Educație</Badge>
      <h1 className="font-[family-name:var(--font-sora)] text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
        Educație în <span className="text-[var(--color-primary)]">{county.name}</span>
      </h1>
      <p className="text-lg text-[var(--color-text-muted)] max-w-3xl mb-10 leading-relaxed">
        Date locale publicate de MEN sunt detaliate pe școală/liceu, nu agregate pe județ. Aici găsești
        contextul național și resursele oficiale pentru {county.name}.
      </p>

      {latestBac && (
        <Card className="mb-10">
          <div className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
            Promovabilitate BAC {latestBac.year} — național
          </div>
          <div className="flex items-baseline gap-3">
            <div className="text-4xl md:text-5xl font-bold text-[var(--color-primary)]">
              {latestBac.promovabilitate}%
            </div>
            <div className="text-sm text-[var(--color-text-muted)]">
              din {latestBac.prezenti.toLocaleString("ro-RO")} elevi prezenți
            </div>
          </div>
        </Card>
      )}

      <section className="mb-12">
        <h2 className="font-[family-name:var(--font-sora)] text-2xl font-bold mb-5 flex items-center gap-2">
          <GraduationCap size={22} className="text-[var(--color-primary)]" />
          Resurse oficiale {county.name}
        </h2>
        <div className="grid gap-4">
          <a
            href={`https://isj${county.slug}.ro`}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] hover:shadow-[var(--shadow-md)] transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Inspectoratul Școlar {county.name}</h3>
                <p className="text-sm text-[var(--color-text-muted)] mt-1">Admitere, titularizare, comunicate</p>
              </div>
              <ExternalLink size={18} className="text-[var(--color-text-muted)]" />
            </div>
          </a>
          <a
            href="https://edu.ro"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] hover:shadow-[var(--shadow-md)] transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Ministerul Educației — edu.ro</h3>
                <p className="text-sm text-[var(--color-text-muted)] mt-1">Calendar, metodologii, clasamente naționale</p>
              </div>
              <ExternalLink size={18} className="text-[var(--color-text-muted)]" />
            </div>
          </a>
        </div>
      </section>

      <Card className="mb-10 bg-gradient-to-br from-[var(--color-primary-soft)] to-transparent text-center">
        <h3 className="font-bold text-xl mb-3">Dashboard național educație</h3>
        <p className="text-sm text-[var(--color-text-muted)] mb-4 max-w-md mx-auto">
          Vezi evoluția BAC, top liceele României, cheltuielile cu educația din buget.
        </p>
        <Link
          href="/educatie"
          className="inline-flex items-center gap-2 h-11 px-5 rounded-[var(--radius-button)] bg-[var(--color-primary)] text-white font-semibold hover:bg-[var(--color-primary-hover)]"
        >
          Deschide dashboard național <ArrowRight size={14} />
        </Link>
      </Card>

      <LastUpdated
        date="2026-04-10"
        sources={["Ministerul Educației", "INS"]}
        note="Datele detaliate pe județ sunt publicate de Inspectoratele Școlare Județene, link mai sus."
      />
    </div>
  );
}
