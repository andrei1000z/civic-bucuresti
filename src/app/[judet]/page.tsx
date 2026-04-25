import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  AlertCircle,
  Map as MapIcon,
  Wind,
  BarChart3,
  Newspaper,
  BookOpen,
  Building2,
  ArrowRight,
  Calendar,
  History,
  HelpCircle,
  Ticket,
} from "lucide-react";
import { ALL_COUNTIES, getCountyBySlug } from "@/data/counties";
import { getCountyStats } from "@/data/statistici-judete";

export async function generateStaticParams() {
  return ALL_COUNTIES.map((c) => ({ judet: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ judet: string }>;
}): Promise<Metadata> {
  const { judet } = await params;
  const county = getCountyBySlug(judet);
  if (!county) return {};
  return {
    title: `${county.name} — Civia`,
    description: `Sesizări, calitate aer, statistici și ghiduri civice pentru județul ${county.name}.`,
    alternates: { canonical: `/${county.slug}` },
  };
}

function aqiColor(aqi: number): string {
  if (aqi <= 50) return "#059669";
  if (aqi <= 100) return "#EAB308";
  if (aqi <= 150) return "#F97316";
  return "#DC2626";
}

function aqiLabel(aqi: number): string {
  if (aqi <= 50) return "Bun";
  if (aqi <= 100) return "Moderat";
  if (aqi <= 150) return "Slab";
  return "Periculos";
}

const sections = [
  { path: "/sesizari", icon: AlertCircle, label: "Sesizări", color: "#DC2626" },
  { path: "/impact", icon: BarChart3, label: "Impact local", color: "#1C4ED8" },
  { path: "/aer", icon: Wind, label: "Calitate aer", color: "#059669" },
  { path: "/harti", icon: MapIcon, label: "Hărți", color: "#2563EB" },
  { path: "/statistici", icon: BarChart3, label: "Statistici", color: "#8B5CF6" },
  { path: "/stiri", icon: Newspaper, label: "Știri", color: "#0EA5E9" },
  { path: "/ghiduri", icon: BookOpen, label: "Ghiduri", color: "#F59E0B" },
  { path: "/autoritati", icon: Building2, label: "Autorități", color: "#64748B" },
  { path: "/evenimente", icon: Calendar, label: "Evenimente", color: "#EC4899" },
  { path: "/istoric", icon: History, label: "Istoric", color: "#6366F1" },
  { path: "/cum-functioneaza", icon: HelpCircle, label: "Administrația", color: "#14B8A6" },
  { path: "/bilete", icon: Ticket, label: "Bilete", color: "#F97316" },
];

export default async function CountyHomePage({
  params,
}: {
  params: Promise<{ judet: string }>;
}) {
  const { judet } = await params;
  const county = getCountyBySlug(judet);
  if (!county) notFound();

  const stats = getCountyStats(county.id);
  const isBucharest = county.id === "B";

  return (
    <>
      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#047857] via-[#065f46] to-[#0a0a0a] text-white min-h-[70vh] flex flex-col justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.3),transparent)]" />
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />

        <div className="container-narrow relative z-10 py-16 md:py-20">
          <div className="grid lg:grid-cols-[1fr_auto] gap-8 items-center">
            {/* Left — county title */}
            <div>
              <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white border border-white/20 text-xs font-semibold mb-6 backdrop-blur-sm">
                🇷🇴 Platformă civică independentă
              </p>

              <h1 className="font-[family-name:var(--font-sora)] text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-bold leading-[1.05] tracking-tight mb-6">
                {county.name},{" "}
                <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-white via-blue-100 to-blue-200 bg-clip-text text-transparent">
                  mai ușor de înțeles.
                </span>
              </h1>

              <p className="text-lg md:text-xl text-emerald-100/85 max-w-xl leading-relaxed mb-8">
                Hărți, sesizări, ghiduri, știri și statistici despre {isBucharest ? "orașul tău" : `județul ${county.name}`} — într-un singur loc.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/${judet}/harti`}
                  className="inline-flex items-center gap-2 h-12 px-6 rounded-[8px] bg-white/10 text-white border border-white/20 font-semibold hover:bg-white/20 transition-colors backdrop-blur-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <MapIcon size={18} aria-hidden="true" />
                  Explorează harta
                </Link>
                <Link
                  href={`/${judet}/sesizari`}
                  className="inline-flex items-center gap-2 h-12 px-6 rounded-[8px] bg-white text-[var(--color-primary)] font-semibold hover:bg-white/90 transition-colors shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-700"
                >
                  <AlertCircle size={18} aria-hidden="true" />
                  Fă o sesizare
                </Link>
              </div>
            </div>

            {/* Right — floating info cards */}
            <div className="hidden lg:flex flex-col gap-4 w-72">
              {/* AQI card */}
              <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-[12px] p-5">
                <p className="text-emerald-200/70 text-xs font-medium mb-1">Calitate aer</p>
                <p className="text-3xl font-bold tabular-nums" style={{ color: aqiColor(stats.aqiMediu) }}>
                  AQI: {stats.aqiMediu} — {aqiLabel(stats.aqiMediu)}
                </p>
                <p className="text-emerald-200/60 text-xs mt-1">medie anuală ANPM</p>
              </div>

              {/* Population card */}
              <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-[12px] p-5">
                <p className="text-emerald-200/70 text-xs font-medium mb-1">Primar {county.name}</p>
                <p className="text-xl font-bold">{stats.primarName}</p>
                <p className="text-emerald-200/60 text-xs mt-1">{stats.primarPartid} · {stats.populatie.toLocaleString("ro-RO")} loc.</p>
              </div>

              {/* Transport card */}
              <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-[12px] p-5">
                <p className="text-emerald-200/70 text-xs font-medium mb-1">Transport public</p>
                <p className="text-xl font-bold">{stats.transportPublicOperator}</p>
                <p className="text-emerald-400 text-xs mt-1">
                  {stats.hasMetrou ? "Cu metrou · " : ""}
                  {stats.spatiiVerziMpPerLocuitor} m² spații verzi/loc.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom ticker — visual only, sr-only summary mai jos */}
        <div
          className="relative z-10 border-t border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden"
          aria-hidden="true"
        >
          <div className="flex animate-ticker whitespace-nowrap py-3 text-xs text-emerald-200/80 gap-8">
            {[
              `📊 AQI: ${stats.aqiMediu} — ${stats.aqiQuality}`,
              `🗳️ ${stats.sesizariTotal.toLocaleString("ro-RO")} sesizări estimate`,
              `✅ ${Math.round((stats.sesizariRezolvate / Math.max(stats.sesizariTotal, 1)) * 100)}% rezolvate`,
              `🚗 ${stats.accidenteTotal.toLocaleString("ro-RO")} accidente rutiere 2023`,
              `🌳 ${stats.spatiiVerziMpPerLocuitor} m² spații verzi/locuitor`,
              `👤 Primar: ${stats.primarName} (${stats.primarPartid})`,
              `🚌 ${stats.transportPublicOperator}`,
              `📊 AQI: ${stats.aqiMediu} — ${stats.aqiQuality}`,
              `🗳️ ${stats.sesizariTotal.toLocaleString("ro-RO")} sesizări estimate`,
              `✅ ${Math.round((stats.sesizariRezolvate / Math.max(stats.sesizariTotal, 1)) * 100)}% rezolvate`,
            ].map((text, i) => (
              <span key={i} className="flex items-center gap-2 shrink-0">
                {text}
                <span className="text-white/20">·</span>
              </span>
            ))}
          </div>
        </div>
        {/* Sr-only summary — un singur set, fără duplicări pentru ticker animation */}
        <div className="sr-only">
          Statistici {county.name}: AQI mediu {stats.aqiMediu}, {stats.aqiQuality}.
          {stats.sesizariTotal.toLocaleString("ro-RO")} sesizări estimate, din care {Math.round((stats.sesizariRezolvate / Math.max(stats.sesizariTotal, 1)) * 100)}% rezolvate.
          {stats.accidenteTotal.toLocaleString("ro-RO")} accidente rutiere în 2023.
          Primar: {stats.primarName} ({stats.primarPartid}). Transport public: {stats.transportPublicOperator}.
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[var(--color-bg)] to-transparent pointer-events-none" />
      </section>

      {/* ─── Mobile stat cards (hidden on lg, visible on mobile) ─── */}
      <section className="lg:hidden py-6">
        <div className="container-narrow">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[10px] p-4">
              <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Calitate aer</p>
              <p className="text-2xl font-bold" style={{ color: aqiColor(stats.aqiMediu) }}>AQI {stats.aqiMediu}</p>
              <p className="text-xs text-[var(--color-text-muted)]">{stats.aqiQuality}</p>
            </div>
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[10px] p-4">
              <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Populație</p>
              <p className="text-2xl font-bold">{stats.populatie.toLocaleString("ro-RO")}</p>
              <p className="text-xs text-[var(--color-text-muted)]">{stats.suprafataKmp.toLocaleString("ro-RO")} km²</p>
            </div>
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[10px] p-4">
              <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Primar</p>
              <p className="text-sm font-bold truncate">{stats.primarName}</p>
              <p className="text-xs text-[var(--color-text-muted)]">{stats.primarPartid}</p>
            </div>
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[10px] p-4">
              <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Transport</p>
              <p className="text-sm font-bold truncate">{stats.transportPublicOperator}</p>
              <p className="text-xs text-[var(--color-text-muted)]">{stats.hasMetrou ? "Cu metrou" : "Fără metrou"}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Sections grid ─── */}
      <section className="py-10 md:py-14">
        <div className="container-narrow">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-[family-name:var(--font-sora)] text-xl md:text-2xl font-bold">
              Explorează {county.name}
            </h2>
            <Link
              href="/"
              className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
            >
              ← Schimbă județul
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {sections.map((s) => {
              const Icon = s.icon;
              return (
                <Link
                  key={s.path}
                  href={`/${judet}${s.path}`}
                  className="group bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[10px] p-4 hover:border-[var(--color-primary)]/30 hover:shadow-[var(--shadow-md)] transition-all text-center"
                >
                  <div
                    className="w-10 h-10 rounded-[8px] flex items-center justify-center mx-auto mb-2"
                    style={{ backgroundColor: `${s.color}15` }}
                  >
                    <Icon size={18} style={{ color: s.color }} />
                  </div>
                  <p className="text-xs font-semibold group-hover:text-[var(--color-primary)] transition-colors">
                    {s.label}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="pb-14">
        <div className="container-narrow">
          <div className="relative overflow-hidden bg-gradient-to-br from-[#047857] via-[#065f46] to-[#0a0a0a] rounded-[16px] p-8 md:p-12 text-white text-center">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_110%,rgba(120,119,198,0.2),transparent)]" />
            <div className="relative z-10">
              <h2 className="font-[family-name:var(--font-sora)] text-2xl md:text-3xl font-bold mb-3">
                Ai o problemă în {county.name}?
              </h2>
              <p className="text-emerald-100/80 mb-8 max-w-lg mx-auto leading-relaxed">
                Depune o sesizare formală — AI-ul generează textul cu temei legal,
                detectăm autoritățile, tu doar apeși trimite.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link
                  href={`/${judet}/sesizari`}
                  className="inline-flex items-center gap-2 h-12 px-7 rounded-[8px] bg-white text-[var(--color-primary)] font-semibold hover:bg-white/90 transition-colors shadow-lg"
                >
                  <AlertCircle size={18} />
                  Fă o sesizare <ArrowRight size={16} />
                </Link>
                <Link
                  href={`/compara/${judet}/b`}
                  className="inline-flex items-center gap-2 h-12 px-6 rounded-[8px] bg-white/10 text-white border border-white/20 font-semibold hover:bg-white/20 transition-colors backdrop-blur-sm"
                >
                  ⚖️ Compară cu alt județ
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
