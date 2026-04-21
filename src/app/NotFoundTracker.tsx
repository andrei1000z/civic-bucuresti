"use client";

import { useEffect } from "react";
import { trackCustomEvent } from "@/components/analytics/CiviaTracker";

// Records every 404 hit with the exact URL that failed. The admin dashboard
// aggregates these under the `errorPaths` card so broken inbound links /
// migration mistakes / squatted URLs surface immediately.
export function NotFoundTracker() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    trackCustomEvent("404", {
      pathname: window.location.pathname,
      referrer: document.referrer ? new URL(document.referrer).host : "direct",
    });
  }, []);
  return null;
}
