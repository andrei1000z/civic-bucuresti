"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { trackAiUsage, trackCustomEvent } from "@/components/analytics/CiviaTracker";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_QUESTIONS = [
  "Câte sesizări s-au rezolvat luna asta?",
  "Când expiră impozitul pe clădire?",
  "Câți bani merg la educație din bugetul de stat?",
  "Cum fac o sesizare pentru groapă?",
  "Ce fac la cutremur?",
  "Care sunt top licee din România?",
];

/**
 * Quick actions — pre-filled expert prompts for the most common civic tasks.
 * Each sends a structured multi-turn request that produces a usable document.
 */
const QUICK_ACTIONS: { emoji: string; label: string; prompt: string }[] = [
  {
    emoji: "📮",
    label: "Scrie o cerere L544",
    prompt:
      "Scrie-mi o cerere formală în baza Legii 544/2001 privind accesul la informații de interes public. Vreau să aflu câte contracte de publicitate a semnat PMB în 2025 și cu ce firme. Cererea să fie gata de copiat, cu formulări legale corecte.",
  },
  {
    emoji: "📝",
    label: "Petiție OG 27/2002",
    prompt:
      "Ajută-mă să redactez o petiție formală în baza OG 27/2002. Problema: groapă periculoasă pe strada mea care nu e reparată de 3 luni. Structurează corect cu temei legal, solicitare clară și termenul de 30 zile.",
  },
  {
    emoji: "⚖️",
    label: "Contestă o amendă",
    prompt:
      "Vreau să contest o amendă contravențională de la Poliția Rutieră. Explică-mi pașii exacți și redactează un model de plângere. Menționează termenul de 15 zile, taxa judiciară, și motive de nulitate frecvente.",
  },
  {
    emoji: "🏛️",
    label: "Cum particip la dezbatere publică",
    prompt:
      "Cum particip efectiv la o dezbatere publică pentru un proiect de hotărâre a Consiliului Local? Pașii de urmat, termenul legal, cum îmi depun observațiile scrise ca să fie luate în considerare.",
  },
  {
    emoji: "🤝",
    label: "Înființez un ONG",
    prompt:
      "Explică-mi pașii pentru a înființa un ONG (asociație) în România. Acte necesare, costuri reale, unde depun dosarul, cât durează. Vreau o listă numerotată și costuri totale estimate.",
  },
  {
    emoji: "💰",
    label: "Ajutoare sociale disponibile",
    prompt:
      "Ce ajutoare sociale există în România pentru o familie cu doi copii și venit redus? Enumeră-le pe toate cu condiții de eligibilitate, cuantum și unde se depune cererea.",
  },
  {
    emoji: "📊",
    label: "Cerere buget L544",
    prompt:
      "Scrie o cerere L544/2001 către primăria orașului meu pentru execuția bugetară 2025: venituri, cheltuieli pe capitole (sănătate, educație, infrastructură), lista contractelor mai mari de 100.000 lei și procentul de realizare. Gata de trimis pe email.",
  },
  {
    emoji: "🏫",
    label: "Compară liceele din oraș",
    prompt:
      "Spune-mi care sunt top 5 licee din orașul meu după promovabilitatea BAC 2025, cu medii de admitere și recomandări concrete pentru părinți. Dacă nu ai date specifice, trimite-mă la /educatie pe civia.ro.",
  },
];

const INITIAL_MESSAGE: Message = {
  role: "assistant",
  content: "Salut! Sunt Asistentul Civia. Te pot ajuta cu informații despre transport, sesizări, primărie, ghiduri sau orice altceva despre oraș. Ce vrei să știi?",
};

const CHAT_STORAGE_KEY = "civic_chat_history";

