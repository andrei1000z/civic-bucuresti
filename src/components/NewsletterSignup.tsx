"use client";

import { useState } from "react";
import { Mail, CheckCircle2, Loader2 } from "lucide-react";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Eroare");
      setStatus("ok");
      setEmail("");
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Eroare");
    }
  };

  return (
    <section className="bg-gradient-to-br from-[var(--color-primary)] to-indigo-800 text-white rounded-[20px] p-6 md:p-10 text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />
      <div className="relative z-10 max-w-2xl mx-auto">
        <Mail size={32} className="mx-auto mb-3 opacity-80" />
        <h3 className="font-[family-name:var(--font-sora)] text-2xl md:text-3xl font-bold mb-2">
          Newsletter săptămânal
        </h3>
        <p className="text-white/80 mb-6">
          Rezumat în fiecare luni: top sesizări, știri verificate, progres primărie.
        </p>
        {status === "ok" ? (
          <div className="inline-flex items-center gap-2 px-4 py-3 rounded-[8px] bg-white/20 backdrop-blur">
            <CheckCircle2 size={18} />
            <span className="font-medium">Te-am abonat cu succes!</span>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="emailul tău"
              className="flex-1 h-12 px-4 rounded-[8px] bg-white/15 backdrop-blur border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
              disabled={status === "loading"}
            />
            <button
              type="submit"
              disabled={status === "loading" || !email}
              className="h-12 px-6 rounded-[8px] bg-white text-[var(--color-primary)] font-semibold hover:bg-blue-50 disabled:opacity-50 transition-all inline-flex items-center justify-center gap-2"
            >
              {status === "loading" ? <Loader2 size={16} className="animate-spin" /> : "Abonează-te"}
            </button>
          </form>
        )}
        {error && <p className="text-sm text-red-200 mt-3">{error}</p>}
        <p className="text-[10px] text-white/50 mt-4">
          Fără spam. Te dezabonezi oricând.
        </p>
      </div>
    </section>
  );
}
