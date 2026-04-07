import type { Metadata } from "next";
import Link from "next/link";
import { Eye, FileText, CheckCircle2 } from "lucide-react";
import { SesizareForm } from "@/components/sesizari/SesizareForm";

export const metadata: Metadata = {
  title: "Sesizări — Civia",
  description: "Trimite o sesizare formală la autorități. AI-ul generează textul cu temei legal. Detectăm automat județul din locația ta.",
  alternates: { canonical: "/sesizari" },
};

export default function SesizariPage() {
  return (
    <div className="container-narrow py-12 md:py-16">
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-sora)] text-4xl md:text-5xl font-bold mb-3">
          Sesizări
        </h1>
        <p className="text-lg text-[var(--color-text-muted)] max-w-3xl">
          Descrie problema, pune locația, iar AI-ul generează o sesizare formală gata de trimis. Județul se detectează automat din adresă.
        </p>
      </div>

      {/* Quick links */}
      <div className="grid sm:grid-cols-3 gap-3 mb-10">
        <Link
          href="/sesizari-publice"
          className="flex items-center gap-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[10px] p-4 hover:shadow-[var(--shadow-md)] transition-all"
        >
          <Eye size={20} className="text-[var(--color-primary)] shrink-0" />
          <div>
            <p className="text-sm font-semibold">Sesizări publice</p>
            <p className="text-[10px] text-[var(--color-text-muted)]">Vezi ce semnalează alții</p>
          </div>
        </Link>
        <Link
          href="/urmareste"
          className="flex items-center gap-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[10px] p-4 hover:shadow-[var(--shadow-md)] transition-all"
        >
          <FileText size={20} className="text-amber-500 shrink-0" />
          <div>
            <p className="text-sm font-semibold">Urmărește sesizarea</p>
            <p className="text-[10px] text-[var(--color-text-muted)]">Verifică statusul cu codul tău</p>
          </div>
        </Link>
        <Link
          href="/sesizari-rezolvate"
          className="flex items-center gap-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[10px] p-4 hover:shadow-[var(--shadow-md)] transition-all"
        >
          <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
          <div>
            <p className="text-sm font-semibold">Rezolvate</p>
            <p className="text-[10px] text-[var(--color-text-muted)]">Galerie before & after</p>
          </div>
        </Link>
      </div>

      {/* Sesizare form */}
      <SesizareForm />

      {/* Info */}
      <div className="mt-8 bg-blue-50 dark:bg-blue-950/20 border-l-4 border-blue-400 rounded-[12px] p-4 text-sm">
        <p className="text-blue-900 dark:text-blue-200">
          <strong>Conform OG 27/2002</strong>, autoritățile au obligația să răspundă în 30 de zile calendaristice.
          Sesizarea generată include temei legal și este adresată instituției competente.
        </p>
      </div>
    </div>
  );
}
