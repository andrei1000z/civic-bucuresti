import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, MapPin, ArrowRight } from "lucide-react";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils";
import { SESIZARE_TIPURI } from "@/lib/constants";
import type { SesizareRow } from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: "Impact — probleme rezolvate",
  description: "Galerie before/after cu sesizări rezolvate în București: trotuare, gropi, iluminat. Dovada că implicarea civică funcționează.",
  alternates: { canonical: "/impact" },
};

export const revalidate = 300; // 5 minutes

async function getResolvedWithPhotos(): Promise<SesizareRow[]> {
  try {
    const admin = createSupabaseAdmin();
    const { data } = await admin
      .from("sesizari")
      .select("*")
      .eq("status", "rezolvat")
      .eq("publica", true)
      .eq("moderation_status", "approved")
      .not("resolved_photo_url", "is", null)
      .order("resolved_at", { ascending: false })
      .limit(48);
    const rows = (data as SesizareRow[] | null) ?? [];
    // Filter JS-side for rows that have at least one "before" image
    return rows.filter((r) => Array.isArray(r.imagini) && r.imagini.length > 0).slice(0, 24);
  } catch {
    return [];
  }
}

export default async function ImpactPage() {
  const sesizari = await getResolvedWithPhotos();

  return (
    <div className="container-narrow py-12 md:py-16">
      {/* Hero */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold mb-4">
          <CheckCircle2 size={14} /> DOVADĂ DE IMPACT
        </div>
        <h1 className="font-[family-name:var(--font-sora)] text-4xl md:text-5xl font-bold mb-3">
          Probleme rezolvate prin Civia
        </h1>
        <p className="text-lg text-[var(--color-text-muted)] max-w-3xl">
          Când cetățenii raportează, urmăresc și verifică — autoritățile rezolvă.
          {sesizari.length > 0 && (
            <>
              {" "}Mai jos sunt <strong>{sesizari.length} probleme</strong> rezolvate pe platformă.
            </>
          )}
        </p>
      </div>

      {sesizari.length === 0 ? (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-10 text-center">
          <p className="text-[var(--color-text-muted)] mb-4">
            Încă nu avem galerii before/after publicate.
          </p>
          <Link
            href="/sesizari"
            className="inline-flex items-center gap-2 h-10 px-4 rounded-[8px] bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-hover)]"
          >
            Fă prima sesizare
            <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sesizari.map((s) => {
            const tipLabel = SESIZARE_TIPURI.find((t) => t.value === s.tip)?.label ?? s.tip;
            const tipIcon = SESIZARE_TIPURI.find((t) => t.value === s.tip)?.icon ?? "📝";
            const beforeUrl = s.imagini[0];
            const afterUrl = s.resolved_photo_url;
            if (!beforeUrl || !afterUrl) return null;
            return (
              <Link
                key={s.id}
                href={`/sesizari/${s.code}`}
                className="group bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] overflow-hidden hover:-translate-y-1 hover:shadow-[var(--shadow-lg)] transition-all"
              >
                <div className="grid grid-cols-2 gap-0.5">
                  <div className="relative aspect-square overflow-hidden bg-[var(--color-surface-2)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={beforeUrl}
                      alt="Înainte"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      loading="lazy"
                    />
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      ÎNAINTE
                    </span>
                  </div>
                  <div className="relative aspect-square overflow-hidden bg-[var(--color-surface-2)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={afterUrl}
                      alt="După"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      loading="lazy"
                    />
                    <span className="absolute top-2 left-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      DUPĂ
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-base">{tipIcon}</span>
                    <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                      {tipLabel}
                    </span>
                    <span className="ml-auto text-xs text-[var(--color-text-muted)]">
                      {s.sector}
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm mb-1 line-clamp-2 group-hover:text-[var(--color-primary)] transition-colors">
                    {s.titlu}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] mb-2">
                    <MapPin size={11} />
                    <span className="truncate">{s.locatie}</span>
                  </div>
                  {s.resolved_at && (
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                      ✓ Rezolvat {formatDate(s.resolved_at)}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* CTA */}
      <section className="mt-16 bg-gradient-to-br from-[var(--color-primary)] to-indigo-900 rounded-[12px] p-8 md:p-12 text-white text-center">
        <h2 className="font-[family-name:var(--font-sora)] text-2xl md:text-3xl font-bold mb-3">
          Ai o problemă nerezolvată în cartier?
        </h2>
        <p className="text-white/85 mb-6 max-w-xl mx-auto">
          Depune o sesizare formală către PMB. E gratis, durează 2 minute, și rezultatele se văd aici.
        </p>
        <Link
          href="/sesizari"
          className="inline-flex items-center gap-2 h-12 px-6 rounded-[8px] bg-white text-[var(--color-primary)] font-semibold hover:bg-white/90 transition-colors"
        >
          Fă o sesizare <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  );
}
