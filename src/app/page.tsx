import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Wind,
  MapPin,
  FileText,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { SITE_NAME } from "@/lib/constants";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { CountyPicker } from "./CountyPicker";

export const revalidate = 300;

export const metadata: Metadata = {
  title: { absolute: `${SITE_NAME} — Platforma civică a României` },
  description:
    "Sesizări cu AI, calitatea aerului live, hărți și ghiduri civice pentru toate cele 42 de județe ale României.",
  alternates: { canonical: "/" },
};

async function getStats() {
  try {
    const admin = createSupabaseAdmin();
    const [totalRes, resolvedRes] = await Promise.all([
      admin.from("sesizari").select("*", { count: "exact", head: true }),
      admin.from("sesizari").select("*", { count: "exact", head: true }).eq("status", "rezolvat"),
    ]);
    return { total: totalRes.count ?? 0, resolved: resolvedRes.count ?? 0 };
  } catch {
    return { total: 0, resolved: 0 };
  }
}

export default async function HomePage() {
  const stats = await getStats();

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1C4ED8] via-[#1e3a8a] to-[#0F172A] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.3),transparent)]" />
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/80 via-transparent to-transparent" />

        <div className="container-narrow relative z-10 py-20 md:py-28 lg:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <p className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white border border-white/20 text-xs font-semibold mb-8 backdrop-blur-sm">
              🇷🇴 Platformă civică pentru toată România
            </p>

            <h1 className="font-[family-name:var(--font-sora)] text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-[1.08] tracking-tight">
              România,{" "}
              <span className="bg-gradient-to-r from-white via-blue-100 to-blue-200 bg-clip-text text-transparent">
                în mâinile tale.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-blue-100/90 mb-3 max-w-2xl mx-auto leading-relaxed">
              Depune sesizări formale generate de AI, monitorizează calitatea
              aerului în timp real și ține autoritățile responsabile.
            </p>

            <p className="text-blue-200/70 text-sm mb-10">
              42 de județe · Sute de senzori · Un singur loc
            </p>

            {/* Hero CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
              <Link
                href="/#county-picker"
                className="inline-flex items-center gap-2 h-12 px-7 rounded-[8px] bg-white text-[var(--color-primary)] font-semibold hover:bg-white/90 transition-colors shadow-lg"
              >
                Alege județul <ArrowRight size={18} />
              </Link>
              <Link
                href="/cum-functioneaza"
                className="inline-flex items-center gap-2 h-12 px-7 rounded-[8px] bg-white/10 text-white border border-white/20 font-semibold hover:bg-white/20 transition-colors"
              >
                Cum funcționează?
              </Link>
            </div>

            {/* Live counter */}
            {stats.total > 0 && (
              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-sm">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
                </span>
                <span className="text-sm font-medium">
                  <span className="text-white font-bold tabular-nums">
                    {stats.total.toLocaleString("ro-RO")}
                  </span>{" "}
                  <span className="text-blue-200/80">sesizări depuse</span>
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[var(--color-bg)] to-transparent" />
      </section>

      {/* 3 FEATURE CARDS */}
      <section className="py-16 md:py-20">
        <div className="container-narrow">
          <div className="grid md:grid-cols-3 gap-5">
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-6 hover:shadow-[var(--shadow-lg)] transition-all">
              <div className="w-11 h-11 rounded-[10px] bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-4">
                <Sparkles size={20} className="text-white" />
              </div>
              <h3 className="font-[family-name:var(--font-sora)] text-lg font-bold mb-2">
                Sesizări cu AI
              </h3>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                Descrii problema în cuvintele tale, iar AI-ul generează o
                sesizare formală cu temei legal, adresată autorității competente.
              </p>
            </div>

            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-6 hover:shadow-[var(--shadow-lg)] transition-all">
              <div className="w-11 h-11 rounded-[10px] bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4">
                <Wind size={20} className="text-white" />
              </div>
              <h3 className="font-[family-name:var(--font-sora)] text-lg font-bold mb-2">
                Calitate aer live
              </h3>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                Hartă națională cu sute de senzori — AQI în timp real, PM2.5,
                PM10 și alte particule, cu heatmap interpolat pe toată România.
              </p>
            </div>

            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-6 hover:shadow-[var(--shadow-lg)] transition-all">
              <div className="w-11 h-11 rounded-[10px] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4">
                <MapPin size={20} className="text-white" />
              </div>
              <h3 className="font-[family-name:var(--font-sora)] text-lg font-bold mb-2">
                42 de județe
              </h3>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                Fiecare județ are sesizări, statistici locale, autorități
                mapate, hărți și știri civice — totul într-un singur loc.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* COUNTY PICKER */}
      <section id="county-picker" className="py-12 md:py-16 bg-[var(--color-surface)]">
        <div className="container-narrow">
          <div className="text-center mb-8">
            <h2 className="font-[family-name:var(--font-sora)] text-2xl md:text-3xl font-bold mb-2">
              Alege județul tău
            </h2>
            <p className="text-[var(--color-text-muted)]">
              Caută după nume sau folosește GPS-ul pentru detectare automată.
            </p>
          </div>
        </div>
        <CountyPicker />
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 md:py-20">
        <div className="container-narrow">
          <div className="text-center mb-12">
            <h2 className="font-[family-name:var(--font-sora)] text-2xl md:text-3xl font-bold mb-2">
              Cum funcționează
            </h2>
            <p className="text-[var(--color-text-muted)]">
              Trei pași simpli până la o sesizare formală.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-[var(--color-primary-soft)] flex items-center justify-center mx-auto mb-4">
                <span className="text-lg font-bold text-[var(--color-primary)]">1</span>
              </div>
              <h3 className="font-[family-name:var(--font-sora)] font-bold text-base mb-2">
                Alege județul
              </h3>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                Selectează județul din listă sau lasă GPS-ul să te detecteze automat.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-[var(--color-primary-soft)] flex items-center justify-center mx-auto mb-4">
                <span className="text-lg font-bold text-[var(--color-primary)]">2</span>
              </div>
              <h3 className="font-[family-name:var(--font-sora)] font-bold text-base mb-2">
                Descrie problema
              </h3>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                Spune-ne în cuvintele tale ce e în neregulă — o groapă, un copac căzut, gunoi necolectat.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-[var(--color-primary-soft)] flex items-center justify-center mx-auto mb-4">
                <span className="text-lg font-bold text-[var(--color-primary)]">3</span>
              </div>
              <h3 className="font-[family-name:var(--font-sora)] font-bold text-base mb-2">
                AI generează sesizarea
              </h3>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                Primești o sesizare formală cu temei legal, gata de trimis la primărie sau instituția competentă.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-16 md:py-20 bg-[var(--color-surface)]">
        <div className="container-narrow">
          <div className="text-center mb-10">
            <h2 className="font-[family-name:var(--font-sora)] text-2xl md:text-3xl font-bold mb-2">
              Civia în cifre
            </h2>
            <p className="text-[var(--color-text-muted)]">
              Date reale, actualizate automat.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[12px] p-5 text-center">
              <FileText size={24} className="mx-auto mb-3 text-[var(--color-primary)]" />
              <p className="text-2xl md:text-3xl font-bold text-[var(--color-primary)] tabular-nums">
                {stats.total > 0 ? stats.total.toLocaleString("ro-RO") : "—"}
              </p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">Sesizări depuse</p>
            </div>
            <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[12px] p-5 text-center">
              <CheckCircle2 size={24} className="mx-auto mb-3 text-emerald-500" />
              <p className="text-2xl md:text-3xl font-bold text-emerald-600 tabular-nums">
                {stats.resolved > 0 ? stats.resolved.toLocaleString("ro-RO") : "—"}
              </p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">Rezolvate</p>
            </div>
            <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[12px] p-5 text-center">
              <MapPin size={24} className="mx-auto mb-3 text-amber-500" />
              <p className="text-2xl md:text-3xl font-bold text-amber-600">42</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">Județe acoperite</p>
            </div>
            <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[12px] p-5 text-center">
              <Wind size={24} className="mx-auto mb-3 text-teal-500" />
              <p className="text-2xl md:text-3xl font-bold text-teal-600">500+</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">Senzori aer live</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-24">
        <div className="container-narrow">
          <div className="relative overflow-hidden bg-gradient-to-br from-[#1C4ED8] via-[#1e3a8a] to-[#0F172A] rounded-[16px] p-10 md:p-14 text-white text-center">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_110%,rgba(120,119,198,0.25),transparent)]" />
            <div className="relative z-10">
              <Zap size={32} className="mx-auto mb-4 text-blue-200" />
              <h2 className="font-[family-name:var(--font-sora)] text-2xl md:text-3xl font-bold mb-3">
                Fă prima ta sesizare
              </h2>
              <p className="text-blue-100/80 mb-8 max-w-lg mx-auto leading-relaxed">
                Ia atitudine. Descrie problema, iar Civia generează o sesizare
                formală pe care o poți trimite direct la autorități.
              </p>
              <Link
                href="/#county-picker"
                className="inline-flex items-center gap-2 h-12 px-8 rounded-[8px] bg-white text-[var(--color-primary)] font-semibold hover:bg-white/90 transition-colors shadow-lg"
              >
                Alege județul <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
