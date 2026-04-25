"use client";

import { useState } from "react";
import { Check, X, AlertCircle, Copy, Mail, Image as ImgIcon } from "lucide-react";

interface Row {
  id: string;
  text: string;
  image_url: string | null;
  email: string | null;
  ip_hash: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
}

function statusStyles(status: string) {
  switch (status) {
    case "published":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300";
    case "rejected":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
    case "duplicate":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
    default:
      return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200";
  }
}

export function IntreruperiSubmissions({ rows: initial }: { rows: Row[] }) {
  const [rows, setRows] = useState(initial);
  const [acting, setActing] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "published" | "rejected">("pending");

  const updateStatus = async (id: string, status: Row["status"]) => {
    setActing(id);
    try {
      const res = await fetch(`/api/admin/intreruperi/${id}`, {
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
    pending: rows.filter((r) => r.status === "pending").length,
    published: rows.filter((r) => r.status === "published").length,
    rejected: rows.filter((r) => r.status === "rejected").length,
    all: rows.length,
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {(["all", "pending", "published", "rejected"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === f
                ? "bg-[var(--color-primary)] text-white"
                : "bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:bg-[var(--color-border)]"
            }`}
          >
            {f === "all"
              ? "Toate"
              : f === "pending"
              ? "În așteptare"
              : f === "published"
              ? "Publicate"
              : "Respinse"}
            <span className="ml-1 opacity-70">({counts[f]})</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-[var(--color-text-muted)] py-16 text-sm">
          Nicio submisie {filter !== "all" ? `cu status „${filter}"` : ""}.
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <article
              key={r.id}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-5"
            >
              <header className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${statusStyles(r.status)}`}
                  >
                    {r.status}
                  </span>
                  <span className="font-mono text-[10px] text-[var(--color-text-muted)]">
                    {r.id.slice(0, 8)}
                  </span>
                  <span className="text-xs text-[var(--color-text-muted)]">
                    {new Date(r.created_at).toLocaleString("ro-RO")}
                  </span>
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(r.text)}
                  aria-label="Copiază textul"
                  className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
                >
                  <Copy size={14} />
                </button>
              </header>

              <p className="text-sm leading-relaxed whitespace-pre-wrap mb-3">
                {r.text}
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--color-text-muted)] mb-4">
                {r.image_url && (
                  <a
                    href={r.image_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[var(--color-primary)] hover:underline"
                  >
                    <ImgIcon size={12} /> Vezi poza
                  </a>
                )}
                {r.email && (
                  <a
                    href={`mailto:${r.email}?subject=${encodeURIComponent(
                      `Re: Întrerupere raportată Civia (${r.id.slice(0, 8)})`,
                    )}&body=${encodeURIComponent(
                      `Salut,\n\nMulțumim că ai raportat întreruperea:\n\n> ${r.text
                        .split("\n")
                        .join("\n> ")}\n\n---\nDespre situație:\n\n`,
                    )}`}
                    className="inline-flex items-center gap-1 text-[var(--color-primary)] hover:underline"
                  >
                    <Mail size={12} /> {r.email}
                  </a>
                )}
                <span className="font-mono text-[10px] opacity-60">
                  IP: {r.ip_hash.slice(0, 10)}…
                </span>
              </div>

              {r.status === "pending" && (
                <div className="flex items-center gap-2 pt-3 border-t border-[var(--color-border)]">
                  <button
                    onClick={() => updateStatus(r.id, "published")}
                    disabled={acting === r.id}
                    className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[8px] bg-emerald-500 text-white text-xs font-medium hover:bg-emerald-600 disabled:opacity-50"
                  >
                    <Check size={13} /> Publică
                  </button>
                  <button
                    onClick={() => updateStatus(r.id, "rejected")}
                    disabled={acting === r.id}
                    className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[8px] bg-red-500 text-white text-xs font-medium hover:bg-red-600 disabled:opacity-50"
                  >
                    <X size={13} /> Respinge
                  </button>
                  <button
                    onClick={() => updateStatus(r.id, "duplicate")}
                    disabled={acting === r.id}
                    className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[8px] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs font-medium hover:bg-[var(--color-surface)] disabled:opacity-50"
                  >
                    <AlertCircle size={13} /> Duplicat
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
