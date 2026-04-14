import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { analyticsRedis, KEY, TTL } from "@/lib/analytics/redis";
import { createSupabaseServer } from "@/lib/supabase/server";
import { rateLimitAsync, getClientIp } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_ORIGINS = new Set([
  "https://civia.ro",
  "https://www.civia.ro",
  "http://localhost:3000",
  "http://localhost:3001",
]);

function sanitizeStr(val: unknown, maxLen = 100): string {
  if (typeof val !== "string") return "";
  return val
    .slice(0, maxLen)
    .replace(/[\n\r\t\0]/g, "")
    .trim();
}

function sanitizeKey(val: unknown, maxLen = 100): string {
  // Redis hash field — forbid chars that could collide with our key format.
  return sanitizeStr(val, maxLen).replace(/[:*?[\]{}]/g, "");
}

function sanitizeId(val: unknown): string {
  if (typeof val !== "string") return "";
  return val.slice(0, 64).replace(/[^a-zA-Z0-9\-_]/g, "");
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}
function hourKey(): string {
  return new Date().toISOString().slice(0, 13).replace("T", " ");
}
function monthKey(): string {
  return today().slice(0, 7);
}
function weekKey(d = new Date()): string {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

async function getSessionUser(): Promise<{ id: string; role?: string } | null> {
  try {
    const supabase = await createSupabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    return { id: user.id, role: (profile as { role?: string } | null)?.role };
  } catch {
    return null;
  }
}

async function isAdmin(): Promise<boolean> {
  const u = await getSessionUser();
  return u?.role === "admin";
}

async function handleTrack(req: NextRequest, body: Record<string, unknown>) {
  if (!analyticsRedis) return NextResponse.json({ ok: true, noop: true });

  // Rate limit per IP — generous (allows SPA nav bursts) but blocks abuse.
  const ip = getClientIp(req);
  const rl = await rateLimitAsync(`analytics:${ip}`, { limit: 60, windowMs: 60_000 });
  if (!rl.success) return NextResponse.json({ ok: false, rateLimited: true }, { status: 429 });

  const visitorId = sanitizeId(body.visitorId);
  if (!visitorId) return NextResponse.json({ ok: true });

  // Resolve user id server-side from Supabase session — never trust client.
  const sessionUser = await getSessionUser();
  const userId = sessionUser?.id || "";

  // Admins are automatically excluded from tracking.
  if (sessionUser?.role === "admin") {
    return NextResponse.json({ ok: true, excluded: true });
  }
  if (userId) {
    const excluded = await analyticsRedis.sismember(KEY.excluded, userId);
    if (excluded) return NextResponse.json({ ok: true, excluded: true });
  }

  const eventType = sanitizeKey(body.eventType, 30) || "pageview";
  const country = (req.headers.get("x-vercel-ip-country") || "XX").slice(0, 4);
  let city = "unknown";
  try {
    const raw = req.headers.get("x-vercel-ip-city");
    if (raw) city = sanitizeKey(decodeURIComponent(raw), 50) || "unknown";
  } catch { /* noop */ }

  const now = Date.now();
  const d = today();
  const h = hourKey();
  const m = monthKey();
  const w = weekKey();

  const pipe = analyticsRedis.pipeline();

  if (eventType === "pageview") {
    const pathname = sanitizeKey(body.pathname, 120) || "/";
    const displayMode = sanitizeKey(body.displayMode, 20) || "browser";
    const deviceType = sanitizeKey(body.deviceType, 20) || "unknown";
    const browser = sanitizeKey(body.browser, 30) || "unknown";
    const os = sanitizeKey(body.os, 20) || "unknown";
    const referrer = sanitizeKey(body.referrer, 100) || "direct";
    const language = sanitizeKey(body.language, 10) || "unknown";
    const viewport = sanitizeKey(body.viewport, 10) || "unknown";
    const colorScheme = sanitizeKey(body.colorScheme, 10) || "unknown";
    const connection = sanitizeKey(body.connection, 10) || "unknown";
    const loadTime = typeof body.loadTime === "number" ? body.loadTime : 0;

    pipe.hincrby(KEY.total, "views", 1);
    pipe.hincrby(KEY.total, `display_${displayMode}`, 1);
    pipe.hincrby(KEY.total, `device_${deviceType}`, 1);
    pipe.hincrby(KEY.total, `browser_${browser}`, 1);
    pipe.hincrby(KEY.total, `os_${os}`, 1);
    pipe.hincrby(KEY.total, `viewport_${viewport}`, 1);
    pipe.hincrby(KEY.total, `color_${colorScheme}`, 1);
    pipe.hincrby(KEY.total, `conn_${connection}`, 1);

    pipe.hincrby(KEY.routes, pathname, 1);
    pipe.hincrby(KEY.referrers, referrer, 1);
    pipe.hincrby(KEY.countries, country, 1);
    pipe.hincrby(KEY.cities, `${city}, ${country}`, 1);
    pipe.hincrby(KEY.languages, language, 1);

    pipe.hincrby(KEY.hourly, h, 1);
    pipe.expire(KEY.hourly, TTL.hourly);

    pipe.hincrby(KEY.daily(d), "views", 1);
    pipe.expire(KEY.daily(d), TTL.daily);

    const utmSource = sanitizeKey(body.utmSource, 50);
    const utmMedium = sanitizeKey(body.utmMedium, 50);
    const utmCampaign = sanitizeKey(body.utmCampaign, 100);
    if (utmSource) pipe.hincrby(KEY.utmSource, utmSource, 1);
    if (utmMedium) pipe.hincrby(KEY.utmMedium, utmMedium, 1);
    if (utmCampaign) pipe.hincrby(KEY.utmCampaign, utmCampaign, 1);

    pipe.sadd(KEY.dau(d), visitorId);
    pipe.expire(KEY.dau(d), TTL.dau);
    pipe.sadd(KEY.wau(w), visitorId);
    pipe.expire(KEY.wau(w), TTL.wau);
    pipe.sadd(KEY.mau(m), visitorId);
    pipe.expire(KEY.mau(m), TTL.mau);

    if (loadTime > 0 && loadTime < 60000) {
      pipe.hincrby(KEY.perf, "load_total", loadTime);
      pipe.hincrby(KEY.perf, "load_count", 1);
    }

    // Real-time feed (last 200)
    pipe.lpush(
      KEY.events,
      JSON.stringify({
        t: now,
        type: "pageview",
        pathname,
        country,
        city,
        device: deviceType,
        browser,
        referrer,
      })
    );
    pipe.ltrim(KEY.events, 0, 199);
    pipe.expire(KEY.events, TTL.events);

    // Per-user tracking
    if (userId) {
      pipe.zincrby(KEY.topUsers, 1, userId);
      pipe.hsetnx(KEY.userMeta(userId), "first_seen", String(now));
      pipe.hset(KEY.userMeta(userId), {
        last_seen: String(now),
        last_country: country,
        last_pathname: pathname,
        last_device: deviceType,
        last_browser: browser,
      });
      pipe.hincrby(KEY.userMeta(userId), "views", 1);
      pipe.expire(KEY.userMeta(userId), TTL.user);
      pipe.hincrby(KEY.userRoutes(userId), pathname, 1);
      pipe.expire(KEY.userRoutes(userId), TTL.user);
      pipe.hincrby(KEY.userCountries(userId), country, 1);
      pipe.expire(KEY.userCountries(userId), TTL.user);
      pipe.hincrby(KEY.userDays(userId), d, 1);
      pipe.expire(KEY.userDays(userId), TTL.user);
    }

    await pipe.exec();

    // Landing-page marker — separate SET NX call (not pipelineable with decision)
    try {
      const res = await analyticsRedis.set(KEY.landingMarker(visitorId), pathname, {
        ex: TTL.landingMarker,
        nx: true,
      });
      if (res) await analyticsRedis.hincrby(KEY.landingPages, pathname, 1);
    } catch { /* noop */ }

    return NextResponse.json({ ok: true });
  }

  if (eventType === "time-on-page") {
    const t = typeof body.timeOnPage === "number" ? body.timeOnPage : 0;
    if (t > 0 && t < 3600000) {
      pipe.hincrby(KEY.perf, "time_total", t);
      pipe.hincrby(KEY.perf, "time_count", 1);
      await pipe.exec();
    }
    return NextResponse.json({ ok: true });
  }

  if (eventType === "js-error") {
    const err = sanitizeKey(body.error, 200);
    if (err) {
      pipe.hincrby(KEY.errors, err, 1);
      pipe.expire(KEY.errors, TTL.errors);
      await pipe.exec();
    }
    return NextResponse.json({ ok: true });
  }

  if (eventType === "scroll-depth") {
    const depth = sanitizeKey(body.depth, 10);
    if (depth) {
      pipe.hincrby(KEY.scrollDepth, depth, 1);
      await pipe.exec();
    }
    return NextResponse.json({ ok: true });
  }

  // Generic custom event
  pipe.hincrby(KEY.eventsTotal, eventType, 1);
  pipe.lpush(
    KEY.events,
    JSON.stringify({ t: now, type: eventType, country, city, userId: userId || null })
  );
  pipe.ltrim(KEY.events, 0, 199);
  pipe.expire(KEY.events, TTL.events);
  await pipe.exec();
  return NextResponse.json({ ok: true });
}

async function handleSummary() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!analyticsRedis) return NextResponse.json({ error: "Redis not configured" }, { status: 500 });

  const d = today();
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const m = monthKey();
  const w = weekKey();

  const [
    total,
    routes,
    referrers,
    countries,
    cities,
    languages,
    hourly,
    perf,
    errors,
    eventsTotal,
    scrollDepth,
    utmSource,
    utmMedium,
    utmCampaign,
    landingPages,
    dauToday,
    dauYesterday,
    wauCount,
    mauCount,
    topUsersRaw,
    eventsStreamRaw,
  ] = await Promise.all([
    analyticsRedis.hgetall<Record<string, string>>(KEY.total),
    analyticsRedis.hgetall<Record<string, string>>(KEY.routes),
    analyticsRedis.hgetall<Record<string, string>>(KEY.referrers),
    analyticsRedis.hgetall<Record<string, string>>(KEY.countries),
    analyticsRedis.hgetall<Record<string, string>>(KEY.cities),
    analyticsRedis.hgetall<Record<string, string>>(KEY.languages),
    analyticsRedis.hgetall<Record<string, string>>(KEY.hourly),
    analyticsRedis.hgetall<Record<string, string>>(KEY.perf),
    analyticsRedis.hgetall<Record<string, string>>(KEY.errors),
    analyticsRedis.hgetall<Record<string, string>>(KEY.eventsTotal),
    analyticsRedis.hgetall<Record<string, string>>(KEY.scrollDepth),
    analyticsRedis.hgetall<Record<string, string>>(KEY.utmSource),
    analyticsRedis.hgetall<Record<string, string>>(KEY.utmMedium),
    analyticsRedis.hgetall<Record<string, string>>(KEY.utmCampaign),
    analyticsRedis.hgetall<Record<string, string>>(KEY.landingPages),
    analyticsRedis.scard(KEY.dau(d)),
    analyticsRedis.scard(KEY.dau(yesterdayStr)),
    analyticsRedis.scard(KEY.wau(w)),
    analyticsRedis.scard(KEY.mau(m)),
    analyticsRedis.zrange(KEY.topUsers, 0, 19, { rev: true, withScores: true }),
    analyticsRedis.lrange(KEY.events, 0, 49),
  ]);

  const toNum = (v: unknown) => (typeof v === "number" ? v : typeof v === "string" ? parseInt(v) || 0 : 0);

  const loadTotal = toNum((perf as Record<string, unknown> | null)?.load_total);
  const loadCount = toNum((perf as Record<string, unknown> | null)?.load_count);
  const timeTotal = toNum((perf as Record<string, unknown> | null)?.time_total);
  const timeCount = toNum((perf as Record<string, unknown> | null)?.time_count);
  const avgLoadTime = loadCount > 0 ? Math.round(loadTotal / loadCount) : 0;
  const avgTimeOnPage = timeCount > 0 ? Math.round(timeTotal / timeCount) : 0;

  const mau = Number(mauCount) || 0;
  const dau = Number(dauToday) || 0;
  const stickiness = mau > 0 && dau <= mau ? Math.round((dau / mau) * 100) : 0;

  // Parse ZRANGE withScores — upstash returns alternating [member, score, ...]
  const topUsers: { id: string; views: number }[] = [];
  if (Array.isArray(topUsersRaw)) {
    for (let i = 0; i < topUsersRaw.length; i += 2) {
      topUsers.push({
        id: String(topUsersRaw[i]),
        views: Number(topUsersRaw[i + 1]) || 0,
      });
    }
  }

  const eventsStream = (eventsStreamRaw || [])
    .map((e) => {
      try {
        return typeof e === "string" ? JSON.parse(e) : e;
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  return NextResponse.json({
    ok: true,
    total: total || {},
    routes: routes || {},
    referrers: referrers || {},
    countries: countries || {},
    cities: cities || {},
    languages: languages || {},
    hourly: hourly || {},
    errors: errors || {},
    eventsTotal: eventsTotal || {},
    scrollDepth: scrollDepth || {},
    utmSource: utmSource || {},
    utmMedium: utmMedium || {},
    utmCampaign: utmCampaign || {},
    landingPages: landingPages || {},
    today: { dau },
    yesterday: { dau: Number(dauYesterday) || 0 },
    wau: Number(wauCount) || 0,
    mau,
    stickiness,
    topUsers,
    eventsStream,
    perf: { avgLoadTime, avgTimeOnPage },
    serverTime: Date.now(),
  });
}

async function handleUser(body: Record<string, unknown>) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!analyticsRedis) return NextResponse.json({ error: "Redis not configured" }, { status: 500 });
  const userId = sanitizeId(body.userId);
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
  const [meta, routes, countries, days] = await Promise.all([
    analyticsRedis.hgetall<Record<string, string>>(KEY.userMeta(userId)),
    analyticsRedis.hgetall<Record<string, string>>(KEY.userRoutes(userId)),
    analyticsRedis.hgetall<Record<string, string>>(KEY.userCountries(userId)),
    analyticsRedis.hgetall<Record<string, string>>(KEY.userDays(userId)),
  ]);
  return NextResponse.json({ ok: true, userId, meta: meta || {}, routes: routes || {}, countries: countries || {}, days: days || {} });
}

async function handleExclude(body: Record<string, unknown>) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!analyticsRedis) return NextResponse.json({ error: "Redis not configured" }, { status: 500 });
  const userId = sanitizeId(body.userId);
  const mode = sanitizeStr(body.mode, 10);
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
  if (mode === "remove") {
    await analyticsRedis.srem(KEY.excluded, userId);
  } else {
    await analyticsRedis.sadd(KEY.excluded, userId);
  }
  return NextResponse.json({ ok: true });
}

export async function POST(req: NextRequest) {
  // Origin check (CSRF) — allow same-origin and whitelisted.
  const origin = req.headers.get("origin");
  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const action = sanitizeStr(body.action, 20);
  try {
    if (action === "track") return await handleTrack(req, body);
    if (action === "summary") return await handleSummary();
    if (action === "user") return await handleUser(body);
    if (action === "exclude") return await handleExclude(body);
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("[analytics] error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
