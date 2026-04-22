import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { BreadcrumbJsonLd } from "@/components/FaqJsonLd";
import { SITE_URL } from "@/lib/constants";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

/**
 * Visual breadcrumb trail + matching schema.org BreadcrumbList. Pass
 * items without the "Acasă" entry — we prepend it automatically so
 * every page has the same root.
 *
 * The JSON-LD variant gets absolute URLs (required by schema.org);
 * the rendered links stay relative so they work across environments.
 */
export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const withHome: BreadcrumbItem[] = [{ label: "Acasă", href: "/" }, ...items];

  return (
    <>
      <BreadcrumbJsonLd
        items={withHome.map((it) => ({
          name: it.label,
          url: it.href ? `${SITE_URL}${it.href}` : SITE_URL,
        }))}
      />
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="flex flex-wrap items-center gap-1 text-xs text-[var(--color-text-muted)]">
          {withHome.map((it, i) => {
            const isLast = i === withHome.length - 1;
            return (
              <li key={i} className="flex items-center gap-1">
                {i === 0 && <Home size={12} aria-hidden />}
                {it.href && !isLast ? (
                  <Link
                    href={it.href}
                    className="hover:text-[var(--color-primary)] hover:underline transition-colors"
                  >
                    {it.label}
                  </Link>
                ) : (
                  <span className={isLast ? "text-[var(--color-text)] font-medium" : ""} aria-current={isLast ? "page" : undefined}>
                    {it.label}
                  </span>
                )}
                {!isLast && <ChevronRight size={12} aria-hidden />}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