function loadChatHistory(): Message[] {
  if (typeof window === "undefined") return [INITIAL_MESSAGE];
  try {
    const saved = sessionStorage.getItem(CHAT_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as Message[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }
  return [INITIAL_MESSAGE];
}

export function CivicAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(loadChatHistory);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Abort any in-flight stream on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  // Persist chat history (sessionStorage — survives tab reloads, cleared on close)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages.slice(-30)));
    } catch {
      // quota or disabled
    }
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streaming]);

  useEffect(() => {
    if (open) {
      // rAF guarantees the input is mounted before we focus; no race
      // with the panel-open transition, and no 200ms window where the
      // user's first keypress vanishes.
      const raf = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(raf);
    }
  }, [open]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || streaming) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    // Track each question for the admin dashboard — helps spot content
    // gaps ("what do people keep asking that we don't have a page for?")
    // and validates which quick-actions get used.
    trackAiUsage("chat");
    trackCustomEvent("ai-chat-message", {
      question: text.trim().slice(0, 160),
      turn: messages.length,
    });
    setMessages((prev) => {
      const next = [...prev, userMsg, { role: "assistant" as const, content: "" }];
      return next;
    });
    setInput("");
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          messages: [...messages, userMsg].slice(-10),
        }),
      });

      if (!res.ok || !res.body) throw new Error("Network error");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6).trim();
          if (payload === "[DONE]") continue;
          try {
            const parsed = JSON.parse(payload) as { delta?: string; error?: string };
            if (parsed.error) throw new Error(parsed.error);
            if (parsed.delta) {
              accumulated += parsed.delta;
              setMessages((prev) => {
                const next = [...prev];
                next[next.length - 1] = { role: "assistant", content: accumulated };
                return next;
              });
            }
          } catch {
            // skip malformed chunk
          }
        }
      }
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") {
        // Intentional cancel — silent
      } else {
        const errMsg = e instanceof Error ? e.message : "Eroare conexiune";
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = {
            role: "assistant",
            content: `Scuze, asistentul e temporar indisponibil. (${errMsg})`,
          };
          return next;
        });
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }, [messages, streaming]);

  return (
    <>
      {/* Launcher button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "fixed bottom-6 right-6 z-40 rounded-full shadow-[var(--shadow-xl)] transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-primary)]/40",
          "bg-gradient-to-br from-[var(--color-primary)] to-indigo-800 text-white",
          "hover:scale-105 active:scale-95",
          open ? "w-12 h-12" : "w-14 h-14"
        )}
        aria-label={open ? "Închide asistentul civic" : "Deschide asistentul civic AI"}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        {open ? <X size={20} className="m-auto" aria-hidden="true" /> : <Sparkles size={22} className="m-auto" aria-hidden="true" />}
      </button>

      {/* Chat window */}
      {open && (
        <div
          role="dialog"
          aria-modal="false"
          aria-labelledby="civic-assistant-title"
          className="fixed inset-x-3 bottom-24 sm:inset-x-auto sm:right-6 z-40 sm:w-[400px] h-[calc(100dvh-7rem)] sm:h-[600px] max-h-[calc(100dvh-7rem)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[16px] shadow-[var(--shadow-xl)] flex flex-col overflow-hidden animate-fade-in-up"
        >
          {/* Header */}
          <header className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] bg-gradient-to-r from-[var(--color-primary)] to-indigo-700 text-white">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center" aria-hidden="true">
                <MessageCircle size={16} />
              </div>
              <div>
                <p id="civic-assistant-title" className="font-semibold text-sm leading-tight">Asistent Civic</p>
                <p className="text-[10px] text-white/70 leading-tight">powered by Groq AI</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setMessages([INITIAL_MESSAGE]);
                  if (typeof window !== "undefined") sessionStorage.removeItem(CHAT_STORAGE_KEY);
                }}
                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                aria-label="Resetează conversația"
                title="Resetează"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <path d="M3 12a9 9 0 1 0 9-9 9 9 0 0 0-6.74 3.08L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                aria-label="Închide asistentul"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          </header>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4"
            role="log"
            aria-live="polite"
            aria-label="Conversație asistent civic"
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "flex",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-[var(--radius-md)] px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
                    msg.role === "user"
                      ? "bg-[var(--color-primary)] text-white rounded-br-sm"
                      : "bg-[var(--color-surface-2)] text-[var(--color-text)] rounded-bl-sm"
                  )}
                >
                  <span className="sr-only">{msg.role === "user" ? "Tu: " : "Asistent: "}</span>
                  {msg.content || (streaming && i === messages.length - 1 ? (
                    <span className="inline-flex gap-1" aria-label="Asistentul scrie">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-muted)] animate-bounce" style={{ animationDelay: "0ms" }} aria-hidden="true" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-muted)] animate-bounce" style={{ animationDelay: "150ms" }} aria-hidden="true" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-muted)] animate-bounce" style={{ animationDelay: "300ms" }} aria-hidden="true" />
                    </span>
                  ) : null)}
                </div>
              </div>
            ))}

            {/* Suggested questions + quick actions on empty state */}
            {messages.length === 1 && !streaming && (
              <div className="pt-2 space-y-3">
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider px-1">
                    Acțiuni utile
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {QUICK_ACTIONS.map((a) => (
                      <button
                        key={a.label}
                        type="button"
                        onClick={() => sendMessage(a.prompt)}
                        className="text-left text-xs px-2.5 py-2 rounded-[8px] bg-gradient-to-br from-[var(--color-primary-soft)] to-transparent hover:from-[var(--color-primary-soft)] hover:to-[var(--color-primary-soft)]/50 border border-[var(--color-primary)]/20 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                        title={a.prompt.slice(0, 100) + "…"}
                      >
                        <div className="text-base mb-0.5" aria-hidden="true">{a.emoji}</div>
                        <div className="font-medium leading-tight">{a.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider px-1">
                    Sau întreabă
                  </p>
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => sendMessage(q)}
                      className="w-full text-left text-xs px-3 py-2 rounded-[8px] bg-[var(--color-surface-2)] hover:bg-[var(--color-primary-soft)] border border-[var(--color-border)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form
            className="border-t border-[var(--color-border)] p-3"
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
          >
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Întreabă orice despre București..."
                aria-label="Mesaj pentru asistentul Civia"
                disabled={streaming}
                className="flex-1 h-10 px-3 rounded-[8px] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || streaming}
                aria-busy={streaming}
                className="w-10 h-10 rounded-[8px] bg-[var(--color-primary)] text-white flex items-center justify-center hover:bg-[var(--color-primary-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-primary)]"
                aria-label="Trimite mesajul"
              >
                <Send size={16} aria-hidden="true" />
              </button>
            </div>
            <p className="text-[10px] text-[var(--color-text-muted)] mt-2 text-center">
              AI poate face greșeli. Verifică informațiile importante oficial.
            </p>
          </form>
        </div>
      )}
    </>
  );
}
