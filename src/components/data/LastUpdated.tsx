import { Clock } from "lucide-react";

const MONTHS_RO = [
  "ianuarie", "februarie", "martie", "aprilie", "mai", "iunie",
  "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie",
];

// Format "2026-04-10" → "10 aprilie 2026" without relying on ICU (SSR/client parity).
function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map((n) => parseInt(n, 10));
  if (!y || !m || !d || m < 1 || m > 12) return iso;
  return `${d} ${MONTHS_RO[m - 1]} ${y}`;
}

export function LastUpdated({
  date,
  sources,
  note,
}: {
  date: string;
  sources?: readonly string[];
  note?: string;
}) {
  return (
    <div className="mt-12 pt-6 border-t border-[var(--color-border)] text-xs text-[var(--color-text-muted)]">
      <div className="flex items-start gap-2 flex-wrap">
        <Clock size={14} className="mt-0.5 shrink-0" />
        <div>
          <p>
            <span className="font-medium text-[var(--color-text)]">Ultima actualizare:</span>{" "}
            {formatDate(date)}
          </p>
          {sources && sources.length > 0 && (
            <p className="mt-1">Surse: {sources.join(" · ")}</p>
          )}
          {note && <p className="mt-1 italic">{note}</p>}
        </div>
      </div>
    </div>
  );
}
