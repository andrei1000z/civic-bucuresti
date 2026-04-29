import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ChevronLeft, ExternalLink, Calendar, User, Tag } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { Badge } from "@/components/ui/Badge";
import { SOURCE_COLORS, SITE_URL } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";
import { getOrGenerateAiSummary } from "@/lib/stiri/ai-summary";
import { AiSummary } from "./AiSummary";
import { NewsArticleJsonLd } from "@/components/JsonLd";

const SOURCE_LOGOS: Record<string, string> = {
  "Digi24": "/images/sources/digi24.png",
  "Hotnews": "/images/sources/hotnews.png",
  "G4Media": "/images/sources/g4media.png",
  "Mediafax": "/images/sources/mediafax.png",
  "News.ro": "/images/sources/newsro.png",
  "B365.ro": "/images/sources/b365.png",
};

// Stire content is immutable once published, AI summary cached in DB.
// ISR 10 min is plenty for the rare case a summary gets regenerated.
export const revalidate = 600;
export const dynamicParams = true;
export async function generateStaticParams() {
  return [];
}

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
  ai_summary: string | null;
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

async function getRelatedArticles(stire: StireRow): Promise<StireRow[]> {
  try {
    // Get articles from same category + same counties, excluding current
    const { data } = await getSupabase()
      .from("stiri_cache")
      .select("*")
      .neq("id", stire.id)
      .eq("category", stire.category)
      .order("published_at", { ascending: false })
      .limit(4);
    return (data ?? []) as StireRow[];
  } catch {
    return [];
  }
}

async function getStire(id: string): Promise<StireRow | null> {
  try {
    const { data, error } = await getSupabase()
      .from("stiri_cache")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) return null;
    return data as StireRow | null;
  } catch {
    return null;
  }
}

