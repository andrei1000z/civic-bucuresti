import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { SesizariPublice } from "@/components/sesizari/SesizariPublice";

export const metadata: Metadata = {
  title: "Vezi ce semnalează cetățenii — Civia",
  description: "Probleme reale din orașele României: gropi, trotuare distruse, iluminat defect, parcări ilegale. Votează și trimite și tu — mai multe voci = răspuns mai rapid de la primărie.",
  alternates: { canonical: "/sesizari-publice" },
};

export default function SesizariPublicePage() {
  return (
    <div className="container-narrow py-12 md:py-16">
      <Link
        href="/sesizari"
        className="inline-flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] mb-6 transition-colors"
      >
        <ChevronLeft size={16} /> Trimit și eu o sesizare
      </Link>

      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-sora)] text-4xl md:text-5xl font-extrabold mb-3">
          Ce se întâmplă în orașul tău
        </h1>
        <p className="text-lg text-[var(--color-text-muted)] max-w-3xl">
          Sesizări trimise de alți cetățeni. Dacă vezi o problemă care te afectează și pe tine, <strong>votează</strong> ca să arăți că nu e doar a unuia, sau apasă <strong>„Trimite și tu"</strong> ca să trimiți același email la primărie — numere mari schimbă prioritatea.
        </p>
      </div>

      <SesizariPublice />
    </div>
  );
}
