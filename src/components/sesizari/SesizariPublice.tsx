"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ThumbsUp, MessageSquare, MapPin, Filter, Image as ImgIcon, Loader2, Map as MapIconLucide, List, Link as LinkIcon, Check } from "lucide-react";
import dynamic from "next/dynamic";
import { ShareButton } from "./ShareButton";

const SesizariMap = dynamic(() => import("@/components/maps/SesizariMap").then((m) => m.SesizariMap), { ssr: false });
import { STATUS_COLORS, STATUS_LABELS, SESIZARE_TIPURI, SECTOARE } from "@/lib/constants";
import { timeAgo, cn } from "@/lib/utils";
import { stripForPreview } from "@/lib/privacy";
import { Badge } from "@/components/ui/Badge";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import type { SesizareFeedRow } from "@/lib/supabase/types";
import { useCountyOptional } from "@/lib/county-context";

type SortKey = "recent" | "votate";
type ViewMode = "list" | "map";

const PAGE_SIZE = 20;

export function SesizariPublice() {
  const county = useCountyOptional();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [rows, setRows] = useState<SesizareFeedRow[]>([]);
  // Read initial filter state from URL — so shared links carry filters
  const [filterTip, setFilterTip] = useState<string>(
    () => searchParams.get("tip") || "toate",
  );
  const [filterStatus, setFilterStatus] = useState<string>(
    () => searchParams.get("status") || "toate",
  );
  const [filterSector, setFilterSector] = useState<string>(
    () => searchParams.get("sector") || "toate",
  );
  const [sort, setSort] = useState<SortKey>(
    () => (searchParams.get("sort") === "votate" ? "votate" : "recent"),
  );
  const [view, setView] = useState<ViewMode>(
    () => (searchParams.get("view") === "map" ? "map" : "list"),
  );
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [copied, setCopied] = useState(false);

  // Push filter state into URL (replace, no history pollution)
  // — so a copy-paste of current URL preserves exact view.
  useEffect(() => {
    const params = new URLSearchParams();
    if (filterTip !== "toate") params.set("tip", filterTip);
    if (filterStatus !== "toate") params.set("status", filterStatus);
    if (filterSector !== "toate") params.set("sector", filterSector);
    if (sort !== "recent") params.set("sort", sort);
    if (view !== "list") params.set("view", view);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [filterTip, filterStatus, filterSector, sort, view, router, pathname]);

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  // "loading" is derived: true when last-fetched key differs from current filter key
  const fetchKey = `${filterTip}|${filterStatus}|${filterSector}|${sort}|${county?.id ?? "all"}`;
  const [lastFetchedKey, setLastFetchedKey] = useState<string | null>(null);
  const loading = lastFetchedKey !== fetchKey;

  // Fetch from API
  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams();
    if (filterTip !== "toate") params.set("tip", filterTip);
    if (filterStatus !== "toate") params.set("status", filterStatus);
    if (filterSector !== "toate") params.set("sector", filterSector);
    if (county) params.set("county", county.id);
    params.set("sort", sort);
    params.set("limit", String(PAGE_SIZE));
    params.set("offset", "0");

    fetch(`/api/sesizari?${params.toString()}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((j) => {
        const data = j.data ?? [];
        setRows(data);
        setHasMore(data.length >= PAGE_SIZE);
        setLastFetchedKey(fetchKey);
      })
      .catch((err) => {
        if (err.name !== "AbortError") setLastFetchedKey(fetchKey);
      });

    return () => controller.abort();
  }, [filterTip, filterStatus, filterSector, sort, fetchKey]);

  // Realtime subscribe to new sesizari
  useEffect(() => {
    const supabase = createSupabaseBrowser();
    const channel = supabase
      .channel("sesizari-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "sesizari" },
        (payload: { new: SesizareFeedRow }) => {
          const row = payload.new as SesizareFeedRow;
          if (row.publica && row.moderation_status === "approved") {
            setRows((prev) => [
              { ...row, upvotes: 0, downvotes: 0, voturi_net: 0, nr_comentarii: 0 },
              ...prev,
            ]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filtered = rows;

  return (
    <div>
      {/* View toggle */}
      <div className="flex items-center gap-2 mb-4">
        <div className="inline-flex rounded-[8px] bg-[var(--color-surface-2)] p-1">
          <button
            onClick={() => setView("list")}
            aria-pressed={view === "list"}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-xs font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]",
              view === "list" ? "bg-[var(--color-surface)] shadow-sm" : "text-[var(--color-text-muted)]"
            )}
          >
            <List size={14} /> Listă
          </button>
          <button
            onClick={() => setView("map")}
            aria-pressed={view === "map"}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-xs font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]",
              view === "map" ? "bg-[var(--color-surface)] shadow-sm" : "text-[var(--color-text-muted)]"
            )}
          >
            <MapIconLucide size={14} /> Hartă
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={16} className="text-[var(--color-text-muted)]" />
          <span className="text-sm font-medium">Filtrează</span>
          {loading && <Loader2 size={14} className="animate-spin text-[var(--color-text-muted)]" />}
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
          <select value={filterTip} onChange={(e) => setFilterTip(e.target.value)} className={selectClass}>
            <option value="toate">Toate tipurile</option>
            {SESIZARE_TIPURI.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={selectClass}>
            <option value="toate">Orice status</option>
            <option value="nou">Nou</option>
            <option value="in-lucru">În lucru</option>
            <option value="rezolvat">Rezolvat</option>
          </select>
          <select value={filterSector} onChange={(e) => setFilterSector(e.target.value)} className={selectClass}>
            <option value="toate">Toate sectoarele</option>
            {SECTOARE.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className={selectClass}>
            <option value="recent">Cele mai recente</option>
            <option value="votate">Cele mai votate</option>
          </select>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between text-xs gap-2">
          <span className="text-[var(--color-text-muted)]">
            {filtered.length} sesizări găsite · 🔴 live
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={copyUrl}
              className="inline-flex items-center gap-1 text-[var(--color-primary)] hover:underline font-medium"
              title="Copiază link cu filtrul curent"
            >
              {copied ? <Check size={11} /> : <LinkIcon size={11} />}
              {copied ? "Link copiat" : "Copiază link"}
            </button>
            {(() => {
              const params = new URLSearchParams();
              if (filterTip !== "toate") params.set("tip", filterTip);
              if (filterStatus !== "toate") params.set("status", filterStatus);
              if (filterSector !== "toate") params.set("sector", filterSector);
              const exportUrl = `/api/sesizari/export?${params.toString()}`;
              return (
                <a
                  href={exportUrl}
                  className="inline-flex items-center gap-1 text-[var(--color-primary)] hover:underline font-medium"
                  title="Descarcă CSV cu filtrul curent"
                >
                  📥 Export CSV
                </a>
              );
            })()}
          </div>
        </div>
      </div>

      {view === "map" && filtered.length > 0 ? (
        <SesizariMap limit={50} height="600px" zoom={12} />
      ) : loading && rows.length === 0 ? (
        <div className="grid md:grid-cols-2 gap-4 min-w-0">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-5 animate-pulse">
              <div className="flex gap-2 mb-3">
                <div className="h-5 w-16 rounded-full bg-[var(--color-surface-2)]" />
                <div className="h-5 w-20 rounded-full bg-[var(--color-surface-2)]" />
              </div>
              <div className="h-5 bg-[var(--color-surface-2)] rounded w-3/4 mb-2" />
              <div className="h-3 bg-[var(--color-surface-2)] rounded w-1/2 mb-3" />
              <div className="h-3 bg-[var(--color-surface-2)] rounded w-full mb-1" />
              <div className="h-3 bg-[var(--color-surface-2)] rounded w-4/5" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        (() => {
          const hasActiveFilter =
            filterTip !== "toate" || filterStatus !== "toate" || filterSector !== "toate";
          return (
            <div className="py-20 text-center">
              <div className="text-6xl mb-4 opacity-40">📮</div>
              <p className="text-lg font-semibold mb-2">
                {hasActiveFilter
                  ? "Nu există sesizări cu filtrele actuale"
                  : "Fii primul care semnalează ceva în această zonă"}
              </p>
              <p className="text-sm text-[var(--color-text-muted)] mb-6 max-w-md mx-auto">
                {hasActiveFilter
                  ? "Încearcă alte combinații de filtre, sau resetează-le ca să vezi toate sesizările disponibile."
                  : "Platforma e gratuită și nu cere cont. 2 minute — noi scriem textul formal, identificăm autoritatea competentă, tu primești un cod de urmărire."}
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {hasActiveFilter && (
                  <button
                    type="button"
                    onClick={() => {
                      setFilterTip("toate");
                      setFilterStatus("toate");
                      setFilterSector("toate");
                      setSort("recent");
                    }}
                    className="inline-flex items-center gap-2 h-10 px-4 rounded-[8px] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-sm font-medium hover:bg-[var(--color-surface)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                  >
                    <span aria-hidden="true">🔄</span> Resetează filtrele
                  </button>
                )}
                <Link
                  href={county ? `/${county.slug}/sesizari` : "/sesizari"}
                  className="inline-flex items-center gap-2 h-10 px-4 rounded-[8px] bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-primary)]"
                >
                  Fă o sesizare acum →
                </Link>
              </div>
            </div>
          );
        })()
      ) : (
        <>
        <div className="grid md:grid-cols-2 gap-4 min-w-0">
          {filtered.map((s) => {
            const tipLabel = SESIZARE_TIPURI.find((t) => t.value === s.tip)?.label ?? s.tip;
            const tipIcon = SESIZARE_TIPURI.find((t) => t.value === s.tip)?.icon ?? "📝";
            return (
              <Link
                key={s.id}
                href={`/sesizari/${s.code}`}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-5 hover:shadow-[var(--shadow-md)] hover:border-[var(--color-primary)]/30 transition-all overflow-hidden min-w-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
                aria-label={`${s.titlu} — ${STATUS_LABELS[s.status]}, ${s.upvotes} ${s.upvotes === 1 ? "vot" : "voturi"}`}
              >
                <div className="flex items-start justify-between mb-3 gap-2 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    <Badge bgColor={STATUS_COLORS[s.status]} color="white">
                      {STATUS_LABELS[s.status]}
                    </Badge>
                    <Badge variant="neutral">
                      <span className="mr-1" aria-hidden="true">{tipIcon}</span>
                      {tipLabel}
                    </Badge>
                    {s.formal_text && (
                      <span
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 text-[10px] font-medium"
                        title="Text rescris cu AI în limbaj formal"
                      >
                        <span aria-hidden="true">✨</span> AI
                      </span>
                    )}
                  </div>
                  <time
                    dateTime={s.created_at}
                    className="text-xs text-[var(--color-text-muted)] shrink-0 whitespace-nowrap"
                    suppressHydrationWarning
                  >
                    {timeAgo(s.created_at)}
                  </time>
                </div>
                <h3 className="font-semibold mb-1 line-clamp-2 break-words">{s.titlu}</h3>
                <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] mb-2 min-w-0">
                  <MapPin size={12} className="shrink-0" aria-hidden="true" />
                  <span className="truncate flex-1 min-w-0">{s.locatie}</span>
                  <span className="shrink-0" aria-hidden="true">·</span>
                  <span className="shrink-0">{s.sector}</span>
                </div>
                <p className="text-sm text-[var(--color-text)] mb-3 line-clamp-2 break-words">
                  {s.formal_text ? stripForPreview(s.formal_text) : s.descriere}
                </p>
                {(s.imagini.length > 0 || s.resolved_photo_url) && (
                  <div className="flex gap-1 mb-3">
                    {s.imagini.slice(0, s.resolved_photo_url ? 2 : 3).map((url, i) => (
                      <div key={i} className="relative w-14 h-14 rounded-[8px] bg-[var(--color-surface-2)] overflow-hidden flex items-center justify-center">
                        {url.startsWith("http") ? (
                          <Image src={url} alt={`Fotografie sesizare ${s.code ?? ""}`} fill sizes="56px" className="object-cover" />
                        ) : (
                          <ImgIcon size={16} className="text-[var(--color-text-muted)]" aria-label="Imagine indisponibilă" />
                        )}
                        {i === 0 && s.resolved_photo_url && (
                          <span className="absolute bottom-0 inset-x-0 bg-red-500/90 text-white text-[8px] font-bold text-center leading-tight py-0.5">
                            BEFORE
                          </span>
                        )}
                      </div>
                    ))}
                    {s.resolved_photo_url && (
                      <div className="relative w-14 h-14 rounded-[8px] overflow-hidden ring-2 ring-emerald-500">
                        <Image src={s.resolved_photo_url} alt="După" fill sizes="56px" className="object-cover" />
                        <span className="absolute bottom-0 inset-x-0 bg-emerald-500/90 text-white text-[8px] font-bold text-center leading-tight py-0.5">
                          AFTER
                        </span>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)] gap-2 min-w-0">
                  <span className="text-xs text-[var(--color-text-muted)] truncate min-w-0 flex-1">
                    de {s.author_name} <span aria-hidden="true">·</span> <span className="font-mono" aria-label={`cod ${s.code}`}>{s.code}</span>
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]"
                      aria-label={`${s.upvotes} ${s.upvotes === 1 ? "vot" : "voturi"}`}
                    >
                      <ThumbsUp size={13} aria-hidden="true" />
                      <span className="font-medium tabular-nums">{s.upvotes}</span>
                    </span>
                    <span
                      className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]"
                      aria-label={`${s.nr_comentarii} ${s.nr_comentarii === 1 ? "comentariu" : "comentarii"}`}
                    >
                      <MessageSquare size={13} aria-hidden="true" />
                      <span className="font-medium tabular-nums">{s.nr_comentarii}</span>
                    </span>
                    <ShareButton code={s.code} size="sm" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Load more */}
        {hasMore && filtered.length >= PAGE_SIZE && (
          <div className="flex justify-center mt-8">
            <button
              onClick={async () => {
                setLoadingMore(true);
                const params = new URLSearchParams();
                if (filterTip !== "toate") params.set("tip", filterTip);
                if (filterStatus !== "toate") params.set("status", filterStatus);
                if (filterSector !== "toate") params.set("sector", filterSector);
                if (county) params.set("county", county.id);
                params.set("sort", sort);
                params.set("limit", String(PAGE_SIZE));
                params.set("offset", String(rows.length));
                try {
                  const res = await fetch(`/api/sesizari?${params.toString()}`);
                  const j = await res.json();
                  const newRows = (j.data ?? []) as SesizareFeedRow[];
                  setRows((prev) => [...prev, ...newRows]);
                  setHasMore(newRows.length >= PAGE_SIZE);
                } catch {
                  // silent
                } finally {
                  setLoadingMore(false);
                }
              }}
              disabled={loadingMore}
              className="inline-flex items-center gap-2 h-11 px-6 rounded-[8px] bg-[var(--color-surface)] border border-[var(--color-border)] text-sm font-medium hover:bg-[var(--color-surface-2)] disabled:opacity-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
            >
              {loadingMore ? (
                <><Loader2 size={14} className="animate-spin" /> Se încarcă...</>
              ) : (
                <>Încarcă mai multe sesizări</>
              )}
            </button>
          </div>
        )}
        </>
      )}
    </div>
  );
}

const selectClass = cn(
  "w-full h-10 px-3 rounded-[8px] bg-[var(--color-surface)]",
  "border border-[var(--color-border)] text-sm",
  "focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
);
