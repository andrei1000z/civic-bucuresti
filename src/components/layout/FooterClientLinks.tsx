"use client";

import { openCookiePreferences } from "@/components/CookieBanner";

const linkCls =
  "text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors cursor-pointer text-left";

export function CookiePreferencesButton() {
  return (
    <button type="button" onClick={openCookiePreferences} className={linkCls}>
      Preferințe cookie
    </button>
  );
}
