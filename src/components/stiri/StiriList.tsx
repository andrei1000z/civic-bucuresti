"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, ArrowRight, RefreshCw, ExternalLink, Loader2 } from "lucide-react";
import { SOURCE_COLORS } from "@/lib/constants";
import { Badge } from "@/components/ui/Badge";
import { timeAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";

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

// Fallback gradient per source
const sourceGradients: Record<string, string> = {
  Digi24: "from-red-600 to-orange-800",
  "B365.ro": "from-emerald-600 to-teal-800",
  "Hotnews București": "from-amber-500 to-orange-700",
  "Buletin de București": "from-blue-600 to-indigo-800",
  "G4Media": "from-slate-700 to-zinc-900",
  "Euronews România": "from-purple-600 to-indigo-800",
};

export function StiriList() {
  const [rows, setRows] = useState<StireRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshMsg, setRefreshMsg] = useState<string | null>(null);
  const [category, setCategory] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(12);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category !== "all") params.set("category", category);
    if (query) params.set("q", query);
    params.set("limit", "100");
    try {
      const res = await fetch(`/api/stiri?${params.toString()}`);
      const json = await res.json();
      setRows(json.data ?? []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [category, query]);

  useEffect(() => {
    load();
  }, [load]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setRefreshMsg(null);
    try {
      const res = await fetch("/api/stiri/fetch", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Eroare refresh");
      setRefreshMsg(`✓ Actualizat: ${json.data.total} articole procesate`);
      await load();
    } catch (e) {
      setRefreshMsg(`✗ ${e instanceof Error ? e.message : "Eroare"}`);
    } finally {
      setRefreshing(false);
      setTimeout(() => setRefreshMsg(null), 4000);
    }
  };

  const featured = rows.find((r) => r.featured) ?? rows[0];
  const rest = rows.filter((r) => r.id !== featured?.id).slice(0, visible);

  return (
    <div>
      {/* Filter bar */}
      <div className="sticky top-16 z-30 -mx-4 md:mx-0 bg-[var(--color-bg)]/95 backdrop-blur py-4 mb-6 border-b border-[var(--color-border)]">
        <div className="container-narrow md:px-0">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex gap-2 overflow-x-auto no-scrollbar flex-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={cn(
                    "px-4 py-2 rounded-[20px] text-xs font-medium whitespace-nowrap transition-all",
                    category === cat.id
                      ? "bg-[var(--color-primary)] text-white"
                      : "bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface-2)]"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                  size={16}
                />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Caută știri..."
                  className="w-full h-10 pl-9 pr-4 rounded-[8px] bg-[var(--color-surface)] border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="h-10 px-4 rounded-[8px] bg-[var(--color-primary)] text-white text-xs font-medium hover:bg-[var(--color-primary-hover)] disabled:opacity-50 transition-colors inline-flex items-center gap-2 whitespace-nowrap"
                title="Fetch RSS feeds noi"
              >
                <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
                <span className="hidden sm:inline">Actualizează</span>
              </button>
            </div>
          </div>
          {refreshMsg && (
            <p className="text-xs text-[var(--color-text-muted)] mt-2">{refreshMsg}</p>
          )}
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-[var(--color-text-muted)] mb-4">
        {loading ? "Se încarcă..." : `${rows.length} articole din RSS real (Digi24, B365, Hotnews)`}
      </p>

      {loading && rows.length === 0 ? (
        <div className="py-20 text-center">
          <Loader2 size={28} className="animate-spin mx-auto text-[var(--color-text-muted)]" />
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-10 text-center">
          <p className="text-[var(--color-text-muted)] mb-4">
            Niciun articol în cache. Apasă <strong>Actualizează</strong> să preiei știri din RSS.
          </p>
          <p className="text-xs text-[var(--color-text-muted)]">
            Dacă nu funcționează, verifică că migrația <code>002_stiri_cache.sql</code> a rulat în Supabase.
          </p>
        </div>
      ) : (
        <>
          {/* Featured */}
          {featured && (
            <a
              href={featured.url}
              target="_blank"
              rel="noreferrer"
              className="group block mb-8 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] overflow-hidden hover:shadow-[var(--shadow-lg)] transition-all"
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
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover opacity-90"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <Badge bgColor={SOURCE_COLORS[featured.source] ?? "#64748b"} color="white">
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
                    <span>{timeAgo(featured.published_at)}</span>
                    <span className="flex items-center gap-1">
                      Citește <ExternalLink size={12} />
                    </span>
                  </div>
                </div>
              </div>
            </a>
          )}

          {/* Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {rest.map((stire) => (
              <a
                key={stire.id}
                href={stire.url}
                target="_blank"
                rel="noreferrer"
                className="group bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] overflow-hidden hover:-translate-y-1 hover:shadow-[var(--shadow-lg)] transition-all cursor-pointer"
              >
                <div
                  className={cn(
                    "relative h-40 bg-gradient-to-br",
                    sourceGradients[stire.source] ?? "from-slate-600 to-slate-800"
                  )}
                >
                  {stire.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={stire.image_url}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover opacity-90"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3">
                    <Badge bgColor={SOURCE_COLORS[stire.source] ?? "#64748b"} color="white">
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
                  <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)] pt-3 border-t border-[var(--color-border)]">
                    <span className="truncate">{stire.author ?? "Redacție"}</span>
                    <span className="shrink-0 ml-2 flex items-center gap-1">
                      {timeAgo(stire.published_at)} <ExternalLink size={11} />
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>

          {rows.length - 1 > visible && (
            <div className="flex justify-center mt-10">
              <button
                onClick={() => setVisible((v) => v + 12)}
                className="inline-flex items-center gap-2 h-11 px-6 rounded-[8px] bg-[var(--color-surface)] border border-[var(--color-border)] text-sm font-medium hover:bg-[var(--color-surface-2)] transition-colors"
              >
                Încarcă mai multe
                <ArrowRight size={14} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
