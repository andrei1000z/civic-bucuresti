import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ExternalLink, Calendar, User, Tag, Sparkles } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { Badge } from "@/components/ui/Badge";
import { SOURCE_COLORS, SITE_URL } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";
import { AiSummary } from "./AiSummary";

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
  ai_summary: string | null;
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
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

  const sourceColor = SOURCE_COLORS[stire.source] ?? "#64748b";

  return (
    <div className="container-narrow py-8 md:py-12 max-w-4xl">
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={stire.image_url}
              alt={stire.title}
              className="w-full h-full object-cover"
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
          <a
            href={stire.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-[var(--color-primary)] hover:underline ml-auto"
          >
            <ExternalLink size={14} />
            {stire.source}
          </a>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-8">
        <div>
          {/* AI Synthesis */}
          <div className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border border-violet-200 dark:border-violet-800/40 rounded-[12px] p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Sparkles size={14} className="text-white" />
              </div>
              <div>
                <p className="font-[family-name:var(--font-sora)] font-bold text-sm">Sinteză Civia AI</p>
                <p className="text-[10px] text-[var(--color-text-muted)]">Rezumat generat automat din articolul original</p>
              </div>
            </div>
            <AiSummary
              stireId={stire.id}
              initialSummary={stire.ai_summary}
              fallbackText={stire.excerpt || stire.content || ""}
            />
          </div>

          {/* Original content */}
          {(stire.excerpt || stire.content) && (
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-6 mb-6">
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
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-5">
            <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-semibold mb-3">Sursă</p>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: sourceColor }}>
                {stire.source.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-sm">{stire.source}</p>
                <p className="text-xs text-[var(--color-text-muted)]">{categoryLabels[stire.category] ?? stire.category}</p>
              </div>
            </div>
            <a
              href={stire.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 w-full justify-center h-10 rounded-[8px] bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-colors"
            >
              <ExternalLink size={14} />
              Articolul complet
            </a>
          </div>

          {/* Info card */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-5">
            <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-semibold mb-3">Despre</p>
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
              Civia agregează știri din surse verificate și generează automat o sinteză AI pentru a facilita înțelegerea rapidă.
              Conținutul original aparține publicației {stire.source}.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
