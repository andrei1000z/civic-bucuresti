"use client";

import { useState } from "react";
import { MessageSquareMore, Mail, Check, Loader2, Bug, Lightbulb, HelpCircle } from "lucide-react";

type Kind = "bug" | "idea" | "question" | "other";

const KIND_META: Record<Kind, { icon: typeof Bug; label: string }> = {
  bug: { icon: Bug, label: "Problemă" },
  idea: { icon: Lightbulb, label: "Sugestie" },
  question: { icon: HelpCircle, label: "Întrebare" },
  other: { icon: MessageSquareMore, label: "Altceva" },
};

/**
 * Two-up widget rendered at the bottom of the footer: a compact
 * feedback form ("ai găsit o problemă / sugestie / întrebare?") and a
 * newsletter signup. Both POST to existing APIs (/api/feedback and
 * /api/newsletter) and mirror into Redis so messages + subscribers
 * show up in /admin/analytics.
 */
export function FooterFeedback() {
  const [kind, setKind] = useState<Kind>("idea");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [nlSending, setNlSending] = useState(false);
  const [nlDone, setNlDone] = useState(false);
  const [nlError, setNlError] = useState<string | null>(null);

  const submitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          message: message.trim(),
          email: email.trim() || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Eroare");
      setDone(true);
      setMessage("");
      setEmail("");
      setTimeout(() => setDone(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eroare");
    } finally {
      setSending(false);
    }
  };

  const submitNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNlSending(true);
    setNlError(null);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newsletterEmail.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Eroare");
      setNlDone(true);
      setNewsletterEmail("");
      setTimeout(() => setNlDone(false), 5000);
    } catch (err) {
      setNlError(err instanceof Error ? err.message : "Eroare");
    } finally {
      setNlSending(false);
    }
  };

  return (
    <div className="mt-10 pt-8 border-t border-[var(--color-border)] grid md:grid-cols-2 gap-6 lg:gap-10">
      {/* Feedback */}
      <section>
        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <MessageSquareMore size={16} className="text-[var(--color-primary)]" />
          Ai găsit o problemă? Ai o sugestie?
        </h4>
        <p className="text-xs text-[var(--color-text-muted)] mb-3 leading-relaxed">
          Scrie-mi direct — citesc tot. Răspund dacă lași un email.
        </p>
        <form onSubmit={submitFeedback} className="space-y-2.5">
          <div className="flex gap-1.5">
            {(Object.keys(KIND_META) as Kind[]).map((k) => {
              const Icon = KIND_META[k].icon;
              const active = kind === k;
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => setKind(k)}
                  className={`flex-1 inline-flex items-center justify-center gap-1 h-8 px-2 rounded-[6px] text-[11px] font-medium transition-colors ${
                    active
                      ? "bg-[var(--color-primary)] text-white"
                      : "bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:bg-[var(--color-border)]"
                  }`}
                  aria-pressed={active}
                >
                  <Icon size={12} />
                  <span className="hidden sm:inline">{KIND_META[k].label}</span>
                </button>
              );
            })}
          </div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={2000}
            placeholder={
              kind === "bug"
                ? "Descrie ce nu merge (URL, ce ai încercat, ce ai primit)..."
                : kind === "idea"
                ? "Ce ar merita adăugat sau schimbat?"
                : kind === "question"
                ? "Scrie întrebarea ta..."
                : "Scrie mesajul..."
            }
            className="w-full min-h-[80px] max-h-60 p-3 rounded-[8px] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-sm resize-y focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            required
          />
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemplu.ro (opțional)"
              autoComplete="email"
              className="flex-1 h-10 px-3 rounded-[8px] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
            <button
              type="submit"
              disabled={sending || message.trim().length < 5}
              className="h-10 px-4 rounded-[8px] bg-[var(--color-primary)] text-white text-sm font-semibold hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center gap-2"
            >
              {sending ? <Loader2 size={14} className="animate-spin" /> : done ? <Check size={14} /> : null}
              {sending ? "Se trimite..." : done ? "Mulțumesc!" : "Trimite"}
            </button>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          {done && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400">
              ✓ Mesajul a ajuns. Mersi că te-ai implicat.
            </p>
          )}
        </form>
      </section>

      {/* Newsletter */}
      <section>
        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <Mail size={16} className="text-[var(--color-primary)]" />
          Newsletter civic săptămânal
        </h4>
        <p className="text-xs text-[var(--color-text-muted)] mb-3 leading-relaxed">
          Top sesizări rezolvate, deadlines civice apropiate, evenimente pe
          care le ratezi. Un singur mail pe săptămână.
        </p>
        <form onSubmit={submitNewsletter} className="space-y-2.5">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="email@exemplu.ro"
              autoComplete="email"
              className="flex-1 h-10 px-3 rounded-[8px] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              required
            />
            <button
              type="submit"
              disabled={nlSending || !newsletterEmail.trim()}
              className="h-10 px-4 rounded-[8px] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-sm font-semibold hover:bg-[var(--color-surface)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center gap-2"
            >
              {nlSending ? <Loader2 size={14} className="animate-spin" /> : nlDone ? <Check size={14} /> : null}
              {nlSending ? "Înscriere..." : nlDone ? "Înscris!" : "Înscrie-mă"}
            </button>
          </div>
          {nlError && <p className="text-xs text-red-500">{nlError}</p>}
          {nlDone && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400">
              ✓ Te-am adăugat. Primul newsletter vine vinerea următoare.
            </p>
          )}
          <p className="text-[11px] text-[var(--color-text-muted)]">
            Fără spam. Dezabonare cu un click din orice mail.
          </p>
        </form>
      </section>
    </div>
  );
}
