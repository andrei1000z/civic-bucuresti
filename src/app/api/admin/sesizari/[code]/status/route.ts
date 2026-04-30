import { NextResponse } from "next/server";
import { z } from "zod";
import * as Sentry from "@sentry/nextjs";
import { createSupabaseServer } from "@/lib/supabase/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { getSesizareByCode } from "@/lib/sesizari/repository";
import { invalidateSesizariCache } from "@/lib/cached-queries";
import { sendEmail, emailTemplate } from "@/lib/email/resend";
import { rateLimitAsync } from "@/lib/ratelimit";
import {
  SESIZARE_STATUS_META,
  SESIZARE_STATUS_VALUES,
  timelineEventForStatus,
  type SesizareStatus,
} from "@/lib/sesizari/status";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://civia.ro";

const schema = z.object({
  status: z.enum(SESIZARE_STATUS_VALUES),
  official_response: z.string().trim().max(5000).optional(),
  /**
   * Optional admin-typed note shown next to the timeline label. If
   * omitted we fall back to a generic "Status actualizat" string,
   * which the timeline UI hides via `isRedundantEventDescription`.
   */
  note: z.string().trim().max(500).optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  // ─── Auth: admin only ───────────────────────────────────────
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Auth required" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if ((profile as { role?: string } | null)?.role !== "admin") {
    return NextResponse.json({ error: "Admin required" }, { status: 403 });
  }

  // ─── Rate limit ──────────────────────────────────────────────
  const rl = await rateLimitAsync(`admin-status:${user.id}`, {
    limit: 30,
    windowMs: 60_000,
  });
  if (!rl.success) {
    return NextResponse.json(
      { error: "Prea multe acțiuni. Așteaptă un minut." },
      { status: 429 },
    );
  }

  // ─── Validate input + load record ────────────────────────────
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Input invalid" }, { status: 400 });
  }

  const sesizare = await getSesizareByCode(code);
  if (!sesizare) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const newStatus = parsed.data.status as SesizareStatus;
  const statusChanged = newStatus !== sesizare.status;

  // ─── Update status + optional official response ──────────────
  const admin = createSupabaseAdmin();
  const updatePayload: Record<string, unknown> = {
    status: newStatus,
  };
  if (parsed.data.official_response) {
    updatePayload.official_response = parsed.data.official_response;
    updatePayload.official_response_at = new Date().toISOString();
  }
  // When the admin flips status to `rezolvat` outside the citizen-author
  // path, mirror the resolved_at timestamp so /sesizari-rezolvate and
  // before/after surfaces still compute durations correctly.
  if (newStatus === "rezolvat" && !sesizare.resolved_at) {
    updatePayload.resolved_at = new Date().toISOString();
  }

  const { error } = await admin
    .from("sesizari")
    .update(updatePayload)
    .eq("id", sesizare.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // ─── Timeline row ───────────────────────────────────────────
  // Only when the status actually moved — re-saving the same status
  // shouldn't pollute the timeline. The trigger writes 'depusa' on
  // insert, so transitions FROM 'nou' INTO anything else need their
  // own row.
  if (statusChanged) {
    const eventType = timelineEventForStatus(newStatus);
    if (eventType) {
      const description = parsed.data.note?.length
        ? parsed.data.note
        : `Status actualizat la: ${newStatus}`;
      const { error: tErr } = await admin
        .from("sesizare_timeline")
        .insert({
          sesizare_id: sesizare.id,
          event_type: eventType,
          description,
        });
      if (tErr) {
        // Timeline insert is best-effort — don't fail the whole status
        // change if it errors. Sentry surfaces the problem.
        Sentry.captureException(tErr, {
          tags: { kind: "status_timeline" },
          extra: { code: sesizare.code, status: newStatus },
        });
      }
    }
  }

  invalidateSesizariCache();

  // ─── Notify author by email (best-effort) ────────────────────
  const recipient = sesizare.author_email;
  if (recipient && statusChanged) {
    const sesizareUrl = `${SITE_URL}/sesizari/${sesizare.code}`;
    const meta = SESIZARE_STATUS_META[newStatus];
    const responseBlock = parsed.data.official_response
      ? `<p><strong>Răspunsul autorității:</strong></p>
         <blockquote style="margin:0;padding:12px 16px;background:#f8fafc;border-left:3px solid #059669;color:#475569;font-size:14px;line-height:1.6;white-space:pre-wrap">${escapeHtml(parsed.data.official_response)}</blockquote>`
      : "";
    const noteBlock = parsed.data.note
      ? `<p style="color:#64748b;font-size:13px;margin:12px 0 0">${escapeHtml(parsed.data.note)}</p>`
      : "";
    try {
      await sendEmail({
        to: recipient,
        subject: `${meta.emoji} ${meta.label} · Sesizarea ${sesizare.code} · Civia`,
        html: emailTemplate({
          title: meta.label,
          preheader: sesizare.titlu,
          kicker: `STATUS · ${meta.label.toUpperCase()}`,
          icon: meta.emoji,
          body: `<p>Bună,</p>
                 <p>Statusul sesizării tale <strong>${sesizare.code}</strong> a fost actualizat.</p>
                 <p><strong>${sesizare.titlu}</strong></p>
                 ${noteBlock}
                 ${responseBlock}`,
          ctaText: "Vezi sesizarea",
          ctaUrl: sesizareUrl,
        }),
      });
    } catch (emailErr) {
      Sentry.captureException(emailErr, {
        tags: { kind: "status_email" },
        extra: { code: sesizare.code, status: newStatus },
      });
    }
  }

  return NextResponse.json({ ok: true });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
