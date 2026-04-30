"use client";

import { useEffect } from "react";

/**
 * Per-tab scroll restoration that survives Next.js App Router's
 * default "scroll to top on every navigation" behaviour.
 *
 * Why this exists:
 *   - Next.js scrolls to top on `router.push`, including the back/
 *     forward case where users expect the previous scroll position.
 *   - Native `history.scrollRestoration = "auto"` doesn't reliably
 *     work in App Router because the new route's content paints
 *     async — the browser's restore happens before the page is tall
 *     enough to honor the saved Y, so it caps at 0.
 *
 * Strategy: take over scroll restoration manually.
 *   - Save scroll Y per (pathname + search) key in sessionStorage on:
 *     · clicks on internal `<a>` (about to navigate),
 *     · `beforeunload` / `pagehide` (full reload / tab close),
 *     · `visibilitychange` (tab switch).
 *   - On `popstate` (back / forward), restore the saved Y for the
 *     destination URL with a few RAFs of retry, so the position
 *     "grabs" once the new DOM has finished rendering.
 *
 * sessionStorage caps storage at ~5MB per origin and clears on tab
 * close — exactly the lifecycle we want for scroll memory.
 */

const STORAGE_KEY = "civia:scrollPositions";
// Bound the cache so a long browse session doesn't bloat
// sessionStorage. 20 routes is enough headroom for a typical session
// — older entries get evicted (LRU by timestamp).
const MAX_ENTRIES = 20;

type Positions = Record<string, { y: number; ts: number }>;

function load(): Positions {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object") return parsed as Positions;
    return {};
  } catch {
    return {};
  }
}

function persist(positions: Positions) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
  } catch {
    // sessionStorage full / unavailable — silently drop.
  }
}

function trim(positions: Positions): Positions {
  const entries = Object.entries(positions);
  if (entries.length <= MAX_ENTRIES) return positions;
  entries.sort((a, b) => b[1].ts - a[1].ts);
  return Object.fromEntries(entries.slice(0, MAX_ENTRIES));
}

function currentKey(): string {
  return window.location.pathname + window.location.search;
}

export function ScrollRestoration() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if ("scrollRestoration" in window.history) {
      // Force "manual" so the browser doesn't fight us. Without this,
      // Chrome and Firefox both try to restore scroll on popstate
      // before the new route has rendered, see Y=0 since the document
      // is still short, and lock that in — leaving the page at top
      // even though we'd like to land where the user was.
      window.history.scrollRestoration = "manual";
    }

    const saveCurrent = () => {
      const positions = trim(load());
      positions[currentKey()] = { y: window.scrollY, ts: Date.now() };
      persist(positions);
    };

    const restoreFor = (key: string) => {
      const positions = load();
      const entry = positions[key];
      if (!entry) return; // nothing saved → fall through to top (browser default)
      const target = entry.y;

      // Retry across animation frames until the document is tall
      // enough to honor the scroll, or we've spent ~6 frames trying.
      // Without this, the first scrollTo is clamped to 0 because the
      // new route hasn't rendered its full height yet.
      let attempts = 0;
      const tryScroll = () => {
        window.scrollTo({ top: target, left: 0, behavior: "instant" as ScrollBehavior });
        attempts++;
        if (attempts < 6 && Math.abs(window.scrollY - target) > 4) {
          window.requestAnimationFrame(tryScroll);
        }
      };
      window.requestAnimationFrame(tryScroll);
    };

    const onPopState = () => {
      // Wait one frame for Next to commit the new route, then
      // restoreFor handles the inner retry loop for paint timing.
      window.requestAnimationFrame(() => restoreFor(currentKey()));
    };

    const onClick = (e: MouseEvent) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;
      // External / new-tab clicks don't navigate THIS document — skip.
      if (anchor.target && anchor.target !== "_self") return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      // Capture the position right before Next swaps the route. Without
      // this, a fast click before any onScroll/visibilitychange fires
      // means we'd lose the position the user had at click time.
      saveCurrent();
    };

    window.addEventListener("popstate", onPopState);
    window.addEventListener("beforeunload", saveCurrent);
    window.addEventListener("pagehide", saveCurrent);
    document.addEventListener("visibilitychange", saveCurrent);
    document.addEventListener("click", onClick, true);

    return () => {
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("beforeunload", saveCurrent);
      window.removeEventListener("pagehide", saveCurrent);
      document.removeEventListener("visibilitychange", saveCurrent);
      document.removeEventListener("click", onClick, true);
    };
  }, []);

  return null;
}
