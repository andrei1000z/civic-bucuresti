"use client";

import { useEffect, useState } from "react";

/**
 * Defers mounting of its children until the browser is idle, a user interaction
 * occurs, or a hard timeout fires — whichever comes first.
 *
 * Why: heavy client components (chat, command palette, install prompt) should
 * not block the first paint or the hydration of the actual page content. They
 * are not needed until the user is ready to interact.
 *
 * The children are still code-split via dynamic imports at the call site — this
 * wrapper only gates when React *mounts* them at all.
 */
export function DeferredClientMount({
  children,
  timeoutMs = 3000,
}: {
  children: React.ReactNode;
  timeoutMs?: number;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (mounted) return;

    let cancelled = false;
    const done = () => {
      if (!cancelled) setMounted(true);
    };

    // 1. Wait for the browser to be idle (or a hard timeout)
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
    };
    const idleId =
      typeof w.requestIdleCallback === "function"
        ? w.requestIdleCallback(done, { timeout: timeoutMs })
        : window.setTimeout(done, timeoutMs);

    // 2. OR: first user interaction wakes it up immediately
    const wake = () => done();
    const opts: AddEventListenerOptions = { once: true, passive: true };
    window.addEventListener("scroll", wake, opts);
    window.addEventListener("keydown", wake, opts);
    window.addEventListener("pointerdown", wake, opts);

    return () => {
      cancelled = true;
      if (typeof w.requestIdleCallback === "function") {
        const cancel = (window as Window & { cancelIdleCallback?: (id: number) => void })
          .cancelIdleCallback;
        cancel?.(idleId as number);
      } else {
        clearTimeout(idleId as number);
      }
      window.removeEventListener("scroll", wake);
      window.removeEventListener("keydown", wake);
      window.removeEventListener("pointerdown", wake);
    };
  }, [mounted, timeoutMs]);

  return mounted ? <>{children}</> : null;
}
