import { Resend } from "resend";

let client: Resend | null = null;

export function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!client) {
    client = new Resend(process.env.RESEND_API_KEY);
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
}): Promise<boolean> {
  const resend = getResendClient();
  if (!resend) {
    console.log("[email] Resend not configured, skipping:", params.subject);
    return false;
  }
  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });
    if (error) {
      console.error("[email] Resend error:", error);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[email] Send failed:", e);
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
  return `<!DOCTYPE html>
<html lang="ro">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${params.title}</title>
${params.preheader ? `<span style="display:none;max-height:0;overflow:hidden">${params.preheader}</span>` : ""}
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:system-ui,-apple-system,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06)">
  <!-- Header -->
  <tr><td style="background:linear-gradient(135deg,#1C4ED8,#1e3a8a);padding:32px 40px;text-align:center">
    <h1 style="color:#fff;font-size:24px;margin:0;font-weight:800">Civia</h1>
    <p style="color:#bfdbfe;font-size:14px;margin:8px 0 0">${params.title}</p>
  </td></tr>
  <!-- Body -->
  <tr><td style="padding:32px 40px;color:#0f172a;font-size:15px;line-height:1.7">
    ${params.body}
    ${params.ctaText && params.ctaUrl ? `
    <p style="text-align:center;margin:28px 0 16px">
      <a href="${params.ctaUrl}" style="display:inline-block;background:#1C4ED8;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px">${params.ctaText}</a>
    </p>` : ""}
  </td></tr>
  <!-- Footer -->
  <tr><td style="padding:20px 40px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center">
    <p style="color:#94a3b8;font-size:12px;margin:0">
      <a href="${siteUrl}" style="color:#1C4ED8;text-decoration:none">civia.ro</a> — platforma civică a Bucureștiului
    </p>
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}
