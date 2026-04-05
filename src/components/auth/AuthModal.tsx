"use client";

import { useState } from "react";
import { Mail, CheckCircle2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "./AuthProvider";

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, signInWithEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg(null);
    const { error } = await signInWithEmail(email);
    if (error) {
      setStatus("error");
      setErrorMsg(error);
    } else {
      setStatus("sent");
    }
  };

  const handleClose = () => {
    closeAuthModal();
    setTimeout(() => {
      setEmail("");
      setStatus("idle");
      setErrorMsg(null);
    }, 300);
  };

  return (
    <Modal open={isAuthModalOpen} onClose={handleClose} title="Autentificare">
      {status === "sent" ? (
        <div className="text-center py-4">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <CheckCircle2 size={28} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Link trimis!</h3>
          <p className="text-sm text-[var(--color-text-muted)] mb-4">
            Ți-am trimis un link de autentificare la <strong>{email}</strong>.
            Deschide-l din email ca să te logezi.
          </p>
          <button
            onClick={handleClose}
            className="h-10 px-4 rounded-[8px] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-sm font-medium hover:bg-[var(--color-surface)] transition-colors"
          >
            Închide
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <p className="text-sm text-[var(--color-text-muted)] mb-4">
            Primești un link prin email — fără parole. Autentificarea e necesară pentru vot și comentarii.
          </p>
          <label className="block text-sm font-medium mb-1.5">
            Adresa ta de email
          </label>
          <div className="relative mb-4">
            <Mail
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
            />
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nume@exemplu.ro"
              className="w-full h-11 pl-9 pr-4 rounded-[8px] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              disabled={status === "sending"}
            />
          </div>
          {errorMsg && (
            <p className="text-sm text-red-600 dark:text-red-400 mb-3">{errorMsg}</p>
          )}
          <button
            type="submit"
            disabled={status === "sending" || !email}
            className="w-full h-11 rounded-[8px] bg-[var(--color-primary)] text-white font-medium hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {status === "sending" ? "Se trimite..." : "Trimite link de autentificare"}
          </button>
          <p className="text-xs text-[var(--color-text-muted)] mt-4 text-center">
            Prin autentificare ești de acord cu termenii platformei.
          </p>
        </form>
      )}
    </Modal>
  );
}
