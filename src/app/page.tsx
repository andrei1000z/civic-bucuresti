import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SITE_NAME } from "@/lib/constants";
import { CountyPicker } from "./CountyPicker";

export const revalidate = 300;

export const metadata: Metadata = {
  title: { absolute: `${SITE_NAME} — Platforma civică a României` },
  description:
    "Sesizări, hărți, statistici, știri și ghiduri civice pentru toate cele 42 de județe ale României.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
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
              🇷🇴 Platformă civică pentru România
            </p>

            <h1 className="font-[family-name:var(--font-sora)] text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-[1.08] tracking-tight">
              România,{" "}
              <span className="bg-gradient-to-r from-white via-blue-100 to-blue-200 bg-clip-text text-transparent">
                în mâinile tale.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-blue-100/90 mb-10 max-w-2xl mx-auto leading-relaxed">
              Ai observat o problemă în orașul tău? Dă câteva detalii și te ajutăm
              să o trimiți la autorități să o rezolve. Plus hărți, statistici, știri și ghiduri civice.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/#county-picker"
                className="inline-flex items-center gap-2 h-12 px-7 rounded-[8px] bg-white text-[#1C4ED8] font-semibold hover:bg-white/90 transition-colors shadow-lg"
              >
                Fă o sesizare <ArrowRight size={18} />
              </Link>
              <Link
                href="/#county-picker"
                className="inline-flex items-center gap-2 h-12 px-7 rounded-[8px] bg-white/10 text-white border border-white/20 font-semibold hover:bg-white/20 transition-colors"
              >
                Alege județul pentru mai multe
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[var(--color-bg)] to-transparent" />
      </section>

      {/* COUNTY PICKER */}
      <section id="county-picker" className="py-12 md:py-16 bg-[var(--color-surface)]">
        <div className="container-narrow">
          <div className="text-center mb-6">
            <h2 className="font-[family-name:var(--font-sora)] text-2xl md:text-3xl font-bold">
              Alege județul tău
            </h2>
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
              <h3 className="font-[family-name:var(--font-sora)] font-bold text-base mb-2">Alege județul</h3>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                Selectează județul din listă sau lasă GPS-ul să te detecteze automat.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-[var(--color-primary-soft)] flex items-center justify-center mx-auto mb-4">
                <span className="text-lg font-bold text-[var(--color-primary)]">2</span>
              </div>
              <h3 className="font-[family-name:var(--font-sora)] font-bold text-base mb-2">Descrie problema</h3>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                Spune-ne în cuvintele tale ce e în neregulă — o groapă, un copac căzut, gunoi necolectat.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-[var(--color-primary-soft)] flex items-center justify-center mx-auto mb-4">
                <span className="text-lg font-bold text-[var(--color-primary)]">3</span>
              </div>
              <h3 className="font-[family-name:var(--font-sora)] font-bold text-base mb-2">AI generează sesizarea</h3>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                Primești o sesizare formală cu temei legal, gata de trimis la primărie sau instituția competentă.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
