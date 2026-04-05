import Link from "next/link";
import { SearchX, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container-narrow py-16 md:py-24 max-w-lg text-center">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center">
        <SearchX size={36} className="text-[var(--color-text-muted)]" />
      </div>
      <h1 className="font-[family-name:var(--font-sora)] text-5xl font-bold mb-2">404</h1>
      <p className="text-lg text-[var(--color-text-muted)] mb-6">
        Pagina pe care o cauți nu există sau a fost mutată.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 h-11 px-5 rounded-[8px] bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-colors"
      >
        <Home size={16} />
        Pagina principală
      </Link>
    </div>
  );
}
