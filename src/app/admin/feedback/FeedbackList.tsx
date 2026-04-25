"use client";

import { useState } from "react";
import { Check, Archive, AlertCircle, Copy, Mail, ExternalLink } from "lucide-react";

interface Row {
  id: string;
  text: string;
  email: string | null;
  topic: string | null;
  page_path: string | null;
  ip_hash: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
}

const TOPIC_LABELS: Record<string, string> = {
  gdpr: "🔒 GDPR",
  bug: "🐛 Bug",
  idee: "💡 Idee",
  contact: "✉️ Contact",
  altele: "📝 Altele",
};

function statusStyles(status: string) {
  switch (status) {
    case "replied":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300";
    case "archived":
      return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200";
    case "spam":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
    default:
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
  }
}

export function FeedbackList({ rows: initial }: { rows: Row[] }) {
  const [rows, setRows] = useState(initial);
  const [acting, setActing] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "replied" | "archived" | "spam">("pending");

  const updateStatus = async (id: string, status: Row["status"]) => {
    setActing(id);
    try {
      const res = await fetch(`/api/admin/feedback/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Eroare");
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Eroare");
    } finally {
      setActing(null);
    }
  };

  const filtered = filter === "all" ? rows : rows.filter((r) => r.status === filter);
  const counts = {
    all: rows.length,
    pending: rows.filter((r) => r.status === "pending").length,
    replied: rows.filter((r) => r.status === "replied").length,
    archived: rows.filter((r) => r.status === "archived").length,
    spam: rows.filter((r) => r.status === "spam").length,
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-6" role="group" aria-label="Filtrează mesaje">
        {(["all", "pending", "replied", "archived", "spam"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] ${
              filter === f
                ? "bg-[var(--color-primary)] text-white"
                : "bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:bg-[var(--color-border)]"
            }`}
          >
            {f === "all" ? "Toate" : f === "pending" ? "Nerăspuns" : f === "replied" ? "Răspuns" : f === "archived" ? "Arhivate" : "Spam"}
            <span className="ml-1 opacity-70 tabular-nums">({counts[f]})</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-[var(--color-text-muted)] py-16 text-sm">
          Niciun mesaj {filter !== "all" ? `cu status „${filter}"` : ""}.
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <article
              key={r.id}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-5"
            >
              <header className="flex items-start justify-between gap-2 mb-3 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${statusStyles(r.status)}`}
                  >
                    {r.status}
                  </span>
                  {r.topic && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[var(--color-bg)] border border-[var(--color-border)]">
                      {TOPIC_LABELS[r.topic] ?? r.topic}
                    </span>
                  )}
                  <span className="font-mono text-[10px] text-[var(--color-text-muted)]">
                    {r.id.slice(0, 8)}
                  </span>
                  <span className="text-xs text-[var(--color-text-muted)]">
                    {new Date(r.created_at).toLocaleString("ro-RO")}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(r.text)}
                  aria-label="Copiază textul mesajului"
                  className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors p-1 -m-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                >
                  <Copy size={14} aria-hidden="true" />
                </button>
              </header>

              <p className="text-sm leading-relaxed whitespace-pre-wrap mb-3">
                {r.text}
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--color-text-muted)] mb-4">
                {r.email && (
                  <a
                    href={`mailto:${r.email}?subject=${encodeURIComponent(
                      `Re: Feedback Civia (${r.id.slice(0, 8)})`,
                    )}&body=${encodeURIComponent(
                      `Salut,\n\nMulțumim pentru mesajul tău:\n\n> ${r.text
                        .split("\n")
                        .join("\n> ")}\n\n---\nRăspuns:\n\n`,
                    )}`}
                    className="inline-flex items-center gap-1 text-[var(--color-primary)] hover:underline font-medium"
                  >
                    <Mail size={12} aria-hidden="true" /> {r.email}
                  </a>
                )}
                {r.page_path && (
                  <a
                    href={r.page_path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:text-[var(--color-primary)]"
                  >
                    <ExternalLink size={11} aria-hidden="true" /> {r.page_path}
                  </a>
                )}
                <span className="font-mono text-[10px] opacity-60">
                  IP: {r.ip_hash.slice(0, 10)}…
                </span>
              </div>

              {r.status === "pending" && (
                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[var(--color-border)]">
                  <button
                    type="button"
                    onClick={() => updateStatus(r.id, "replied")}
                    disabled={acting === r.id}
                    className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[8px] bg-emerald-500 text-white text-xs font-medium hover:bg-emerald-600 disabled:opacity-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                  >
                    <Check size={13} aria-hidden="true" /> Marchează răspuns
                  </button>
                  <button
                    type="button"
                    onClick={() => updateStatus(r.id, "archived")}
                    disabled={acting === r.id}
                    className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[8px] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs font-medium hover:bg-[var(--color-surface)] disabled:opacity-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                  >
                    <Archive size={13} aria-hidden="true" /> Arhivează
                  </button>
                  <button
                    type="button"
                    onClick={() => updateStatus(r.id, "spam")}
                    disabled={acting === r.id}
                    className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[8px] bg-red-500 text-white text-xs font-medium hover:bg-red-600 disabled:opacity-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                  >
                    <AlertCircle size={13} aria-hidden="true" /> Spam
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
