interface BarData {
  label: string;
  value: number;
  color?: string;
  sub?: string;
}

/**
 * Tiny server-renderable bar chart — no JS, pure CSS widths.
 * Perfect for static data pages where Recharts would be overkill.
 */
export function SimpleBar({
  data,
  format = (v) => v.toLocaleString("ro-RO"),
  max,
}: {
  data: BarData[];
  format?: (v: number) => string;
  max?: number;
}) {
  const actualMax = max ?? Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="space-y-2.5">
      {data.map((d) => {
        const pct = (d.value / actualMax) * 100;
        return (
          <div key={d.label}>
            <div className="flex items-baseline justify-between gap-2 text-xs mb-1">
              <span className="font-medium truncate">{d.label}</span>
              <span className="text-[var(--color-text-muted)] tabular-nums shrink-0">
                {format(d.value)}
                {d.sub && <span className="ml-2 opacity-60">{d.sub}</span>}
              </span>
            </div>
            <div className="h-2 bg-[var(--color-surface-2)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${pct}%`,
                  backgroundColor: d.color ?? "var(--color-primary)",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
