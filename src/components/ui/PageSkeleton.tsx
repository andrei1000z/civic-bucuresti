/**
 * Page-level loading skeletons used by `loading.tsx` files across the App Router.
 *
 * Philosophy:
 *   - Mirror the real page layout closely — heights, widths, gaps — so there's no
 *     visual shift when the real content takes over.
 *   - Keep them dependency-free and zero-JS (pure CSS pulse).
 *   - Import only the variant needed; every KB counts on the navigation critical path.
 */

function Shimmer({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-[var(--color-surface-2)] rounded-[8px] ${className}`}
    />
  );
}

/** Generic article / detail page layout */
export function ArticleSkeleton() {
  return (
    <div className="container-narrow py-12 md:py-16 max-w-4xl">
      <Shimmer className="h-5 w-32 mb-6" />
      <Shimmer className="h-10 w-full max-w-2xl mb-4" />
      <Shimmer className="h-5 w-full max-w-md mb-8" />
      <div className="grid lg:grid-cols-[1fr_300px] gap-8">
        <div className="space-y-3">
          <Shimmer className="h-40 w-full" />
          <Shimmer className="h-4 w-full" />
          <Shimmer className="h-4 w-11/12" />
          <Shimmer className="h-4 w-full" />
          <Shimmer className="h-4 w-3/4" />
          <Shimmer className="h-4 w-5/6" />
          <Shimmer className="h-4 w-full" />
        </div>
        <aside className="space-y-3">
          <Shimmer className="h-40" />
          <Shimmer className="h-24" />
        </aside>
      </div>
    </div>
  );
}

/** Dashboard / stats / listing page with metric cards at top */
export function DashboardSkeleton() {
  return (
    <div className="container-narrow py-12 md:py-16">
      <Shimmer className="h-6 w-28 mb-4" />
      <Shimmer className="h-12 w-3/4 max-w-2xl mb-4" />
      <Shimmer className="h-5 w-full max-w-xl mb-10" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <Shimmer className="h-24" />
        <Shimmer className="h-24" />
        <Shimmer className="h-24" />
        <Shimmer className="h-24" />
      </div>

      <Shimmer className="h-8 w-48 mb-4" />
      <Shimmer className="h-64 w-full mb-10" />

      <Shimmer className="h-8 w-56 mb-4" />
      <div className="grid md:grid-cols-2 gap-4">
        <Shimmer className="h-32" />
        <Shimmer className="h-32" />
        <Shimmer className="h-32" />
        <Shimmer className="h-32" />
      </div>
    </div>
  );
}

/** List of items (sesizari, stiri, events) */
export function ListSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="container-narrow py-12 md:py-16">
      <Shimmer className="h-10 w-64 mb-3" />
      <Shimmer className="h-5 w-full max-w-lg mb-8" />
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <Shimmer key={i} className="h-24 w-full" />
        ))}
      </div>
    </div>
  );
}

/** Ghid / long-form reading */
export function GuideSkeleton() {
  return (
    <div>
      {/* Hero */}
      <div className="h-72 bg-gradient-to-br from-slate-200 to-slate-400 dark:from-slate-700 dark:to-slate-900 animate-pulse" />
      <div className="container-narrow py-8 md:py-12 max-w-3xl space-y-4">
        <Shimmer className="h-4 w-full" />
        <Shimmer className="h-4 w-5/6" />
        <Shimmer className="h-4 w-full" />
        <Shimmer className="h-4 w-11/12" />
        <Shimmer className="h-4 w-full" />
        <Shimmer className="h-4 w-4/5" />
        <div className="h-4" />
        <Shimmer className="h-6 w-64" />
        <Shimmer className="h-4 w-full" />
        <Shimmer className="h-4 w-11/12" />
        <Shimmer className="h-4 w-full" />
      </div>
    </div>
  );
}
