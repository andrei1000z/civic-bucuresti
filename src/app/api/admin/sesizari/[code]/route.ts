import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { createSupabaseServer } from "@/lib/supabase/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { getSesizareByCode } from "@/lib/sesizari/repository";
import { invalidateSesizariCache } from "@/lib/cached-queries";
import { rateLimitAsync } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

/**
 * DELETE /api/admin/sesizari/[code]
 *
 * Hard-deletes a sesizare by code. Cascading FKs in schema.sql clean
 * up votes / comments / timeline / verifications / follows / status-
 * tickets automatically — we only delete the parent row.
 *
 * Author-side delete already exists at /api/sesizari/[code]/DELETE
 * but is gated to "owner OR within 1h created_at". Admin needs to
 * delete spam / abuse / GDPR-erasure requests at any time.
 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;

  // Verify admin role — same shape as moderate/polish/status routes.
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

  // Cap per-admin to stop a runaway script (or compromised session)
  // from wiping the whole table.
  const rl = await rateLimitAsync(`admin-delete-sesizare:${user.id}`, {
    limit: 30,
    windowMs: 60_000,
  });
  if (!rl.success) {
    return NextResponse.json(
      { error: "Prea multe ștergeri într-un minut. Așteaptă puțin." },
      { status: 429 },
    );
  }

  const sesizare = await getSesizareByCode(code);
  if (!sesizare) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const admin = createSupabaseAdmin();
  const { error } = await admin.from("sesizari").delete().eq("id", sesizare.id);
  if (error) {
    Sentry.captureException(error, {
      tags: { kind: "admin_delete_sesizare_failed" },
      extra: { code, sesizareId: sesizare.id, adminId: user.id },
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Audit trail — info-level so the dashboard shows admin actions
  // without burning Sentry quota on errors.
  Sentry.captureMessage("admin deleted sesizare", {
    level: "info",
    tags: { kind: "admin_delete_sesizare" },
    extra: { code, sesizareId: sesizare.id, adminId: user.id, titlu: sesizare.titlu },
  });

  invalidateSesizariCache();

  return NextResponse.json({ ok: true });
}
