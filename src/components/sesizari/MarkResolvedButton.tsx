"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, X } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/Toast";
import { PhotoUploader } from "./PhotoUploader";

interface Props {
  code: string;
  status: string;
  authorEmail: string | null;
  userId: string | null;
}

export function MarkResolvedButton({ code, status, authorEmail, userId }: Props) {
  const { user, openAuthModal } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [photo, setPhoto] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status === "rezolvat") return null;

  const canResolve = user && (user.id === userId || user.email === authorEmail);

  const handleClick = () => {
    if (!user) {
      openAuthModal();
      return;
    }
    if (!canResolve) {
      setError("Doar autorul poate marca sesizarea ca rezolvată.");
      setTimeout(() => setError(null), 4000);
      return;
    }
    setOpen(true);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/sesizari/${code}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolved_photo_url: photo[0] ?? null }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Eroare");
      toast("Sesizare marcată ca rezolvată! 🎉", "success");
      router.refresh();
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Eroare");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="inline-flex items-center gap-2 h-10 px-4 rounded-[8px] bg-emerald-500 text-white text-sm font-medium hover:brightness-110 transition-all shadow-sm"
      >
        <CheckCircle2 size={15} />
        Marchează ca rezolvată
      </button>
      {error && !open && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}

      {open && (
        <div
          className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-start md:items-center justify-center p-4 overflow-y-auto"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-[var(--color-surface)] rounded-[12px] shadow-[var(--shadow-xl)] overflow-hidden"
          >
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-5 relative">
              <button
                onClick={() => setOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"
              >
                <X size={16} />
              </button>
              <h3 className="font-[family-name:var(--font-sora)] text-xl font-bold">
                Marchează ca rezolvată
              </h3>
              <p className="text-sm text-white/85 mt-1">
                Confirmi că problema a fost rezolvată. Opțional, atașează o poză after/before.
              </p>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-sm font-medium block mb-2">
                  Fotografie după rezolvare (opțional)
                </label>
                <PhotoUploader urls={photo} onChange={setPhoto} max={1} />
              </div>

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => setOpen(false)}
                  className="flex-1 h-11 rounded-[8px] bg-[var(--color-surface-2)] text-sm font-medium hover:bg-[var(--color-border)]"
                >
                  Anulează
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 inline-flex items-center justify-center gap-2 h-11 rounded-[8px] bg-emerald-500 text-white text-sm font-medium hover:brightness-110 disabled:opacity-50"
                >
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  Confirmă rezolvarea
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
