"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, XCircle, Eye, Loader2, MapPin, Sparkles, X as CloseX, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { STATUS_COLORS, STATUS_LABELS, SESIZARE_TIPURI } from "@/lib/constants";
import { timeAgo } from "@/lib/utils";
import { useToast } from "@/components/Toast";

interface SesizareRow {
  id: string;
  code: string;
  titlu: string;
  descriere?: string;
  locatie: string;
  sector: string;
  tip: string;
  status: string;
  moderation_status: string;
  author_name: string;
  created_at: string;
  lat?: number;
  lng?: number;
}

interface PolishDiff {
  code: string;
  before: { titlu: string; descriere: string; locatie: string; lat: number; lng: number };
  after: { titlu: string; descriere: string; locatie: string; lat: number; lng: number };
  geocodeNote: string | null;
  aiSucceeded: boolean;
  aiError: string | null;
}

export default function AdminSesizariPage() {
  const { toast } = useToast();
  const [rows, setRows] = useState<SesizareRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [polishDiff, setPolishDiff] = useState<PolishDiff | null>(null);

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

  const polish = async (code: string) => {
    setActing(`polish-${code}`);
    try {
      const res = await fetch(`/api/admin/sesizari/${code}/polish`, { method: "POST" });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Eroare polish");
      // Sync every field the endpoint may have changed into local state
      // so the list reflects the new titlu / locatie / descriere / lat /
      // lng without a reload.
      setRows((prev) =>
        prev.map((r) =>
          r.code === code
            ? {
                ...r,
                titlu: j.data.titlu ?? r.titlu,
                descriere: j.data.descriere ?? r.descriere,
                locatie: j.data.locatie ?? r.locatie,
                lat: j.data.lat ?? r.lat,
                lng: j.data.lng ?? r.lng,
              }
            : r,
        ),
      );
      // Pop a diff modal so the admin sees exactly what AI changed.
      setPolishDiff({
        code,
        before: j.data.before,
        after: {
          titlu: j.data.titlu,
          descriere: j.data.descriere,
          locatie: j.data.locatie,
          lat: j.data.lat,
          lng: j.data.lng,
        },
        geocodeNote: j.data.geocodeNote ?? null,
        aiSucceeded: j.data.aiSucceeded ?? true,
        aiError: j.data.aiError ?? null,
      });
      toast(`Polished ${code}`, "success");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Eroare polish", "error");
    } finally {
      setActing(null);
    }
  };

  const filtered = rows.filter((r) => filter === "all" || r.moderation_status === filter);

  return (
    <div>
      {polishDiff && (
        <div
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-start md:items-center justify-center p-4 overflow-y-auto"
          onClick={() => setPolishDiff(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[16px] shadow-[var(--shadow-xl)] overflow-hidden my-8"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-purple-500" />
                <h3 className="font-semibold">
                  Polish aplicat pe {polishDiff.code}
                </h3>
              </div>
              <button
                onClick={() => setPolishDiff(null)}
                className="w-8 h-8 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center hover:bg-[var(--color-border)]"
                aria-label="Închide"
              >
                <CloseX size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4 text-sm">
              {/* AI health banner — warn the admin when the polish call
                  actually failed (Groq down, quota hit, etc) so they
                  don't confuse "already clean" with "AI didn't run". */}
              {!polishDiff.aiSucceeded && (
                <div className="p-3 rounded-[8px] border border-red-500/30 bg-red-500/5 text-xs text-red-700 dark:text-red-400">
                  <strong>⚠ AI nu a putut contacta modelul.</strong> Textele au rămas
                  la valoarea din DB. Coordonatele au fost totuși verificate prin
                  geocoder.
                  {polishDiff.aiError && (
                    <p className="font-mono opacity-70 mt-1 text-[11px]">{polishDiff.aiError}</p>
                  )}
                </div>
              )}

              {[
                { label: "Titlu", before: polishDiff.before.titlu, after: polishDiff.after.titlu },
                { label: "Locație", before: polishDiff.before.locatie, after: polishDiff.after.locatie },
                { label: "Descriere", before: polishDiff.before.descriere, after: polishDiff.after.descriere },
              ].map((row) => {
                const changed = row.before !== row.after;
                return (
                  <div key={row.label}>
                    <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] font-semibold mb-1.5">
                      {row.label}{" "}
                      {changed ? (
                        <span className="text-emerald-500 normal-case">· schimbat</span>
                      ) : (
                        <span className="text-[var(--color-text-muted)] normal-case">· neschimbat</span>
                      )}
                    </p>
                    <div className="grid md:grid-cols-2 gap-2">
                      <div className="p-3 rounded-[8px] bg-red-500/5 border border-red-500/20">
                        <p className="text-[10px] text-red-600 dark:text-red-400 font-semibold mb-1">ÎNAINTE</p>
                        <p className="whitespace-pre-wrap break-words">{row.before || "—"}</p>
                      </div>
                      <div className="p-3 rounded-[8px] bg-emerald-500/5 border border-emerald-500/20">
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mb-1">DUPĂ</p>
                        <p className="whitespace-pre-wrap break-words">{row.after || "—"}</p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Coordonate — always shown with the actual status so the
                  admin can tell whether the geocoder ran and what it
                  concluded, even when the pin didn't need to move. */}
              {(() => {
                const moved =
                  polishDiff.before.lat !== polishDiff.after.lat ||
                  polishDiff.before.lng !== polishDiff.after.lng;
                return (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] font-semibold mb-1.5">
                      Coordonate{" "}
                      <span className={moved ? "text-emerald-500 normal-case" : "text-[var(--color-text-muted)] normal-case"}>
                        · {moved ? "re-geocodate" : "neschimbate"}
                      </span>
                    </p>
                    <div className="flex flex-wrap items-center gap-3 p-3 rounded-[8px] bg-[var(--color-surface-2)] font-mono text-xs">
                      <span className={moved ? "text-red-600 dark:text-red-400" : "text-[var(--color-text-muted)]"}>
                        {polishDiff.before.lat.toFixed(5)}, {polishDiff.before.lng.toFixed(5)}
                      </span>
                      <ArrowRight size={12} className="text-[var(--color-text-muted)]" />
                      <span className={moved ? "text-emerald-600 dark:text-emerald-400" : "text-[var(--color-text-muted)]"}>
                        {polishDiff.after.lat.toFixed(5)}, {polishDiff.after.lng.toFixed(5)}
                      </span>
                    </div>
                    {polishDiff.geocodeNote && (
                      <p className="text-[11px] text-[var(--color-text-muted)] italic mt-1">
                        {polishDiff.geocodeNote}
                      </p>
                    )}
                  </div>
                );
              })()}
            </div>
            <div className="flex justify-end gap-2 px-5 py-4 border-t border-[var(--color-border)]">
              <Link
                href={`/sesizari/${polishDiff.code}`}
                target="_blank"
                className="inline-flex items-center gap-1 h-9 px-3 rounded-[8px] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs font-medium hover:bg-[var(--color-surface)] transition-colors"
              >
                <Eye size={12} /> Deschide sesizarea
              </Link>
              <button
                onClick={() => setPolishDiff(null)}
                className="h-9 px-4 rounded-[8px] bg-[var(--color-primary)] text-white text-xs font-semibold hover:bg-[var(--color-primary-hover)] transition-colors"
              >
                OK, am văzut
              </button>
            </div>
          </div>
        </div>
      )}

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
                  <button
                    onClick={() => polish(s.code)}
                    disabled={acting === `polish-${s.code}`}
                    className="w-9 h-9 rounded-[8px] bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center hover:brightness-110 disabled:opacity-50 transition-all"
                    title="Rescrie cu AI + re-geocode"
                  >
                    {acting === `polish-${s.code}` ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  </button>
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
