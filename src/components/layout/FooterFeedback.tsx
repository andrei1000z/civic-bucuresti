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
    const trimmed = newsletterEmail.trim();
    if (!trimmed) return;
    if (!/^[\w.+-]+@[\w-]+\.[\w.-]+$/.test(trimmed)) {
      setNlError("Adresă de email incorectă — verifică formatul.");
      return;
    }
    setNlSending(true);
    setNlError(null);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
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
    // `id="footer-feedback"` is the anchor target for /not-found and
    // a few other pages that say "scrie-ne aici" — without it those
    // links would jump to the homepage top.
    <div
      id="footer-feedback"
      className="mt-10 pt-8 border-t border-[var(--color-border)] grid md:grid-cols-2 gap-6 lg:gap-10 scroll-mt-24"
    >
      {/* Feedback */}
      <section>
        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <MessageSquareMore size={16} className="text-[var(--color-primary)]" />
          Ce nu-ți place la Civia? Ce lipsește?
        </h4>
        <p className="text-xs text-[var(--color-text-muted)] mb-3 leading-relaxed">
          Platforma se construiește cu tine. Un bug, o idee, o pagină lipsă — orice feedback ajunge direct la mine. Răspund dacă lași un mesaj.
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
                  className={`flex-1 inline-flex items-center justify-center gap-1 h-8 px-2 rounded-[6px] text-[11px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] ${
                    active
                      ? "bg-[var(--color-primary)] text-white"
                      : "bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:bg-[var(--color-border)]"
                  }`}
                  aria-pressed={active}
                  aria-label={`Categorie feedback: ${KIND_META[k].label}`}
                >
                  <Icon size={12} aria-hidden="true" />
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
            className="w-full min-h-[80px] max-h-60 p-3 rounded-[var(--radius-xs)] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-sm resize-y focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
            required
          />
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemplu.ro (opțional)"
              autoComplete="email"
              className="flex-1 h-10 px-3 rounded-[var(--radius-xs)] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
            />
            <button
              type="submit"
              disabled={sending || message.trim().length < 5}
              aria-busy={sending}
              className="h-10 px-4 rounded-[var(--radius-xs)] bg-[var(--color-primary)] text-white text-sm font-semibold hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-primary)]"
            >
              {sending ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : done ? <Check size={14} aria-hidden="true" /> : null}
              {sending ? "Se trimite..." : done ? "Mulțumesc!" : "Trimite"}
            </button>
          </div>
          {error && <p role="alert" className="text-xs text-red-500">{error}</p>}
          {done && (
            <p role="status" className="text-xs text-emerald-600 dark:text-emerald-400">
              <span aria-hidden="true">✓ </span>Mesajul a ajuns. Mersi că te-ai implicat.
            </p>
          )}
        </form>
      </section>

      {/* Newsletter */}
      <section>
        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <Mail size={16} className="text-[var(--color-primary)]" />
          Newsletter săptămânal — lunea
        </h4>
        <p className="text-xs text-[var(--color-text-muted)] mb-3 leading-relaxed">
          Cele mai votate sesizări rezolvate, petiții civice noi, deadline-uri și evenimente locale — tot ce s-a mișcat în România săptămâna trecută, într-un singur email de 2 minute.
        </p>
        <form onSubmit={submitNewsletter} className="space-y-2.5">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="email@exemplu.ro"
              autoComplete="email"
              className="flex-1 h-10 px-3 rounded-[var(--radius-xs)] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
              required
            />
            <button
              type="submit"
              disabled={nlSending || !newsletterEmail.trim()}
              aria-busy={nlSending}
              className="h-10 px-4 rounded-[var(--radius-xs)] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-sm font-semibold hover:bg-[var(--color-surface)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
            >
              {nlSending ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : nlDone ? <Check size={14} aria-hidden="true" /> : null}
              {nlSending ? "Înscriere..." : nlDone ? "Înscris!" : "Înscrie-mă"}
            </button>
          </div>
          {nlError && <p role="alert" className="text-xs text-red-500">{nlError}</p>}
          {nlDone && (
            <p role="status" className="text-xs text-emerald-600 dark:text-emerald-400">
              <span aria-hidden="true">✓ </span>Te-am adăugat. Primul newsletter vine lunea următoare.
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
