import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { createHash } from "crypto";
import { scrapeAllSources } from "@/lib/intreruperi/scrapers";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServer } from "@/lib/supabase/server";
import { rateLimitAsync } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST /api/intreruperi/refresh
 *
 * Re-runs the utility-outage scrapers and upserts results into the
 * `intreruperi_scraped` Supabase table. Authentication mirrors
 * `/api/stiri/fetch`: either a `Bearer ${CRON_SECRET}` header (Vercel
 * cron path) or an admin user session. Hobby plan only allows one daily
 * cron, so the page itself also fires this in the background once every
 * 6 hours via a Redis NX lock.
 */
async function authorize(
  req: Request,
): Promise<{ ok: boolean; reason?: string; userId?: string; viaCron?: boolean }> {
  const auth = req.headers.get("authorization") ?? "";
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && auth === `Bearer ${cronSecret}`) return { ok: true, viaCron: true };

  try {
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, reason: "auth required" };
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if ((profile as { role?: string } | null)?.role === "admin") {
      return { ok: true, userId: user.id };
    }
    return { ok: false, reason: "admin required" };
  } catch {
    return { ok: false, reason: "auth check failed" };
  }
}

/**
 * Stable hash of the upstream content fields. Used so that re-running
 * the scraper on unchanged source data doesn't bump `updated_at` for
 * every row — only when something actually changed. Helps the admin
 * queue see "scraper saw nothing new" vs "scraper updated 12 rows".
 */
function hashContent(payload: Record<string, unknown>): string {
  const stable = JSON.stringify(payload, Object.keys(payload).sort());
  return createHash("sha1").update(stable).digest("hex");
}

export async function POST(req: Request) {
  const authResult = await authorize(req);
  if (!authResult.ok) {
    return NextResponse.json(
      { error: `Forbidden: ${authResult.reason}` },
      { status: 403 },
    );
  }

  // Cap admin-triggered runs — full scrape is ~10s and cron has it
  // covered. 5/min keeps the button-mash floor without blocking quick
  // back-to-back fixes during scraper development.
  if (!authResult.viaCron && authResult.userId) {
    const rl = await rateLimitAsync(`intreruperi-refresh:${authResult.userId}`, {
      limit: 5,
      windowMs: 60_000,
    });
    if (!rl.success) {
      return NextResponse.json(
        { error: "Prea multe refresh-uri. Încearcă peste un minut." },
        { status: 429 },
      );
    }
  }

  try {
    const result = await scrapeAllSources();

    if (result.items.length === 0) {
      // All sources returning 0 is unusual but plausible (Cloudflare
      // tightening, all upstreams going dark at once). Flag it in
      // Sentry so we notice before the catalog goes stale for a week.
      Sentry.captureMessage("intreruperi_refresh: 0 items scraped", {
        level: "warning",
        extra: { bySource: result.bySource, errors: result.errors },
      });
      return NextResponse.json({
        data: { upserted: 0, total: 0, ...result },
        warning: "All scrapers returned 0 items",
      });
    }

    const supabase = createSupabaseAdmin();
    const now = new Date().toISOString();

    const rows = result.items.map((it) => {
      const contentHash = hashContent({
        title: it.sourceEntryTitle ?? "",
        reason: it.reason,
        addresses: it.addresses,
        startAt: it.startAt,
        endAt: it.endAt,
        sourceEntryUrl: it.sourceEntryUrl ?? "",
      });
      return {
        id: it.id,
        external_id: it.externalId ?? null,
        type: it.type,
        status: it.status,
        provider: it.provider,
        source_url: it.sourceUrl ?? null,
        source_entry_url: it.sourceEntryUrl ?? null,
        source_entry_title: it.sourceEntryTitle ?? null,
        reason: it.reason,
        addresses: it.addresses,
        lat: it.lat ?? null,
        lng: it.lng ?? null,
        county: it.county,
        locality: it.locality ?? null,
        sector: it.sector ?? null,
        start_at: it.startAt,
        end_at: it.endAt,
        affected_population: it.affectedPopulation ?? null,
        excerpt: it.excerpt ?? null,
        content_hash: contentHash,
        updated_at: now,
        last_seen_at: now,
      };
    });

    const { error, count } = await supabase
      .from("intreruperi_scraped")
      .upsert(rows, { onConflict: "id", count: "exact" });

    if (error) throw error;

    return NextResponse.json({
      data: {
        total: result.items.length,
        upserted: count ?? rows.length,
        bySource: result.bySource,
        errors: result.errors,
      },
    });
  } catch (e) {
    Sentry.captureException(e, { tags: { kind: "intreruperi_refresh" } });
    const msg = e instanceof Error ? e.message : "Refresh failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
