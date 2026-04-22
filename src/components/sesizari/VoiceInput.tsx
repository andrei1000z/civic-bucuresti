"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";

// Subset of the Web Speech API types we need. Not in lib.dom yet on
// every browser's TS bundle, so we declare just the surface we use.
interface SpeechEventLike {
  resultIndex: number;
  results: ArrayLike<{
    isFinal: boolean;
    0: { transcript: string };
  }>;
}
interface Recognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((e: SpeechEventLike) => void) | null;
  onerror: ((e: unknown) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}
interface SpeechWindow extends Window {
  SpeechRecognition?: new () => Recognition;
  webkitSpeechRecognition?: new () => Recognition;
}

/**
 * Microphone button that dictates Romanian speech into a target
 * callback. Uses the Web Speech API when available (Chrome, Edge,
 * Safari iOS 14+); hides itself on unsupported browsers so the
 * keyboard-only UX stays clean.
 */
export function VoiceInput({
  onTranscript,
  className,
}: {
  onTranscript: (delta: string) => void;
  className?: string;
}) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const recRef = useRef<Recognition | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const w = window as SpeechWindow;
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    setSupported(!!Ctor);
  }, []);

  if (!supported) return null;

  const toggle = () => {
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const w = window as SpeechWindow;
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) return;
    const rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = false;
    rec.lang = "ro-RO";
    rec.onresult = (e: SpeechEventLike) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r && r.isFinal) {
          const text = r[0]?.transcript ?? "";
          if (text.trim()) onTranscript(text);
        }
      }
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    rec.start();
    recRef.current = rec;
    setListening(true);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={listening ? "Oprește dictarea" : "Dictează"}
      aria-pressed={listening}
      className={`inline-flex items-center justify-center w-9 h-9 rounded-[8px] transition-colors ${
        listening
          ? "bg-red-500 text-white animate-pulse"
          : "bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:bg-[var(--color-surface)] text-[var(--color-text-muted)]"
      } ${className ?? ""}`}
      title={listening ? "Înregistrează... apasă pentru stop" : "Dictează în română"}
    >
      {listening ? <MicOff size={14} /> : <Mic size={14} />}
    </button>
  );
}
