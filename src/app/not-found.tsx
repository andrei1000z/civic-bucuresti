import Link from "next/link";
import { SearchX, Home, Map, AlertCircle, BookOpen, Newspaper } from "lucide-react";
import { NotFoundTracker } from "./NotFoundTracker";
import { NotFoundSearchButton } from "./NotFoundSearchButton";

export default function NotFound() {
  const quickLinks = [
    { href: "/harti", label: "Hărți", icon: Map },
    { href: "/sesizari", label: "Sesizări", icon: AlertCircle },
    { href: "/ghiduri", label: "Ghiduri", icon: BookOpen },
    { href: "/stiri", label: "Știri", icon: Newspaper },
  ];

  return (
    <div className="container-narrow py-16 md:py-24 max-w-lg text-center">
      <NotFoundTracker />
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center">
        <SearchX size={36} className="text-[var(--color-text-muted)]" />
      </div>
      <h1 className="font-[family-name:var(--font-sora)] text-5xl font-bold mb-2">404</h1>
      <p className="text-lg text-[var(--color-text-muted)] mb-8">
        Pagina pe care o cauți nu există sau a fost mutată.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-[8px] bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-colors"
        >
          <Home size={16} />
          Pagina principală
        </Link>
        <NotFoundSearchButton />
      </div>

      <div className="mt-8 pt-6 border-t border-[var(--color-border)]">
        <p className="text-sm text-[var(--color-text-muted)] mb-4">Sau încearcă:</p>
        <div className="flex flex-wrap justify-center gap-3">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex items-center gap-2 h-10 px-4 rounded-[8px] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-sm font-medium hover:bg-[var(--color-surface)] transition-colors"
              >
                <Icon size={14} />
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
