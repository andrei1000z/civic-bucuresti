import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Users,
  ExternalLink,
  Building2,
} from "lucide-react";
import {
  getInterruptionById,
  getAllInterruptions,
  INTRERUPERI,
  TYPE_COLORS,
  TYPE_ICONS,
  TYPE_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
} from "@/data/intreruperi";
import { SITE_URL } from "@/lib/constants";
import { ShareButton } from "./ShareButton";
import { MapClient } from "./MapClient";
import { CalendarMenu } from "./CalendarMenu";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const item = await getInterruptionById(id);
  if (!item) return {};
  const title = `${TYPE_ICONS[item.type]} ${TYPE_LABELS[item.type]} — ${item.addresses[0] ?? item.reason}`;
  return {
    title,
    description: item.excerpt ?? `${item.reason}. Provider: ${item.provider}.`,
    alternates: { canonical: `/intreruperi/${item.id}` },
    openGraph: {
      title,
      description: item.excerpt ?? item.reason,
      type: "article",
      locale: "ro_RO",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: item.excerpt ?? item.reason,
    },
    keywords: [
      TYPE_LABELS[item.type],
      item.provider,
      item.locality ?? "",
      item.county === "B" ? "București" : item.county,
      ...item.addresses.slice(0, 3),
    ].filter(Boolean),
  };
}

export const revalidate = 1800;

