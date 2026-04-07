import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { UrmarireSesizare } from "@/components/sesizari/UrmarireSesizare";

export const metadata: Metadata = {
  title: "Urmărește sesizarea — Civia",
  description: "Verifică statusul sesizării tale. Introdu codul unic primit la trimitere.",
  alternates: { canonical: "/urmareste" },
};

export default function UrmarestePage() {
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
          Urmărește sesizarea
        </h1>
        <p className="text-lg text-[var(--color-text-muted)] max-w-3xl">
          Introdu codul unic primit la trimiterea sesizării pentru a vedea statusul actual.
        </p>
      </div>

      <UrmarireSesizare />
    </div>
  );
}
