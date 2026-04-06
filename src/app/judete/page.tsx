import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Users, Building2, ArrowRight } from "lucide-react";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Județele României — Civia",
  description: "Alege județul tău pentru a depune sesizări, vedea autorități locale și statistici civice. Toate cele 41 de județe + București.",
  alternates: { canonical: "/judete" },
};

export const revalidate = 86400; // 24h

interface County {
  id: string;
  name: string;
  center_lat: number | null;
  center_lng: number | null;
}

async function getCounties(): Promise<County[]> {
  try {
    const admin = createSupabaseAdmin();
    const { data } = await admin
      .from("counties")
      .select("id, name, center_lat, center_lng")
      .order("name", { ascending: true });
    return (data ?? []) as County[];
  } catch {
    return [];
  }
}

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
  const [counties, sesizariStats, authStats] = await Promise.all([
    getCounties(),
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
          Alege județul tău
        </h1>
        <p className="text-lg text-[var(--color-text-muted)] max-w-2xl">
          Selectează județul pentru a vedea autoritățile locale, a depune sesizări și a urmări rezolvarea problemelor din comunitatea ta.
        </p>
      </div>

      {/* Grid de județe */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {counties.map((county) => {
          const sesizari = sesizariStats[county.id] ?? 0;
          const authorities = authStats[county.id] ?? 0;
          return (
            <Link
              key={county.id}
              href={`/judete/${county.id.toLowerCase()}`}
              className="group bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-4 hover:border-[var(--color-primary)]/40 hover:shadow-[var(--shadow-md)] transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[var(--color-primary)] bg-[var(--color-primary-soft)] px-2 py-0.5 rounded">
                  {county.id}
                </span>
                <ArrowRight size={12} className="text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="font-semibold text-sm mb-2 group-hover:text-[var(--color-primary)] transition-colors">
                {county.name}
              </p>
              <div className="flex items-center gap-3 text-[10px] text-[var(--color-text-muted)]">
                {sesizari > 0 && (
                  <span className="flex items-center gap-1">
                    <Users size={10} /> {sesizari}
                  </span>
                )}
                {authorities > 0 && (
                  <span className="flex items-center gap-1">
                    <Building2 size={10} /> {authorities}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* CTA */}
      <div className="mt-12 bg-gradient-to-br from-[var(--color-primary)] to-indigo-900 rounded-[12px] p-8 text-white text-center">
        <h2 className="font-[family-name:var(--font-sora)] text-2xl font-bold mb-3">
          Nu găsești ce cauți?
        </h2>
        <p className="text-white/80 mb-6 max-w-lg mx-auto">
          Folosește sesizarea directă — detectăm automat județul și autoritățile din locația ta GPS.
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
