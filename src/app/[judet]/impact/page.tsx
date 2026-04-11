import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, Clock, TrendingUp, MapPin } from "lucide-react";
import { getCountyBySlug } from "@/data/counties";
import { SESIZARE_TIPURI, STATUS_COLORS, STATUS_LABELS } from "@/lib/constants";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CountUp } from "@/components/home/CountUp";
import { DatasetJsonLd } from "@/components/FaqJsonLd";
import { getImpactDataCached } from "@/lib/cached-queries";

// On-demand ISR: render when first visitor hits a county, cache 10 min.
// Avoids 42-county sequential Supabase round-trip at build time.
export const revalidate = 600;
export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ judet: string }>;
}): Promise<Metadata> {
  const { judet } = await params;
  const county = getCountyBySlug(judet);
  if (!county) return {};
  return {
    title: `Impact — ${county.name}`,
    description: `Dashboard local: sesizări depuse, rezolvate, top votate din județul ${county.name}. Date actualizate din Civia.`,
    alternates: { canonical: `/${county.slug}/impact` },
  };
}

const EMPTY_COUNTY_IMPACT = {
  total: 0,
  rezolvate: 0,
  inLucru: 0,
  today: 0,
  byType: [] as Array<{ tip: string; count: number }>,
  topVoted: [] as Array<{ code: string; titlu: string; locatie: string; voturi_net: number; status: string }>,
  latestResolved: [] as Array<{ code: string; titlu: string; locatie: string; resolved_at: string }>,
  avgResolutionDays: null as number | null,
};

async function getCountyImpact(countyId: string) {
  try {
    return await getImpactDataCached(countyId);
  } catch {
    return EMPTY_COUNTY_IMPACT;
  }
}

function tipLabel(tip: string): string {
  return SESIZARE_TIPURI.find((t) => t.value === tip)?.label ?? tip;
}

function tipIcon(tip: string): string {
  return SESIZARE_TIPURI.find((t) => t.value === tip)?.icon ?? "📮";
}

