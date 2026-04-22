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
  /** Optional kicker line above title (e.g. "SESIZARE · BUCURESTI"). */
  kicker?: string;
  /** Optional emoji / status icon displayed large in the header. */
  icon?: string;
}): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://civia.ro";
  // Brand palette. Kept in sync with globals.css (light mode). Email
  // clients generally ignore prefers-color-scheme so we commit to the
  // light-mode palette — good enough for both Gmail + Outlook + iOS Mail.
  const PRIMARY = "#059669";
  const PRIMARY_DARK = "#047857";
  const PRIMARY_DARKER = "#065f46";
  const PRIMARY_SOFT = "#ecfdf5";
  const SURFACE = "#ffffff";
  const BG = "#f8fafc";
  const BORDER = "#e5e7eb";
  const TEXT = "#0f172a";
  const TEXT_MUTED = "#64748b";
  const TEXT_DIM = "#94a3b8";

  return `<!DOCTYPE html>
<html lang="ro">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${params.title}</title>
${params.preheader ? `<span style="display:none;max-height:0;overflow:hidden;visibility:hidden;opacity:0;color:transparent;font-size:1px;line-height:1px;mso-hide:all">${params.preheader}</span>` : ""}
</head>
<body style="margin:0;padding:0;background:${BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;color:${TEXT};-webkit-font-smoothing:antialiased">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG};padding:40px 16px">
<tr><td align="center">

<!-- Wordmark -->
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;margin-bottom:16px">
  <tr><td align="center">
    <a href="${siteUrl}" style="text-decoration:none;display:inline-flex;align-items:center;gap:8px">
      <span style="display:inline-block;width:28px;height:28px;border-radius:8px;background:linear-gradient(135deg,${PRIMARY},${PRIMARY_DARKER});vertical-align:middle"></span>
      <span style="font-weight:800;font-size:18px;color:${TEXT};letter-spacing:-0.3px;vertical-align:middle;margin-left:8px">Civia</span>
    </a>
  </td></tr>
</table>

<!-- Card -->
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:${SURFACE};border-radius:16px;overflow:hidden;box-shadow:0 2px 4px rgba(15,23,42,0.04),0 8px 24px rgba(15,23,42,0.06);max-width:600px;border:1px solid ${BORDER}">

  <!-- Hero header -->
  <tr><td style="background:linear-gradient(135deg,${PRIMARY} 0%,${PRIMARY_DARK} 60%,${PRIMARY_DARKER} 100%);padding:40px 40px 44px;text-align:center;position:relative">
    ${params.icon ? `<div style="font-size:44px;line-height:1;margin-bottom:14px">${params.icon}</div>` : ""}
    ${params.kicker ? `<p style="color:${PRIMARY_SOFT};font-size:11px;margin:0 0 6px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;opacity:0.9">${params.kicker}</p>` : ""}
    <h1 style="color:#fff;font-size:26px;margin:0;font-weight:800;letter-spacing:-0.5px;line-height:1.2">${params.title}</h1>
  </td></tr>

  <!-- Body -->
  <tr><td style="padding:36px 40px 24px;color:${TEXT};font-size:15px;line-height:1.7">
    ${params.body}
    ${params.ctaText && params.ctaUrl ? `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:32px 0 8px">
      <tr><td align="center">
        <a href="${params.ctaUrl}" style="display:inline-block;background:linear-gradient(135deg,${PRIMARY},${PRIMARY_DARK});color:#fff;padding:15px 40px;border-radius:10px;text-decoration:none;font-weight:600;font-size:15px;letter-spacing:0.2px;box-shadow:0 4px 12px rgba(5,150,105,0.3);transition:all 0.2s">${params.ctaText} →</a>
      </td></tr>
    </table>` : ""}
  </td></tr>

  <!-- Footer (inside card) -->
  <tr><td style="padding:24px 40px 28px;border-top:1px solid ${BORDER};background:${BG}">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="font-size:12px;color:${TEXT_MUTED};line-height:1.5">
          <a href="${siteUrl}" style="color:${PRIMARY};text-decoration:none;font-weight:600">civia.ro</a> · platforma civică a României
          <br><span style="color:${TEXT_DIM};font-size:11px">Gratuit · Fără reclame · Open-source</span>
        </td>
        <td align="right" style="font-size:11px;color:${TEXT_DIM}">
          <a href="${siteUrl}/cont" style="color:${TEXT_MUTED};text-decoration:none">Contul meu</a>
          <span style="color:${BORDER};margin:0 6px">·</span>
          <a href="${siteUrl}/legal/confidentialitate" style="color:${TEXT_MUTED};text-decoration:none">Confidențialitate</a>
        </td>
      </tr>
    </table>
  </td></tr>
</table>

<!-- Meta line under the card -->
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;margin-top:20px">
  <tr><td align="center" style="color:${TEXT_DIM};font-size:11px;line-height:1.6;padding:0 16px">
    Primești acest email pentru că ai trimis o sesizare, te-ai abonat la newsletter, sau ai acțiuni în contul Civia.<br>
    Dacă nu mai vrei mesaje de la noi, <a href="${siteUrl}/cont?unsubscribe=1" style="color:${TEXT_MUTED};text-decoration:underline">dezabonează-te</a>.
  </td></tr>
</table>

</td></tr>
</table>

</body></html>`;
}
