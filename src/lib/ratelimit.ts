// Simple in-memory rate limiter — per IP or per identifier
// For production scale, replace with Upstash Redis or Vercel KV

interface Bucket {
  count: number;
  resetAt: number;
}

const BUCKETS = new Map<string, Bucket>();
const MAX_BUCKETS = 10_000;

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetIn: number;
}

export function rateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number }
): RateLimitResult {
  const now = Date.now();
  const bucket = BUCKETS.get(key);

  if (!bucket || bucket.resetAt < now) {
    BUCKETS.set(key, { count: 1, resetAt: now + windowMs });
    // Cleanup stale buckets if we exceed max
    if (BUCKETS.size > MAX_BUCKETS) {
      for (const [k, b] of BUCKETS) {
        if (b.resetAt < now) BUCKETS.delete(k);
        if (BUCKETS.size <= MAX_BUCKETS / 2) break;
      }
    }
    return { success: true, remaining: limit - 1, resetIn: windowMs };
  }

  if (bucket.count >= limit) {
    return { success: false, remaining: 0, resetIn: bucket.resetAt - now };
  }

  bucket.count++;
  return { success: true, remaining: limit - bucket.count, resetIn: bucket.resetAt - now };
}

export function getClientIp(req: Request): string {
  // Prefer Vercel-injected header (not spoofable from client).
  const vercelFwd = req.headers.get("x-vercel-forwarded-for");
  if (vercelFwd) return vercelFwd.split(",")[0].trim();
  // Fall back to x-real-ip (set by most edge proxies).
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  // Last resort: x-forwarded-for (spoofable; take LAST entry which is usually
  // the proxy-closest IP, harder to spoof than first)
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded.split(",").map((s) => s.trim()).filter(Boolean);
    return parts[parts.length - 1] ?? "unknown";
  }
  return "unknown";
}
