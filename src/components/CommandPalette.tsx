"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, FileText, Newspaper, BookOpen, Siren, Hash, Loader2, ArrowRight, X, MapPin, BarChart3, Map as MapIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchResult {
  type: "sesizare" | "ghid" | "eveniment" | "stire" | "page";
  title: string;
  url: string;
  excerpt?: string;
  meta?: string;
}

const TYPE_ICON = {
  sesizare: FileText,
  ghid: BookOpen,
  eveniment: Siren,
  stire: Newspaper,
  page: Hash,
};

const TYPE_COLOR = {
  sesizare: "text-red-500",
  ghid: "text-amber-500",
  eveniment: "text-purple-500",
  stire: "text-blue-500",
  page: "text-[var(--color-text-muted)]",
};

const TYPE_LABEL = {
  sesizare: "Sesizare",
  ghid: "Ghid",
  eveniment: "Eveniment",
  stire: "Știre",
  page: "Pagină",
};

const QUICK_LINKS = [
  { label: "Sesizări", url: "/sesizari", icon: FileText, color: "text-red-500" },
  { label: "Hărți", url: "/harti", icon: MapIcon, color: "text-blue-500" },
  { label: "Statistici", url: "/statistici", icon: BarChart3, color: "text-purple-500" },
  { label: "Știri", url: "/stiri", icon: Newspaper, color: "text-emerald-500" },
  { label: "Ghiduri", url: "/ghiduri", icon: BookOpen, color: "text-amber-500" },
  { label: "Evenimente", url: "/evenimente", icon: Siren, color: "text-pink-500" },
];

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape" && open) setOpen(false);
    };
    const customHandler = () => setOpen(true);
    document.addEventListener("keydown", handler);
    document.addEventListener("open-command-palette", customHandler);
    return () => {
      document.removeEventListener("keydown", handler);
      document.removeEventListener("open-command-palette", customHandler);
    };
  }, [open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
    else { setQuery(""); setResults([]); setActiveIdx(0); }
  }, [open]);

  useEffect(() => {
    if (!query || query.length < 2) { setResults([]); return; }
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: controller.signal });
        const json = await res.json();
        setResults(json.data ?? []);
        setActiveIdx(0);
      } catch { /* aborted */ }
      finally { setLoading(false); }
    }, 200);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [query]);

  const handleSelect = useCallback((url: string) => {
    setOpen(false);
    if (url.startsWith("http")) window.open(url, "_blank", "noopener,noreferrer");
    else router.push(url);
  }, [router]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (results.length === 0) return;
      if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx((i) => (i + 1) % results.length); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx((i) => (i - 1 + results.length) % results.length); }
      else if (e.key === "Enter") { e.preventDefault(); handleSelect(results[activeIdx].url); }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, results, activeIdx, handleSelect]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-md flex items-start justify-center pt-[12vh] p-4"
      onClick={() => setOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[16px] shadow-2xl overflow-hidden"
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-5 h-14 border-b border-[var(--color-border)]">
          <Search size={18} className="text-[var(--color-primary)] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Caută pe Civia..."
            className="flex-1 bg-transparent text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none text-sm"
          />
          {loading && <Loader2 size={14} className="animate-spin text-[var(--color-primary)]" />}
          <button onClick={() => setOpen(false)} className="w-7 h-7 rounded-[6px] bg-[var(--color-surface-2)] flex items-center justify-center hover:bg-[var(--color-border)] transition-colors">
            <X size={12} className="text-[var(--color-text-muted)]" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[55vh] overflow-y-auto">
          {query.length < 2 ? (
            <div className="p-4">
              <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-semibold mb-3 px-1">Acces rapid</p>
              <div className="grid grid-cols-3 gap-2">
                {QUICK_LINKS.map((link) => {
                  const Icon = link.icon;
                  return (
                    <button
                      key={link.url}
                      onClick={() => handleSelect(link.url)}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-[10px] hover:bg-[var(--color-surface-2)] transition-colors"
                    >
                      <Icon size={18} className={link.color} />
                      <span className="text-xs font-medium">{link.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : results.length === 0 && !loading ? (
            <div className="p-8 text-center">
              <Search size={24} className="mx-auto mb-2 text-[var(--color-text-muted)] opacity-30" />
              <p className="text-sm text-[var(--color-text-muted)]">Niciun rezultat pentru „{query}"</p>
            </div>
          ) : (
            <ul className="py-1">
              {results.map((r, i) => {
                const Icon = TYPE_ICON[r.type];
                return (
                  <li key={`${r.type}-${r.url}-${i}`}>
                    <button
                      onClick={() => handleSelect(r.url)}
                      onMouseEnter={() => setActiveIdx(i)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                        i === activeIdx ? "bg-[var(--color-primary-soft)]" : "hover:bg-[var(--color-surface-2)]"
                      )}
                    >
                      <div className={cn("w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0", i === activeIdx ? "bg-[var(--color-primary)]/10" : "bg-[var(--color-surface-2)]")}>
                        <Icon size={14} className={TYPE_COLOR[r.type]} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{r.title}</p>
                        <p className="text-[10px] text-[var(--color-text-muted)] truncate">
                          {TYPE_LABEL[r.type]}{r.meta ? ` · ${r.meta}` : ""}
                        </p>
                      </div>
                      {i === activeIdx && <ArrowRight size={12} className="text-[var(--color-primary)] shrink-0" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-[var(--color-border)] flex items-center justify-between">
          <div className="flex items-center gap-3 text-[10px] text-[var(--color-text-muted)]">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-[var(--color-surface-2)] font-mono text-[9px]">↑↓</kbd> navighează
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-[var(--color-surface-2)] font-mono text-[9px]">↵</kbd> deschide
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-[var(--color-surface-2)] font-mono text-[9px]">esc</kbd> închide
            </span>
          </div>
          <span className="flex items-center gap-1 text-[10px] text-[var(--color-text-muted)]">
            <MapPin size={8} /> civia.ro
          </span>
        </div>
      </div>
    </div>
  );
}
