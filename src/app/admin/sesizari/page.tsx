"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, XCircle, Eye, Loader2, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { STATUS_COLORS, STATUS_LABELS, SESIZARE_TIPURI } from "@/lib/constants";
import { timeAgo } from "@/lib/utils";
import { useToast } from "@/components/Toast";

interface SesizareRow {
  id: string;
  code: string;
  titlu: string;
  locatie: string;
  sector: string;
  tip: string;
  status: string;
  moderation_status: string;
  author_name: string;
  created_at: string;
}

export default function AdminSesizariPage() {
  const { toast } = useToast();
  const [rows, setRows] = useState<SesizareRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

  useEffect(() => {
    fetch("/api/sesizari?limit=200")
      .then((r) => r.json())
      .then((j) => setRows(j.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const moderate = async (code: string, action: "approve" | "reject") => {
    setActing(code);
    try {
      const res = await fetch(`/api/admin/sesizari/${code}/moderate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Eroare");
      setRows((prev) =>
        prev.map((r) =>
          r.code === code
            ? { ...r, moderation_status: action === "approve" ? "approved" : "rejected" }
            : r
        )
      );
      toast(action === "approve" ? "Sesizare aprobată" : "Sesizare respinsă", "success");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Eroare", "error");
    } finally {
      setActing(null);
    }
  };

  const filtered = rows.filter((r) => filter === "all" || r.moderation_status === filter);

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        {(["all", "pending", "approved", "rejected"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === f
                ? "bg-[var(--color-primary)] text-white"
                : "bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:bg-[var(--color-border)]"
            }`}
          >
            {f === "all" ? "Toate" : f === "pending" ? "În așteptare" : f === "approved" ? "Aprobate" : "Respinse"}
            {f !== "all" && (
              <span className="ml-1 opacity-70">
                ({rows.filter((r) => r.moderation_status === f).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={24} className="animate-spin text-[var(--color-text-muted)]" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-[var(--color-text-muted)] py-20">
          Nicio sesizare {filter !== "all" ? `cu status "${filter}"` : ""}.
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => {
            const tipIcon = SESIZARE_TIPURI.find((t) => t.value === s.tip)?.icon ?? "📝";
            return (
              <div
                key={s.id}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-4 flex items-start gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Badge bgColor={STATUS_COLORS[s.status]} color="white" className="text-[10px]">
                      {STATUS_LABELS[s.status]}
                    </Badge>
                    <span className="text-xs">{tipIcon}</span>
                    <span className="font-mono text-[10px] text-[var(--color-text-muted)]">{s.code}</span>
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        s.moderation_status === "approved"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : s.moderation_status === "rejected"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      }`}
                    >
                      {s.moderation_status}
                    </span>
                  </div>
                  <p className="font-semibold text-sm line-clamp-1">{s.titlu}</p>
                  <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] mt-1">
                    <MapPin size={11} />
                    <span className="truncate">{s.locatie}</span>
                    <span>·</span>
                    <span>{s.author_name}</span>
                    <span>·</span>
                    <span>{timeAgo(s.created_at)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Link
                    href={`/sesizari/${s.code}`}
                    className="w-9 h-9 rounded-[8px] bg-[var(--color-surface-2)] flex items-center justify-center hover:bg-[var(--color-border)] transition-colors"
                    title="Vezi"
                  >
                    <Eye size={14} />
                  </Link>
                  {s.moderation_status !== "approved" && (
                    <button
                      onClick={() => moderate(s.code, "approve")}
                      disabled={acting === s.code}
                      className="w-9 h-9 rounded-[8px] bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 disabled:opacity-50 transition-colors"
                      title="Aprobă"
                    >
                      {acting === s.code ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                    </button>
                  )}
                  {s.moderation_status !== "rejected" && (
                    <button
                      onClick={() => moderate(s.code, "reject")}
                      disabled={acting === s.code}
                      className="w-9 h-9 rounded-[8px] bg-red-500 text-white flex items-center justify-center hover:bg-red-600 disabled:opacity-50 transition-colors"
                      title="Respinge"
                    >
                      {acting === s.code ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
