import type { Metadata } from "next";
import Link from "next/link";
import { Zap, FileText, Eye, CheckCircle2, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Sesizări — Civia",
  description: "Trimite sesizări formale la autorități, vezi sesizările publice, urmărește statusul sau vezi sesizările rezolvate.",
  alternates: { canonical: "/sesizari" },
};

export default function SesizariPage() {
  return (
    <div className="container-narrow py-12 md:py-16">
      <div className="mb-10">
        <h1 className="font-[family-name:var(--font-sora)] text-4xl md:text-5xl font-bold mb-3">
          Sesizări
        </h1>
        <p className="text-lg text-[var(--color-text-muted)] max-w-3xl">
          Alege județul tău și trimite o sesizare formală la autorități. AI-ul generează textul cu temei legal.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-5 mb-10">
        <Link
          href="/#county-picker"
          className="group bg-gradient-to-br from-[var(--color-primary)] to-indigo-900 rounded-[12px] p-6 text-white hover:shadow-[var(--shadow-lg)] transition-all"
        >
          <Zap size={28} className="mb-3 text-blue-200" />
          <h2 className="font-[family-name:var(--font-sora)] text-xl font-bold mb-2">
            Fă o sesizare
          </h2>
          <p className="text-white/80 text-sm mb-4">
            Alege județul, descrie problema, iar AI-ul generează o sesizare formală gata de trimis.
          </p>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-blue-200 group-hover:gap-2 transition-all">
            Alege județul <ArrowRight size={14} />
          </span>
        </Link>

        <Link
          href="/sesizari-publice"
          className="group bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-6 hover:shadow-[var(--shadow-lg)] transition-all"
        >
          <Eye size={28} className="mb-3 text-[var(--color-primary)]" />
          <h2 className="font-[family-name:var(--font-sora)] text-xl font-bold mb-2">
            Sesizări publice
          </h2>
          <p className="text-[var(--color-text-muted)] text-sm mb-4">
            Vezi ce probleme semnalează alți cetățeni din toată România.
          </p>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-primary)] group-hover:gap-2 transition-all">
            Vezi sesizările <ArrowRight size={14} />
          </span>
        </Link>

        <Link
          href="/urmareste"
          className="group bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-6 hover:shadow-[var(--shadow-lg)] transition-all"
        >
          <FileText size={28} className="mb-3 text-amber-500" />
          <h2 className="font-[family-name:var(--font-sora)] text-xl font-bold mb-2">
            Urmărește sesizarea
          </h2>
          <p className="text-[var(--color-text-muted)] text-sm mb-4">
            Ai trimis deja o sesizare? Introdu codul pentru a vedea statusul.
          </p>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-amber-600 group-hover:gap-2 transition-all">
            Verifică status <ArrowRight size={14} />
          </span>
        </Link>

        <Link
          href="/sesizari-rezolvate"
          className="group bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-6 hover:shadow-[var(--shadow-lg)] transition-all"
        >
          <CheckCircle2 size={28} className="mb-3 text-emerald-500" />
          <h2 className="font-[family-name:var(--font-sora)] text-xl font-bold mb-2">
            Sesizări rezolvate
          </h2>
          <p className="text-[var(--color-text-muted)] text-sm mb-4">
            Galerie before & after cu problemele rezolvate. Dovada că funcționează.
          </p>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 group-hover:gap-2 transition-all">
            Vezi rezultatele <ArrowRight size={14} />
          </span>
        </Link>
      </div>
    </div>
  );
}
