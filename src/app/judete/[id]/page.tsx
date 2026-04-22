import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Building2, Mail, Phone, Globe, MapPin, FileText, ArrowRight } from "lucide-react";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { Badge } from "@/components/ui/Badge";

// ISR: county authorities rarely change; sesizari list is small. 5 min refresh.
export const revalidate = 300;

interface County { id: string; name: string; center_lat: number | null; center_lng: number | null; }
interface Authority { id: string; name: string; type: string; email: string | null; phone: string | null; website: string | null; verified: boolean; }
interface Sesizare { code: string; titlu: string; status: string; tip: string; created_at: string; }

async function getCounty(id: string): Promise<County | null> {
  const admin = createSupabaseAdmin();
  const { data } = await admin.from("counties").select("*").eq("id", id.toUpperCase()).maybeSingle();
  return data as County | null;
}

async function getAuthorities(countyId: string): Promise<Authority[]> {
  const admin = createSupabaseAdmin();
  const { data } = await admin.from("authorities").select("*").eq("county_id", countyId).order("type");
  return (data ?? []) as Authority[];
}

async function getSesizari(countyId: string): Promise<Sesizare[]> {
  const admin = createSupabaseAdmin();
  const { data } = await admin
    .from("sesizari")
    .select("code, titlu, status, tip, created_at")
    .eq("county", countyId)
    .eq("moderation_status", "approved")
    .eq("publica", true)
    .order("created_at", { ascending: false })
    .limit(10);
  return (data ?? []) as Sesizare[];
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const county = await getCounty(id);
  return {
    title: county ? `${county.name} — Sesizări și autorități` : "Județ negăsit",
    description: county ? `Depune sesizări în județul ${county.name}. Vezi autoritățile locale și urmărește rezolvarea problemelor.` : "",
    alternates: { canonical: `/judete/${id.toLowerCase()}` },
  };
}

const TYPE_LABELS: Record<string, string> = {
  primarie: "Primărie",
  politie_locala: "Poliție Locală",
  consiliu_judetean: "Consiliu Județean",
  prefectura: "Prefectură",
  ipj: "Poliție (IPJ)",
  isu: "ISU",
  dsp: "Sănătate (DSP)",
  isj: "Educație (ISJ)",
  apm: "Mediu (APM)",
  dsvsa: "Veterinar (DSVSA)",
  garda_mediu: "Garda de Mediu",
  other: "Altele",
};

const STATUS_COLORS: Record<string, string> = {
  nou: "#3b82f6",
  "in-lucru": "#f59e0b",
  rezolvat: "#10b981",
  respins: "#ef4444",
};

export default async function CountyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const county = await getCounty(id);
  if (!county) notFound();

  const [authorities, sesizari] = await Promise.all([
    getAuthorities(county.id),
    getSesizari(county.id),
  ]);

  // Group authorities by type
  const grouped = new Map<string, Authority[]>();
  for (const auth of authorities) {
    const list = grouped.get(auth.type) ?? [];
    list.push(auth);
    grouped.set(auth.type, list);
  }

  return (
    <div className="container-narrow py-8 md:py-12">
      <Link
        href="/judete"
        className="inline-flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] mb-6 transition-colors"
      >
        <ChevronLeft size={16} /> Toate județele
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl font-bold text-[var(--color-primary)] bg-[var(--color-primary-soft)] px-3 py-1 rounded-[8px]">
            {county.id}
          </span>
          <div>
            <h1 className="font-[family-name:var(--font-sora)] text-3xl md:text-4xl font-bold">
              Județul {county.name}
            </h1>
            <p className="text-[var(--color-text-muted)]">
              {authorities.length} autorități înregistrate · {sesizari.length} sesizări recente
            </p>
          </div>
        </div>

        <Link
          href={`/sesizari?county=${county.id}`}
          className="inline-flex items-center gap-2 h-11 px-5 rounded-[8px] bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-hover)] mt-4"
        >
          <FileText size={16} />
          Fă o sesizare în {county.name}
        </Link>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-8">
        {/* Authorities */}
        <div>
          <h2 className="font-[family-name:var(--font-sora)] text-2xl font-bold mb-4">
            Autorități locale
          </h2>
          {grouped.size === 0 ? (
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-8 text-center">
              <Building2 size={32} className="mx-auto mb-3 text-[var(--color-text-muted)]" />
              <p className="text-[var(--color-text-muted)] mb-4">
                Încă nu avem autorități înregistrate pentru acest județ.
              </p>
              <Link
                href="https://github.com/andrei1000z/civic-bucuresti/issues"
                className="inline-flex items-center gap-2 text-sm text-[var(--color-primary)] hover:underline"
              >
                Ajută-ne să completăm baza de date <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {Array.from(grouped.entries()).map(([type, auths]) => (
                <div key={type}>
                  <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
                    {TYPE_LABELS[type] ?? type}
                  </h3>
                  <div className="space-y-2">
                    {auths.map((auth) => (
                      <div
                        key={auth.id}
                        className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[8px] p-4"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-sm">{auth.name}</p>
                            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-[var(--color-text-muted)]">
                              {auth.email && (
                                <a href={`mailto:${auth.email}`} className="flex items-center gap-1 hover:text-[var(--color-primary)]">
                                  <Mail size={11} /> {auth.email}
                                </a>
                              )}
                              {auth.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone size={11} /> {auth.phone}
                                </span>
                              )}
                              {auth.website && (
                                <a href={auth.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-[var(--color-primary)]">
                                  <Globe size={11} /> Site
                                </a>
                              )}
                            </div>
                          </div>
                          {auth.verified && (
                            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                              ✓ Verificat
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar — recent sesizari */}
        <aside>
          <h2 className="font-[family-name:var(--font-sora)] text-xl font-bold mb-4">
            Sesizări recente
          </h2>
          {sesizari.length === 0 ? (
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-6 text-center">
              <p className="text-[var(--color-text-muted)] text-sm mb-3">
                Nicio sesizare încă în {county.name}.
              </p>
              <Link
                href="/sesizari"
                className="text-sm text-[var(--color-primary)] hover:underline"
              >
                Fii primul care raportează o problemă →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {sesizari.map((s) => (
                <Link
                  key={s.code}
                  href={`/sesizari/${s.code}`}
                  className="block bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[8px] p-3 hover:border-[var(--color-primary)]/40 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: STATUS_COLORS[s.status] ?? "#64748b" }}
                    />
                    <span className="font-mono text-[10px] text-[var(--color-text-muted)]">{s.code}</span>
                  </div>
                  <p className="text-sm font-medium line-clamp-1">{s.titlu}</p>
                  <p className="text-[10px] text-[var(--color-text-muted)] mt-1">
                    {new Date(s.created_at).toLocaleDateString("ro-RO")}
                  </p>
                </Link>
              ))}
            </div>
          )}

          {/* CTA contribuie */}
          <div className="mt-6 bg-[var(--color-surface-2)] rounded-[12px] p-5">
            <h3 className="font-semibold text-sm mb-2">Cunoști emailuri de primării?</h3>
            <p className="text-xs text-[var(--color-text-muted)] mb-3">
              Ajută-ne să completăm baza de date cu emailuri oficiale ale primăriilor din {county.name}.
            </p>
            <Link
              href="https://github.com/andrei1000z/civic-bucuresti/issues"
              className="inline-flex items-center gap-2 text-xs text-[var(--color-primary)] font-medium hover:underline"
            >
              Contribuie cu date <ArrowRight size={12} />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
