export default function Loading() {
  return (
    <div className="container-narrow py-16">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-[var(--color-surface-2)] rounded-[var(--radius-xs)] w-1/3" />
        <div className="h-4 bg-[var(--color-surface-2)] rounded-[var(--radius-xs)] w-2/3" />
        <div className="h-64 bg-[var(--color-surface-2)] rounded-[var(--radius-md)]" />
      </div>
    </div>
  );
}
