"use client";

import { useState } from "react";
import { Mail, Copy, Check, ExternalLink } from "lucide-react";
import {
  buildMailtoLink,
  buildGmailLink,
  buildOutlookLink,
  buildYahooLink,
  buildEmailPayload,
  type MailtoInput,
} from "@/lib/sesizari/mailto";

interface Props {
  input: MailtoInput;
  compact?: boolean;
}

export function EmailChoicePanel({ input, compact }: Props) {
  const [copied, setCopied] = useState<"all" | "body" | "to" | null>(null);

  const payload = buildEmailPayload(input);

  const copyAll = async () => {
    const text = `Către: ${payload.to.join(", ")}\nCC: ${payload.cc.join(", ")}\nSubiect: ${payload.subject}\n\n${payload.body}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied("all");
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // ignore
    }
  };

  const copyBody = async () => {
    try {
      await navigator.clipboard.writeText(payload.body);
      setCopied("body");
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // ignore
    }
  };

  const copyTo = async () => {
    try {
      await navigator.clipboard.writeText(payload.to.join(", ") + (payload.cc.length > 0 ? `, ${payload.cc.join(", ")}` : ""));
      setCopied("to");
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className={compact ? "" : "space-y-3"}>
      {/* Big primary buttons */}
      <div className="grid sm:grid-cols-2 gap-2">
        <a
          href={buildGmailLink(input)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 h-12 px-4 rounded-[8px] bg-[var(--color-primary)] text-white font-semibold hover:bg-[var(--color-primary-hover)] shadow-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-primary)]"
        >
          <Mail size={18} />
          Deschide în Gmail
          <ExternalLink size={12} className="opacity-70" />
        </a>
        <a
          href={buildOutlookLink(input)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 h-12 px-4 rounded-[8px] bg-[#0078d4] text-white font-semibold hover:brightness-110 shadow-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0078d4]"
        >
          <Mail size={18} />
          Deschide în Outlook
          <ExternalLink size={12} className="opacity-70" />
        </a>
      </div>

      {/* Smaller secondary */}
      <div className="grid grid-cols-3 gap-2">
        <a
          href={buildYahooLink(input)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 h-9 px-2 rounded-[8px] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs font-medium hover:bg-[var(--color-surface)] transition-colors"
        >
          Yahoo
        </a>
        <a
          href={buildMailtoLink(input)}
          className="inline-flex items-center justify-center gap-1.5 h-9 px-2 rounded-[8px] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs font-medium hover:bg-[var(--color-surface)] transition-colors"
          title="Folosește aplicația ta de email nativă"
        >
          Mail nativ
        </a>
        <button
          type="button"
          onClick={copyAll}
          className="inline-flex items-center justify-center gap-1.5 h-9 px-2 rounded-[8px] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs font-medium hover:bg-[var(--color-surface)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
        >
          {copied === "all" ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
          {copied === "all" ? "Copiat în clipboard" : "Copiază emailul"}
        </button>
      </div>

      {!compact && (
        <details className="bg-[var(--color-surface-2)] rounded-[8px] p-3 text-xs">
          <summary className="font-medium cursor-pointer select-none">
            Trimit manual din alt client de email
          </summary>
          <div className="mt-3 space-y-3">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] mb-1">
                Către
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 block p-2 rounded bg-[var(--color-surface)] font-mono text-[10px] break-all">
                  {payload.to.join(", ")}
                  {payload.cc.length > 0 && `, ${payload.cc.join(", ")}`}
                </code>
                <button
                  type="button"
                  onClick={copyTo}
                  className="h-8 px-2 rounded bg-[var(--color-surface)] text-[10px] font-medium hover:bg-[var(--color-border)]"
                >
                  {copied === "to" ? "✓ Copiat" : "Copiază"}
                </button>
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] mb-1">
                Subiect
              </p>
              <code className="block p-2 rounded bg-[var(--color-surface)] font-mono text-[10px] break-all">
                {payload.subject}
              </code>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">
                  Corpul emailului
                </p>
                <button
                  type="button"
                  onClick={copyBody}
                  className="h-7 px-2 rounded bg-[var(--color-surface)] text-[10px] font-medium hover:bg-[var(--color-border)]"
                >
                  {copied === "body" ? "✓ Copiat" : "Copiază textul"}
                </button>
              </div>
              <pre className="p-2 rounded bg-[var(--color-surface)] text-[10px] whitespace-pre-wrap font-mono max-h-60 overflow-y-auto">
                {payload.body}
              </pre>
            </div>
          </div>
        </details>
      )}
    </div>
  );
}
