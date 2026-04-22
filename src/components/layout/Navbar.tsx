"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Menu, X, ChevronDown, AlertCircle, MapPin, Search } from "lucide-react";
import { NAV_LINKS, NAV_MORE, NAV_DATE_PUBLICE, GHID_DROPDOWN, SITE_NAME } from "@/lib/constants";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserMenu } from "@/components/auth/UserMenu";
import { NotificationBell } from "@/components/NotificationBell";
import { useCountyOptional } from "@/lib/county-context";
import { cn } from "@/lib/utils";
import { LiveWeatherAqi } from "@/components/home/LiveWeatherAqi";
import { ALL_COUNTIES } from "@/data/counties";

export function Navbar() {
  const pathname = usePathname();
  const county = useCountyOptional();
  const [scrolled, setScrolled] = useState(false);

  // Detect county slug from pathname if context not available.
  // The regex matches both /ar/statistici AND /ar (county homepage, no trailing slash).
  const pathSlug = pathname.match(/^\/([a-z]{1,2})(?:\/|$)/)?.[1] ?? null;
  // Validate it's an actual county slug — not a random 2-letter path
  const validatedSlug = pathSlug && ALL_COUNTIES.some((c) => c.slug === pathSlug) ? pathSlug : null;
  const countySlug = county?.slug ?? validatedSlug;
  const countyObj = county ?? (validatedSlug ? ALL_COUNTIES.find((c) => c.slug === validatedSlug) : null);
  const countyName = countyObj?.name ?? null;

  // Prefix links with county slug if we're inside a county route
  const prefixedLinks = NAV_LINKS.map((l) => ({
    ...l,
    href: countySlug ? `/${countySlug}${l.href}` : l.href,
  }));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [ghidDropdown, setGhidDropdown] = useState(false);
  const [moreDropdown, setMoreDropdown] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-[var(--color-surface)]/85 backdrop-blur-md border-b border-[var(--color-border)] shadow-[var(--shadow-soft)]"
            : "bg-transparent"
        )}
      >
        <div className="container-narrow flex items-center justify-between h-16">
          <Link href={countySlug ? `/${countySlug}` : "/"} className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-[var(--radius-button)] bg-gradient-to-br from-[var(--color-primary)] to-emerald-900 flex items-center justify-center text-white">
              <MapPin size={18} strokeWidth={2.5} />
            </div>
            <span className="font-[family-name:var(--font-sora)] font-bold text-lg text-[var(--color-text)]">
              {SITE_NAME}
            </span>
            {countyName && (
              <span className="text-xs text-[var(--color-text-muted)] font-medium">· {countyName}</span>
            )}
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {prefixedLinks.map((link) => {
              const ghiduriHref = countySlug ? `/${countySlug}/ghiduri` : "/ghiduri";
              if (link.href === ghiduriHref) {
                return (
                  <div
                    key={link.href}
                    className="relative"
                    onMouseEnter={() => setGhidDropdown(true)}
                    onMouseLeave={() => setGhidDropdown(false)}
                  >
                    <Link
                      href={link.href}
                      aria-current={pathname.startsWith("/ghiduri") ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-1 px-3 py-2 rounded-[var(--radius-button)] text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]",
                        pathname.startsWith("/ghiduri")
                          ? "text-[var(--color-primary)] bg-[var(--color-primary-soft)]"
                          : "text-[var(--color-text)] hover:bg-[var(--color-surface-2)]"
                      )}
                    >
                      {link.label}
                      <ChevronDown size={14} className={cn("transition-transform", ghidDropdown && "rotate-180")} />
                    </Link>
                    <div
                      className={cn(
                        "absolute top-full left-0 w-64 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] shadow-[var(--shadow-lg)] overflow-hidden py-2 origin-top transition-all duration-150",
                        ghidDropdown
                          ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                          : "opacity-0 scale-95 -translate-y-1 pointer-events-none"
                      )}
                    >
                      {GHID_DROPDOWN.map((ghid) => (
                        <Link
                          key={ghid.href}
                          href={countySlug ? `/${countySlug}${ghid.href}` : ghid.href}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[var(--color-surface-2)] transition-colors focus:outline-none focus-visible:bg-[var(--color-surface-2)] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-primary)]"
                        >
                          <span className="text-xl" aria-hidden="true">{ghid.icon}</span>
                          <span className="text-[var(--color-text)]">{ghid.label}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              }
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "px-3 py-2 rounded-[var(--radius-button)] text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]",
                    isActive
                      ? "text-[var(--color-primary)] bg-[var(--color-primary-soft)]"
                      : "text-[var(--color-text)] hover:bg-[var(--color-surface-2)]"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}

            {/* "Mai mult" dropdown — secondary links + date publice */}
            <div
              className="relative"
              onMouseEnter={() => setMoreDropdown(true)}
              onMouseLeave={() => setMoreDropdown(false)}
            >
              <button
                type="button"
                onClick={() => setMoreDropdown((v) => !v)}
                className={cn(
                  "flex items-center gap-1 px-3 py-2 rounded-[var(--radius-button)] text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]",
                  "text-[var(--color-text)] hover:bg-[var(--color-surface-2)]"
                )}
                aria-expanded={moreDropdown}
                aria-haspopup="menu"
              >
                Mai mult
                <ChevronDown size={14} className={cn("transition-transform", moreDropdown && "rotate-180")} />
              </button>
              <div
                className={cn(
                  "absolute top-full right-0 w-72 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] shadow-[var(--shadow-lg)] overflow-hidden py-2 origin-top transition-all duration-150",
                  moreDropdown
                    ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 scale-95 -translate-y-1 pointer-events-none"
                )}
              >
                {NAV_MORE.filter((l) => !("countyOnly" in l && l.countyOnly) || countySlug).map((link) => (
                  <Link
                    key={link.href}
                    href={countySlug ? `/${countySlug}${link.href}` : link.href}
                    onClick={() => setMoreDropdown(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-[var(--color-surface-2)] transition-colors focus:outline-none focus-visible:bg-[var(--color-surface-2)] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-primary)]"
                  >
                    <span className="text-lg" aria-hidden="true">{link.icon}</span>
                    <span className="text-[var(--color-text)]">{link.label}</span>
                  </Link>
                ))}
                <div className="my-2 border-t border-[var(--color-border)]" role="separator" />
                <div className="px-4 py-1 text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] font-semibold">
                  Date publice
                </div>
                {NAV_DATE_PUBLICE.map((link) => (
                  <Link
                    key={link.href}
                    href={countySlug ? `/${countySlug}${link.href}` : link.href}
                    onClick={() => setMoreDropdown(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-[var(--color-surface-2)] transition-colors focus:outline-none focus-visible:bg-[var(--color-surface-2)] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-primary)]"
                  >
                    <span className="text-lg" aria-hidden="true">{link.icon}</span>
                    <span className="text-[var(--color-text)]">{link.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            {countySlug && (
              <div className="hidden xl:block">
                <LiveWeatherAqi />
              </div>
            )}
            <button
              onClick={() => {
                document.dispatchEvent(new CustomEvent("open-command-palette"));
              }}
              className="hidden sm:flex w-10 h-10 rounded-[var(--radius-button)] bg-[var(--color-surface-2)] hover:bg-[var(--color-surface)] border border-[var(--color-border)] items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
              aria-label="Caută (Ctrl+K)"
              title="Caută (Ctrl+K)"
            >
              <Search size={16} />
            </button>
            <ThemeToggle />
            <NotificationBell />
            <UserMenu />
            <Link
              href={countySlug ? `/${countySlug}/sesizari` : "/sesizari"}
              className="hidden md:inline-flex items-center gap-2 h-10 px-4 rounded-[var(--radius-button)] bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-hover)] shadow-md transition-all"
            >
              <AlertCircle size={16} />
              Fă sesizare
            </Link>
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden w-10 h-10 rounded-[var(--radius-button)] bg-[var(--color-surface-2)] hover:bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text)]"
              aria-label="Deschide meniul"
              aria-expanded={mobileOpen}
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu — CSS transitions instead of framer-motion */}
      <div
        className={cn(
          "fixed inset-0 z-[60] bg-[var(--color-surface)] lg:hidden transition-opacity duration-200",
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        aria-hidden={!mobileOpen}
      >
        <div className="container-narrow flex items-center justify-between h-16 border-b border-[var(--color-border)]">
          <Link href="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
            <div className="w-9 h-9 rounded-[var(--radius-button)] bg-gradient-to-br from-[var(--color-primary)] to-emerald-900 flex items-center justify-center text-white">
              <MapPin size={18} strokeWidth={2.5} />
            </div>
            <span className="font-[family-name:var(--font-sora)] font-bold text-lg">{SITE_NAME}</span>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="w-10 h-10 rounded-[var(--radius-button)] bg-[var(--color-surface-2)] flex items-center justify-center"
            aria-label="Închide meniul"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="container-narrow py-6 flex flex-col gap-1">
          {prefixedLinks.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                transitionDelay: mobileOpen ? `${i * 40}ms` : "0ms",
              }}
              className={cn(
                "block px-4 py-3 rounded-[var(--radius-button)] text-base font-medium transition-all duration-200",
                mobileOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4",
                pathname === link.href
                  ? "bg-[var(--color-primary)] text-white"
                  : "text-[var(--color-text)] hover:bg-[var(--color-surface-2)]"
              )}
            >
              {link.label}
            </Link>
          ))}
          {/* Mai mult — secondary links */}
          <div className="pt-3 mt-3 border-t border-[var(--color-border)]">
            <div className="px-4 py-1 text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] font-semibold">
              Mai mult
            </div>
            {NAV_MORE.filter((l) => !("countyOnly" in l && l.countyOnly) || countySlug).map((link) => (
              <Link
                key={link.href}
                href={countySlug ? `/${countySlug}${link.href}` : link.href}
                className="block px-4 py-2 rounded-[var(--radius-button)] text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)]"
              >
                {link.icon} {link.label}
              </Link>
            ))}
          </div>

          {/* Date publice */}
          <div className="pt-3 mt-3 border-t border-[var(--color-border)]">
            <div className="px-4 py-1 text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] font-semibold">
              Date publice
            </div>
            {NAV_DATE_PUBLICE.map((link) => (
              <Link
                key={link.href}
                href={countySlug ? `/${countySlug}${link.href}` : link.href}
                className="block px-4 py-2 rounded-[var(--radius-button)] text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)]"
              >
                {link.icon} {link.label}
              </Link>
            ))}
          </div>
          <div className="pt-4 mt-4 border-t border-[var(--color-border)] space-y-2">
            <Link
              href={countySlug ? `/${countySlug}/sesizari` : "/sesizari"}
              className="flex items-center justify-center gap-2 h-12 rounded-[var(--radius-button)] bg-[var(--color-primary)] text-white font-medium"
            >
              <AlertCircle size={18} />
              Fă sesizare acum
            </Link>
            {countySlug && (
              <Link
                href="/"
                className="flex items-center justify-center gap-2 h-10 rounded-[var(--radius-button)] bg-[var(--color-surface-2)] text-sm font-medium text-[var(--color-text-muted)]"
              >
                Schimbă județul
              </Link>
            )}
          </div>
        </nav>
      </div>
    </>
  );
}
