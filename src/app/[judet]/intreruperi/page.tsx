import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, Calendar, ExternalLink, MapPin, ArrowLeft } from "lucide-react";
import {
  getInterruptionsForCounty,
  TYPE_ICONS,
  TYPE_LABELS,
} from "@/data/intreruperi";
import { getCountyBySlug } from "@/data/counties";
import { SITE_URL } from "@/lib/constants";
import { IntreruperiFilters } from "../../intreruperi/IntreruperiFilters";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ judet: string }>;
}): Promise<Metadata> {
  const { judet } = await params;
  const county = getCountyBySlug(judet);
  if (!county) return {};
  return {
    title: `Întreruperi programate — ${county.name}`,
    description: `Întreruperi de apă, caldură, gaz, curent + lucrări la stradă în ${county.name}. Catalogat din anunțuri oficiale ale operatorilor locali.`,
    alternates: { canonical: `/${county.slug}/intreruperi` },
  };
}

export const revalidate = 1800;

export default async function JudetIntreruperiPage({
  params,
}: {
  params: Promise<{ judet: string }>;
}) {
  const { judet } = await params;
  const county = getCountyBySlug(judet);
  if (!county) notFound();

  const all = getInterruptionsForCounty(county.id).filter((i) => {
    const now = Date.now();
    return i.status !== "anulat" && i.status !== "finalizat" && new Date(i.endAt).getTime() >= now;
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: `Întreruperi programate — ${county.name}`,
    description: `Catalog de întreruperi utilitare + lucrări de stradă pentru ${county.name}.`,
    url: `${SITE_URL}/${county.slug}/intreruperi`,
    spatialCoverage: { "@type": "AdministrativeArea", name: county.name },
  };

  return (
    <div className="container-narrow py-10 md:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link
        href="/intreruperi"
        className="inline-flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Toate județele
      </Link>

      <header className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)] text-xs font-semibold mb-4">
          <MapPin size={12} /> {county.name}
        </div>
        <h1 className="font-[family-name:var(--font-sora)] text-3xl md:text-5xl font-bold mb-3">
          Întreruperi programate — {county.name}
        </h1>
        <p className="text-base md:text-lg text-[var(--color-text-muted)] max-w-3xl leading-relaxed">
          Apă, caldură, gaz, curent + lucrări de stradă în județul tău.
          Agregat din surse oficiale. Filtrează după tip sau deschide harta.
        </p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {(["apa", "caldura", "gaz", "electricitate"] as const).map((t) => {
          const count = all.filter((i) => i.type === t).length;
          return (
            <div
              key={t}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-4"
            >
              <div className="text-2xl mb-1">{TYPE_ICONS[t]}</div>
              <div className="text-2xl font-bold text-[var(--color-primary)] font-[family-name:var(--font-sora)]">
                {count}
              </div>
              <div className="text-xs text-[var(--color-text-muted)] mt-0.5">
                {TYPE_LABELS[t]}
              </div>
            </div>
          );
        })}
      </div>

      {all.length === 0 ? (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[16px] p-8 text-center">
          <Calendar
            size={40}
            className="mx-auto mb-3 text-[var(--color-text-muted)]"
          />
          <h2 className="font-semibold text-lg mb-1">
            Nicio întrerupere activă în {county.name}
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] mb-4">
            Catalogul se actualizează la 6h. Revino curând sau urmărește sursele oficiale direct.
          </p>
          <Link
            href="/intreruperi"
            className="inline-flex items-center gap-1 text-sm text-[var(--color-primary)] hover:underline font-medium"
          >
            <ExternalLink size={14} /> Vezi toate întreruperile (toată țara)
          </Link>
        </div>
      ) : (
        <IntreruperiFilters items={all} />
      )}

      <section className="mt-12 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-[12px] p-6">
        <h2 className="font-semibold mb-2 flex items-center gap-2 text-amber-900 dark:text-amber-300">
          <AlertTriangle size={16} /> Lipsește ceva?
        </h2>
        <p className="text-sm text-amber-800 dark:text-amber-300 mb-3">
          Catalogul pentru {county.name} poate fi incomplet dacă nu avem
          încă un scraper pentru operatorul tău local. Vrei să adăugăm o
          sursă nouă?
        </p>
        <a
          href={`https://github.com/andrei1000z/civic-bucuresti/issues/new?title=${encodeURIComponent(
            `Adaugă sursă întreruperi pentru ${county.name}`,
          )}&labels=intreruperi`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-amber-900 dark:text-amber-300 hover:underline font-medium"
        >
          <ExternalLink size={12} /> Deschide issue pe GitHub
        </a>
      </section>
    </div>
  );
}
