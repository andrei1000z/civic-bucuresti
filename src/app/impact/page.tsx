import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock, TrendingUp, Users, MapPin, ThumbsUp } from "lucide-react";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { SITE_NAME, STATUS_COLORS, STATUS_LABELS, SESIZARE_TIPURI } from "@/lib/constants";
import { ALL_COUNTIES } from "@/data/counties";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CountUp } from "@/components/home/CountUp";
import { DatasetJsonLd } from "@/components/FaqJsonLd";

export const revalidate = 600; // 10 minutes

export const metadata: Metadata = {
  title: "Impact — sesizări rezolvate, cetățeni activi",
  description:
    "Vezi impactul concret al platformei Civia: sesizări rezolvate, primării notificate, cetățeni care acționează. Date actualizate automat.",
  alternates: { canonical: "/impact" },
  openGraph: {
    title: `Impactul platformei ${SITE_NAME}`,
    description: "Sesizări rezolvate, primării notificate, cetățeni implicați — date live.",
  },
};

interface ImpactData {
  total: number;
  rezolvate: number;
  inLucru: number;
  today: number;
  byType: { tip: string; count: number }[];
  byCounty: { county: string; count: number; resolved: number }[];
  avgResolutionDays: number | null;
  topVoted: Array<{ code: string; titlu: string; locatie: string; voturi_net: number; status: string }>;
  latestResolved: Array<{ code: string; titlu: string; locatie: string; resolved_at: string }>;
}

