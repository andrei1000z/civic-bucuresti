"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 600);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={cn(
        "fixed bottom-24 left-6 z-30 w-11 h-11 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-lg)] flex items-center justify-center text-[var(--color-text)] hover:bg-[var(--color-surface-2)] transition-all",
        visible ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"
      )}
      aria-label="Înapoi la început"
      title="Sus"
    >
      <ArrowUp size={18} />
    </button>
  );
}
