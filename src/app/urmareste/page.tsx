import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { UrmarireSesizare } from "@/components/sesizari/UrmarireSesizare";

export const metadata: Metadata = {
  title: "Urmărește-ți sesizarea — Civia",
  description: "Ai trimis o sesizare prin Civia? Introdu codul primit la trimitere și vezi unde e — pe ce autoritate a ajuns, dacă a fost aprobată public, câți cetățeni au co-semnat.",
  alternates: { canonical: "/urmareste" },
};

export default function UrmarestePage() {
  return (
    <div className="container-narrow py-12 md:py-16">
      <Link
        href="/sesizari"
        className="inline-flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] mb-6 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded"
      >
        <ChevronLeft size={16} aria-hidden="true" /> Înapoi la formularul de sesizări
      </Link>

      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-sora)] text-4xl md:text-5xl font-extrabold mb-3">
          Unde a ajuns sesizarea ta?
        </h1>
        <p className="text-lg text-[var(--color-text-muted)] max-w-3xl">
          Introdu codul unic de 6 caractere pe care l-ai primit când ai trimis sesizarea. Vezi statusul oficial, voturile primite, comentariile și dacă a fost marcată drept rezolvată.
        </p>
      </div>

      <UrmarireSesizare />
    </div>
  );
}
