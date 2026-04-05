"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, ChevronDown, AlertCircle, MapPin } from "lucide-react";
import { NAV_LINKS, GHID_DROPDOWN, SITE_NAME } from "@/lib/constants";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserMenu } from "@/components/auth/UserMenu";
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

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
                      <ChevronDown size={14} />
                    </Link>
                    <AnimatePresence>
                      {ghidDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full left-0 w-64 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-card)] shadow-[var(--shadow-lg)] overflow-hidden py-2"
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
                        </motion.div>
                      )}
                    </AnimatePresence>
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
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-[var(--color-surface)] lg:hidden"
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
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link
                    href={link.href}
                    className={cn(
                      "block px-4 py-3 rounded-[var(--radius-button)] text-base font-medium",
                      pathname === link.href
                        ? "bg-[var(--color-primary)] text-white"
                        : "text-[var(--color-text)] hover:bg-[var(--color-surface-2)]"
                    )}
                  >
                    {link.label}
                  </Link>
                </motion.div>
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
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
