"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2, X, AlertTriangle } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/Toast";

interface Props {
  code: string;
  authorEmail: string | null;
  userId: string | null;
}

export function DeleteSesizareButton({ code, authorEmail, userId }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Only show to author
  const canDelete = user && (user.id === userId || user.email === authorEmail);
  if (!canDelete) return null;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/sesizari/${code}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Eroare");
      toast("Sesizarea a fost ștearsă", "success");
      router.push("/sesizari");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Eroare la ștergere", "error");
      setDeleting(false);
      setConfirm(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setConfirm(true)}
        className="inline-flex items-center gap-2 h-10 px-4 rounded-[8px] border border-red-300 dark:border-red-900 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
        title="Șterge sesizarea"
      >
        <Trash2 size={14} />
        Șterge
      </button>

      {confirm && (
        <div
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => !deleting && setConfirm(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-[var(--color-surface)] rounded-[12px] shadow-[var(--shadow-xl)] overflow-hidden"
          >
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-5 relative">
              {!deleting && (
                <button
                  onClick={() => setConfirm(false)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"
                  aria-label="Închide"
                >
                  <X size={16} />
                </button>
              )}
              <div className="flex items-start gap-3">
                <AlertTriangle size={24} className="shrink-0 mt-1" />
                <div>
                  <h3 className="font-[family-name:var(--font-sora)] text-lg font-bold">
                    Șterge sesizarea
                  </h3>
                  <p className="text-sm text-white/90 mt-1">
                    Această acțiune nu poate fi anulată.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-sm text-[var(--color-text)]">
                Sesizarea, voturile, comentariile și toate datele asociate vor fi șterse definitiv.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirm(false)}
                  disabled={deleting}
                  className="flex-1 h-11 rounded-[8px] bg-[var(--color-surface-2)] text-sm font-medium hover:bg-[var(--color-border)] disabled:opacity-50"
                >
                  Anulează
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 inline-flex items-center justify-center gap-2 h-11 rounded-[8px] bg-red-500 text-white text-sm font-medium hover:bg-red-600 disabled:opacity-50"
                >
                  {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  Da, șterge
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
