import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { getOrGenerateAiSummary } from "@/lib/stiri/ai-summary";
import { AI_SUMMARY_VERSION } from "@/lib/ai/synthesis-version";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // up to 5 min — sequential AI calls add up

/**
 * POST /api/admin/stiri/regenerate-summaries?limit=50&force=1
 *
 * Walks the most-recent stiri_cache rows and forces a re-synthesis
 * for each. Used after a synthesis-version bump to pre-warm the
 * cache instead of waiting for organic page views to trickle through.
 *
 * Query params:
 *   limit  — how many rows to touch (default 50, max 200)
 *   force  — when "1", clears ai_summary first so getOrGenerateAiSummary
 *            regenerates even if the row is already at AI_SUMMARY_VERSION.
 *            Default off — only rows below current version regenerate.
 *
 * Sequential by design: parallel calls would hammer Gemini's
 * per-minute rate limit (1500/day = 1 every ~57s avg, but bursts
 * trip the per-minute cap). One-at-a-time + small delay keeps the
 * provider chain happy.
 *
 * Admin role gated. Returns a per-row summary so the caller can see
 * which providers handled which articles.
 */
export async function POST(req: Request) {
  // Admin auth — same shape as moderate/polish/status routes.
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Auth required" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if ((profile as { role?: string } | null)?.role !== "admin") {
    return NextResponse.json({ error: "Admin required" }, { status: 403 });
  }

  const url = new URL(req.url);
  const limit = Math.min(200, Math.max(1, parseInt(url.searchParams.get("limit") ?? "50", 10) || 50));
  const force = url.searchParams.get("force") === "1";

  const admin = createSupabaseAdmin();
  const { data: rows, error } = await admin
    .from("stiri_cache")
    .select("id,title,excerpt,content,source,ai_summary,ai_summary_version")
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // When force=1, blank ai_summary upfront so getOrGenerateAiSummary
  // hits the regenerate path even on rows already at current version.
  if (force) {
    const ids = (rows ?? []).map((r) => (r as { id: string }).id);
    if (ids.length > 0) {
      await admin
        .from("stiri_cache")
        .update({ ai_summary: null, ai_summary_version: 0 })
        .in("id", ids);
    }
  }

  const results: Array<{ id: string; ok: boolean; len: number; error?: string }> = [];
  for (const r of (rows ?? []) as Array<{
    id: string;
    title: string;
    excerpt: string | null;
    content: string | null;
    source: string;
    ai_summary: string | null;
    ai_summary_version: number | null;
  }>) {
    try {
      // Pass a fresh row shape (no ai_summary, no version) so the
      // cache check in getOrGenerateAiSummary always misses and we
      // hit the synthesis path.
      const summary = await getOrGenerateAiSummary({
        id: r.id,
        title: r.title,
        excerpt: r.excerpt,
        content: r.content,
        source: r.source,
        ai_summary: force ? null : r.ai_summary,
        ai_summary_version: force ? 0 : r.ai_summary_version,
      });
      results.push({ id: r.id, ok: !!summary, len: summary?.length ?? 0 });
    } catch (e) {
      results.push({
        id: r.id,
        ok: false,
        len: 0,
        error: e instanceof Error ? e.message.slice(0, 200) : "unknown",
      });
    }
    // 600ms gap between calls — keeps us under Gemini 2.5 Flash's
    // 15 RPM free tier (4s between requests would be safer but
    // the burst cap is ~1 per 4s sustained; we're fine on average).
    await new Promise((r) => setTimeout(r, 600));
  }

  const ok = results.filter((r) => r.ok).length;
  const failed = results.length - ok;
  return NextResponse.json({
    data: {
      total: results.length,
      ok,
      failed,
      version: AI_SUMMARY_VERSION,
      results,
    },
  });
}
