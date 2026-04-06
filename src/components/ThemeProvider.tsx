"use client";

import { useEffect } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Add theme-ready class after hydration so CSS transitions activate.
  // This prevents the flash-of-wrong-theme on initial load.
  useEffect(() => {
    requestAnimationFrame(() => {
      document.documentElement.classList.add("theme-ready");
    });
  }, []);

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
    >
      {children}
    </NextThemesProvider>
  );
}
