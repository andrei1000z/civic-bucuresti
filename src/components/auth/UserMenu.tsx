"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { LogIn, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "./AuthProvider";

export function UserMenu() {
  const { user, loading, signOut, openAuthModal } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  if (loading) {
    return <div className="w-10 h-10 rounded-[8px] bg-[var(--color-surface-2)] animate-pulse" />;
  }

  if (!user) {
    return (
      <button
        type="button"
        onClick={openAuthModal}
        className="hidden sm:inline-flex items-center gap-1.5 h-10 px-3 rounded-[8px] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-sm font-medium hover:bg-[var(--color-surface)] transition-colors"
        aria-label="Autentificare"
      >
        <LogIn size={15} aria-hidden="true" />
        Login
      </button>
    );
  }

  const initial = (user.email ?? "C").charAt(0).toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-10 h-10 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center font-semibold text-sm hover:brightness-110 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
        aria-label={`Meniu utilizator (${user.email})`}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {initial}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-60 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] shadow-[var(--shadow-lg)] overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-[var(--color-border)]">
            <p className="text-xs text-[var(--color-text-muted)]">Autentificat ca</p>
            <p className="text-sm font-medium truncate">{user.email}</p>
          </div>
          <Link
            href="/cont"
            onClick={() => setOpen(false)}
            className="w-full px-4 py-2.5 text-left text-sm hover:bg-[var(--color-surface-2)] flex items-center gap-2 transition-colors border-b border-[var(--color-border)] focus:outline-none focus-visible:bg-[var(--color-surface-2)]"
          >
            <UserIcon size={14} aria-hidden="true" />
            Contul tău
          </Link>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              signOut();
            }}
            className="w-full px-4 py-2.5 text-left text-sm hover:bg-[var(--color-surface-2)] flex items-center gap-2 text-red-600 dark:text-red-400 transition-colors focus:outline-none focus-visible:bg-[var(--color-surface-2)]"
          >
            <LogOut size={14} aria-hidden="true" />
            Deconectare
          </button>
        </div>
      )}
    </div>
  );
}
