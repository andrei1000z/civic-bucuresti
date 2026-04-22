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
          Trimite o sesizare formală
        </h1>
        <p className="text-lg text-[var(--color-text-muted)] max-w-3xl">
          Descrie problema în română simplă și atașează o poză. AI-ul rescrie textul pentru a fi luat în serios la primărie, iar noi alegem automat autoritatea competentă. 2 minute de la tine, 30 de zile pentru răspunsul lor.
        </p>
      </div>

      {/* Quick links */}
      <div className="grid sm:grid-cols-3 gap-3 mb-10">
        <Link
          href="/sesizari-publice"
          className="flex items-center gap-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[10px] p-4 hover:shadow-[var(--shadow-md)] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
        >
          <Eye size={20} className="text-[var(--color-primary)] shrink-0" />
          <div>
            <p className="text-sm font-semibold">Ce semnalează alții</p>
            <p className="text-[10px] text-[var(--color-text-muted)]">Votează + co-semnează public</p>
          </div>
        </Link>
        <Link
          href="/urmareste"
          className="flex items-center gap-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[10px] p-4 hover:shadow-[var(--shadow-md)] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
        >
          <FileText size={20} className="text-amber-500 shrink-0" />
          <div>
            <p className="text-sm font-semibold">Urmărește sesizarea ta</p>
            <p className="text-[10px] text-[var(--color-text-muted)]">Verifică statusul cu codul primit</p>
          </div>
        </Link>
        <Link
          href="/sesizari-rezolvate"
          className="flex items-center gap-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[10px] p-4 hover:shadow-[var(--shadow-md)] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
        >
          <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
          <div>
            <p className="text-sm font-semibold">Dovezi că funcționează</p>
            <p className="text-[10px] text-[var(--color-text-muted)]">Galerie „înainte / după"</p>
          </div>
        </Link>
      </div>

      {/* Sesizare form */}
      <SesizareForm />

      {/* Info */}
      <div className="mt-8 bg-blue-50 dark:bg-blue-950/20 border-l-4 border-blue-400 rounded-[12px] p-4 text-sm">
        <p className="text-blue-900 dark:text-blue-200">
          <strong>Legal — OG 27/2002 art. 8 alin. (1)</strong>: autoritatea are <strong>30 de zile calendaristice</strong> să îți răspundă. Dacă nu primești răspuns, ai drept de plângere la Avocatul Poporului și la instanța de contencios administrativ. Sesizarea generată include temeiul legal complet.
        </p>
      </div>
    </div>
  );
}
