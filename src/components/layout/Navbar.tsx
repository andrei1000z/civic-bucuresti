"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, ChevronDown, AlertCircle, MapPin, Search } from "lucide-react";
import { NAV_LINKS, GHID_DROPDOWN, SITE_NAME } from "@/lib/constants";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserMenu } from "@/components/auth/UserMenu";
import { LiveWeatherAqi } from "@/components/home/LiveWeatherAqi";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [ghidDropdown, setGhidDropdown] = useState(false);

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
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
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
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-[var(--radius-button)] bg-gradient-to-br from-[var(--color-primary)] to-indigo-900 flex items-center justify-center text-white">
              <MapPin size={18} strokeWidth={2.5} />
            </div>
            <span className="font-[family-name:var(--font-sora)] font-bold text-lg text-[var(--color-text)]">
              {SITE_NAME}
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              if (link.href === "/ghiduri") {
                return (
                  <div
                    key={link.href}
                    className="relative"
                    onMouseEnter={() => setGhidDropdown(true)}
                    onMouseLeave={() => setGhidDropdown(false)}
                  >
                    <Link
                      href={link.href}
                      className={cn(
                        "flex items-center gap-1 px-3 py-2 rounded-[var(--radius-button)] text-sm font-medium transition-all",
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
                          href={ghid.href}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[var(--color-surface-2)] transition-colors"
                        >
                          <span className="text-xl">{ghid.icon}</span>
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
                  className={cn(
                    "px-3 py-2 rounded-[var(--radius-button)] text-sm font-medium transition-all",
                    isActive
                      ? "text-[var(--color-primary)] bg-[var(--color-primary-soft)]"
                      : "text-[var(--color-text)] hover:bg-[var(--color-surface-2)]"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden xl:block">
              <LiveWeatherAqi />
            </div>
            <button
              onClick={() => {
                // Trigger CommandPalette via custom event (same as Cmd+K)
                document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, ctrlKey: true }));
              }}
              className="w-10 h-10 rounded-[var(--radius-button)] bg-[var(--color-surface-2)] hover:bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
              aria-label="Caută (Ctrl+K)"
              title="Caută (Ctrl+K)"
            >
              <Search size={16} />
            </button>
            <ThemeToggle />
            <UserMenu />
            <Link
              href="/sesizari"
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
            <div className="w-9 h-9 rounded-[var(--radius-button)] bg-gradient-to-br from-[var(--color-primary)] to-indigo-900 flex items-center justify-center text-white">
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
          {NAV_LINKS.map((link, i) => (
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
          <div className="pt-4 mt-4 border-t border-[var(--color-border)]">
            <Link
              href="/sesizari"
              className="flex items-center justify-center gap-2 h-12 rounded-[var(--radius-button)] bg-[var(--color-primary)] text-white font-medium"
            >
              <AlertCircle size={18} />
              Fă sesizare acum
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
}
