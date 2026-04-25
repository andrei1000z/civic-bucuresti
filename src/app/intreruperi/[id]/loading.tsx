export default function Loading() {
  return (
    <div className="container-narrow py-8 md:py-12 animate-pulse">
      <div className="h-5 w-40 bg-[var(--color-surface-2)] rounded mb-6" />

      <div className="mb-8 pl-4 border-l-4 border-[var(--color-surface-2)]">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-6 w-24 bg-[var(--color-surface-2)] rounded-full" />
          <div className="h-6 w-20 bg-[var(--color-surface-2)] rounded-full" />
        </div>
        <div className="h-10 w-3/4 bg-[var(--color-surface-2)] rounded mb-3" />
        <div className="h-5 w-full max-w-2xl bg-[var(--color-surface-2)] rounded" />
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-8">
        <div className="space-y-6">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-6 h-64" />
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-6 h-80" />
        </div>
        <aside className="space-y-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-5 h-32" />
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[12px] p-5 h-32" />
        </aside>
      </div>
    </div>
  );
}
