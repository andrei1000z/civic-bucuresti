import { Redis } from "@upstash/redis";

export const analyticsRedis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? Redis.fromEnv()
    : null;

export const KEY = {
  total: "analytics:total",
  routes: "analytics:routes",
  referrers: "analytics:referrers",
  countries: "analytics:countries",
  cities: "analytics:cities",
  languages: "analytics:languages",
  hourly: "analytics:hourly",
  daily: (d: string) => `analytics:daily:${d}`,
  dau: (d: string) => `analytics:dau:${d}`,
  wau: (w: string) => `analytics:wau:${w}`,
  mau: (m: string) => `analytics:mau:${m}`,
  landingPages: "analytics:landing-pages",
  landingMarker: (vid: string) => `analytics:landing:${vid}`,
  utmSource: "analytics:utm-source",
  utmMedium: "analytics:utm-medium",
  utmCampaign: "analytics:utm-campaign",
  events: "analytics:events",
  eventsTotal: "analytics:events-total",
  perf: "analytics:perf",
  errors: "analytics:errors",
  scrollDepth: "analytics:scroll-depth",
  topUsers: "analytics:top-users",
  userMeta: (u: string) => `analytics:user:${u}:meta`,
  userRoutes: (u: string) => `analytics:user:${u}:routes`,
  userCountries: (u: string) => `analytics:user:${u}:countries`,
  userDays: (u: string) => `analytics:user:${u}:days`,
  excluded: "analytics:excluded-users",
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
} as const;
