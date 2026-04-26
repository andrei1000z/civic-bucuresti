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
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<Recognition | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const w = window as SpeechWindow;
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    // setState în effect e intenționat — feature detection rulează doar pe client.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSupported(!!Ctor);
  }, []);

  // Stop any in-progress recording when the component unmounts —
  // avoids ghost mic access if user navigates away mid-dictation.
  useEffect(() => {
    return () => {
      try { recRef.current?.stop(); } catch { /* already stopped */ }
    };
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
    setError(null);
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
    rec.onerror = (e: unknown) => {
      setListening(false);
      // Common browser errors: "not-allowed" (mic permission denied)
      // or "no-speech" (silence). Translate for the user.
      const code = (e as { error?: string })?.error ?? "";
      if (code === "not-allowed" || code === "service-not-allowed") {
        setError("Permisiunea microfonului a fost refuzată. Activează-o din setările browser-ului.");
      } else if (code === "no-speech") {
        setError("Nu te-am auzit. Încearcă mai aproape de microfon.");
      } else if (code === "network") {
        setError("Fără conexiune — dictarea are nevoie de net.");
      }
    };
    rec.onend = () => setListening(false);
    try {
      rec.start();
      recRef.current = rec;
      setListening(true);
    } catch {
      // .start() throws InvalidStateError if the underlying service
      // is already running (double-click). Ignore — next end fires.
    }
  };

  return (
    <div className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={toggle}
        aria-label={listening ? "Oprește dictarea" : "Dictează în română"}
        aria-pressed={listening}
        className={`inline-flex items-center justify-center w-9 h-9 rounded-[8px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] ${
          listening
            ? "bg-red-500 text-white animate-pulse"
            : "bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:bg-[var(--color-surface)] text-[var(--color-text-muted)]"
        } ${className ?? ""}`}
        title={listening ? "Înregistrează... apasă pentru stop" : "Dictează în română (clic pentru start)"}
      >
        {listening ? <MicOff size={14} aria-hidden="true" /> : <Mic size={14} aria-hidden="true" />}
      </button>
      {error && (
        <p className="text-[10px] text-red-500 max-w-[180px] text-right" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
