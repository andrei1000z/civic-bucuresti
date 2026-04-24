import { Redis } from "@upstash/redis";

export const analyticsRedis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? Redis.fromEnv()
    : null;

export const KEY = {
  total: "civia:analytics:total",
  routes: "civia:analytics:routes",
  referrers: "civia:analytics:referrers",
  countries: "civia:analytics:countries",
  cities: "civia:analytics:cities",
  languages: "civia:analytics:languages",
  hourly: "civia:analytics:hourly",
  daily: (d: string) => `civia:analytics:daily:${d}`,
  dau: (d: string) => `civia:analytics:dau:${d}`,
  wau: (w: string) => `civia:analytics:wau:${w}`,
  mau: (m: string) => `civia:analytics:mau:${m}`,
  landingPages: "civia:analytics:landing-pages",
  landingMarker: (vid: string) => `civia:analytics:landing:${vid}`,
  utmSource: "civia:analytics:utm-source",
  utmMedium: "civia:analytics:utm-medium",
  utmCampaign: "civia:analytics:utm-campaign",
  events: "civia:analytics:events",
  eventsTotal: "civia:analytics:events-total",
  perf: "civia:analytics:perf",
  errors: "civia:analytics:errors",
  errorPaths: "civia:analytics:error-paths",
  errorSources: "civia:analytics:error-sources",
  scrollDepth: "civia:analytics:scroll-depth",
  topUsers: "civia:analytics:top-users",
  userMeta: (u: string) => `civia:analytics:user:${u}:meta`,
  userRoutes: (u: string) => `civia:analytics:user:${u}:routes`,
  userCountries: (u: string) => `civia:analytics:user:${u}:countries`,
  userDays: (u: string) => `civia:analytics:user:${u}:days`,
  excluded: "civia:analytics:excluded-users",

  // --- New tracking surfaces ---
  // Web Vitals: LCP, INP, CLS, FCP, TTFB. We keep per-metric rating
  // counts (good/needs-improvement/poor) and a reservoir-sampled list of
  // recent values for percentile estimation.
  vitalRating: (vital: string) => `civia:analytics:vital:${vital}:rating`,
  vitalSamples: (vital: string) => `civia:analytics:vital:${vital}:samples`,
  vitalPerRoute: (vital: string) => `civia:analytics:vital:${vital}:routes`,

  // Click tracking
  clicks: "civia:analytics:clicks",
  clicksPerRoute: "civia:analytics:clicks-per-route",

  // Outbound link destinations
  outbound: "civia:analytics:outbound",

  // Rage clicks — frustration signal. Keyed by route + label.
  rageClicks: "civia:analytics:rage-clicks",
  rageClicksPerRoute: "civia:analytics:rage-clicks-per-route",

  // Copy events
  copyEvents: "civia:analytics:copy",
  copyPerRoute: "civia:analytics:copy-per-route",

  // Network transitions
  offlineCount: "civia:analytics:offline-count",

  // Funnel — per-funnel-per-step counts, so the dashboard can compute
  // drop-off rates. One hash per funnel, fields are the step labels.
  funnel: (funnel: string) => `civia:analytics:funnel:${funnel}`,

  // Search — global + per-context (command palette, sesizari filter, etc.)
  searchTerms: "civia:analytics:search",
  searchZeroResults: "civia:analytics:search-zero",

  // AI feature usage (improve, chat, classify, vision, polish)
  aiUsage: "civia:analytics:ai-usage",

  // Auth events (signup, signin, signout, password-reset)
  authEvents: "civia:analytics:auth",

  // Form abandonment — per form, per step
  formAbandon: "civia:analytics:form-abandon",

  // Page time spent — histogram-ish, keyed by path
  timePerPath: "civia:analytics:time-per-path",

  // Viewport + orientation + color scheme tallies (per-session context)
  viewports: "civia:analytics:viewports",
  orientations: "civia:analytics:orientations",
  colorSchemes: "civia:analytics:color-schemes",
  connections: "civia:analytics:connections",

  // PWA install funnel
  pwaEvents: "civia:analytics:pwa-events",

  // 404 paths — path-level breakdown pentru broken links / URL-uri
  // învechite / typo-uri / bots. Plus referrer-urile de unde vin
  // (ajută să identificăm broken links pe site-uri externe).
  notFoundPaths: "civia:analytics:404-paths",
  notFoundReferrers: "civia:analytics:404-referrers",
} as const;

export const TTL = {
  daily: 60 * 60 * 24 * 90,
  hourly: 60 * 60 * 24 * 7,
  dau: 60 * 60 * 24 * 90,
  wau: 60 * 60 * 24 * 60,
  mau: 60 * 60 * 24 * 90,
  events: 60 * 60 * 24 * 7,
  errors: 60 * 60 * 24 * 30,
  landingMarker: 60 * 60 * 24,
  user: 60 * 60 * 24 * 365,
  vitalSamples: 60 * 60 * 24 * 14, // 2 weeks rolling window
  clicks: 60 * 60 * 24 * 30,
  search: 60 * 60 * 24 * 60,
} as const;

// Web Vitals reservoir sampling — keep at most 500 recent samples per
// metric so we can compute p50/p75/p95 without unbounded list growth.
export const VITAL_SAMPLE_CAP = 500;
