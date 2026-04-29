import type { Metadata } from "next";
import Link from "next/link";
import { getCountyBySlug } from "@/data/counties";
import { FileText, Eye, CheckCircle2 } from "lucide-react";
import { SesizareForm } from "@/components/sesizari/SesizareForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ judet: string }>;
}): Promise<Metadata> {
  const { judet } = await params;
  const county = getCountyBySlug(judet);
  if (!county) return {};
  return {
    title: "Sesizări",
    description: `Trimite sesizări formale la autoritățile din ${county.name}. AI-ul generează textul cu temei legal.`,
    alternates: { canonical: `/${county.slug}/sesizari` },
  };
}

export default async function SesizariPage({
  params,
}: {
  params: Promise<{ judet: string }>;
}) {
  const { judet } = await params;
  const county = getCountyBySlug(judet);
  const countyName = county?.name ?? judet;

  return (
    <div className="container-narrow py-12 md:py-16">
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-sora)] text-4xl md:text-5xl font-bold mb-3">
          Sesizări — {countyName}
        </h1>
        <p className="text-lg text-[var(--color-text-muted)] max-w-3xl">
          Trimite o sesizare formală la autoritățile din {countyName}. AI-ul generează textul cu temei legal, tu doar apeși trimite.
        </p>
      </div>

      {/* Quick links */}
      <div className="grid sm:grid-cols-3 gap-3 mb-10">
        <Link
          href="/sesizari-publice"
          className="flex items-center gap-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-sm)] p-4 hover:shadow-[var(--shadow-md)] transition-all"
        >
          <Eye size={20} className="text-[var(--color-primary)] shrink-0" />
          <div>
            <p className="text-sm font-semibold">Sesizări publice</p>
            <p className="text-[10px] text-[var(--color-text-muted)]">Vezi ce semnalează alții</p>
          </div>
        </Link>
        <Link
          href="/urmareste"
          className="flex items-center gap-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-sm)] p-4 hover:shadow-[var(--shadow-md)] transition-all"
        >
          <FileText size={20} className="text-amber-500 shrink-0" />
          <div>
            <p className="text-sm font-semibold">Urmărește sesizarea</p>
            <p className="text-[10px] text-[var(--color-text-muted)]">Verifică statusul cu codul tău</p>
          </div>
        </Link>
        <Link
          href="/sesizari-rezolvate"
          className="flex items-center gap-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-sm)] p-4 hover:shadow-[var(--shadow-md)] transition-all"
        >
          <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
          <div>
            <p className="text-sm font-semibold">Rezolvate</p>
            <p className="text-[10px] text-[var(--color-text-muted)]">Galerie before & after</p>
          </div>
        </Link>
      </div>

      {/* Sesizare type choice */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-6 mb-8">
        <h2 className="font-[family-name:var(--font-sora)] text-xl font-bold mb-2">
          Fă o sesizare
        </h2>
        <p className="text-sm text-[var(--color-text-muted)] mb-4">
          Alege tipul de sesizare. Sesizarea rapidă necesită doar datele minime. Sesizarea completă include detalii suplimentare care ajută autoritățile să rezolve problema mai rapid și mai eficient.
        </p>
      </div>

      {/* The actual form */}
      <SesizareForm />

      {/* Info */}
      <div className="mt-8 bg-blue-50 dark:bg-blue-950/20 border-l-4 border-blue-400 rounded-[var(--radius-md)] p-4 text-sm">
        <p className="text-blue-900 dark:text-blue-200">
          <strong>Conform OG 27/2002</strong>, autoritățile au obligația să răspundă în 30 de zile calendaristice.
          Sesizarea generată include temei legal și este adresată instituției competente din {countyName}.
        </p>
      </div>
    </div>
  );
}
