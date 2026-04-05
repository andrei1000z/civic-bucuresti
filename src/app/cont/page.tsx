"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Save, LogOut, CheckCircle2, Loader2, Plus, ExternalLink } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Badge } from "@/components/ui/Badge";
import { STATUS_COLORS, STATUS_LABELS, SESIZARE_TIPURI } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

interface Profile {
  id: string;
  display_name: string;
  full_name: string | null;
  address: string | null;
  phone: string | null;
  email: string;
}

interface SesizareRow {
  id: string;
  code: string;
  tip: string;
  titlu: string;
  locatie: string;
  sector: string;
  status: string;
  created_at: string;
  publica: boolean;
}

export default function ContPage() {
  const { user, loading: authLoading, signOut, openAuthModal } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [sesizari, setSesizari] = useState<SesizareRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ display_name: "", full_name: "", address: "", phone: "" });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      openAuthModal();
      return;
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [p, s] = await Promise.all([
        fetch("/api/profile").then((r) => r.json()),
        fetch("/api/profile/sesizari").then((r) => r.json()),
      ]);
      if (p.data) {
        setProfile(p.data);
        setForm({
          display_name: p.data.display_name ?? "",
          full_name: p.data.full_name ?? "",
          address: p.data.address ?? "",
          phone: p.data.phone ?? "",
        });
      }
      if (s.data) setSesizari(s.data);
    } finally {
      setLoading(false);
    }
  };

  const [saveError, setSaveError] = useState<string | null>(null);
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setSaveError(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) {
        setSaveError(json.error ?? "Eroare salvare");
      } else {
        // Update local profile so changes persist visually
        if (json.data) setProfile({ ...json.data, email: profile?.email ?? "" });
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Eroare salvare");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="container-narrow py-20 text-center">
        <Loader2 size={28} className="animate-spin mx-auto text-[var(--color-text-muted)]" />
        <p className="text-sm text-[var(--color-text-muted)] mt-3">
          {!user ? "Autentifică-te pentru a accesa contul..." : "Se încarcă..."}
        </p>
      </div>
    );
  }

  return (
    <div className="container-narrow py-12 md:py-16">
      <div className="mb-10 flex items-start justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-sora)] text-4xl md:text-5xl font-bold mb-2">
            Contul tău
          </h1>
          <p className="text-[var(--color-text-muted)]">
            Datele salvate aici se completează automat când depui o sesizare nouă.
          </p>
        </div>
        <button
          onClick={() => {
            signOut();
            router.push("/");
          }}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-[8px] bg-[var(--color-surface)] border border-[var(--color-border)] text-sm font-medium hover:bg-[var(--color-surface-2)] transition-colors"
        >
          <LogOut size={14} />
          Deconectare
        </button>
      </div>

      <div className="grid lg:grid-cols-[360px_1fr] gap-8">
        {/* Profile form */}
        <aside>
          <form
            onSubmit={handleSave}
            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-6 sticky top-24"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-indigo-800 text-white flex items-center justify-center text-lg font-bold">
                {(profile?.display_name ?? profile?.email ?? "C")[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{profile?.display_name ?? "Cetățean"}</p>
                <p className="text-xs text-[var(--color-text-muted)] truncate">{profile?.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <Field label="Nume afișat">
                <input
                  type="text"
                  autoComplete="nickname"
                  value={form.display_name}
                  onChange={(e) => setForm({ ...form, display_name: e.target.value })}
                  placeholder="Maria P."
                  className={inputClass}
                />
              </Field>
              <Field label="Nume complet (pentru sesizări)">
                <input
                  type="text"
                  autoComplete="name"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  placeholder="Maria Popescu"
                  className={inputClass}
                />
              </Field>
              <Field label="Adresă (domiciliu)">
                <input
                  type="text"
                  autoComplete="street-address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Str. Exemplu 12, Sector 3"
                  className={inputClass}
                />
              </Field>
              <Field label="Telefon (opțional)">
                <input
                  type="tel"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="07XX..."
                  className={inputClass}
                />
              </Field>
            </div>

            {saveError && (
              <div className="mt-3 p-2.5 rounded-[8px] bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
                {saveError}
              </div>
            )}
            <button
              type="submit"
              disabled={saving}
              className="mt-5 w-full inline-flex items-center justify-center gap-2 h-11 rounded-[8px] bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-hover)] disabled:opacity-50 transition-colors"
            >
              {saving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : saved ? (
                <CheckCircle2 size={14} />
              ) : (
                <Save size={14} />
              )}
              {saving ? "Se salvează..." : saved ? "Salvat!" : "Salvează modificări"}
            </button>
          </form>
        </aside>

        {/* Sesizari */}
        <div>
          {/* Stats */}
          {sesizari.length > 0 && (() => {
            const rezolvate = sesizari.filter((s) => s.status === "rezolvat").length;
            const inLucru = sesizari.filter((s) => s.status === "in-lucru").length;
            const procent = Math.round((rezolvate / sesizari.length) * 100);
            return (
              <div className="grid grid-cols-3 gap-3 mb-5">
                <StatBox label="Totale" value={sesizari.length.toString()} color="#2563EB" />
                <StatBox label="Rezolvate" value={rezolvate.toString()} delta={`${procent}%`} color="#059669" />
                <StatBox label="În lucru" value={inLucru.toString()} color="#EAB308" />
              </div>
            );
          })()}

          <div className="flex items-center justify-between mb-5">
            <h2 className="font-[family-name:var(--font-sora)] text-2xl font-bold">
              Sesizările tale ({sesizari.length})
            </h2>
            <Link
              href="/sesizari"
              className="inline-flex items-center gap-2 h-9 px-4 rounded-[8px] bg-[var(--color-primary)] text-white text-xs font-medium hover:bg-[var(--color-primary-hover)]"
            >
              <Plus size={14} />
              Sesizare nouă
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-4 animate-pulse">
                  <div className="h-4 bg-[var(--color-surface-2)] rounded w-1/3 mb-2" />
                  <div className="h-5 bg-[var(--color-surface-2)] rounded w-3/4 mb-2" />
                  <div className="h-3 bg-[var(--color-surface-2)] rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : sesizari.length === 0 ? (
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-10 text-center">
              <User size={32} className="mx-auto text-[var(--color-text-muted)] mb-3" />
              <p className="text-[var(--color-text-muted)] mb-4">Nu ai încă nicio sesizare.</p>
              <Link
                href="/sesizari"
                className="inline-flex items-center gap-2 h-10 px-4 rounded-[8px] bg-[var(--color-primary)] text-white text-sm font-medium"
              >
                Depune prima sesizare →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {sesizari.map((s) => {
                const tipLabel = SESIZARE_TIPURI.find((t) => t.value === s.tip)?.label ?? s.tip;
                return (
                  <Link
                    key={s.id}
                    href={`/sesizari/${s.code}`}
                    className="block bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-4 hover:border-[var(--color-primary)]/40 hover:shadow-[var(--shadow-md)] transition-all"
                  >
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badge bgColor={STATUS_COLORS[s.status] ?? "#64748b"} color="white">
                        {STATUS_LABELS[s.status] ?? s.status}
                      </Badge>
                      <Badge variant="neutral">{tipLabel}</Badge>
                      <Badge variant="neutral">{s.sector}</Badge>
                      {!s.publica && (
                        <Badge variant="warning" className="text-[10px]">Privat</Badge>
                      )}
                      <span className="text-[10px] font-mono text-[var(--color-text-muted)] ml-auto">
                        {s.code}
                      </span>
                    </div>
                    <h3 className="font-semibold mb-1 line-clamp-1">{s.titlu}</h3>
                    <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-2">
                      <span>{s.locatie}</span>
                      <span>·</span>
                      <span>{formatDate(s.created_at)}</span>
                      <ExternalLink size={10} className="ml-auto" />
                    </p>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* GDPR */}
      <div className="mt-16 pt-8 border-t border-[var(--color-border)]">
        <h3 className="text-sm font-semibold mb-2 text-[var(--color-text-muted)] uppercase tracking-wider">
          Drepturile tale (GDPR)
        </h3>
        <p className="text-xs text-[var(--color-text-muted)] mb-4 max-w-2xl">
          Conform GDPR, ai dreptul să primești toate datele tale într-un format portabil sau să
          ștergi contul. Sesizările tale publice rămân (anonimizate) pentru interesul public.
        </p>
        <div className="flex flex-wrap gap-2">
          <a
            href="/api/profile/export"
            className="inline-flex items-center gap-2 h-10 px-4 rounded-[8px] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs font-medium hover:bg-[var(--color-surface)]"
          >
            📥 Exportă datele mele (JSON)
          </a>
          <button
            onClick={async () => {
              if (!confirm("Ești sigur? Această acțiune NU poate fi anulată. Contul + datele tale vor fi șterse definitiv. Sesizările tale vor rămâne anonimizate.")) return;
              const res = await fetch("/api/profile/delete", { method: "DELETE" });
              if (res.ok) {
                alert("Contul a fost șters. Vei fi redirecționat.");
                window.location.href = "/";
              } else {
                alert("Eroare la ștergere.");
              }
            }}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-[8px] border border-red-300 dark:border-red-900 text-red-700 dark:text-red-400 text-xs font-medium hover:bg-red-50 dark:hover:bg-red-950/30"
          >
            🗑️ Șterge contul definitiv
          </button>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, delta, color }: { label: string; value: string; delta?: string; color: string }) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-4 text-center">
      <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-semibold mb-1">
        {label}
      </p>
      <p className="text-2xl font-bold" style={{ color }}>{value}</p>
      {delta && <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{delta}</p>}
    </div>
  );
}

const inputClass =
  "w-full h-10 px-3 rounded-[8px] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1 text-[var(--color-text-muted)] uppercase tracking-wider">
        {label}
      </label>
      {children}
    </div>
  );
}
