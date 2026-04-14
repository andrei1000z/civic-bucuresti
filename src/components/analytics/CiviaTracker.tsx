"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const VID_KEY = "civia_vid";
const EXCLUDE_KEY = "civia_exclude_tracking";
const LANG_FALLBACK = "unknown";

function getVisitorId(): string {
  try {
    let vid = localStorage.getItem(VID_KEY);
    if (!vid) {
      vid = `v-${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
      localStorage.setItem(VID_KEY, vid);
    }
    return vid;
  } catch {
    return "v-anon";
  }
}

function isExcluded(): boolean {
  try {
    return localStorage.getItem(EXCLUDE_KEY) === "1";
  } catch {
    return false;
  }
}

function detectDevice(): string {
  const ua = navigator.userAgent;
  if (/iPad|tablet|PlayBook|Kindle|Silk/i.test(ua)) return "tablet";
  if (/Mobi|Android|iPhone|iPod/i.test(ua)) return "mobile";
  return "desktop";
}

function detectOS(): string {
  const ua = navigator.userAgent;
  if (/Windows/i.test(ua)) return "windows";
  if (/Android/i.test(ua)) return "android";
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Mac OS/i.test(ua)) return "macos";
  if (/Linux/i.test(ua)) return "linux";
  return "unknown";
}

function detectBrowser(): string {
  const ua = navigator.userAgent;
  if (/Edg\//i.test(ua)) return "edge";
  if (/OPR\//i.test(ua)) return "opera";
  if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) return "chrome";
  if (/Firefox\//i.test(ua)) return "firefox";
  if (/Safari\//i.test(ua)) return "safari";
  return "other";
}

function detectDisplayMode(): string {
  if (typeof window === "undefined") return "browser";
  if (window.matchMedia?.("(display-mode: standalone)").matches) return "standalone";
  if ((navigator as Navigator & { standalone?: boolean }).standalone) return "standalone";
  return "browser";
}

function viewportBucket(): string {
  const w = window.innerWidth;
  if (w < 480) return "xs";
  if (w < 640) return "sm";
  if (w < 1024) return "md";
  if (w < 1280) return "lg";
  if (w < 1536) return "xl";
  return "2xl";
}

function getReferrer(): { host: string; full: string } {
  try {
    const ref = document.referrer;
    if (!ref) return { host: "direct", full: "" };
    const u = new URL(ref);
    if (u.host === window.location.host) return { host: "direct", full: "" };
    return { host: u.host.slice(0, 100), full: ref.slice(0, 280) };
  } catch {
    return { host: "direct", full: "" };
  }
}

interface TrackPayload {
  action: "track";
  visitorId: string;
  eventType: string;
  pathname?: string;
  displayMode?: string;
  deviceType?: string;
  browser?: string;
  os?: string;
  referrer?: string;
  referrerFull?: string;
  language?: string;
  timezone?: string;
  screenSize?: string;
  viewport?: string;
  orientation?: string;
  connection?: string;
  colorScheme?: string;
  loadTime?: number;
  timeOnPage?: number;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  depth?: string;
  error?: string;
  userId?: string;
  [k: string]: string | number | undefined;
}

async function send(payload: TrackPayload): Promise<void> {
  try {
    const body = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics", new Blob([body], { type: "application/json" }));
      return;
    }
    await fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    });
  } catch {
    /* silent */
  }
}

export function trackCustomEvent(eventType: string, extra: Record<string, string | number> = {}): void {
  if (typeof window === "undefined") return;
  if (isExcluded()) return;
  send({ action: "track", visitorId: getVisitorId(), eventType, ...extra });
}

export function CiviaTracker(): null {
  const pathname = usePathname();
  const pageEnterRef = useRef<number>(0);
  const lastPathRef = useRef<string | null>(null);

  // Pageview
  useEffect(() => {
    if (isExcluded()) return;
    if (typeof window === "undefined") return;

    // Time-on-page for previous route
    if (lastPathRef.current && lastPathRef.current !== pathname) {
      const t = Date.now() - pageEnterRef.current;
      if (t > 1000 && t < 3600000) {
        send({ action: "track", visitorId: getVisitorId(), eventType: "time-on-page", timeOnPage: t });
      }
    }
    pageEnterRef.current = Date.now();
    lastPathRef.current = pathname;

    const params = new URLSearchParams(window.location.search);
    const ref = getReferrer();

    // Load time (only on first pageview of the session; SPA navs don't trigger a new navigation entry)
    let loadTime = 0;
    try {
      const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
      if (nav) {
        const t = nav.loadEventEnd - nav.startTime;
        if (t > 0 && t < 60000) loadTime = Math.round(t);
      }
    } catch { /* noop */ }

    send({
      action: "track",
      visitorId: getVisitorId(),
      eventType: "pageview",
      pathname,
      displayMode: detectDisplayMode(),
      deviceType: detectDevice(),
      browser: detectBrowser(),
      os: detectOS(),
      referrer: ref.host,
      referrerFull: ref.full,
      language: navigator.language?.slice(0, 10) || LANG_FALLBACK,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screenSize: `${window.screen.width}x${window.screen.height}`,
      viewport: viewportBucket(),
      orientation: window.innerWidth > window.innerHeight ? "landscape" : "portrait",
      connection:
        (navigator as Navigator & { connection?: { effectiveType?: string } }).connection?.effectiveType || "unknown",
      colorScheme: window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light",
      loadTime,
      utmSource: params.get("utm_source") || "",
      utmMedium: params.get("utm_medium") || "",
      utmCampaign: params.get("utm_campaign") || "",
      utmContent: params.get("utm_content") || "",
      utmTerm: params.get("utm_term") || "",
    });
  }, [pathname]);

  // Unload: flush time-on-page
  useEffect(() => {
    const onUnload = () => {
      if (isExcluded()) return;
      const t = Date.now() - pageEnterRef.current;
      if (t <= 1000 || t >= 3600000) return;
      send({ action: "track", visitorId: getVisitorId(), eventType: "time-on-page", timeOnPage: t });
    };
    window.addEventListener("beforeunload", onUnload);
    window.addEventListener("pagehide", onUnload);
    return () => {
      window.removeEventListener("beforeunload", onUnload);
      window.removeEventListener("pagehide", onUnload);
    };
  }, []);

  // Scroll depth
  useEffect(() => {
    if (isExcluded()) return;
    const marks = new Set<number>();
    let raf = 0;
    const check = () => {
      raf = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      const pct = Math.round((window.scrollY / max) * 100);
      for (const m of [25, 50, 75, 100]) {
        if (pct >= m && !marks.has(m)) {
          marks.add(m);
          send({ action: "track", visitorId: getVisitorId(), eventType: "scroll-depth", depth: String(m) });
        }
      }
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(check);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pathname]);

  // JS errors (filtered noise)
  useEffect(() => {
    if (isExcluded()) return;
    const NOISE = [/__firefox__/i, /chrome-extension/i, /^Script error\.?$/i, /ResizeObserver loop/i];
    const onError = (e: ErrorEvent) => {
      const msg = (e.message || "").slice(0, 200);
      if (!msg || NOISE.some((rx) => rx.test(msg))) return;
      send({ action: "track", visitorId: getVisitorId(), eventType: "js-error", error: msg });
    };
    window.addEventListener("error", onError);
    return () => window.removeEventListener("error", onError);
  }, []);

  return null;
}
