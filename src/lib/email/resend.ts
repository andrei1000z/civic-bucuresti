import { Resend } from "resend";
import { ENV, isProd } from "@/lib/env";

let client: Resend | null = null;

export function getResendClient(): Resend | null {
  const key = ENV.RESEND_API_KEY();
  if (!key) return null;
  if (!client) {
    client = new Resend(key);
  }
  return client;
}

const FROM = process.env.RESEND_FROM_EMAIL || "Civia <onboarding@resend.dev>";

/**
 * Send email via Resend. Returns true on success, false on failure.
 * Silently fails if Resend is not configured (no API key).
 */
export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  /** Optional plain-text fallback for clients that block HTML. */
  text?: string;
  /** Optional Reply-To override (default: same as FROM). */
  replyTo?: string;
}): Promise<boolean> {
  const resend = getResendClient();
  if (!resend) {
    // Only log in dev — in production this is silent (Resend key
    // is expected to be present in real deployment).
    if (!isProd()) {
      console.log("[email] Resend not configured, skipping:", params.subject);
    }
    return false;
  }
  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: params.to,
      subject: params.subject,
      html: params.html,
      // Multipart — lots of corporate mail filters drop HTML-only
      // mail. If the caller didn't provide text, synth it from the
      // subject so we at least have something.
      text: params.text ?? `${params.subject}\n\n—\nVezi conținutul complet pe civia.ro`,
      ...(params.replyTo ? { replyTo: params.replyTo } : {}),
      // List-Unsubscribe so Gmail / Apple Mail get a native
      // unsubscribe button at the top of notification emails.
      headers: {
        "List-Unsubscribe": `<${ENV.SITE_URL()}/cont?unsubscribe=1>, <mailto:unsubscribe@civia.ro?subject=Unsubscribe>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    });
    if (error) {
      if (!isProd()) console.error("[email] Resend error:", error);
      return false;
    }
    return true;
  } catch (e) {
    if (!isProd()) console.error("[email] Send failed:", e);
    return false;
  }
}

/**
 * HTML email template with Civia branding.
 */
export function emailTemplate(params: {
  title: string;
  preheader?: string;
  body: string;
  ctaText?: string;
  ctaUrl?: string;
}): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://civia.ro";
  // Brand emerald — matches --color-primary (#059669) in the app.
  // Previously used #1C4ED8 (blue) which diverged from the web UI,
  // making emails feel off-brand.
  const PRIMARY = "#059669";
  const PRIMARY_DARK = "#065f46";
  const PRIMARY_SOFT = "#ecfdf5";
  return `<!DOCTYPE html>
<html lang="ro">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${params.title}</title>
${params.preheader ? `<span style="display:none;max-height:0;overflow:hidden;visibility:hidden;opacity:0;color:transparent">${params.preheader}</span>` : ""}
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:system-ui,-apple-system,'Segoe UI',sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);max-width:600px">
  <!-- Header -->
  <tr><td style="background:linear-gradient(135deg,${PRIMARY},${PRIMARY_DARK});padding:32px 40px;text-align:center">
    <h1 style="color:#fff;font-size:24px;margin:0;font-weight:800;letter-spacing:-0.5px">Civia</h1>
    <p style="color:${PRIMARY_SOFT};font-size:14px;margin:8px 0 0">${params.title}</p>
  </td></tr>
  <!-- Body -->
  <tr><td style="padding:32px 40px;color:#0f172a;font-size:15px;line-height:1.7">
    ${params.body}
    ${params.ctaText && params.ctaUrl ? `
    <p style="text-align:center;margin:28px 0 16px">
      <a href="${params.ctaUrl}" style="display:inline-block;background:${PRIMARY};color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px">${params.ctaText}</a>
    </p>` : ""}
  </td></tr>
  <!-- Footer -->
  <tr><td style="padding:20px 40px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center">
    <p style="color:#64748b;font-size:12px;margin:0 0 4px">
      <a href="${siteUrl}" style="color:${PRIMARY};text-decoration:none;font-weight:500">civia.ro</a> — platforma civică a României
    </p>
    <p style="color:#94a3b8;font-size:11px;margin:0">
      Primești acest email pentru că ai trimis o sesizare, te-ai abonat la newsletter, sau ai acțiuni în contul tău Civia.
    </p>
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}
