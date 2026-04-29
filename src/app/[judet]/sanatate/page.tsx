import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Heart, ArrowRight, ExternalLink } from "lucide-react";
import { getCountyBySlug } from "@/data/counties";
import { SANATATE_NATIONALA } from "@/data/date-publice";
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
    title: `Sănătate — ${county.name}`,
    description: `DSP ${county.name}, programări, spitale locale, speranță de viață și date naționale.`,
    alternates: { canonical: `/${county.slug}/sanatate` },
  };
}

export default async function CountySanatatePage({
  params,
}: {
  params: Promise<{ judet: string }>;
}) {
  const { judet } = await params;
  const county = getCountyBySlug(judet);
  if (!county) notFound();

  const latest = SANATATE_NATIONALA[SANATATE_NATIONALA.length - 1]!;

  return (
    <div className="container-narrow py-12 md:py-16">
      <Link
        href={`/${county.slug}`}
        className="inline-flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] mb-6 transition-colors"
      >
        ← {county.name}
      </Link>

      <Badge className="mb-4" variant="primary">❤️ Sănătate</Badge>
      <h1 className="font-[family-name:var(--font-sora)] text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
        Sănătate în <span className="text-[var(--color-primary)]">{county.name}</span>
      </h1>
      <p className="text-lg text-[var(--color-text-muted)] max-w-3xl mb-10 leading-relaxed">
        Contact DSP {county.name}, resurse pentru pacienți și indicatori naționali relevanți.
      </p>

      {latest && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
          <Card className="text-center">
            <div className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-2">Speranță de viață</div>
            <div className="text-3xl font-bold text-[var(--color-primary)]">{latest.sperantaViataAni}</div>
            <div className="text-xs text-[var(--color-text-muted)] mt-1">ani · național {latest.year}</div>
          </Card>
          <Card className="text-center">
            <div className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-2">Medici/1000 loc</div>
            <div className="text-3xl font-bold text-[var(--color-primary)]">{latest.mediciLa1000Loc}</div>
            <div className="text-xs text-[var(--color-text-muted)] mt-1">național {latest.year}</div>
          </Card>
          <Card className="text-center">
            <div className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-2">Mortalitate infantilă</div>
            <div className="text-3xl font-bold text-red-600">{latest.mortInfantilaLa1000}</div>
            <div className="text-xs text-[var(--color-text-muted)] mt-1">la 1000 născuți · {latest.year}</div>
          </Card>
        </div>
      )}

      <section className="mb-12">
        <h2 className="font-[family-name:var(--font-sora)] text-2xl font-bold mb-5 flex items-center gap-2">
          <Heart size={22} className="text-red-500" />
          Resurse {county.name}
        </h2>
        <div className="grid gap-4">
          <a
            href={`https://dsp${county.slug}.ro`}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] hover:shadow-[var(--shadow-md)] transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">DSP {county.name}</h3>
                <p className="text-sm text-[var(--color-text-muted)] mt-1">Direcția de Sănătate Publică — anchete, avizări, comunicate</p>
              </div>
              <ExternalLink size={18} className="text-[var(--color-text-muted)]" />
            </div>
          </a>
          <a
            href="https://www.ms.ro"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] hover:shadow-[var(--shadow-md)] transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Ministerul Sănătății</h3>
                <p className="text-sm text-[var(--color-text-muted)] mt-1">Reglementări naționale, rețele spitalicești</p>
              </div>
              <ExternalLink size={18} className="text-[var(--color-text-muted)]" />
            </div>
          </a>
          <a
            href="https://www.cnas.ro"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] hover:shadow-[var(--shadow-md)] transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Casa Națională de Asigurări — CNAS</h3>
                <p className="text-sm text-[var(--color-text-muted)] mt-1">Cash-card, programări, decontări</p>
              </div>
              <ExternalLink size={18} className="text-[var(--color-text-muted)]" />
            </div>
          </a>
        </div>
      </section>

      <Card className="mb-10 bg-gradient-to-br from-[var(--color-primary-soft)] to-transparent text-center">
        <h3 className="font-bold text-xl mb-3">Dashboard național sănătate</h3>
        <p className="text-sm text-[var(--color-text-muted)] mb-4 max-w-md mx-auto">
          Evoluție speranță de viață, top spitale publice, context european.
        </p>
        <Link
          href="/sanatate"
          className="inline-flex items-center gap-2 h-11 px-5 rounded-[var(--radius-button)] bg-[var(--color-primary)] text-white font-semibold hover:bg-[var(--color-primary-hover)]"
        >
          Deschide dashboard național <ArrowRight size={14} />
        </Link>
      </Card>

      <LastUpdated date="2026-04-10" sources={["INS", "OMS", "Ministerul Sănătății"]} />
    </div>
  );
}