async function getImpactData(): Promise<ImpactData> {
  try {
    const admin = createSupabaseAdmin();
    const todayIso = new Date(Date.now() - 24 * 60 * 60_000).toISOString();

    const [totalRes, resRes, inLucruRes, todayRes, byTypeRes, byCountyRes, resolvedDates, topRes, latestRes] =
      await Promise.all([
        admin.from("sesizari").select("*", { count: "exact", head: true }).eq("moderation_status", "approved"),
        admin.from("sesizari").select("*", { count: "exact", head: true }).eq("moderation_status", "approved").eq("status", "rezolvat"),
        admin.from("sesizari").select("*", { count: "exact", head: true }).eq("moderation_status", "approved").eq("status", "in-lucru"),
        admin.from("sesizari").select("*", { count: "exact", head: true }).eq("moderation_status", "approved").gte("created_at", todayIso),
        admin.from("sesizari").select("tip").eq("moderation_status", "approved").limit(5000),
        admin.from("sesizari").select("county, status").eq("moderation_status", "approved").limit(5000),
        admin
          .from("sesizari")
          .select("created_at, resolved_at")
          .eq("moderation_status", "approved")
          .eq("status", "rezolvat")
          .not("resolved_at", "is", null)
          .limit(500),
        admin
          .from("sesizari_feed")
          .select("code, titlu, locatie, voturi_net, status")
          .eq("publica", true)
          .order("voturi_net", { ascending: false })
          .limit(6),
        admin
          .from("sesizari")
          .select("code, titlu, locatie, resolved_at")
          .eq("moderation_status", "approved")
          .eq("status", "rezolvat")
          .not("resolved_at", "is", null)
          .order("resolved_at", { ascending: false })
          .limit(6),
      ]);

    const byTypeMap = new Map<string, number>();
    for (const r of (byTypeRes.data ?? []) as { tip: string }[]) {
      byTypeMap.set(r.tip, (byTypeMap.get(r.tip) ?? 0) + 1);
    }
    const byType = [...byTypeMap.entries()]
      .map(([tip, count]) => ({ tip, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const countyMap = new Map<string, { count: number; resolved: number }>();
    for (const r of (byCountyRes.data ?? []) as { county: string | null; status: string }[]) {
      if (!r.county) continue;
      const prev = countyMap.get(r.county) ?? { count: 0, resolved: 0 };
      prev.count += 1;
      if (r.status === "rezolvat") prev.resolved += 1;
      countyMap.set(r.county, prev);
    }
    const byCounty = [...countyMap.entries()]
      .map(([county, v]) => ({ county, ...v }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    let avgResolutionDays: number | null = null;
    const resolvedArr = (resolvedDates.data ?? []) as { created_at: string; resolved_at: string }[];
    if (resolvedArr.length > 0) {
      const totalMs = resolvedArr.reduce((acc, r) => {
        const c = new Date(r.created_at).getTime();
        const s = new Date(r.resolved_at).getTime();
        if (isNaN(c) || isNaN(s) || s <= c) return acc;
        return acc + (s - c);
      }, 0);
      avgResolutionDays = Math.round((totalMs / resolvedArr.length) / (1000 * 60 * 60 * 24));
    }

    return {
      total: totalRes.count ?? 0,
      rezolvate: resRes.count ?? 0,
      inLucru: inLucruRes.count ?? 0,
      today: todayRes.count ?? 0,
      byType,
      byCounty,
      avgResolutionDays,
      topVoted: (topRes.data ?? []) as ImpactData["topVoted"],
      latestResolved: (latestRes.data ?? []) as ImpactData["latestResolved"],
    };
  } catch {
    return {
      total: 0,
      rezolvate: 0,
      inLucru: 0,
      today: 0,
      byType: [],
      byCounty: [],
      avgResolutionDays: null,
      topVoted: [],
      latestResolved: [],
    };
  }
}

function countyName(id: string): string {
  return ALL_COUNTIES.find((c) => c.id === id)?.name ?? id;
}

function countySlug(id: string): string {
  return ALL_COUNTIES.find((c) => c.id === id)?.slug ?? id.toLowerCase();
}

function tipLabel(tip: string): string {
  return SESIZARE_TIPURI.find((t) => t.value === tip)?.label ?? tip;
}

function tipIcon(tip: string): string {
  return SESIZARE_TIPURI.find((t) => t.value === tip)?.icon ?? "📮";
}

export default async function ImpactPage() {
  const data = await getImpactData();
  const resolvedPct = data.total > 0 ? Math.round((data.rezolvate / data.total) * 100) : 0;
  const maxTypeCount = data.byType[0]?.count ?? 1;
  const maxCountyCount = data.byCounty[0]?.count ?? 1;
  // eslint-disable-next-line react-hooks/purity -- server component; evaluated once per ISR revalidation
  const nowMs = Date.now();

  return (
    <div className="container-narrow py-12 md:py-16">
      <DatasetJsonLd
        name="Civia — Sesizări civice România"
        description="Dataset cu sesizări civice depuse prin platforma Civia: total, rezolvate, în lucru, pe tipuri, pe județe. Actualizat live."
        url="https://civia.ro/impact"
        keywords={["sesizari", "romania", "date publice", "transparenta", "administratie"]}
      />
      {/* HERO */}
      <div className="mb-10 md:mb-14">
        <Badge className="mb-4">Dashboard public</Badge>
        <h1 className="font-[family-name:var(--font-sora)] text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
          Impactul platformei{" "}
          <span className="text-[var(--color-primary)]">Civia</span>
        </h1>
        <p className="text-lg md:text-xl text-[var(--color-text-muted)] max-w-3xl leading-relaxed">
          Fiecare sesizare e un pas către un oraș mai bun. Iată ce s-a schimbat
          datorită cetățenilor care au ales să acționeze.
        </p>
      </div>

      {/* BIG NUMBERS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
        <Card className="text-center">
          <div className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
            Sesizări depuse
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
          <div className="text-xs text-[var(--color-text-muted)] mt-1">
            {resolvedPct}% din total
          </div>
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

      {/* METRIC: avg resolution */}
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
                Din depunere până la confirmarea rezolvării. Calculat din ultimele {data.rezolvate} sesizări rezolvate.
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* TOP BY TYPE */}
      {data.byType.length > 0 && (
        <section className="mb-12">
          <h2 className="font-[family-name:var(--font-sora)] text-2xl md:text-3xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp size={24} className="text-[var(--color-primary)]" />
            Cele mai frecvente probleme
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
                      <div
                        className="h-full bg-[var(--color-primary)] rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </section>
      )}

      {/* BY COUNTY */}
      {data.byCounty.length > 0 && (
        <section className="mb-12">
          <h2 className="font-[family-name:var(--font-sora)] text-2xl md:text-3xl font-bold mb-6 flex items-center gap-2">
            <MapPin size={24} className="text-[var(--color-primary)]" />
            Cele mai active județe
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {data.byCounty.map((c) => {
              const pct = Math.round((c.count / maxCountyCount) * 100);
              const resolvedPct = c.count > 0 ? Math.round((c.resolved / c.count) * 100) : 0;
              return (
                <Link key={c.county} href={`/${countySlug(c.county)}/sesizari`}>
                  <Card hover className="h-full">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <div className="font-semibold">{countyName(c.county)}</div>
                        <div className="text-xs text-[var(--color-text-muted)]">
                          {c.count} sesizări · {c.resolved} rezolvate ({resolvedPct}%)
                        </div>
                      </div>
                      <ArrowRight size={18} className="text-[var(--color-text-muted)] mt-1" />
                    </div>
                    <div className="h-1.5 bg-[var(--color-bg)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[var(--color-primary)] to-emerald-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* TOP VOTED + LATEST RESOLVED */}
      <div className="grid gap-10 lg:grid-cols-2 mb-12">
        {data.topVoted.length > 0 && (
          <section>
            <h2 className="font-[family-name:var(--font-sora)] text-xl md:text-2xl font-bold mb-5 flex items-center gap-2">
              <ThumbsUp size={22} className="text-[var(--color-primary)]" />
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
                    <div className="text-xs text-[var(--color-text-muted)] mt-1 truncate">
                      📍 {s.locatie}
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
                        <span className="truncate">📍 {s.locatie}</span>
                        <span className="shrink-0 ml-2">
                          {daysAgo === 0 ? "azi" : `${daysAgo}z`}
                        </span>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* CTA */}
      <section className="mt-16 p-8 md:p-12 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-blue-900 text-white text-center">
        <Users size={40} className="mx-auto mb-4 opacity-90" />
        <h2 className="font-[family-name:var(--font-sora)] text-2xl md:text-3xl font-bold mb-3">
          Impactul tău începe cu o sesizare
        </h2>
        <p className="text-white/90 mb-6 max-w-xl mx-auto">
          Adaugă vocea ta celor {data.total.toLocaleString("ro-RO")} sesizări depuse deja.
          Cu cât mai mulți cetățeni, cu atât mai mare presiunea pentru schimbare.
        </p>
        <Link
          href="/#county-picker"
          className="inline-flex items-center gap-2 h-12 px-7 rounded-[8px] bg-white text-[var(--color-primary)] font-semibold hover:bg-white/90 transition-colors shadow-lg"
        >
          Fă o sesizare <ArrowRight size={18} />
        </Link>
      </section>
    </div>
  );
}
