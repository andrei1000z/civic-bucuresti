import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ExternalLink, Calendar, User, Tag } from "lucide-react";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { Badge } from "@/components/ui/Badge";
import { SOURCE_COLORS, SITE_URL } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";
import { BreadcrumbJsonLd } from "@/components/FaqJsonLd";

export const dynamic = "force-dynamic";

interface StireRow {
  id: string;
  url: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  source: string;
  category: string;
  author: string | null;
  image_url: string | null;
  published_at: string;
}

async function getStire(id: string): Promise<StireRow | null> {
  const admin = createSupabaseAdmin();
  const { data } = await admin
    .from("stiri_cache")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data as StireRow | null;
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const stire = await getStire(id);
  return {
    title: stire?.title ?? "Știre",
    description: stire?.excerpt?.slice(0, 160) ?? "",
    openGraph: {
      title: stire?.title,
      description: stire?.excerpt?.slice(0, 160),
      images: stire?.image_url ? [stire.image_url] : undefined,
    },
  };
}

export default async function StireDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const stire = await getStire(id);
  if (!stire) notFound();

  const categoryLabels: Record<string, string> = {
    transport: "Transport",
    urbanism: "Urbanism",
    mediu: "Mediu",
    siguranta: "Siguranță",
    administratie: "Administrație",
    eveniment: "Evenimente",
  };

  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: "Civia", url: SITE_URL },
        { name: "Știri", url: `${SITE_URL}/stiri` },
        { name: stire.title, url: `${SITE_URL}/stiri/${stire.id}` },
      ]} />
    <div className="container-narrow py-8 md:py-12 max-w-3xl">
      <Link
        href="/stiri"
        className="inline-flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] mb-6 transition-colors"
      >
        <ChevronLeft size={16} /> Înapoi la știri
      </Link>

      {/* Hero image */}
      {stire.image_url && (
        <div className="relative h-64 md:h-96 rounded-[12px] overflow-hidden mb-6 bg-[var(--color-surface-2)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={stire.image_url}
            alt={stire.title}
            className="w-full h-full object-cover"
            onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 flex gap-2">
            <Badge bgColor={SOURCE_COLORS[stire.source] ?? "#64748b"} color="white">
              {stire.source}
            </Badge>
            <Badge className="bg-black/40 text-white border border-white/20 uppercase text-[10px]">
              {categoryLabels[stire.category] ?? stire.category}
            </Badge>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        {!stire.image_url && (
          <div className="flex gap-2 mb-3">
            <Badge bgColor={SOURCE_COLORS[stire.source] ?? "#64748b"} color="white">
              {stire.source}
            </Badge>
            <Badge variant="neutral" className="uppercase text-[10px]">
              {categoryLabels[stire.category] ?? stire.category}
            </Badge>
          </div>
        )}
        <h1 className="font-[family-name:var(--font-sora)] text-3xl md:text-4xl font-bold mb-4 leading-tight">
          {stire.title}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--color-text-muted)]">
          <span className="flex items-center gap-1.5">
            <Calendar size={14} />
            {formatDateTime(stire.published_at)}
          </span>
          {stire.author && (
            <span className="flex items-center gap-1.5">
              <User size={14} />
              {stire.author}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Tag size={14} />
            {categoryLabels[stire.category] ?? stire.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <article className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-6 md:p-8 mb-6">
        {stire.excerpt && (
          <p className="text-lg text-[var(--color-text)] leading-relaxed mb-6 font-medium border-l-4 border-[var(--color-primary)] pl-4">
            {stire.excerpt}
          </p>
        )}
        {stire.content && stire.content !== stire.excerpt && (
          <div className="text-[var(--color-text)] leading-relaxed whitespace-pre-wrap">
            {stire.content}
          </div>
        )}
      </article>

      {/* CTA: Read original */}
      <div className="bg-gradient-to-br from-[var(--color-primary)] to-indigo-900 rounded-[12px] p-6 text-white text-center">
        <p className="text-sm text-white/80 mb-3">
          Conținutul aparține publicației originale.
        </p>
        <a
          href={stire.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 h-12 px-6 rounded-[8px] bg-white text-[var(--color-primary)] font-semibold hover:bg-white/90 transition-colors"
        >
          Citește articolul complet pe {stire.source}
          <ExternalLink size={16} />
        </a>
        <p className="text-[10px] text-white/60 mt-3">
          Civia agregează știri din surse verificate. Nu modificăm conținutul editorial.
        </p>
      </div>
    </div>
    </>
  );
}
