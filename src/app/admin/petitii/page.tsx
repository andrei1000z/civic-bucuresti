"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Megaphone,
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Loader2,
  Users,
  CheckCircle2,
  AlertTriangle,
  X,
  Clock,
  Eye,
  ImageIcon,
} from "lucide-react";
import { useToast } from "@/components/Toast";
import { cn } from "@/lib/utils";

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

const DRAFT_KEY_NEW = "civia_admin_petitie_draft_new";
const DRAFT_KEY_EDIT_PREFIX = "civia_admin_petitie_draft_edit_";

interface FormState {
  slug: string;
  title: string;
  summary: string;
  body: string;
  image_url: string;
  external_url: string;
  target_signatures: number;
  category: string;
  county_code: string;
  ends_at: string;
  status: "active" | "draft" | "closed" | "archived";
}

const EMPTY_FORM: FormState = {
  slug: "",
  title: "",
  summary: "",
  body: "",
  image_url: "",
  external_url: "",
  target_signatures: 1000,
  category: "",
  county_code: "",
  ends_at: "",
  status: "active",
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
    // load() referențiază doar setRows + setLoading care sunt stabili.
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
            CRUD pentru petițiile afișate pe /petitii. Doar admin. Auto-save activ la 2s.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingId(null);
            setShowForm(true);
          }}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-[var(--radius-full)] bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
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
            Niciun petiție creată. Apasă „Petiție nouă" sus.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((p) => (
            <article
              key={p.id}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-5 flex items-start gap-4"
            >
              {p.image_url && (
                <div className="relative shrink-0 w-20 h-20 rounded-[var(--radius-xs)] overflow-hidden bg-[var(--color-surface-2)] hidden sm:block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image_url} alt="" className="w-full h-full object-cover" loading="lazy" />
                </div>
              )}
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
                  <span className="inline-flex items-center gap-1 tabular-nums font-medium text-[var(--color-text)]">
                    <Users size={11} aria-hidden="true" />
                    {p.signature_count.toLocaleString("ro-RO")} / {p.target_signatures.toLocaleString("ro-RO")}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono">/{p.slug}</span>
                  {p.external_url && (
                    <>
                      <span aria-hidden="true">·</span>
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
                  <Eye size={14} aria-hidden="true" />
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

// ─────────────────────────────────────────────────────────────────
// PetitieForm cu auto-save la 2s în localStorage
// ─────────────────────────────────────────────────────────────────

function getDraftKey(editingId: string | null): string {
  return editingId ? `${DRAFT_KEY_EDIT_PREFIX}${editingId}` : DRAFT_KEY_NEW;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    // Remove combining diacritical marks (Latin + cyrillic ranges).
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
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
  const [draftSavedAt, setDraftSavedAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [restoredBanner, setRestoredBanner] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const slugManuallyEditedRef = useRef(false);

  const baseForm: FormState = existing
    ? {
        slug: existing.slug,
        title: existing.title,
        summary: existing.summary,
        body: existing.body,
        image_url: existing.image_url ?? "",
        external_url: existing.external_url ?? "",
        target_signatures: existing.target_signatures,
        category: existing.category ?? "",
        county_code: existing.county_code ?? "",
        ends_at: existing.ends_at?.slice(0, 10) ?? "",
        status: existing.status,
      }
    : EMPTY_FORM;

  const [form, setForm] = useState<FormState>(baseForm);

  // ─── Restore draft on mount ────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(getDraftKey(editingId));
      if (!raw) return;
      const parsed = JSON.parse(raw) as { form: FormState; savedAt: number };
      // Only restore if draft has meaningful content vs base form
      const hasContent =
        parsed.form.title.trim().length > 0 ||
        parsed.form.summary.trim().length > 0 ||
        parsed.form.body.trim().length > 0;
      if (hasContent) {
        setForm(parsed.form);
        setDraftSavedAt(parsed.savedAt);
        setRestoredBanner(true);
        if (parsed.form.slug && parsed.form.slug !== slugify(parsed.form.title)) {
          slugManuallyEditedRef.current = true;
        }
      }
    } catch {
      // Corrupt draft — ignore.
    }
  }, [editingId]);

  // ─── Auto-save la 2s ────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = getDraftKey(editingId);
    const t = setTimeout(() => {
      try {
        const hasContent =
          form.title.trim().length > 0 ||
          form.summary.trim().length > 0 ||
          form.body.trim().length > 0;
        if (!hasContent) return;
        localStorage.setItem(key, JSON.stringify({ form, savedAt: Date.now() }));
        setDraftSavedAt(Date.now());
      } catch {
        // Quota exceeded — silent.
      }
    }, 2000);
    return () => clearTimeout(t);
  }, [form, editingId]);

  // ─── "X secunde acum" updater ──────────────────────────────────
  useEffect(() => {
    if (!draftSavedAt) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [draftSavedAt]);

  // ─── Auto-slug generator (până e editat manual) ────────────────
  const updateTitle = (title: string) => {
    setForm((f) => ({
      ...f,
      title,
      slug: slugManuallyEditedRef.current ? f.slug : slugify(title),
    }));
  };

  const updateSlug = (slug: string) => {
    slugManuallyEditedRef.current = true;
    setForm((f) => ({ ...f, slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, "-") }));
  };

  const clearDraft = () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(getDraftKey(editingId));
    setForm(baseForm);
    setDraftSavedAt(null);
    setRestoredBanner(false);
    slugManuallyEditedRef.current = !!existing;
    toast("Ciorna ștearsă", "info");
  };

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
      // Clear draft on successful save
      if (typeof window !== "undefined") localStorage.removeItem(getDraftKey(editingId));
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

  // Estimate read time pentru body — ~200 words/min
  const wordCount = form.body.trim().split(/\s+/).filter(Boolean).length;
  const readMinutes = Math.max(1, Math.ceil(wordCount / 200));

  // Format draftSavedAt
  const draftAge = draftSavedAt ? Math.floor((now - draftSavedAt) / 1000) : 0;
  const draftAgeText =
    draftAge < 5
      ? "acum"
      : draftAge < 60
        ? `acum ${draftAge}s`
        : draftAge < 3600
          ? `acum ${Math.floor(draftAge / 60)}min`
          : `acum ${Math.floor(draftAge / 3600)}h`;

  return (
    <form
      onSubmit={submit}
      className="bg-[var(--color-surface)] border border-[var(--color-primary)]/30 rounded-[var(--radius-md)] p-6 mb-6 shadow-[var(--shadow-3)]"
    >
      <header className="mb-5 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="font-[family-name:var(--font-sora)] text-xl font-bold flex items-center gap-2">
            {editingId ? (
              <>
                <Pencil size={18} aria-hidden="true" /> Editează petiția
              </>
            ) : (
              <>
                <Plus size={18} aria-hidden="true" /> Petiție nouă
              </>
            )}
          </h2>
          {draftSavedAt && (
            <p className="text-[10px] text-[var(--color-text-muted)] flex items-center gap-1 mt-1">
              <Clock size={10} aria-hidden="true" />
              Ciornă salvată {draftAgeText} (autosave la 2s)
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPreview((v) => !v)}
            className={cn(
              "inline-flex items-center gap-1.5 h-9 px-3 rounded-[var(--radius-xs)] border text-xs font-medium transition-colors",
              showPreview
                ? "bg-[var(--color-primary-soft)] border-[var(--color-primary)]/30 text-[var(--color-primary)]"
                : "bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]",
            )}
          >
            <Eye size={12} aria-hidden="true" />
            {showPreview ? "Ascunde preview" : "Preview live"}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Închide formularul"
            className="w-9 h-9 rounded-full bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      </header>

      {restoredBanner && (
        <div
          role="status"
          className="mb-5 p-3 rounded-[var(--radius-xs)] bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 flex items-start gap-2"
        >
          <AlertTriangle size={14} className="shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
          <div className="flex-1 text-xs text-amber-800 dark:text-amber-300">
            <p className="font-semibold mb-0.5">Ciornă restaurată</p>
            <p>Am găsit o ciornă nesalvată din sesiunea anterioară. Continuă de unde ai rămas sau șterge-o.</p>
          </div>
          <button
            type="button"
            onClick={clearDraft}
            className="shrink-0 text-xs font-medium text-amber-700 dark:text-amber-300 underline hover:no-underline"
          >
            Șterge ciornă
          </button>
        </div>
      )}

      <div className={showPreview ? "grid lg:grid-cols-2 gap-6" : ""}>
        <div className="space-y-4">
          <div>
            <label htmlFor="p-title" className={labelCls}>Titlu</label>
            <input
              id="p-title"
              type="text"
              value={form.title}
              onChange={(e) => updateTitle(e.target.value)}
              placeholder="ex: Parcuri mai multe pentru București"
              required
              className={inputCls}
              autoCapitalize="words"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="p-slug" className={labelCls}>
                Slug (URL)
                {!slugManuallyEditedRef.current && form.title && (
                  <span className="ml-2 text-[10px] normal-case text-emerald-600 dark:text-emerald-400">
                    auto-generat
                  </span>
                )}
              </label>
              <input
                id="p-slug"
                type="text"
                value={form.slug}
                onChange={(e) => updateSlug(e.target.value)}
                placeholder="parcuri-mai-multe-bucuresti"
                required
                className={`${inputCls} font-mono text-xs`}
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
                onChange={(e) => setForm({ ...form, status: e.target.value as FormState["status"] })}
                className={inputCls}
              >
                <option value="draft">Ciornă (ascuns public)</option>
                <option value="active">Activă (semnabilă)</option>
                <option value="closed">Încheiată (read-only)</option>
                <option value="archived">Arhivată (ascuns)</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="p-summary" className={labelCls}>
              Sumar (afișat pe card){" "}
              <span className={cn(
                "tabular-nums normal-case font-medium",
                form.summary.length >= 480 ? "text-red-500" : form.summary.length >= 400 ? "text-amber-500" : "text-[var(--color-text-muted)]",
              )}>
                {form.summary.length}/500
              </span>
            </label>
            <textarea
              id="p-summary"
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value.slice(0, 500) })}
              placeholder="2-3 propoziții cu contextul petiției..."
              required
              rows={3}
              maxLength={500}
              className={`${inputCls} h-auto py-3`}
              autoCapitalize="sentences"
              spellCheck
            />
          </div>

          <div>
            <label htmlFor="p-body" className={labelCls}>
              Conținut complet{" "}
              <span className="tabular-nums normal-case text-[var(--color-text-muted)] font-medium">
                {wordCount.toLocaleString("ro-RO")} cuvinte · ~{readMinutes} min lectură
              </span>
            </label>
            <textarea
              id="p-body"
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              placeholder="Argumentul detaliat. Linii noi se păstrează."
              required
              rows={10}
              className={`${inputCls} h-auto py-3 font-mono text-xs leading-relaxed`}
              autoCapitalize="sentences"
              spellCheck
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="p-image" className={labelCls}>
                <ImageIcon size={11} className="inline mr-1" aria-hidden="true" />
                URL Imagine (opțional)
              </label>
              <input
                id="p-image"
                type="url"
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                placeholder="https://..."
                className={inputCls}
              />
              {form.image_url && (
                <div className="mt-2 relative w-full aspect-[16/9] rounded-[var(--radius-xs)] overflow-hidden bg-[var(--color-surface-2)] border border-[var(--color-border)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.image_url}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>
            <div>
              <label htmlFor="p-ext" className={labelCls}>
                <ExternalLink size={11} className="inline mr-1" aria-hidden="true" />
                Link extern (opțional)
              </label>
              <input
                id="p-ext"
                type="url"
                value={form.external_url}
                onChange={(e) => setForm({ ...form, external_url: e.target.value })}
                placeholder="https://declic.ro/petitii/..."
                className={inputCls}
              />
              <p className="text-[10px] text-[var(--color-text-muted)] mt-1">
                Pentru petițiile oficiale (Declic, Avaaz, Change.org).
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
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
              <label htmlFor="p-cat" className={labelCls}>Categorie</label>
              <input
                id="p-cat"
                type="text"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="Mediu / Transport"
                className={inputCls}
                autoCapitalize="words"
              />
            </div>
            <div>
              <label htmlFor="p-county" className={labelCls}>Județ</label>
              <input
                id="p-county"
                type="text"
                value={form.county_code}
                onChange={(e) => setForm({ ...form, county_code: e.target.value.toUpperCase().slice(0, 3) })}
                placeholder="B / CJ"
                maxLength={3}
                className={`${inputCls} uppercase`}
              />
            </div>
          </div>

          <div>
            <label htmlFor="p-ends" className={labelCls}>Data de încheiere (opțional)</label>
            <input
              id="p-ends"
              type="date"
              value={form.ends_at}
              onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
              className={inputCls}
            />
          </div>
        </div>

        {/* Live preview */}
        {showPreview && (
          <aside className="lg:sticky lg:top-24 self-start bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-5 max-h-[80vh] overflow-y-auto">
            <p className="text-[10px] uppercase tracking-wider font-bold text-[var(--color-text-muted)] mb-3 flex items-center gap-1">
              <Eye size={10} aria-hidden="true" /> Preview live
            </p>
            {form.image_url && (
              <div className="relative w-full aspect-[16/9] rounded-[var(--radius-xs)] overflow-hidden bg-[var(--color-surface)] mb-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.image_url} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            {form.category && (
              <span className="inline-block text-[10px] uppercase tracking-wider font-bold text-purple-600 dark:text-purple-400 mb-2">
                {form.category}
              </span>
            )}
            <h3 className="font-[family-name:var(--font-sora)] font-bold text-lg mb-2">
              {form.title || "Titlul petiției"}
            </h3>
            <p className="text-sm text-[var(--color-text-muted)] mb-4 leading-relaxed">
              {form.summary || "Sumar..."}
            </p>
            <div className="text-sm whitespace-pre-line leading-relaxed">
              {form.body || "Conținut petiție..."}
            </div>
          </aside>
        )}
      </div>

      <div className="flex gap-3 pt-5 mt-5 border-t border-[var(--color-border)]">
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className="h-11 px-5 rounded-[var(--radius-xs)] bg-[var(--color-surface-2)] text-sm font-medium hover:bg-[var(--color-border)] disabled:opacity-50 transition-colors"
        >
          Anulează
        </button>
        {draftSavedAt && (
          <button
            type="button"
            onClick={clearDraft}
            disabled={saving}
            className="h-11 px-4 rounded-[var(--radius-xs)] text-xs text-[var(--color-text-muted)] hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            Șterge ciornă
          </button>
        )}
        <button
          type="submit"
          disabled={saving}
          aria-busy={saving}
          className="flex-1 inline-flex items-center justify-center gap-2 h-11 rounded-[var(--radius-xs)] bg-[var(--color-primary)] text-white text-sm font-semibold hover:bg-[var(--color-primary-hover)] disabled:opacity-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-primary)]"
        >
          {saving ? (
            <Loader2 size={14} className="animate-spin" aria-hidden="true" />
          ) : (
            <CheckCircle2 size={14} aria-hidden="true" />
          )}
          {editingId ? "Salvează modificările" : "Publică petiția"}
        </button>
      </div>
    </form>
  );
}
