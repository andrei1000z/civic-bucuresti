"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

/**
 * Renders inline markdown for **bold** spans inside a paragraph. We avoid a
 * full markdown lib because the AI output is constrained to bold + bullets,
 * and dangerouslySetInnerHTML on user-adjacent text is risky.
 */
function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  // Match **xxx** non-greedy across the line — `s` flag is unnecessary since
  // we already split on \n upstream.
  const pattern = /\*\*([^*]+?)\*\*/g;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = pattern.exec(text)) !== null) {
    if (m.index > lastIndex) {
      parts.push(text.slice(lastIndex, m.index));
    }
    parts.push(
      <strong key={`${keyPrefix}-b${i++}`} className="font-bold text-[var(--color-text)]">
        {m[1]}
      </strong>,
    );
    lastIndex = m.index + m[0].length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

export function AiSummary({
  stireId,
  initialSummary,
  fallbackText,
}: {
  stireId: string;
  initialSummary: string | null;
  fallbackText: string;
}) {
  const [summary, setSummary] = useState<string | null>(initialSummary);
  const [loading, setLoading] = useState(!initialSummary);

  useEffect(() => {
    if (initialSummary) return;
    let cancelled = false;
    fetch(`/api/stiri/${stireId}/synthesize`)
      .then((r) => r.json())
      .then((j) => {
        if (!cancelled && j.data?.summary) {
          setSummary(j.data.summary);
        }
      })
      .catch(() => {
        if (!cancelled) setSummary(fallbackText);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [stireId, initialSummary, fallbackText]);

  if (loading) {
    return (
      <div className="flex items-center gap-3 py-4">
        <Loader2 size={16} className="animate-spin text-violet-500" />
        <p className="text-sm text-[var(--color-text-muted)]">
          Se generează sinteza AI...
        </p>
      </div>
    );
  }

  if (!summary) {
    return (
      <p className="text-sm text-[var(--color-text-muted)] italic">
        {fallbackText || "Nu am putut genera o sinteză pentru acest articol."}
      </p>
    );
  }

  // ── Group consecutive `- ` bullet lines into <ul>, render the rest as
  //    paragraphs / headings. Inline **bold** is rendered everywhere.
  const lines = summary.split("\n");
  const blocks: React.ReactNode[] = [];
  let bulletBuf: string[] = [];

  const flushBullets = () => {
    if (bulletBuf.length === 0) return;
    blocks.push(
      <ul
        key={`ul-${blocks.length}`}
        className="space-y-1.5 my-3 pl-1"
      >
        {bulletBuf.map((b, i) => (
          <li
            key={i}
            className="flex items-start gap-2 text-sm text-[var(--color-text)] leading-relaxed"
          >
            <span
              className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-[0.55rem] shrink-0"
              aria-hidden="true"
            />
            <span>{renderInline(b, `li-${i}`)}</span>
          </li>
        ))}
      </ul>,
    );
    bulletBuf = [];
  };

  lines.forEach((rawLine, i) => {
    const line = rawLine.trim();
    if (!line) {
      flushBullets();
      return;
    }

    // Bullet line: `- xxx` or `* xxx`
    const bulletMatch = line.match(/^[-*]\s+(.*)$/);
    if (bulletMatch && bulletMatch[1]) {
      bulletBuf.push(bulletMatch[1]);
      return;
    }

    flushBullets();

    // Whole-line heading wrapped in **
    if (line.startsWith("**") && line.endsWith("**") && line.length > 4) {
      blocks.push(
        <h3
          key={i}
          className="font-[family-name:var(--font-sora)] font-bold text-base mt-5 mb-2 text-[var(--color-text)]"
        >
          {line.replace(/^\*\*|\*\*$/g, "")}
        </h3>,
      );
      return;
    }

    // Section headers like "De ce contează:"
    if (line.match(/^(De ce contează|Context|Cifre cheie|Ce urmează|Programul|Detalii)/i)) {
      blocks.push(
        <h3
          key={i}
          className="font-[family-name:var(--font-sora)] font-bold text-sm mt-5 mb-1.5 text-violet-700 dark:text-violet-400"
        >
          {renderInline(line, `h-${i}`)}
        </h3>,
      );
      return;
    }

    blocks.push(
      <p
        key={i}
        className="mb-2.5 text-sm text-[var(--color-text)] leading-relaxed"
      >
        {renderInline(line, `p-${i}`)}
      </p>,
    );
  });

  flushBullets();

  return <div className="prose-civic">{blocks}</div>;
}
