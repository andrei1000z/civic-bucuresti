"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Megaphone, Plus, Pencil, Trash2, ExternalLink, Loader2, Users } from "lucide-react";
import { useToast } from "@/components/Toast";

export const dynamic = "force-dynamic";

interface PetitieWithCount {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  image_url: string | null;
  external_url: string | null;
  target_signatures: number;
  category: string | null;
  county_code: string | null;
  starts_at: string;
  ends_at: string | null;
  status: "draft" | "active" | "closed" | "archived";
  signature_count: number;
  created_at: string;
  updated_at: string;
}

const STATUS_LABEL: Record<string, string> = {
  draft: "Ciornă",
  active: "Activă",
  closed: "Încheiată",
  archived: "Arhivată",
};

const STATUS_BG: Record<string, string> = {
  draft: "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
  active: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
  closed: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  archived: "bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-500",
};

export default function AdminPetitiiPage() {
  const { toast } = useToast();
  const [rows, setRows] = useState<PetitieWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/petitii");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setRows(json.data ?? []);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Eroare la încărcare", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // load() e definit în component scope, ESLint cere să-l includem în
    // deps, dar el referențiază setRows + setLoading (state setters stabili).
    // Mount-only e corect aici — rulează o dată la montare.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Ștergi petiția „${title}"? Toate semnăturile dispar.`)) return;
    try {
      const res = await fetch(`/api/admin/petitii/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      toast("Șters", "success");
      load();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Eroare", "error");
    }
  };

  return (
    <div className="container-narrow py-8 md:py-12">
      <header className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-sora)] text-3xl font-extrabold flex items-center gap-2">
            <Megaphone size={26} className="text-purple-600" aria-hidden="true" />
            Petiții civice
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            CRUD pentru petițiile afișate pe /petitii. Doar admin.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingId(null);
            setShowForm(true);
          }}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-[var(--radius-full)] bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-colors"
        >
          <Plus size={16} aria-hidden="true" />
          Petiție nouă
        </button>
      </header>

      {showForm && (
        <PetitieForm
          editingId={editingId}
          existing={editingId ? rows.find((r) => r.id === editingId) ?? null : null}
          onClose={() => {
            setShowForm(false);
            setEditingId(null);
          }}
          onSaved={() => {
            setShowForm(false);
            setEditingId(null);
            load();
          }}
        />
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={20} className="animate-spin text-[var(--color-text-muted)]" />
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-[var(--color-surface)] border border-dashed border-[var(--color-border)] rounded-[var(--radius-md)] p-8 text-center">
          <Megaphone size={32} className="mx-auto text-[var(--color-text-muted)] mb-3" aria-hidden="true" />
          <p className="text-sm text-[var(--color-text-muted)] mb-4">
            Niciun petiție creată. Migration 020 e aplicat?
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((p) => (
            <article
              key={p.id}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-5 flex items-start gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${STATUS_BG[p.status]}`}>
                    {STATUS_LABEL[p.status]}
                  </span>
                  {p.category && (
                    <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-[var(--color-surface-2)] text-[var(--color-text-muted)]">
                      {p.category}
                    </span>
                  )}
                  {p.county_code && (
                    <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-[var(--color-surface-2)] text-[var(--color-text-muted)]">
                      {p.county_code}
                    </span>
                  )}
                </div>
                <h2 className="font-[family-name:var(--font-sora)] font-bold text-base mb-1 line-clamp-1">
                  {p.title}
                </h2>
                <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 mb-2">
                  {p.summary}
                </p>
                <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)] flex-wrap">
                  <span className="inline-flex items-center gap-1 tabular-nums">
                    <Users size={11} aria-hidden="true" />
                    {p.signature_count.toLocaleString("ro-RO")} / {p.target_signatures.toLocaleString("ro-RO")}
                  </span>
                  <span>·</span>
                  <span className="font-mono">/{p.slug}</span>
                  {p.external_url && (
                    <>
                      <span>·</span>
                      <a
                        href={p.external_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 hover:text-[var(--color-primary)]"
                      >
                        <ExternalLink size={11} aria-hidden="true" />
                        link extern
                      </a>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Link
                  href={`/petitii/${p.slug}`}
                  target="_blank"
                  className="w-9 h-9 rounded-[var(--radius-xs)] bg-[var(--color-surface-2)] hover:bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                  aria-label="Deschide pe site"
                  title="Deschide pe site"
                >
                  <ExternalLink size={14} aria-hidden="true" />
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(p.id);
                    setShowForm(true);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="w-9 h-9 rounded-[var(--radius-xs)] bg-[var(--color-surface-2)] hover:bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                  aria-label="Editează"
                  title="Editează"
                >
                  <Pencil size={14} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(p.id, p.title)}
                  className="w-9 h-9 rounded-[var(--radius-xs)] bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-950/50 border border-red-200 dark:border-red-900 flex items-center justify-center text-red-600 dark:text-red-400 transition-colors"
                  aria-label="Șterge"
                  title="Șterge"
                >
                  <Trash2 size={14} aria-hidden="true" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function PetitieForm({
  editingId,
  existing,
  onClose,
  onSaved,
}: {
  editingId: string | null;
  existing: PetitieWithCount | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    slug: existing?.slug ?? "",
    title: existing?.title ?? "",
    summary: existing?.summary ?? "",
    body: existing?.body ?? "",
    image_url: existing?.image_url ?? "",
    external_url: existing?.external_url ?? "",
    target_signatures: existing?.target_signatures ?? 1000,
    category: existing?.category ?? "",
    county_code: existing?.county_code ?? "",
    ends_at: existing?.ends_at?.slice(0, 10) ?? "",
    status: existing?.status ?? ("active" as "active" | "draft" | "closed" | "archived"),
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        slug: form.slug.trim(),
        title: form.title.trim(),
        summary: form.summary.trim(),
        body: form.body.trim(),
        image_url: form.image_url.trim() || null,
        external_url: form.external_url.trim() || null,
        target_signatures: Number(form.target_signatures),
        category: form.category.trim() || null,
        county_code: form.county_code.trim().toUpperCase() || null,
        ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
        status: form.status,
      };
      const url = editingId ? `/api/admin/petitii/${editingId}` : "/api/admin/petitii";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      toast(editingId ? "Salvat" : "Creată", "success");
      onSaved();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Eroare", "error");
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full h-11 px-4 rounded-[var(--radius-xs)] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]";
  const labelCls = "block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5";

  return (
    <form
      onSubmit={submit}
      className="bg-[var(--color-surface)] border border-[var(--color-primary)]/30 rounded-[var(--radius-md)] p-6 mb-6 shadow-[var(--shadow-3)]"
    >
      <h2 className="font-[family-name:var(--font-sora)] text-xl font-bold mb-5">
        {editingId ? "Editează petiția" : "Petiție nouă"}
      </h2>

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="p-slug" className={labelCls}>Slug (URL)</label>
          <input
            id="p-slug"
            type="text"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })}
            placeholder="ex: parcuri-mai-multe-bucuresti"
            required
            className={inputCls}
          />
          <p className="text-[10px] text-[var(--color-text-muted)] mt-1">
            URL: /petitii/{form.slug || "slug"}
          </p>
        </div>
        <div>
          <label htmlFor="p-status" className={labelCls}>Status</label>
          <select
            id="p-status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as "active" | "draft" | "closed" | "archived" })}
            className={inputCls}
          >
            <option value="draft">Ciornă (ascuns)</option>
            <option value="active">Activă (publică, semnabilă)</option>
            <option value="closed">Încheiată (publică, ne-semnabilă)</option>
            <option value="archived">Arhivată (ascuns)</option>
          </select>
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="p-title" className={labelCls}>Titlu</label>
        <input
          id="p-title"
          type="text"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="ex: Parcuri mai multe pentru București"
          required
          className={inputCls}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="p-summary" className={labelCls}>Sumar (afișat pe card)</label>
        <textarea
          id="p-summary"
          value={form.summary}
          onChange={(e) => setForm({ ...form, summary: e.target.value })}
          placeholder="2-3 propoziții cu contextul petiției..."
          required
          rows={3}
          maxLength={500}
          className={`${inputCls} h-auto py-3`}
        />
        <p className="text-[10px] text-[var(--color-text-muted)] mt-1 tabular-nums">
          {form.summary.length}/500
        </p>
      </div>

      <div className="mb-4">
        <label htmlFor="p-body" className={labelCls}>Conținut complet (suport linii noi)</label>
        <textarea
          id="p-body"
          value={form.body}
          onChange={(e) => setForm({ ...form, body: e.target.value })}
          placeholder="Argumentul detaliat al petiției. Linii noi se păstrează."
          required
          rows={8}
          className={`${inputCls} h-auto py-3 font-mono text-xs`}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="p-image" className={labelCls}>URL Imagine (opțional)</label>
          <input
            id="p-image"
            type="url"
            value={form.image_url}
            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            placeholder="https://..."
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="p-ext" className={labelCls}>Link extern (opțional)</label>
          <input
            id="p-ext"
            type="url"
            value={form.external_url}
            onChange={(e) => setForm({ ...form, external_url: e.target.value })}
            placeholder="https://declic.ro/petitii/..."
            className={inputCls}
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-5">
        <div>
          <label htmlFor="p-target" className={labelCls}>Semnături țintă</label>
          <input
            id="p-target"
            type="number"
            min={10}
            max={10_000_000}
            value={form.target_signatures}
            onChange={(e) => setForm({ ...form, target_signatures: Number(e.target.value) })}
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="p-cat" className={labelCls}>Categorie (opțional)</label>
          <input
            id="p-cat"
            type="text"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            placeholder="Mediu / Transport / etc."
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="p-county" className={labelCls}>Județ (opțional)</label>
          <input
            id="p-county"
            type="text"
            value={form.county_code}
            onChange={(e) => setForm({ ...form, county_code: e.target.value.toUpperCase().slice(0, 3) })}
            placeholder="B / CJ / TM"
            maxLength={3}
            className={inputCls}
          />
        </div>
      </div>

      <div className="mb-5">
        <label htmlFor="p-ends" className={labelCls}>Data de încheiere (opțional)</label>
        <input
          id="p-ends"
          type="date"
          value={form.ends_at}
          onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
          className={inputCls}
        />
      </div>

      <div className="flex gap-3 pt-4 border-t border-[var(--color-border)]">
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className="flex-1 h-11 rounded-[var(--radius-xs)] bg-[var(--color-surface-2)] text-sm font-medium hover:bg-[var(--color-border)] disabled:opacity-50 transition-colors"
        >
          Anulează
        </button>
        <button
          type="submit"
          disabled={saving}
          aria-busy={saving}
          className="flex-1 inline-flex items-center justify-center gap-2 h-11 rounded-[var(--radius-xs)] bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-hover)] disabled:opacity-50 transition-colors"
        >
          {saving && <Loader2 size={14} className="animate-spin" aria-hidden="true" />}
          {editingId ? "Salvează" : "Creează"}
        </button>
      </div>
    </form>
  );
}
