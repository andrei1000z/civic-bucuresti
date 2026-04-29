import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Megaphone, Users, ArrowRight, Calendar } from "lucide-react";
import { listPetitii } from "@/lib/petitii/repository";
import { CollectionPageJsonLd } from "@/components/JsonLd";
import { SITE_URL } from "@/lib/constants";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Petiții civice — Civia",
  description:
    "Semnează online petiții civice care pun presiune publică pe autorități. Mai multe semnături = răspuns mai rapid. Gratuit, fără spam.",
  alternates: { canonical: "/petitii" },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ro-RO", { day: "numeric", month: "short", year: "numeric" });
}

export default async function PetitiiPage() {
  const petitii = await listPetitii({ status: ["active", "closed"] });
  const active = petitii.filter((p) => p.status === "active");
  const closed = petitii.filter((p) => p.status === "closed");

  return (
    <div className="container-narrow py-12 md:py-16">
      <CollectionPageJsonLd
        name="Petiții civice — Civia"
        description="Catalog cu petiții civice active. Semnează online — mai multe voci = autoritățile răspund."
        url={`${SITE_URL}/petitii`}
      />

      <header className="mb-10 max-w-3xl">
        <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 text-xs font-semibold mb-4">
          <Megaphone size={12} aria-hidden="true" /> Acțiuni colective
        </p>
        <h1 className="font-[family-name:var(--font-sora)] text-4xl md:text-5xl font-extrabold mb-3 tracking-tight">
          Petiții civice
        </h1>
        <p className="text-lg text-[var(--color-text-muted)] leading-relaxed">
          Semnături online care pun presiune publică pe autorități. Spre deosebire de o
          sesizare, petiția adună <strong>multe voci pentru aceeași cauză</strong> —
          autoritățile nu pot ignora 1.000 de oameni.
        </p>
      </header>

      {petitii.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {active.length > 0 && (
            <section className="mb-12">
              <h2 className="font-[family-name:var(--font-sora)] text-xl md:text-2xl font-bold mb-5 flex items-center gap-2">
                Active
                <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)] text-xs font-bold tabular-nums">
                  {active.length}
                </span>
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {active.map((p) => (
                  <PetitieCard key={p.id} p={p} />
                ))}
              </div>
            </section>
          )}

          {closed.length > 0 && (
            <section>
              <h2 className="font-[family-name:var(--font-sora)] text-xl md:text-2xl font-bold mb-5 text-[var(--color-text-muted)]">
                Încheiate
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 opacity-80">
                {closed.map((p) => (
                  <PetitieCard key={p.id} p={p} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex items-center justify-center min-h-[280px] p-8 bg-[var(--color-surface)] border border-dashed border-[var(--color-border)] rounded-[var(--radius-md)] text-center">
      <div className="max-w-md">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[var(--color-primary-soft)] flex items-center justify-center">
          <Megaphone size={24} className="text-[var(--color-primary)]" aria-hidden="true" />
        </div>
        <h2 className="font-semibold text-lg mb-2">Nicio petiție activă acum</h2>
        <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
          Verifică curând — adăugăm petiții civice când avem o cauză suficient
          de importantă pentru presiune publică. Între timp, poți trimite o
          sesizare individuală.
        </p>
        <Link
          href="/sesizari"
          className="inline-flex items-center gap-2 mt-5 h-11 px-5 rounded-[var(--radius-full)] bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-colors"
        >
          Trimite o sesizare
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

function PetitieCard({ p }: { p: { slug: string; title: string; summary: string; image_url: string | null; signature_count: number; target_signatures: number; status: string; ends_at: string | null; category: string | null } }) {
  const progress = Math.min(100, Math.round((p.signature_count / Math.max(1, p.target_signatures)) * 100));
  return (
    <Link
      href={`/petitii/${p.slug}`}
      className="group flex flex-col bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] overflow-hidden hover:shadow-[var(--shadow-3)] hover:border-[var(--color-primary)]/30 transition-all"
    >
      {p.image_url ? (
        <div className="relative w-full aspect-[16/9] bg-[var(--color-surface-2)]">
          <Image
            src={p.image_url}
            alt={p.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      ) : (
        <div className="w-full aspect-[16/9] bg-gradient-to-br from-purple-500/20 to-purple-900/20 flex items-center justify-center">
          <Megaphone size={48} className="text-purple-500/50" aria-hidden="true" />
        </div>
      )}
      <div className="flex-1 p-5 flex flex-col">
        {p.category && (
          <span className="inline-block self-start text-[10px] uppercase tracking-wider font-bold text-purple-600 dark:text-purple-400 mb-2">
            {p.category}
          </span>
        )}
        <h3 className="font-[family-name:var(--font-sora)] font-bold text-base mb-2 line-clamp-2 group-hover:text-[var(--color-primary)] transition-colors">
          {p.title}
        </h3>
        <p className="text-sm text-[var(--color-text-muted)] line-clamp-2 mb-4">
          {p.summary}
        </p>
        <div className="mt-auto space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1 text-[var(--color-text)] font-medium">
              <Users size={12} aria-hidden="true" />
              {p.signature_count.toLocaleString("ro-RO")} / {p.target_signatures.toLocaleString("ro-RO")}
            </span>
            <span className="text-[var(--color-text-muted)] tabular-nums">{progress}%</span>
          </div>
          <div className="h-1.5 bg-[var(--color-surface-2)] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-purple-700 rounded-full transition-all"
              style={{ width: `${progress}%` }}
              aria-hidden="true"
            />
          </div>
          {p.ends_at && (
            <p className="text-[10px] text-[var(--color-text-muted)] flex items-center gap-1 pt-1">
              <Calendar size={10} aria-hidden="true" />
              {p.status === "closed" ? "Încheiată " : "Până "}
              {formatDate(p.ends_at)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
