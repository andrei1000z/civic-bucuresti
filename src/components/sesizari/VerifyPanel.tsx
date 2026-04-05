"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

interface Props {
  code: string;
  verifDa: number;
  verifNu: number;
  initialUserChoice: boolean | null;
  isAuthor: boolean;
}

export function VerifyPanel({
  code,
  verifDa,
  verifNu,
  initialUserChoice,
  isAuthor,
}: Props) {
  const { user, openAuthModal } = useAuth();
  const router = useRouter();
  const [choice, setChoice] = useState<boolean | null>(initialUserChoice);
  const [counts, setCounts] = useState({ da: verifDa, nu: verifNu });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (agrees: boolean) => {
    if (!user) {
      openAuthModal();
      return;
    }
    if (isAuthor) {
      setError("Nu poți vota pe propria sesizare.");
      setTimeout(() => setError(null), 3000);
      return;
    }
    setLoading(true);
    setError(null);

    // optimistic update
    const prev = choice;
    setChoice(agrees);
    setCounts((c) => {
      const next = { ...c };
      if (prev === true) next.da -= 1;
      if (prev === false) next.nu -= 1;
      if (agrees) next.da += 1;
      else next.nu += 1;
      return next;
    });

    try {
      const res = await fetch(`/api/sesizari/${code}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agrees }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Eroare");
      router.refresh();
    } catch (e) {
      // rollback optimistic
      setChoice(prev);
      setCounts({ da: verifDa, nu: verifNu });
      setError(e instanceof Error ? e.message : "Eroare");
      setTimeout(() => setError(null), 4000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-5">
      <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-semibold mb-3">
        Verifică rezolvarea
      </p>
      <p className="text-sm text-[var(--color-text)] mb-4">
        A fost cu adevărat rezolvată problema?
      </p>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => submit(true)}
          disabled={loading || isAuthor}
          className={`inline-flex items-center justify-center gap-2 h-10 rounded-[8px] text-sm font-medium transition-all disabled:opacity-50 ${
            choice === true
              ? "bg-emerald-500 text-white"
              : "bg-[var(--color-surface-2)] text-[var(--color-text)] hover:bg-emerald-500/10 hover:text-emerald-600"
          }`}
          aria-label="Da, rezolvată"
        >
          {loading && choice === true ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <ThumbsUp size={14} />
          )}
          <span>Da ({counts.da})</span>
        </button>
        <button
          onClick={() => submit(false)}
          disabled={loading || isAuthor}
          className={`inline-flex items-center justify-center gap-2 h-10 rounded-[8px] text-sm font-medium transition-all disabled:opacity-50 ${
            choice === false
              ? "bg-red-500 text-white"
              : "bg-[var(--color-surface-2)] text-[var(--color-text)] hover:bg-red-500/10 hover:text-red-600"
          }`}
          aria-label="Nu, nerezolvată"
        >
          {loading && choice === false ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <ThumbsDown size={14} />
          )}
          <span>Nu ({counts.nu})</span>
        </button>
      </div>
      {isAuthor && (
        <p className="text-xs text-[var(--color-text-muted)] mt-3 italic">
          Tu ești autorul — alții vor verifica.
        </p>
      )}
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
    </div>
  );
}
