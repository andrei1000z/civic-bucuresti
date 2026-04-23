import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";
import { STATUS_COLORS, STATUS_LABELS } from "@/lib/constants";
import { timeAgo } from "@/lib/utils";
import type { SesizareFeedRow } from "@/lib/supabase/types";

interface Props {
  sesizari: SesizareFeedRow[];
}

export function SimilarSesizari({ sesizari }: Props) {
  if (sesizari.length === 0) return null;

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-5">
      <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-semibold mb-3">
        Alții au sesizat aceeași problemă
      </p>
      <ul className="space-y-3">
        {sesizari.slice(0, 5).map((s) => (
          <li key={s.id}>
            <Link
              href={`/sesizari/${s.code}`}
              className="group block p-3 -mx-3 rounded-[8px] hover:bg-[var(--color-surface-2)] transition-colors"
            >
              <div className="flex items-start gap-2 mb-1">
                <span
                  className="mt-1 inline-block w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: STATUS_COLORS[s.status] ?? "#64748B" }}
                  aria-hidden
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-2 group-hover:text-[var(--color-primary)] transition-colors">
                    {s.titlu}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-[var(--color-text-muted)] min-w-0">
                    <MapPin size={11} className="shrink-0" />
                    <span className="truncate flex-1 min-w-0">{s.author_name}</span>
                    <span className="shrink-0">·</span>
                    <span className="shrink-0 whitespace-nowrap">{timeAgo(s.created_at)}</span>
                  </div>
                  <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                    {STATUS_LABELS[s.status] ?? s.status}
                  </span>
                </div>
                <ArrowRight
                  size={14}
                  className="text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity mt-1"
                />
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <p className="text-xs text-[var(--color-text-muted)] mt-3 pt-3 border-t border-[var(--color-border)]">
        În raza de 300m · același tip
      </p>
    </div>
  );
}
