import { NextResponse } from "next/server";
import { fetchAllFeeds } from "@/lib/stiri/rss";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Authorize the RSS refresh trigger.
 * Accepts either:
 *   1. Authorization: Bearer <CRON_SECRET> (for Vercel Cron / GitHub Actions)
 *   2. Logged-in admin user (role='admin' on profile)
 */
async function authorize(req: Request): Promise<{ ok: boolean; reason?: string }> {
  const auth = req.headers.get("authorization") ?? "";
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && auth === `Bearer ${cronSecret}`) return { ok: true };

  // fallback: allow if logged-in user has role='admin'
  try {
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, reason: "auth required" };
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if ((profile as { role?: string } | null)?.role === "admin") return { ok: true };
    return { ok: false, reason: "admin required" };
  } catch {
    return { ok: false, reason: "auth check failed" };
  }
}

export async function POST(req: Request) {
  const authResult = await authorize(req);
  if (!authResult.ok) {
    return NextResponse.json(
      { error: `Forbidden: ${authResult.reason}` },
      { status: 403 }
    );
  }

  try {
    const articles = await fetchAllFeeds();
    if (articles.length === 0) {
      return NextResponse.json({ data: { inserted: 0, total: 0 } });
    }

    const supabase = createSupabaseAdmin();
    const { error, count } = await supabase
      .from("stiri_cache")
      .upsert(articles, { onConflict: "url", ignoreDuplicates: true, count: "exact" });

    if (error) throw error;

    return NextResponse.json({
      data: {
        total: articles.length,
        inserted: count ?? 0,
        sources: [...new Set(articles.map((a) => a.source))],
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Fetch failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