export async function generateStaticParams() {
  return INTRERUPERI.map((i) => ({ id: i.id }));
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("ro-RO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function durationLabel(startAt: string, endAt: string): string {
  const ms = new Date(endAt).getTime() - new Date(startAt).getTime();
  const h = Math.round(ms / 3_600_000);
  if (h < 24) return `${h} ore`;
  const d = Math.round(h / 24);
  return `${d} ${d === 1 ? "zi" : "zile"}`;
}

export default async function InterruptionDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getInterruptionById(id);
  if (!item) notFound();

  const all = await getAllInterruptions();
  const related = all
    .filter(
      (i) => i.id !== item.id && i.county === item.county && i.status !== "finalizat",
    )
    .slice(0, 4);

  // Schema.org Event JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: `${TYPE_LABELS[item.type]} — ${item.addresses[0] ?? item.reason}`,
    description: item.excerpt ?? item.reason,
    startDate: item.startAt,
    endDate: item.endAt,
    eventStatus:
      item.status === "anulat"
        ? "https://schema.org/EventCancelled"
        : item.status === "in-desfasurare"
        ? "https://schema.org/EventScheduled"
        : "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: item.addresses.slice(0, 2).join(", "),
      address: {
        "@type": "PostalAddress",
        addressCountry: "RO",
        addressLocality: item.locality ?? "",
        addressRegion: item.county,
      },
      ...(item.lat != null && item.lng != null
        ? {
            geo: {
              "@type": "GeoCoordinates",
              latitude: item.lat,
              longitude: item.lng,
            },
          }
        : {}),
    },
    organizer: {
      "@type": "Organization",
      name: item.provider,
      url: item.sourceUrl,
    },
    url: `${SITE_URL}/intreruperi/${item.id}`,
  };

  return (
    <div className="container-narrow py-8 md:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link
        href="/intreruperi"
        className="inline-flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Toate întreruperile
      </Link>

      <header
        className="mb-8 pl-4 border-l-4"
        style={{ borderLeftColor: TYPE_COLORS[item.type] }}
      >
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{
              background: TYPE_COLORS[item.type] + "25",
              color: TYPE_COLORS[item.type],
            }}
          >
            {TYPE_ICONS[item.type]} {TYPE_LABELS[item.type]}
          </span>
          <span
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{
              background: STATUS_COLORS[item.status] + "25",
              color: STATUS_COLORS[item.status],
            }}
          >
            {STATUS_LABELS[item.status]}
          </span>
        </div>
        <h1 className="font-[family-name:var(--font-sora)] text-2xl md:text-4xl font-extrabold mb-2">
          {item.reason}
        </h1>
        {item.excerpt && (
          <p className="text-base text-[var(--color-text-muted)] leading-relaxed">
            {item.excerpt}
          </p>
        )}
      </header>

      <div className="grid lg:grid-cols-[1fr_320px] gap-8">
        <div>
          {/* Info block */}
          <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-6 mb-6 space-y-4">
            <div>
              <h2 className="text-xs uppercase tracking-wider font-semibold text-[var(--color-text-muted)] mb-2 flex items-center gap-1.5">
                <Clock size={12} /> Interval
              </h2>
              <p className="text-sm">
                <strong>Început:</strong> {formatDateTime(item.startAt)}
              </p>
              <p className="text-sm">
                <strong>Sfârșit estimat:</strong> {formatDateTime(item.endAt)}
              </p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                Durată: {durationLabel(item.startAt, item.endAt)}
              </p>
            </div>

            <div>
              <h2 className="text-xs uppercase tracking-wider font-semibold text-[var(--color-text-muted)] mb-2 flex items-center gap-1.5">
                <MapPin size={12} /> Adrese afectate
              </h2>
              <ul className="space-y-1">
                {item.addresses.map((addr, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="text-[var(--color-primary)] mt-0.5">•</span>
                    {addr}
                  </li>
                ))}
              </ul>
            </div>

            {item.affectedPopulation != null && item.affectedPopulation > 0 && (
              <div>
                <h2 className="text-xs uppercase tracking-wider font-semibold text-[var(--color-text-muted)] mb-2 flex items-center gap-1.5">
                  <Users size={12} /> Populație afectată
                </h2>
                <p className="text-sm">
                  Aproximativ <strong>{item.affectedPopulation.toLocaleString("ro-RO")}</strong>{" "}
                  persoane
                </p>
              </div>
            )}
          </section>

          {/* Map */}
          {item.lat != null && item.lng != null && (
            <section className="mb-6">
              <h2 className="font-semibold mb-3">Locația pe hartă</h2>
              <MapClient
                coords={[item.lat, item.lng]}
                label={item.reason}
                color={TYPE_COLORS[item.type]}
                zoom={15}
                height="320px"
              />
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-5">
            <p className="text-xs uppercase tracking-wider font-semibold text-[var(--color-text-muted)] mb-3 flex items-center gap-1.5">
              <Building2 size={12} /> Provider
            </p>
            <p className="font-medium mb-3">{item.provider}</p>
            <div className="flex flex-col gap-2">
              {item.sourceEntryUrl && (
                <a
                  href={item.sourceEntryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-[var(--color-primary)] hover:underline font-medium"
                  title={item.sourceEntryTitle}
                >
                  <ExternalLink size={11} />
                  {item.sourceEntryUrl.toLowerCase().endsWith(".pdf")
                    ? "PDF oficial"
                    : "Anunț oficial"}
                </a>
              )}
              {item.sourceUrl && item.sourceUrl !== item.sourceEntryUrl && (
                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11px] text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:underline"
                  title={`Lista ${item.provider} cu toate anunțurile active`}
                >
                  <ExternalLink size={10} /> Toate anunțurile providerului
                </a>
              )}
              {!item.sourceEntryUrl && !item.sourceUrl && (
                <span className="text-[11px] text-[var(--color-text-muted)] italic">
                  Linkul direct la anunț urmează să fie adăugat.
                </span>
              )}
            </div>
          </div>

          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-5">
            <p className="text-xs uppercase tracking-wider font-semibold text-[var(--color-text-muted)] mb-3">
              Acțiuni
            </p>
            <div className="flex flex-col gap-2">
              <CalendarMenu item={item} />
              <ShareButton
                id={item.id}
                title={`${TYPE_ICONS[item.type]} ${TYPE_LABELS[item.type]} — ${item.addresses[0] ?? ""}`}
                text={item.reason}
              />
            </div>
          </div>

          {item.county && (
            <Link
              href={`/${item.county.toLowerCase()}/intreruperi`}
              className="block bg-[var(--color-primary-soft)] border border-[var(--color-primary)]/20 rounded-[var(--radius-md)] p-5 hover:bg-[var(--color-primary-soft)]/70 transition-colors"
            >
              <p className="text-xs uppercase tracking-wider font-semibold text-[var(--color-primary)] mb-1">
                Vezi toate din {item.county === "B" ? "București" : item.county}
              </p>
              <p className="text-sm text-[var(--color-text)]">
                Alte întreruperi programate în această zonă →
              </p>
            </Link>
          )}
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="font-[family-name:var(--font-sora)] text-xl font-bold mb-4">
            Alte întreruperi în {item.county === "B" ? "București" : item.county}
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/intreruperi/${r.id}`}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-4 hover:border-[var(--color-primary)]/40 transition-all flex gap-3"
                style={{ borderLeftWidth: "3px", borderLeftColor: TYPE_COLORS[r.type] }}
              >
                <span className="text-2xl shrink-0">{TYPE_ICONS[r.type]}</span>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-0.5">
                    {TYPE_LABELS[r.type]}
                  </p>
                  <p className="font-medium text-sm line-clamp-2 mb-1">{r.reason}</p>
                  <p className="text-[11px] text-[var(--color-text-muted)] truncate">
                    {r.addresses[0] ?? ""}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
