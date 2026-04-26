"use client";

import { useEffect, useState } from "react";
import { timeAgo, formatDateTime } from "@/lib/utils";

interface Props {
  date: string | Date;
  /** Wrapper className */
  className?: string;
  /** Refresh interval in ms (default 60s). Pass 0 to disable refresh. */
  refreshMs?: number;
}

/**
 * Hydration-safe relative time ("acum 3 ore") with absolute-time tooltip.
 *
 * Why this exists: `timeAgo()` calls `new Date()` for the current time. The
 * server renders one value, the client (during hydration) computes a
 * different one — milliseconds apart at minimum, often seconds. That
 * causes React errors #418/#419 ("hydration failed").
 *
 * Fix: render the absolute time on first paint (server + first client
 * render are identical), then upgrade to relative after mount. Plus
 * `suppressHydrationWarning` defends against any residual sub-second
 * drift on slow clients. Auto-refreshes every minute so "acum 5 minute"
 * doesn't stay stale while the page is open.
 */
export function TimeAgo({ date, className, refreshMs = 60_000 }: Props) {
  const iso = typeof date === "string" ? date : date.toISOString();
  const abs = formatDateTime(date);
  const [mounted, setMounted] = useState(false);
  const [, force] = useState(0);

  useEffect(() => {
    setMounted(true);
    if (refreshMs <= 0) return;
    const id = setInterval(() => force((n) => n + 1), refreshMs);
    return () => clearInterval(id);
  }, [refreshMs]);

  // First render = absolute timestamp (deterministic, SSR-safe).
  // After mount, switch to relative — and auto-refresh every minute.
  const display = mounted ? timeAgo(date) : abs;

  return (
    <time
      dateTime={iso}
      title={abs}
      className={className}
      aria-label={`${timeAgo(date)} (${abs})`}
      suppressHydrationWarning
    >
      {display}
    </time>
  );
}
