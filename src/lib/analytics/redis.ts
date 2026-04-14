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
  scrollDepth: "civia:analytics:scroll-depth",
  topUsers: "civia:analytics:top-users",
  userMeta: (u: string) => `civia:analytics:user:${u}:meta`,
  userRoutes: (u: string) => `civia:analytics:user:${u}:routes`,
  userCountries: (u: string) => `civia:analytics:user:${u}:countries`,
  userDays: (u: string) => `civia:analytics:user:${u}:days`,
  excluded: "civia:analytics:excluded-users",
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
