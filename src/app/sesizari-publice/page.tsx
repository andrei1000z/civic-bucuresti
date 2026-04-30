import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Eye, Sparkles } from "lucide-react";
import { SesizariPublice } from "@/components/sesizari/SesizariPublice";
import { CollectionPageJsonLd } from "@/components/JsonLd";
import { SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Vezi ce semnalează cetățenii — Civia",
  description:
    "Probleme reale din orașele României: gropi, trotuare distruse, iluminat defect, parcări ilegale. Votează și trimite și tu — mai multe voci = răspuns mai rapid de la primărie.",
  alternates: { canonical: "/sesizari-publice" },
};

export default function SesizariPublicePage() {
  return (
    <div className="container-narrow py-8 md:py-12">
      <CollectionPageJsonLd
        name="Sesizări publice — Civia"
        description="Catalog cu sesizări trimise de cetățeni la primării și autorități locale. Filtrat pe tip, sector, status. Votează pentru cele care te afectează."
        url={`${SITE_URL}/sesizari-publice`}
      />
      <Link
        href="/sesizari"
        className="inline-flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-primary)] mb-5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded"
      >
        <ArrowLeft size={13} aria-hidden="true" />
        Trimit și eu o sesizare
      </Link>

      <header className="relative mb-8 overflow-hidden rounded-[var(--radius-lg)] bg-gradient-to-br from-[var(--color-primary)] via-emerald-700 to-indigo-800 p-6 md:p-8 text-white shadow-[var(--shadow-3)]">
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" aria-hidden="true" />
        <div className="absolute -bottom-16 -left-8 w-72 h-72 rounded-full bg-indigo-400/20 blur-3xl pointer-events-none" aria-hidden="true" />
        <div className="relative flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-[var(--radius-xs)] bg-white/15 backdrop-blur-sm ring-2 ring-white/30 grid place-items-center shrink-0"
            aria-hidden="true"
          >
            <Eye size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-[family-name:var(--font-sora)] text-2xl md:text-4xl font-extrabold leading-tight mb-2">
              Ce se întâmplă în orașul tău
            </h1>
            <p className="text-sm md:text-base text-white/85 leading-relaxed max-w-2xl">
              Sesizări trimise de alți cetățeni. Dacă vezi o problemă care te afectează și pe tine,
              <strong> votează</strong> ca să arăți că nu e doar a unuia, sau apasă{" "}
              <strong>„Trimite și tu"</strong> ca să trimiți același email la primărie.
            </p>
            <p className="text-[11px] text-white/70 mt-3 inline-flex items-center gap-1.5">
              <Sparkles size={11} aria-hidden="true" />
              Numere mari schimbă prioritatea la primărie — co-semnătura ta contează.
            </p>
          </div>
        </div>
      </header>

      <SesizariPublice />
    </div>
  );
}
