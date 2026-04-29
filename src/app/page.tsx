import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, TrendingUp, Wind, Building2 } from "lucide-react";
import { SITE_NAME } from "@/lib/constants";
import { CountyPicker } from "./CountyPicker";
import { LiveStatsBar } from "@/components/home/LiveStatsBar";
import { TopVotedWidget } from "@/components/home/TopVotedWidget";
import { LiveWeatherAqi } from "@/components/home/LiveWeatherAqi";
import { IntreruperiWidget } from "@/components/home/IntreruperiWidget";
import { ALL_COUNTIES } from "@/data/counties";
import {
  PRIMARII,
  POLITIA_LOCALA_JUDET,
  getCityCount,
} from "@/data/autoritati-contact";

export const revalidate = 300;

export const metadata: Metadata = {
  title: { absolute: `${SITE_NAME} — Sesizări civice gratuite către primării, cu AI` },
  description:
    "Trimite o sesizare formală la primărie în 2 minute. AI-ul scrie textul cu temei legal, găsim autoritatea competentă, iar tu urmărești răspunsul. Gratuit, pentru toate județele României.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  const totalJudete = ALL_COUNTIES.length;
  const totalPrimarii = Object.keys(PRIMARII).length;
  const totalPL = Object.keys(POLITIA_LOCALA_JUDET).length;
  const totalOrase = getCityCount();

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#047857] via-[#065f46] to-[#0a0a0a] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.3),transparent)]" />
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/80 via-transparent to-transparent" />

        <div className="container-narrow relative z-10 py-14 md:py-24 lg:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <p className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white border border-white/20 text-xs font-semibold mb-8 backdrop-blur-sm">
              🇷🇴 Civia — gratuit, open-source, fără politică
            </p>

            <h1 className="font-[family-name:var(--font-sora)] text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-[1.08] tracking-tight">
              Orașul tău,{" "}
              <span className="bg-gradient-to-r from-white via-blue-100 to-blue-200 bg-clip-text text-transparent">
                rezolvat pe email.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-emerald-100/90 mb-10 max-w-2xl mx-auto leading-relaxed">
              Fă o poză, scrie 2 rânduri, apeși trimite. Noi construim sesizarea formală,
              alegem autoritatea corectă și îți dăm codul prin care urmărești răspunsul de 30 de zile.
            </p>

            {/* Single primary CTA + 1 secondary text link.
                Pillz quick-actions au fost mutate în MobileFab + Navbar Search +
                footer ca să nu concureze cu CTA-ul principal. */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
              <Link
                href="/sesizari"
                className="inline-flex items-center gap-2 h-12 px-7 rounded-[var(--radius-full)] bg-white text-[var(--color-primary)] font-semibold hover:bg-white/90 active:scale-[0.97] transition-all shadow-[var(--shadow-3)] hover:shadow-[var(--shadow-4)] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-700"
              >
                Trimite o sesizare acum <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link
                href="/#county-picker"
                className="inline-flex items-center gap-1.5 text-white/90 hover:text-white text-sm font-medium underline-offset-4 hover:underline transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-[var(--radius-xs)] px-1 py-0.5"
              >
                sau explorează după județ <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[var(--color-bg)] to-transparent" />
      </section>

      {/* LIVE STATS BAR */}
      <section className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="container-narrow py-6">
          <LiveStatsBar />
        </div>
      </section>

      {/* COUNTY PICKER */}
      <section id="county-picker" className="py-12 md:py-16 bg-[var(--color-surface)]">
        <div className="container-narrow">
          <div className="text-center mb-6">
            <h2 className="font-[family-name:var(--font-sora)] text-2xl md:text-3xl font-bold">
              Alege-ți județul
            </h2>
            <p className="text-[var(--color-text-muted)] mt-2">
              Sesizări, hărți, calitate aer, știri și date publice — filtrate pe județul tău.
            </p>
          </div>
        </div>
        <CountyPicker />
      </section>

      {/* TOP VOTED + AER LIVE */}
      <section className="py-12 md:py-16">
        <div className="container-narrow">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-[family-name:var(--font-sora)] text-xl md:text-2xl font-bold flex items-center gap-2">
                  <TrendingUp size={22} className="text-[var(--color-primary)]" aria-hidden="true" />
                  Ce semnalează cetățenii acum
                </h2>
                <Link
                  href="/sesizari-publice"
                  className="text-sm text-[var(--color-primary)] hover:underline inline-flex items-center gap-1"
                >
                  Vezi toate <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </div>
              <TopVotedWidget />
            </div>
            <div>
              <h2 className="font-[family-name:var(--font-sora)] text-xl md:text-2xl font-bold flex items-center gap-2 mb-5">
                <Wind size={22} className="text-[var(--color-primary)]" aria-hidden="true" />
                Aerul respirat acum
              </h2>
              <LiveWeatherAqi />
              <Link
                href="/aer"
                className="mt-3 text-sm text-[var(--color-primary)] hover:underline inline-flex items-center gap-1"
              >
                Harta live a calității aerului <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* INTRERUPERI WIDGET */}
      <IntreruperiWidget />

      {/* COVERAGE / AUTORITATI */}
      <section className="py-14 md:py-16 bg-[var(--color-surface)] border-y border-[var(--color-border)]">
        <div className="container-narrow">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)] text-xs font-semibold mb-4">
                <Building2 size={12} aria-hidden="true" /> Autorități publice
              </p>
              <h2 className="font-[family-name:var(--font-sora)] text-2xl md:text-3xl font-bold mb-3">
                {totalPrimarii} primării, {totalPL} Poliții Locale,{" "}
                {totalOrase} orașe — toate acoperite
              </h2>
              <p className="text-[var(--color-text-muted)] mb-5 leading-relaxed">
                Nu mai cauți pe Google „cum contactez primăria din Turda" — Civia
                știe. Avem un catalog verificat cu emailuri, telefoane și
                adrese pentru toate autoritățile civice, de la București la
                cel mai mic oraș județean.
              </p>
              <Link
                href="/autoritati"
                className="inline-flex items-center gap-2 h-11 px-5 rounded-[var(--radius-full)] bg-[var(--color-primary)] text-white font-medium hover:bg-[var(--color-primary-hover)] active:scale-[0.97] shadow-[var(--shadow-2)] hover:shadow-[var(--shadow-3)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
              >
                Vezi catalogul de autorități <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <CoverageStat value={totalJudete} label="Județe" />
              <CoverageStat value={totalPrimarii} label="Primării" />
              <CoverageStat value={totalPL} label="Poliție Locală" />
              <CoverageStat value={totalOrase} label="Orașe mari" />
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 md:py-20">
        <div className="container-narrow">
          <div className="text-center mb-12">
            <h2 className="font-[family-name:var(--font-sora)] text-2xl md:text-3xl font-bold mb-2">
              De la problemă la răspuns oficial, în 3 pași
            </h2>
            <p className="text-[var(--color-text-muted)]">
              Sub 2 minute. Fără formulare complicate, fără drumuri la primărie.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-[var(--color-primary-soft)] flex items-center justify-center mx-auto mb-4">
                <span className="text-lg font-bold text-[var(--color-primary)]">1</span>
              </div>
              <h3 className="font-[family-name:var(--font-sora)] font-bold text-base mb-2">Fotografiază și localizează</h3>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                O poză clară cu problema + un reper. GPS-ul tău prinde automat adresa și sectorul.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-[var(--color-primary-soft)] flex items-center justify-center mx-auto mb-4">
                <span className="text-lg font-bold text-[var(--color-primary)]">2</span>
              </div>
              <h3 className="font-[family-name:var(--font-sora)] font-bold text-base mb-2">Scrie 2-3 rânduri în română simplă</h3>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                AI-ul transformă textul tău într-o cerere formală cu temei legal (OUG 195/2002, OG 27/2002) și alege autoritatea competentă.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-[var(--color-primary-soft)] flex items-center justify-center mx-auto mb-4">
                <span className="text-lg font-bold text-[var(--color-primary)]">3</span>
              </div>
              <h3 className="font-[family-name:var(--font-sora)] font-bold text-base mb-2">Trimite și urmărește răspunsul</h3>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                Un click deschide emailul către primărie, deja completat. Primești un cod cu care urmărești răspunsul de 30 de zile.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function CoverageStat({ value, label }: { value: number; label: string }) {
  return (
    <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-md)] shadow-[var(--shadow-1)] p-5 text-center">
      <div className="text-3xl md:text-4xl font-bold text-[var(--color-primary)] font-[family-name:var(--font-sora)]">
        {value}
      </div>
      <div className="text-xs text-[var(--color-text-muted)] mt-1 uppercase tracking-wide">
        {label}
      </div>
    </div>
  );
}
