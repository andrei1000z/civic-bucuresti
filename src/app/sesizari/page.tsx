import type { Metadata } from "next";
import Link from "next/link";
import { Eye, Search, CheckCircle2, Send, Sparkles, Scale } from "lucide-react";
import { SesizareForm } from "@/components/sesizari/SesizareForm";

export const metadata: Metadata = {
  title: "Sesizări — Civia",
  description:
    "Trimite o sesizare formală la autorități. AI-ul generează textul cu temei legal. Detectăm automat județul din locația ta.",
  alternates: { canonical: "/sesizari" },
};

// Pure form shell — content e static. ISR 24h e suficient.
export const revalidate = 86400;

const QUICK_LINKS = [
  {
    href: "/sesizari-publice",
    icon: Eye,
    title: "Ce semnalează alții",
    desc: "Votează + trimite și tu",
    accent: "var(--color-primary)",
  },
  {
    href: "/urmareste",
    icon: Search,
    title: "Urmărește sesizarea ta",
    desc: "Verifică statusul cu codul primit",
    accent: "#F59E0B",
  },
  {
    href: "/sesizari-rezolvate",
    icon: CheckCircle2,
    title: "Dovezi că funcționează",
    desc: `Galerie „înainte / după"`,
    accent: "#10B981",
  },
] as const;

export default function SesizariPage() {
  return (
    <div className="container-narrow py-8 md:py-12">
      {/* Hero header — same gradient pattern used across /admin, /cont,
          /urmareste so the sesizari surface clusters visually. */}
      <header className="relative mb-8 overflow-hidden rounded-[var(--radius-lg)] bg-gradient-to-br from-[var(--color-primary)] via-emerald-700 to-indigo-800 p-6 md:p-8 text-white shadow-[var(--shadow-3)]">
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" aria-hidden="true" />
        <div className="absolute -bottom-16 -left-8 w-72 h-72 rounded-full bg-indigo-400/20 blur-3xl pointer-events-none" aria-hidden="true" />
        <div className="relative flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-[var(--radius-xs)] bg-white/15 backdrop-blur-sm ring-2 ring-white/30 grid place-items-center shrink-0"
            aria-hidden="true"
          >
            <Send size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-[family-name:var(--font-sora)] text-2xl md:text-4xl font-extrabold leading-tight mb-2">
              Trimite o sesizare formală
            </h1>
            <p className="text-sm md:text-base text-white/85 leading-relaxed max-w-2xl">
              Descrie problema în română simplă și atașează o poză. AI-ul rescrie textul pentru a fi
              luat în serios la primărie, iar noi alegem automat autoritatea competentă.
            </p>
            <p className="text-[11px] text-white/70 mt-3 inline-flex items-center gap-1.5">
              <Sparkles size={11} aria-hidden="true" />
              2 minute de la tine, 30 de zile pentru răspunsul lor (OG 27/2002).
            </p>
          </div>
        </div>
      </header>

      {/* Quick links — colored accent ring + icon chip per item */}
      <div className="grid sm:grid-cols-3 gap-3 mb-8">
        {QUICK_LINKS.map((q) => {
          const Icon = q.icon;
          return (
            <Link
              key={q.href}
              href={q.href}
              className="group relative flex items-center gap-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-4 hover:shadow-[var(--shadow-3)] hover:-translate-y-0.5 hover:border-[var(--color-primary)]/30 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
            >
              <span
                className="w-9 h-9 rounded-[var(--radius-xs)] grid place-items-center shrink-0"
                style={{ backgroundColor: `${q.accent}1a`, color: q.accent }}
                aria-hidden="true"
              >
                <Icon size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-tight group-hover:text-[var(--color-primary)] transition-colors">
                  {q.title}
                </p>
                <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">{q.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Sesizare form */}
      <SesizareForm />

      {/* Legal footer card */}
      <div className="mt-8 bg-[var(--color-surface)] border border-blue-500/30 rounded-[var(--radius-md)] p-5 flex items-start gap-3">
        <span
          className="w-9 h-9 rounded-[var(--radius-xs)] bg-blue-500/15 text-blue-600 dark:text-blue-400 grid place-items-center shrink-0"
          aria-hidden="true"
        >
          <Scale size={16} />
        </span>
        <div className="flex-1 text-sm">
          <p className="font-bold mb-1 text-blue-700 dark:text-blue-300">
            Legal — OG 27/2002 art. 8 alin. (1)
          </p>
          <p className="text-[var(--color-text)] leading-relaxed">
            Autoritatea are <strong>30 de zile calendaristice</strong> să îți răspundă. Dacă nu
            primești răspuns, ai drept de plângere la <strong>Avocatul Poporului</strong> și la
            <strong> instanța de contencios administrativ</strong>. Sesizarea generată include
            temeiul legal complet.
          </p>
        </div>
      </div>
    </div>
  );
}
