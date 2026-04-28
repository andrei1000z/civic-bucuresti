"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, ArrowRight, ExternalLink, Loader2 } from "lucide-react";
import { SOURCE_COLORS } from "@/lib/constants";
import { Badge } from "@/components/ui/Badge";
import { TimeAgo } from "@/components/ui/TimeAgo";
import { cn } from "@/lib/utils";
import { useCountyOptional } from "@/lib/county-context";

const SOURCE_LOGOS: Record<string, string> = {
  "Digi24": "/images/sources/digi24.png",
  "Hotnews": "/images/sources/hotnews.png",
  "G4Media": "/images/sources/g4media.png",
  "Mediafax": "/images/sources/mediafax.png",
  "News.ro": "/images/sources/newsro.png",
  "B365.ro": "/images/sources/b365.png",
};

interface StireRow {
  id: string;
  url: string;
  title: string;
  excerpt: string;
  source: string;
  category: string;
  author: string | null;
  image_url: string | null;
  published_at: string;
  featured: boolean;
}

const categories = [
  { id: "all", label: "Toate" },
  { id: "transport", label: "Transport" },
  { id: "urbanism", label: "Urbanism" },
  { id: "mediu", label: "Mediu" },
  { id: "siguranta", label: "Siguranță" },
  { id: "administratie", label: "Administrație" },
  { id: "eveniment", label: "Evenimente" },
];

// Fallback gradient per source (when no image)
const sourceGradients: Record<string, string> = {
  Digi24: "from-red-600 to-red-900",
  "B365.ro": "from-emerald-600 to-emerald-900",
  Hotnews: "from-amber-600 to-amber-900",
  "G4Media": "from-slate-600 to-slate-900",
  Mediafax: "from-sky-600 to-sky-900",
  "News.ro": "from-green-600 to-green-900",
  "Monitorul CJ": "from-violet-600 to-violet-900",
  "Ziarul de Iași": "from-indigo-600 to-indigo-900",
  "Opinia Timișoarei": "from-pink-600 to-pink-900",
  "Știri Suceava": "from-teal-600 to-teal-900",
  "Ediția de Dimineață": "from-amber-500 to-amber-800",
  "Gazeta BT": "from-purple-600 to-purple-900",
};

