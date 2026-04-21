import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { rateLimitAsync, getClientIp } from "@/lib/ratelimit";
import { analyticsRedis } from "@/lib/analytics/redis";

export const dynamic = "force-dynamic";

export const NEWSLETTER_REDIS_KEY = "civia:newsletter:subscribers";
const NEWSLETTER_REDIS_CAP = 1000;

const schema = z.object({
  email: z.string().email("Email invalid"),
  sectors: z.array(z.enum(["S1", "S2", "S3", "S4", "S5", "S6"])).optional(),
});

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = await rateLimitAsync(`newsletter:${ip}`, { limit: 3, windowMs: 60 * 60_000 });
  if (!rl.success) {
    return NextResponse.json({ error: "Prea multe încercări. Așteaptă o oră." }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { email, sectors } = schema.parse(body);

    const admin = createSupabaseAdmin();
    const { error } = await admin
      .from("newsletter_subscribers")
      .upsert({ email, sectors: sectors ?? [] }, { onConflict: "email" });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Mirror into Redis so /admin/analytics shows subscribers without
    // an extra DB round-trip. Capped to the most-recent NEWSLETTER_REDIS_CAP.
    if (analyticsRedis) {
      try {
        const entry = JSON.stringify({
          t: Date.now(),
          email,
          sectors: sectors ?? [],
          country: req.headers.get("x-vercel-ip-country") ?? null,
        });
        await analyticsRedis.lpush(NEWSLETTER_REDIS_KEY, entry);
        await analyticsRedis.ltrim(NEWSLETTER_REDIS_KEY, 0, NEWSLETTER_REDIS_CAP - 1);
        await analyticsRedis.hincrby("civia:newsletter:counts", "total", 1);
      } catch {
        // Redis failure shouldn't block the subscription — DB write succeeded
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.issues[0]?.message ?? "Invalid" }, { status: 400 });
    }
    const msg = e instanceof Error ? e.message : "Eroare";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
