import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, TrendingUp, Megaphone, MapPin, Camera, Send, Sparkles, Building2 } from "lucide-react";
import { SITE_NAME } from "@/lib/constants";
import { CountyPicker } from "./CountyPicker";
import { LiveStatsBar } from "@/components/home/LiveStatsBar";
import { TopVotedWidget } from "@/components/home/TopVotedWidget";
import { IntreruperiWidget } from "@/components/home/IntreruperiWidget";
import { ALL_COUNTIES } from "@/data/counties";
import {
  PRIMARII,
  POLITIA_LOCALA_JUDET,
  getCityCount,
} from "@/data/autoritati-contact";

export const revalidate = 300;

export const metadata: Metadata = {
  title: { absolute: `${SITE_NAME} — Schimbă România prin sesizări și petiții civice` },
  description:
    "Fă o poză, descrie problema în câteva cuvinte, noi îți construim sesizarea formală. Plus petiții civice pe care le poți semna online. Gratuit, pentru toate județele.",
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

        <div className="container-narrow relative z-10 py-16 md:py-24 lg:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-[family-name:var(--font-sora)] text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 leading-[1.05] tracking-tight">
              Ajută la schimbarea{" "}
              <span className="bg-gradient-to-r from-white via-blue-100 to-blue-200 bg-clip-text text-transparent">
                României.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-emerald-100/90 mb-10 max-w-2xl mx-auto leading-relaxed">
              Fă o poză, scrie în 2 cuvinte care e problema — noi îți construim sesizarea formală
              către autoritatea corectă. Plus poți semna petiții civice și alte acțiuni care
              pun presiune publică reală.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link
                href="/sesizari"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-7 rounded-[var(--radius-full)] bg-white text-[var(--color-primary)] font-semibold hover:bg-white/90 active:scale-[0.97] transition-all shadow-[var(--shadow-3)] hover:shadow-[var(--shadow-4)] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-700"
              >
                <Send size={16} aria-hidden="true" />
                Fă o sesizare acum
              </Link>
              <Link
                href="/petitii"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-7 rounded-[var(--radius-full)] bg-white/10 backdrop-blur-sm border border-white/30 text-white font-semibold hover:bg-white/20 active:scale-[0.97] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <Megaphone size={16} aria-hidden="true" />
                Semnează petiții
              </Link>
              <Link
                href="/#county-picker"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-7 rounded-[var(--radius-full)] text-white/90 hover:text-white text-sm font-medium underline-offset-4 hover:underline transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <MapPin size={16} aria-hidden="true" />
                Alege-ți județul <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[var(--color-bg)] to-transparent" />
      </section>

      {/* LIVE STATS BAR */}
      <LiveStatsBar />

      {/* COUNTY PICKER */}
      <section id="county-picker" className="py-12 md:py-16 bg-[var(--color-surface)]">
        <div className="container-narrow">
          <div className="text-center mb-6">
            <h2 className="font-[family-name:var(--font-sora)] text-2xl md:text-3xl font-bold">
              Alege-ți județul
            </h2>
            <p className="text-[var(--color-text-muted)] mt-2">
              Sesizări, hărți, calitatea aerului, știri și date publice — filtrate pe județul tău.
            </p>
          </div>
        </div>
        <CountyPicker />
      </section>

      {/* TOP VOTED — fără coloana „Aerul respirat acum" la cererea user-ului. */}
      <section className="py-12 md:py-16">
        <div className="container-narrow">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <h2 className="font-[family-name:var(--font-sora)] text-xl md:text-2xl font-bold flex items-center gap-2">
              <TrendingUp size={22} className="text-[var(--color-primary)]" aria-hidden="true" />
              Ce semnalează cetățenii acum
            </h2>
            <Link
              href="/sesizari-publice"
              className="text-sm font-medium text-[var(--color-primary)] hover:underline inline-flex items-center gap-1"
            >
              Vezi toate <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
          <TopVotedWidget />
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
                {totalPrimarii} primării, {totalPL} Poliții Locale, {totalOrase} orașe — toate acoperite
              </h2>
              <p className="text-[var(--color-text-muted)] mb-5 leading-relaxed">
                Nu mai cauți pe Google „cum contactez primăria din Turda". Civia are un
                catalog verificat cu emailuri, telefoane și adrese pentru toate autoritățile
                civice — de la București la cel mai mic oraș județean.
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
              De la problemă la răspuns oficial — în 3 pași
            </h2>
            <p className="text-[var(--color-text-muted)]">
              Sub 2 minute. Fără formulare complicate, fără drumuri la primărie.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            <Step
              num={1}
              icon={<Camera size={20} aria-hidden="true" />}
              title="Fotografiază și localizează"
              text="O poză clară cu problema + un reper. GPS-ul tău prinde automat adresa și sectorul."
            />
            <Step
              num={2}
              icon={<Sparkles size={20} aria-hidden="true" />}
              title="Scrie 2-3 rânduri în română simplă"
              text="AI-ul transformă textul tău într-o cerere formală cu temei legal (OUG 195/2002, OG 27/2002) și alege autoritatea competentă."
            />
            <Step
              num={3}
              icon={<Send size={20} aria-hidden="true" />}
              title="Trimite și urmărește răspunsul"
              text="Un click deschide emailul către primărie, deja completat. Primești un cod cu care urmărești răspunsul de 30 de zile."
            />
          </div>
        </div>
      </section>
    </>
  );
}

function CoverageStat({ value, label }: { value: number; label: string }) {
  return (
    <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-md)] shadow-[var(--shadow-1)] p-5 text-center">
      <div className="text-3xl md:text-4xl font-extrabold text-[var(--color-primary)] font-[family-name:var(--font-sora)] tabular-nums">
        {value}
      </div>
      <div className="text-xs text-[var(--color-text-muted)] mt-1 uppercase tracking-wide font-semibold">
        {label}
      </div>
    </div>
  );
}

function Step({
  num,
  icon,
  title,
  text,
}: {
  num: number;
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-6 hover:shadow-[var(--shadow-3)] hover:border-[var(--color-primary)]/30 transition-all">
      <div className="flex items-start gap-4 mb-3">
        <div
          className="shrink-0 w-12 h-12 rounded-[var(--radius-md)] bg-gradient-to-br from-[var(--color-primary)] to-emerald-900 flex items-center justify-center text-white shadow-[var(--shadow-2)]"
          aria-hidden="true"
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <span className="inline-block text-[10px] uppercase tracking-wider font-bold text-[var(--color-primary)] mb-1">
            Pasul {num}
          </span>
          <h3 className="font-[family-name:var(--font-sora)] font-bold text-base">
            {title}
          </h3>
        </div>
      </div>
      <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
        {text}
      </p>
    </div>
  );
}
