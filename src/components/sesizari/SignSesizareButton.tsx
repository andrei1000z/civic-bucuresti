"use client";

import { useState, useEffect } from "react";
import { UserPlus, X, AlertCircle, ArrowRight } from "lucide-react";
import { getRecipientsLabel } from "@/lib/sesizari/mailto";
import { EmailChoicePanel } from "./EmailChoicePanel";
import { useAuth } from "@/components/auth/AuthProvider";
import { cn } from "@/lib/utils";

interface Props {
  tip: string;
  titlu: string;
  locatie: string;
  sector?: string | null;
  descriere: string;
  formal_text?: string | null;
  imagini?: string[];
  code: string;
  variant?: "primary" | "outline";
}

const STORAGE_KEY = "civic_user_data";

interface UserData {
  name: string;
  address: string;
  email: string;
}

export function SignSesizareButton({
  tip,
  titlu,
  locatie,
  sector,
  descriere,
  formal_text,
  imagini,
  code,
  variant = "primary",
}: Props) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"form" | "send">("form");
  // Lazy initializer — reads localStorage sync on first render, no useEffect needed
  const [data, setData] = useState<UserData>(() => {
    if (typeof window === "undefined") return { name: "", address: "", email: "" };
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved) as UserData;
      } catch {
        // ignore corrupt
      }
    }
    return { name: "", address: "", email: "" };
  });
  const [remember, setRemember] = useState(true);
  const [profileLoaded, setProfileLoaded] = useState(false);

  // Auto-fill from user profile when logged in (overrides localStorage if profile has data)
  useEffect(() => {
    if (!user || profileLoaded) return;
    fetch("/api/profile")
      .then((r) => r.json())
      .then((j) => {
        if (j.data) {
          setData((prev) => ({
            name: j.data.full_name || j.data.display_name || prev.name,
            address: j.data.address || prev.address,
            email: j.data.email || prev.email,
          }));
        }
        setProfileLoaded(true);
      })
      .catch(() => setProfileLoaded(true));
  }, [user, profileLoaded]);

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.name || !data.address) return;
    if (remember && typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
    setStep("send");
  };

  const canContinue = data.name.length >= 2 && data.address.length >= 3;

  const emailInput = {
    tip,
    titlu,
    locatie,
    sector,
    descriere,
    formal_text,
    author_name: data.name,
    author_email: data.email || null,
    author_address: data.address,
    imagini,
    code,
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => setStep("form"), 300);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex items-center gap-2 rounded-[8px] font-medium transition-colors",
          variant === "primary"
            ? "h-11 px-5 text-sm bg-[var(--color-secondary)] text-white hover:brightness-110 shadow-md"
            : "h-9 px-3 text-xs bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface)]"
        )}
        title="Co-semnează și trimite și tu"
      >
        <UserPlus size={variant === "primary" ? 16 : 13} />
        {variant === "primary" ? "Trimite și tu sesizarea" : "Co-semnează"}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-start md:items-center justify-center p-4 overflow-y-auto"
          onClick={handleClose}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-[var(--color-surface)] rounded-[12px] shadow-[var(--shadow-xl)] my-8 overflow-hidden"
          >
            <header className="bg-gradient-to-r from-[var(--color-secondary)] to-emerald-700 text-white p-5 relative">
              <button
                type="button"
                onClick={handleClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30"
              >
                <X size={16} />
              </button>
              <h3 className="font-[family-name:var(--font-sora)] text-xl font-bold mb-1">
                {step === "form" ? "Trimite și tu această sesizare" : "Alege serviciul de email"}
              </h3>
              <p className="text-sm text-white/85">
                {step === "form"
                  ? "Co-semnezi cu numele tău și trimiți la autorități."
                  : "Deschide în tab nou și apeși Send."}
              </p>
            </header>

            {step === "form" ? (
              <form onSubmit={handleContinue} className="p-5 space-y-4">
                <div className="rounded-[8px] bg-[var(--color-surface-2)] p-3 text-xs text-[var(--color-text-muted)]">
                  <p className="font-semibold text-[var(--color-text)] mb-1">Despre sesizare:</p>
                  <p className="line-clamp-2">{titlu}</p>
                  <p className="mt-2">
                    <strong>Se trimite la:</strong> {getRecipientsLabel(tip, sector)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Numele tău <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    autoComplete="name"
                    value={data.name}
                    onChange={(e) => setData({ ...data, name: e.target.value })}
                    placeholder="Ex: Ion Popescu"
                    className="w-full h-11 px-3 rounded-[8px] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Adresa ta (domiciliu) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    autoComplete="street-address"
                    value={data.address}
                    onChange={(e) => setData({ ...data, address: e.target.value })}
                    placeholder="Ex: Str. Exemplu 12, Sector 3, București"
                    className="w-full h-11 px-3 rounded-[8px] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    required
                  />
                </div>

                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-[var(--color-primary)]"
                  />
                  <span className="text-xs text-[var(--color-text-muted)]">
                    Salvează datele în browser (nu mai pui data viitoare)
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={!canContinue}
                  className="w-full inline-flex items-center justify-center gap-2 h-12 rounded-[8px] bg-[var(--color-primary)] text-white font-semibold hover:bg-[var(--color-primary-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Continuă
                  <ArrowRight size={16} />
                </button>
              </form>
            ) : (
              <div className="p-5 space-y-4">
                <div className="flex items-start gap-2 p-3 rounded-[8px] bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
                  <AlertCircle size={14} className="text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-blue-900 dark:text-blue-300">
                    Se va deschide un tab nou cu email-ul pregătit. Verifică, apoi apeși <strong>Send</strong>.
                  </p>
                </div>
                <EmailChoicePanel input={emailInput} />
                <button
                  type="button"
                  onClick={() => setStep("form")}
                  className="w-full h-9 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                >
                  ← Înapoi la date
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
