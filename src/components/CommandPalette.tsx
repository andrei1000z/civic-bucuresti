"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, FileText, Newspaper, BookOpen, Siren, MapPin, Hash, Loader2, Command } from "lucide-react";
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

const TYPE_LABEL = {
  sesizare: "Sesizare",
  ghid: "Ghid",
  eveniment: "Eveniment",
  stire: "Știre",
  page: "Pagină",
};

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Cmd+K / Ctrl+K global shortcut + custom event from Navbar search button
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    const customHandler = () => setOpen(true);
    document.addEventListener("keydown", handler);
    document.addEventListener("open-command-palette", customHandler);
    return () => {
      document.removeEventListener("keydown", handler);
      document.removeEventListener("open-command-palette", customHandler);
    };
  }, [open]);

  // Focus input on open
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults([]);
      setActiveIdx(0);
    }
  }, [open]);

  // Debounced search
  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }
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
      } catch {
        // aborted or error
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const handleSelect = useCallback((r: SearchResult) => {
    setOpen(false);
    if (r.url.startsWith("http")) {
      window.open(r.url, "_blank", "noopener,noreferrer");
    } else {
      router.push(r.url);
    }
  }, [router]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (results.length === 0) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx((i) => (i + 1) % results.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx((i) => (i - 1 + results.length) % results.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        handleSelect(results[activeIdx]);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, results, activeIdx, handleSelect]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[150] bg-black/50 backdrop-blur-sm flex items-start justify-center pt-[10vh] p-4"
      onClick={() => setOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-[var(--color-surface)] rounded-[12px] shadow-[var(--shadow-xl)] overflow-hidden animate-fade-in-up"
      >
        <div className="flex items-center gap-3 px-4 border-b border-[var(--color-border)]">
          <Search size={20} className="text-[var(--color-text-muted)] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Caută sesizări, ghiduri, evenimente, pagini..."
            className="flex-1 h-14 bg-transparent text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none text-base"
          />
          {loading && <Loader2 size={16} className="animate-spin text-[var(--color-text-muted)]" />}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded border border-[var(--color-border)] text-[10px] text-[var(--color-text-muted)] font-mono">
            ESC
          </kbd>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {query.length < 2 ? (
            <div className="p-8 text-center text-sm text-[var(--color-text-muted)]">
              <Command size={28} className="mx-auto mb-3 opacity-50" />
              <p>Scrie minim 2 caractere să cauți</p>
              <div className="flex flex-wrap gap-2 justify-center mt-4 text-xs">
                <button onClick={() => setQuery("sesizari")} className="px-2 py-1 rounded bg-[var(--color-surface-2)]">sesizari</button>
                <button onClick={() => setQuery("groapa")} className="px-2 py-1 rounded bg-[var(--color-surface-2)]">groapa</button>
                <button onClick={() => setQuery("bilete")} className="px-2 py-1 rounded bg-[var(--color-surface-2)]">bilete</button>
                <button onClick={() => setQuery("cutremur")} className="px-2 py-1 rounded bg-[var(--color-surface-2)]">cutremur</button>
              </div>
            </div>
          ) : results.length === 0 && !loading ? (
            <div className="p-8 text-center text-sm text-[var(--color-text-muted)]">
              Niciun rezultat pentru &quot;{query}&quot;
            </div>
          ) : (
            <ul>
              {results.map((r, i) => {
                const Icon = TYPE_ICON[r.type];
                return (
                  <li key={`${r.type}-${r.url}-${i}`}>
                    <button
                      onClick={() => handleSelect(r)}
                      onMouseEnter={() => setActiveIdx(i)}
                      className={cn(
                        "w-full flex items-start gap-3 px-4 py-3 text-left border-b border-[var(--color-border)] last:border-b-0 transition-colors",
                        i === activeIdx && "bg-[var(--color-primary-soft)]"
                      )}
                    >
                      <Icon size={16} className="text-[var(--color-text-muted)] mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] font-semibold">
                            {TYPE_LABEL[r.type]}
                          </span>
                          {r.meta && (
                            <span className="text-[10px] text-[var(--color-text-muted)]">· {r.meta}</span>
                          )}
                        </div>
                        <p className="font-medium text-sm truncate">{r.title}</p>
                        {r.excerpt && (
                          <p className="text-xs text-[var(--color-text-muted)] truncate mt-0.5">{r.excerpt}</p>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="px-4 py-2 border-t border-[var(--color-border)] flex items-center justify-between text-[10px] text-[var(--color-text-muted)]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded border border-[var(--color-border)] font-mono">↑↓</kbd> navighezi
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded border border-[var(--color-border)] font-mono">Enter</kbd> deschide
            </span>
          </div>
          <span className="flex items-center gap-1">
            <MapPin size={10} /> civia.ro
          </span>
        </div>
      </div>
    </div>
  );
}
