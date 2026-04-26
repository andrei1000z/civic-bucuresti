import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServer } from "@/lib/supabase/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { getSesizareByCode } from "@/lib/sesizari/repository";
import { invalidateSesizariCache } from "@/lib/cached-queries";
import { sendEmail, emailTemplate } from "@/lib/email/resend";
import { rateLimitAsync } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://civia.ro";

const schema = z.object({
  status: z.enum(["nou", "in-lucru", "rezolvat", "respins", "amanata"]),
  official_response: z.string().trim().max(5000).optional(),
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

  // ─── Update status + optional official response ──────────────
  const admin = createSupabaseAdmin();
  const updatePayload: Record<string, unknown> = {
    status: parsed.data.status,
  };
  if (parsed.data.official_response) {
    updatePayload.official_response = parsed.data.official_response;
    updatePayload.official_response_at = new Date().toISOString();
  }

  const { error } = await admin
    .from("sesizari")
    .update(updatePayload)
    .eq("id", sesizare.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  invalidateSesizariCache();

  // ─── Notify author by email (best-effort) ────────────────────
  const recipient = sesizare.author_email;
  if (recipient && parsed.data.status !== sesizare.status) {
    const sesizareUrl = `${SITE_URL}/sesizari/${sesizare.code}`;
    const statusLabelMap: Record<string, { label: string; kicker: string; icon: string }> = {
      "in-lucru": { label: "În lucru la autoritate", kicker: "STATUS · ÎN LUCRU", icon: "🔧" },
      rezolvat: { label: "Rezolvat", kicker: "STATUS · REZOLVAT", icon: "✅" },
      respins: { label: "Respins de autoritate", kicker: "STATUS · RESPINS", icon: "⛔" },
      amanata: { label: "Amânat", kicker: "STATUS · AMÂNAT", icon: "🕒" },
      nou: { label: "Reîncadrat ca nou", kicker: "STATUS · NOU", icon: "📩" },
    };
    const meta = statusLabelMap[parsed.data.status];
    if (meta) {
      const responseBlock = parsed.data.official_response
        ? `<p><strong>Răspunsul autorității:</strong></p>
           <blockquote style="margin:0;padding:12px 16px;background:#f8fafc;border-left:3px solid #059669;color:#475569;font-size:14px;line-height:1.6;white-space:pre-wrap">${escapeHtml(parsed.data.official_response)}</blockquote>`
        : "";
      // Email best-effort — Resend down nu trebuie să blocheze răspunsul
      // (DB update deja a avut succes mai sus).
      try {
        await sendEmail({
          to: recipient,
          subject: `${meta.icon} ${meta.label} · Sesizarea ${sesizare.code} · Civia`,
          html: emailTemplate({
            title: meta.label,
            preheader: sesizare.titlu,
            kicker: meta.kicker,
            icon: meta.icon,
            body: `<p>Bună,</p>
                   <p>Statusul sesizării tale <strong>${sesizare.code}</strong> a fost actualizat.</p>
                   <p><strong>${sesizare.titlu}</strong></p>
                   ${responseBlock}`,
            ctaText: "Vezi sesizarea",
            ctaUrl: sesizareUrl,
          }),
        });
      } catch (emailErr) {
        console.error("[status] email failed:", emailErr);
      }
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