export function StiriList() {
  const county = useCountyOptional();
  const [rows, setRows] = useState<StireRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [category, setCategory] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(12);

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setFetchError(null);
    const params = new URLSearchParams();
    if (category !== "all") params.set("category", category);
    if (query) params.set("q", query);
    if (county) params.set("county", county.id);
    params.set("limit", "100");
    try {
      const res = await fetch(`/api/stiri?${params.toString()}`, { signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (signal?.aborted) return;
      setRows(json.data ?? []);
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return;
      setRows([]);
      setFetchError(e instanceof Error ? e.message : "Eroare");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [category, query, county]);

  useEffect(() => {
    const ctrl = new AbortController();
    load(ctrl.signal);
    return () => ctrl.abort();
  }, [load]);

  // Prefer featured articles with images, then any with images, then first
  const featured = rows.find((r) => r.featured && r.image_url)
    ?? rows.find((r) => r.image_url)
    ?? rows[0];
  const rest = rows.filter((r) => r.id !== featured?.id).slice(0, visible);

  return (
    <div>
      {/* Filter bar */}
      <div className="sticky top-16 z-30 bg-[var(--color-bg)]/95 backdrop-blur py-4 mb-6 border-b border-[var(--color-border)]">
        <div>
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex gap-2 overflow-x-auto no-scrollbar flex-1" role="tablist" aria-label="Filtre categorie știri">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  role="tab"
                  aria-selected={category === cat.id}
                  className={cn(
                    "px-4 py-2 rounded-[20px] text-xs font-medium whitespace-nowrap transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]",
                    category === cat.id
                      ? "bg-[var(--color-primary)] text-white"
                      : "bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface-2)]"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <div className="relative flex-1 sm:w-64">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none"
                size={16}
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Caută în titlu..."
                aria-label="Caută în titlurile știrilor"
                className="w-full h-10 pl-9 pr-4 rounded-[8px] bg-[var(--color-surface)] border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results count — plural-aware + reflects filters */}
      <p className="text-sm text-[var(--color-text-muted)] mb-4" aria-live="polite">
        {loading
          ? "Se încarcă..."
          : rows.length === 1
            ? "1 articol găsit"
            : rows.length === 0
              ? "Niciun articol"
              : `${rows.length} articole${query || category !== "all" ? " (filtrat)" : ""} · sursele: Digi24, B365, Hotnews`}
      </p>

      {loading && rows.length === 0 ? (
        <div className="py-20 text-center" role="status" aria-label="Se încarcă știrile">
          <Loader2 size={28} className="animate-spin mx-auto text-[var(--color-text-muted)]" aria-hidden="true" />
          <span className="sr-only">Se încarcă știrile...</span>
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] shadow-[var(--shadow-1)] p-10 text-center">
          {fetchError ? (
            <>
              <p className="text-[var(--color-text-muted)] mb-2">
                Nu am putut încărca știrile.
              </p>
              <p className="text-xs text-[var(--color-text-muted)] mb-4">
                Eroare: {fetchError}. Verifică conexiunea și încearcă din nou.
              </p>
              <button
                type="button"
                onClick={() => load()}
                className="inline-flex items-center gap-2 h-9 px-4 rounded-[8px] bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-primary)]"
              >
                Reîncearcă
              </button>
            </>
          ) : (
            <>
              <p className="text-[var(--color-text-muted)] mb-2">Știrile se actualizează.</p>
              <p className="text-xs text-[var(--color-text-muted)]">
                Revino în câteva minute sau încearcă alt filtru.
              </p>
            </>
          )}
        </div>
      ) : (
        <>
          {/* Featured */}
          {featured && (
            <Link
              href={`/stiri/${featured.id}`}
              className="group block mb-8 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-2)] overflow-hidden hover:shadow-[var(--shadow-4)] hover:-translate-y-0.5 transition-all"
            >
              <div className="grid md:grid-cols-[1.2fr_1fr]">
                <div
                  className={cn(
                    "relative h-64 md:h-auto bg-gradient-to-br",
                    sourceGradients[featured.source] ?? "from-slate-600 to-slate-800"
                  )}
                >
                  {featured.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={featured.image_url}
                      alt={featured.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-90"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <Badge bgColor={SOURCE_COLORS[featured.source] ?? "#64748b"} color="white" className="flex items-center gap-1.5">
                      {SOURCE_LOGOS[featured.source] && (
                        <Image
                          src={SOURCE_LOGOS[featured.source] ?? ""}
                          alt=""
                          width={16}
                          height={16}
                          className="w-4 h-4 rounded-sm object-contain"
                          unoptimized
                        />
                      )}
                      {featured.source}
                    </Badge>
                    <Badge className="bg-black/40 text-white border border-white/20">Featured</Badge>
                  </div>
                </div>
                <div className="p-6 md:p-8 flex flex-col">
                  <Badge variant="primary" className="w-fit mb-3">{featured.category}</Badge>
                  <h2 className="font-[family-name:var(--font-sora)] text-2xl md:text-3xl font-bold mb-3 group-hover:text-[var(--color-primary)] transition-colors">
                    {featured.title}
                  </h2>
                  <p className="text-[var(--color-text-muted)] mb-4 flex-1 line-clamp-4">{featured.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)] pt-4 border-t border-[var(--color-border)]">
                    <TimeAgo date={featured.published_at} />
                    <span className="flex items-center gap-1">
                      Citește <ExternalLink size={12} aria-hidden="true" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {rest.map((stire) => (
              <Link
                key={stire.id}
                href={`/stiri/${stire.id}`}
                className="group bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] shadow-[var(--shadow-1)] overflow-hidden hover:-translate-y-1 hover:shadow-[var(--shadow-3)] transition-all cursor-pointer"
              >
                <div
                  className={cn(
                    "relative h-40 bg-gradient-to-br",
                    sourceGradients[stire.source] ?? "from-slate-600 to-slate-800"
                  )}
                >
                  {stire.image_url ? (
                    <Image
                      src={stire.image_url}
                      alt={stire.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover opacity-90"
                      unoptimized
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-5xl font-bold text-white/20 select-none">
                        {stire.source.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3">
                    <Badge bgColor={SOURCE_COLORS[stire.source] ?? "#64748b"} color="white" className="flex items-center gap-1.5">
                      {SOURCE_LOGOS[stire.source] && (
                        <Image
                          src={SOURCE_LOGOS[stire.source] ?? ""}
                          alt=""
                          width={14}
                          height={14}
                          className="w-3.5 h-3.5 rounded-sm object-contain"
                          unoptimized
                        />
                      )}
                      {stire.source}
                    </Badge>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <Badge className="bg-black/40 text-white border border-white/20 uppercase text-[10px]">
                      {stire.category}
                    </Badge>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-base mb-2 line-clamp-2 group-hover:text-[var(--color-primary)] transition-colors">
                    {stire.title}
                  </h3>
                  <p className="text-sm text-[var(--color-text-muted)] line-clamp-2 mb-4">{stire.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)] pt-3 border-t border-[var(--color-border)] gap-2 min-w-0">
                    <span className="truncate min-w-0 flex-1">{stire.author ?? "Redacție"}</span>
                    <TimeAgo date={stire.published_at} className="shrink-0 ml-2" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {rows.length - 1 > visible && (
            <div className="flex justify-center mt-10">
              <button
                type="button"
                onClick={() => setVisible((v) => v + 12)}
                className="inline-flex items-center gap-2 h-11 px-6 rounded-[8px] bg-[var(--color-surface)] border border-[var(--color-border)] text-sm font-medium hover:bg-[var(--color-surface-2)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]"
              >
                Încarcă mai multe
                <ArrowRight size={14} aria-hidden="true" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