const categoryLabels: Record<string, string> = {
  transport: "Transport",
  urbanism: "Urbanism",
  mediu: "Mediu",
  siguranta: "Siguranță",
  administratie: "Administrație",
  eveniment: "Evenimente",
};

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const stire = await getStire(id);
  if (!stire) {
    return { title: "Știre inexistentă", robots: { index: false, follow: false } };
  }
  const title = stire.title;
  const description = stire.excerpt?.slice(0, 160) ?? `Știre din ${stire.source}`;
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/stiri/${id}` },
    authors: stire.author ? [{ name: stire.author }] : undefined,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: stire.published_at,
      url: `${SITE_URL}/stiri/${id}`,
      images: stire.image_url ? [stire.image_url] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: stire.image_url ? [stire.image_url] : undefined,
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

  // Generate (or read cached) AI summary on the server so the first user
  // to open the article pays the Groq cost and every subsequent visitor
  // gets the summary pre-rendered in the initial HTML — no client fetch,
  // no flicker, no duplicate API calls.
  const aiSummary = await getOrGenerateAiSummary(stire);

  const related = await getRelatedArticles(stire);
  const sourceColor = SOURCE_COLORS[stire.source] ?? "#64748b";

  return (
    <div className="container-narrow py-8 md:py-12 max-w-4xl">
      <NewsArticleJsonLd
        headline={stire.title}
        description={stire.excerpt ?? undefined}
        url={`${SITE_URL}/stiri/${stire.id}`}
        datePublished={stire.published_at}
        author={stire.author ?? undefined}
        publisher={stire.source}
        image={stire.image_url ?? undefined}
      />
      <Link
        href="/stiri"
        className="inline-flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] mb-6 transition-colors"
      >
        <ChevronLeft size={16} /> Toate știrile
      </Link>

      {/* Hero */}
      <div className="mb-8">
        {stire.image_url && (
          <div className="relative h-64 md:h-[420px] rounded-[16px] overflow-hidden mb-6 bg-[var(--color-surface-2)]">
            <Image
              src={stire.image_url}
              alt={stire.title}
              fill
              sizes="(max-width: 768px) 100vw, 896px"
              className="object-cover"
              priority
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex gap-2 mb-3">
                <Badge bgColor={sourceColor} color="white">{stire.source}</Badge>
                <Badge className="bg-white/20 text-white border border-white/30 uppercase text-[10px] backdrop-blur-sm">
                  {categoryLabels[stire.category] ?? stire.category}
                </Badge>
              </div>
              <h1 className="font-[family-name:var(--font-sora)] text-2xl md:text-4xl font-bold text-white leading-tight drop-shadow-lg">
                {stire.title}
              </h1>
            </div>
          </div>
        )}

        {!stire.image_url && (
          <>
            <div className="flex gap-2 mb-4">
              <Badge bgColor={sourceColor} color="white">{stire.source}</Badge>
              <Badge variant="neutral" className="uppercase text-[10px]">
                {categoryLabels[stire.category] ?? stire.category}
              </Badge>
            </div>
            <h1 className="font-[family-name:var(--font-sora)] text-3xl md:text-4xl font-bold leading-tight mb-4">
              {stire.title}
            </h1>
          </>
        )}

        {/* Meta bar */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--color-text-muted)]">
          <span className="flex items-center gap-1.5">
            <Calendar size={14} aria-hidden="true" />
            <time dateTime={stire.published_at}>{formatDateTime(stire.published_at)}</time>
          </span>
          {stire.author && (
            <span className="flex items-center gap-1.5">
              <User size={14} aria-hidden="true" />
              {stire.author}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Tag size={14} aria-hidden="true" />
            {categoryLabels[stire.category] ?? stire.category}
          </span>
          <a
            href={stire.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[var(--color-primary)] hover:underline ml-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded"
            aria-label={`Citește articolul original pe ${stire.source} (deschide în tab nou)`}
          >
            <ExternalLink size={14} aria-hidden="true" />
            {stire.source}
          </a>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-8">
        <div>
          {/* Sinteză */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] shadow-[var(--shadow-2)] p-6 mb-6">
            <div className="mb-4">
              <p className="font-[family-name:var(--font-sora)] font-bold text-sm">Sinteză Civia</p>
              <p className="text-[10px] text-[var(--color-text-muted)]">Rezumat al articolului original</p>
            </div>
            <AiSummary
              stireId={stire.id}
              initialSummary={aiSummary}
              fallbackText={stire.excerpt || stire.content || ""}
            />
          </div>

          {/* Original content */}
          {(stire.excerpt || stire.content) && (
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-6 mb-6">
              <h2 className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-semibold mb-4">
                Text original — {stire.source}
              </h2>
              {stire.excerpt && (
                <p className="text-base leading-relaxed mb-4 font-medium border-l-4 border-[var(--color-border)] pl-4 text-[var(--color-text-muted)]">
                  {stire.excerpt}
                </p>
              )}
              {stire.content && stire.content !== stire.excerpt && (
                <div className="text-sm text-[var(--color-text-muted)] leading-relaxed whitespace-pre-wrap">
                  {stire.content}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          {/* Source card */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-5">
            <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-semibold mb-3">Sursă</p>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden" style={{ backgroundColor: sourceColor }}>
                {SOURCE_LOGOS[stire.source] ? (
                  <Image
                    src={SOURCE_LOGOS[stire.source] ?? ""}
                    alt={stire.source}
                    width={28}
                    height={28}
                    className="w-7 h-7 object-contain"
                  />
                ) : (
                  <span className="text-white font-bold">{stire.source.charAt(0)}</span>
                )}
              </div>
              <div>
                <p className="font-semibold text-sm">{stire.source}</p>
                <p className="text-xs text-[var(--color-text-muted)]">{categoryLabels[stire.category] ?? stire.category}</p>
              </div>
            </div>
            <a
              href={stire.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 w-full justify-center h-10 rounded-[var(--radius-xs)] bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-primary)]"
              aria-label={`Citește articolul complet pe ${stire.source} (deschide în tab nou)`}
            >
              <ExternalLink size={14} aria-hidden="true" />
              Articolul complet
            </a>
          </div>

          {/* Info card */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-5">
            <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-semibold mb-3">Despre</p>
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
              Civia agregează știri din surse verificate și generează automat o sinteză AI pentru a facilita înțelegerea rapidă.
              Conținutul original aparține publicației {stire.source}.
            </p>
          </div>
        </aside>
      </div>

      {/* Related articles */}
      {related.length > 0 && (
        <div className="mt-10">
          <h2 className="font-[family-name:var(--font-sora)] text-xl font-bold mb-5">
            Știri similare
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/stiri/${r.id}`}
                className="group bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[10px] overflow-hidden hover:shadow-[var(--shadow-md)] transition-all"
              >
                <div className="relative h-32 bg-gradient-to-br from-slate-600 to-slate-800">
                  {r.image_url ? (
                    <Image
                      src={r.image_url}
                      alt={r.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover"
                      unoptimized
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-4xl font-bold text-white/20">{r.source.charAt(0)}</span>
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <Badge bgColor={SOURCE_COLORS[r.source] ?? "#64748b"} color="white" className="text-[9px]">
                      {r.source}
                    </Badge>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-semibold line-clamp-2 group-hover:text-[var(--color-primary)] transition-colors">
                    {r.title}
                  </h3>
                  <p className="text-[10px] text-[var(--color-text-muted)] mt-1">
                    {formatDateTime(r.published_at)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