export default async function CountyImpactPage({
  params,
}: {
  params: Promise<{ judet: string }>;
}) {
  const { judet } = await params;
  const county = getCountyBySlug(judet);
  if (!county) notFound();

  const data = await getCountyImpact(county.id);
  const resolvedPct = data.total > 0 ? Math.round((data.rezolvate / data.total) * 100) : 0;
  const maxTypeCount = data.byType[0]?.count ?? 1;
  // eslint-disable-next-line react-hooks/purity -- server component; evaluated once per ISR revalidation
  const nowMs = Date.now();

  return (
    <div className="container-narrow py-12 md:py-16">
      <DatasetJsonLd
        name={`Impact Civia — ${county.name}`}
        description={`Sesizări civice din județul ${county.name}: total, rezolvate, pe tipuri, top votate.`}
        url={`https://civia.ro/${county.slug}/impact`}
        keywords={["sesizari", county.name.toLowerCase(), "impact civic", "date publice"]}
      />

      <Link
        href={`/${county.slug}`}
        className="inline-flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] mb-6 transition-colors"
      >
        ← {county.name}
      </Link>

      <Badge className="mb-4">Dashboard local</Badge>
      <h1 className="font-[family-name:var(--font-sora)] text-4xl md:text-5xl font-bold mb-4 leading-tight">
        Impact în <span className="text-[var(--color-primary)]">{county.name}</span>
      </h1>
      <p className="text-lg text-[var(--color-text-muted)] max-w-3xl mb-10 leading-relaxed">
        Sesizările depuse de cetățenii din {county.name} prin platforma Civia. Actualizat live.
      </p>

      {/* Empty state — shown when no data at all, skips empty grids below */}
      {data.total === 0 ? (
        <Card className="text-center py-16">
          <div className="text-6xl mb-4 opacity-40">📮</div>
          <h3 className="text-xl font-bold mb-2">Încă nu sunt sesizări publice în {county.name}</h3>
          <p className="text-[var(--color-text-muted)] mb-6 max-w-md mx-auto">
            Fii primul cetățean care semnalează o problemă. Platforma generează automat textul formal și îl trimite la autoritatea competentă.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href={`/${county.slug}/sesizari`}
              className="inline-flex items-center gap-2 h-11 px-5 rounded-[var(--radius-button)] bg-[var(--color-primary)] text-white font-semibold hover:bg-[var(--color-primary-hover)]"
            >
              Fă o sesizare <ArrowRight size={16} />
            </Link>
            <Link
              href="/impact"
              className="inline-flex items-center gap-2 h-11 px-5 rounded-[var(--radius-button)] bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:bg-[var(--color-surface)] font-medium"
            >
              Vezi dashboard-ul național
            </Link>
          </div>
        </Card>
      ) : (
      <>
      {/* Big numbers */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
        <Card className="text-center">
          <div className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
            Total depuse
          </div>
          <div className="text-3xl md:text-5xl font-bold text-[var(--color-primary)]">
            <CountUp to={data.total} />
          </div>
        </Card>
        <Card className="text-center">
          <div className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
            Rezolvate
          </div>
          <div className="text-3xl md:text-5xl font-bold text-emerald-600">
            <CountUp to={data.rezolvate} />
          </div>
          <div className="text-xs text-[var(--color-text-muted)] mt-1">{resolvedPct}% din total</div>
        </Card>
        <Card className="text-center">
          <div className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
            În lucru
          </div>
          <div className="text-3xl md:text-5xl font-bold text-amber-600">
            <CountUp to={data.inLucru} />
          </div>
        </Card>
        <Card className="text-center">
          <div className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
            Astăzi
          </div>
          <div className="text-3xl md:text-5xl font-bold text-[var(--color-primary)]">
            <CountUp to={data.today} />
          </div>
        </Card>
      </div>

      {/* Timp mediu rezolvare */}
      {data.avgResolutionDays !== null && (
        <Card className="mb-12 bg-gradient-to-br from-[var(--color-primary-soft)] to-transparent">
          <div className="flex items-center gap-4">
            <Clock size={40} className="text-[var(--color-primary)] shrink-0" />
            <div>
              <div className="text-sm text-[var(--color-text-muted)]">Timp mediu de rezolvare</div>
              <div className="text-2xl md:text-3xl font-bold">
                {data.avgResolutionDays} {data.avgResolutionDays === 1 ? "zi" : "zile"}
              </div>
              <div className="text-xs text-[var(--color-text-muted)] mt-1">
                Calculat din ultimele {data.rezolvate} sesizări rezolvate din {county.name}.
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Types */}
      {data.byType.length > 0 && (
        <section className="mb-12">
          <h2 className="font-[family-name:var(--font-sora)] text-2xl md:text-3xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp size={24} className="text-[var(--color-primary)]" />
            Top tipuri de probleme
          </h2>
          <Card>
            <div className="space-y-3">
              {data.byType.map((t) => {
                const pct = Math.round((t.count / maxTypeCount) * 100);
                return (
                  <div key={t.tip}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium">
                        {tipIcon(t.tip)} {tipLabel(t.tip)}
                      </span>
                      <span className="text-[var(--color-text-muted)] tabular-nums">{t.count}</span>
                    </div>
                    <div className="h-2 bg-[var(--color-bg)] rounded-full overflow-hidden">
                      <div className="h-full bg-[var(--color-primary)] rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </section>
      )}

      {/* Top voted + latest resolved */}
      <div className="grid gap-10 lg:grid-cols-2 mb-12">
        {data.topVoted.length > 0 && (
          <section>
            <h2 className="font-[family-name:var(--font-sora)] text-xl md:text-2xl font-bold mb-5">
              Cele mai votate
            </h2>
            <div className="space-y-3">
              {data.topVoted.map((s) => (
                <Link key={s.code} href={`/sesizari/${s.code}`}>
                  <Card hover className="h-full">
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <Badge
                        style={{
                          backgroundColor: `${STATUS_COLORS[s.status] ?? "#64748b"}22`,
                          color: STATUS_COLORS[s.status] ?? "#64748b",
                        }}
                      >
                        {STATUS_LABELS[s.status] ?? s.status}
                      </Badge>
                      <div className="text-sm font-bold text-[var(--color-primary)] tabular-nums">
                        ▲ {s.voturi_net}
                      </div>
                    </div>
                    <div className="font-medium line-clamp-2">{s.titlu}</div>
                    <div className="text-xs text-[var(--color-text-muted)] mt-1 truncate flex items-center gap-1">
                      <MapPin size={10} /> {s.locatie}
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {data.latestResolved.length > 0 && (
          <section>
            <h2 className="font-[family-name:var(--font-sora)] text-xl md:text-2xl font-bold mb-5 flex items-center gap-2">
              <CheckCircle2 size={22} className="text-emerald-600" />
              Recent rezolvate
            </h2>
            <div className="space-y-3">
              {data.latestResolved.map((s) => {
                const d = new Date(s.resolved_at);
                const daysAgo = Math.max(0, Math.round((nowMs - d.getTime()) / (1000 * 60 * 60 * 24)));
                return (
                  <Link key={s.code} href={`/sesizari/${s.code}`}>
                    <Card hover className="h-full" accentColor="#10b981">
                      <div className="font-medium line-clamp-2">{s.titlu}</div>
                      <div className="text-xs text-[var(--color-text-muted)] mt-1 flex items-center justify-between">
                        <span className="truncate flex items-center gap-1">
                          <MapPin size={10} /> {s.locatie}
                        </span>
                        <span className="shrink-0 ml-2">{daysAgo === 0 ? "azi" : `${daysAgo}z`}</span>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>

      <div className="mt-10 text-center">
        <Link href="/impact" className="inline-flex items-center gap-1 text-sm text-[var(--color-primary)] hover:underline font-medium">
          Vezi dashboard-ul național <ArrowRight size={14} />
        </Link>
      </div>
      </>
      )}
    </div>
  );
}
