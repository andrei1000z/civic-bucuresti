export default function Loading() {
  return (
    <div className="container-narrow py-10 md:py-14 animate-pulse">
      <div className="h-6 w-32 bg-[var(--color-surface-2)] rounded-full mb-6" />
      <div className="h-7 w-40 bg-[var(--color-surface-2)] rounded-full mb-4" />
      <div className="h-12 w-2/3 bg-[var(--color-surface-2)] rounded mb-3" />
      <div className="h-5 w-full max-w-3xl bg-[var(--color-surface-2)] rounded mb-2" />
      <div className="h-5 w-3/4 max-w-3xl bg-[var(--color-surface-2)] rounded mb-8" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-4 h-20"
          />
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-5 h-48"
          />
        ))}
      </div>
    </div>
  );
}
