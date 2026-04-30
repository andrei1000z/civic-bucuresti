import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Search, Sparkles } from "lucide-react";
import { UrmarireSesizare } from "@/components/sesizari/UrmarireSesizare";

export const metadata: Metadata = {
  title: "Urmărește-ți sesizarea — Civia",
  description:
    "Ai trimis o sesizare prin Civia? Introdu codul primit la trimitere și vezi unde e — pe ce autoritate a ajuns, dacă a fost aprobată public, câți cetățeni au co-semnat.",
  alternates: { canonical: "/urmareste" },
};

export default function UrmarestePage() {
  return (
    <div className="container-narrow py-8 md:py-12">
      <Link
        href="/sesizari"
        className="inline-flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-primary)] mb-5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded"
      >
        <ArrowLeft size={13} aria-hidden="true" />
        Formular nou de sesizare
      </Link>

      {/* Hero header — same gradient pattern as /admin and /cont so the
          sesizari surface visually clusters with the rest of the app. */}
      <header className="relative mb-8 overflow-hidden rounded-[var(--radius-lg)] bg-gradient-to-br from-[var(--color-primary)] via-emerald-700 to-indigo-800 p-6 md:p-8 text-white shadow-[var(--shadow-3)]">
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" aria-hidden="true" />
        <div className="absolute -bottom-16 -left-8 w-72 h-72 rounded-full bg-indigo-400/20 blur-3xl pointer-events-none" aria-hidden="true" />
        <div className="relative flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-[var(--radius-xs)] bg-white/15 backdrop-blur-sm ring-2 ring-white/30 grid place-items-center shrink-0"
            aria-hidden="true"
          >
            <Search size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-[family-name:var(--font-sora)] text-2xl md:text-4xl font-extrabold leading-tight mb-2">
              Unde a ajuns sesizarea ta?
            </h1>
            <p className="text-sm md:text-base text-white/85 leading-relaxed max-w-2xl">
              Introdu codul de 6 caractere primit la trimitere. Vezi statusul oficial,
              voturile, comentariile și dacă a fost marcată drept rezolvată.
            </p>
            <p className="text-[11px] text-white/70 mt-3 inline-flex items-center gap-1.5">
              <Sparkles size={11} aria-hidden="true" />
              Codul l-ai primit pe email și pe pagina sesizării imediat după trimitere.
            </p>
          </div>
        </div>
      </header>

      <UrmarireSesizare />
    </div>
  );
}
