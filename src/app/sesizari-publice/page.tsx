import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { SesizariPublice } from "@/components/sesizari/SesizariPublice";

export const metadata: Metadata = {
  title: "Sesizări publice — Civia",
  description: "Vezi sesizările publice din toată România: gropi, trotuare, iluminat, parcări ilegale și alte probleme semnalate de cetățeni.",
  alternates: { canonical: "/sesizari-publice" },
};

export default function SesizariPublicePage() {
  return (
    <div className="container-narrow py-12 md:py-16">
      <Link
        href="/sesizari"
        className="inline-flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] mb-6 transition-colors"
      >
        <ChevronLeft size={16} /> Înapoi la sesizări
      </Link>

      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-sora)] text-4xl md:text-5xl font-bold mb-3">
          Sesizări publice
        </h1>
        <p className="text-lg text-[var(--color-text-muted)] max-w-3xl">
          Probleme semnalate de cetățeni din toată România. Votează, comentează și urmărește rezolvarea.
        </p>
      </div>

      <SesizariPublice />
    </div>
  );
}
