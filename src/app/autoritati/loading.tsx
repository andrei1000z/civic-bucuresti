export default function Loading() {
  return (
    <div className="container-narrow py-12 md:py-16 animate-pulse">
      <div className="h-12 w-2/3 bg-[var(--color-surface-2)] rounded mb-3" />
      <div className="h-5 w-full max-w-3xl bg-[var(--color-surface-2)] rounded mb-2" />
      <div className="h-5 w-3/4 max-w-3xl bg-[var(--color-surface-2)] rounded mb-10" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-4 h-24"
          />
        ))}
      </div>

      <div className="h-12 bg-[var(--color-surface-2)] rounded-[var(--radius-sm)] mb-6" />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-sm)] p-4 h-40"
          />
        ))}
      </div>
    </div>
  );
}
