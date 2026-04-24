import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { JudeteGrid } from "./JudeteGrid";

export const metadata: Metadata = {
  title: "Alege sau schimbă județul — Civia",
  description: "Civia reține preferința ta de județ la următoarea vizită. Pe această pagină poți schimba oricând județul salvat sau șterge preferința.",
  alternates: { canonical: "/judete" },
};

export const revalidate = 86400; // 24h

async function getCountyStats(): Promise<Record<string, number>> {
  try {
    const admin = createSupabaseAdmin();
    const { data } = await admin
      .from("sesizari")
      .select("county")
      .eq("moderation_status", "approved");
    const counts: Record<string, number> = {};
    for (const row of (data ?? []) as { county: string | null }[]) {
      const c = row.county ?? "B";
      counts[c] = (counts[c] ?? 0) + 1;
    }
    return counts;
  } catch {
    return {};
  }
}

async function getAuthorityCount(): Promise<Record<string, number>> {
  try {
    const admin = createSupabaseAdmin();
    const { data } = await admin
      .from("authorities")
      .select("county_id");
    const counts: Record<string, number> = {};
    for (const row of (data ?? []) as { county_id: string | null }[]) {
      const c = row.county_id ?? "?";
      counts[c] = (counts[c] ?? 0) + 1;
    }
    return counts;
  } catch {
    return {};
  }
}

export default async function JudetePage() {
  const [sesizariStats, authStats] = await Promise.all([
    getCountyStats(),
    getAuthorityCount(),
  ]);

  return (
    <div className="container-narrow py-12 md:py-16">
      {/* Hero */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)] text-xs font-semibold mb-4">
          <MapPin size={14} /> 42 JUDEȚE
        </div>
        <h1 className="font-[family-name:var(--font-sora)] text-4xl md:text-5xl font-bold mb-3">
          Alege sau schimbă județul
        </h1>
        <p className="text-lg text-[var(--color-text-muted)] max-w-2xl">
          Civia reține județul tău la următoarea vizită și te duce direct acolo.
          De aici îl poți schimba oricând — click pe alt județ ca să-l
          salvezi în loc.
        </p>
      </div>

      <JudeteGrid sesizariStats={sesizariStats} authStats={authStats} />

      {/* CTA */}
      <div className="mt-12 bg-gradient-to-br from-[var(--color-primary)] to-indigo-900 rounded-[12px] p-8 text-white text-center">
        <h2 className="font-[family-name:var(--font-sora)] text-2xl font-bold mb-3">
          Nu-ți găsești județul?
        </h2>
        <p className="text-white/80 mb-6 max-w-lg mx-auto">
          Folosește sesizarea directă — detectăm automat județul și
          autoritățile din locația ta GPS.
        </p>
        <Link
          href="/sesizari"
          className="inline-flex items-center gap-2 h-12 px-6 rounded-[8px] bg-white text-[var(--color-primary)] font-semibold hover:bg-white/90 transition-colors"
        >
          Fă o sesizare <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
