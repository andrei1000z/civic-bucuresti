import { SESIZARE_TIPURI } from "@/lib/constants";
import { getAuthoritiesFor, type ResolvedRecipients } from "./authorities";
import { detectGen, subsemnatulForm, domiciliatForm } from "./gen";

export interface MailtoInput {
  tip: string;
  titlu: string;
  locatie: string;
  sector?: string | null;
  descriere: string;
  formal_text?: string | null;
  author_name: string;
  author_email?: string | null;
  author_address?: string | null;
  imagini?: string[];
  code?: string;
}

export interface EmailPayload {
  to: string[];
  cc: string[];
  subject: string;
  body: string;
  recipients: ResolvedRecipients;
}

const LUNI_RO = [
  "ianuarie", "februarie", "martie", "aprilie", "mai", "iunie",
  "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie",
];

function formatRoDate(d = new Date()): string {
  return `${d.getDate()} ${LUNI_RO[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Post-processes AI-generated formal_text so the identity block (subsemnatul +
 * adresa + signature) reflects the CURRENT submitter, not whatever the AI
 * produced at generation time. Also strips Supabase photo URL lists that
 * otherwise show as raw links in the email body, and forces today's date.
 *
 * This is essential for the "co-semnez" flow: the original author's text is
 * reused for co-signers, but each co-signer must sign with their own data.
 */
function rewriteFormalText(formalText: string, input: MailtoInput): string {
  const name = input.author_name?.trim();
  const address = input.author_address?.trim();
  const today = formatRoDate();
  const gen = name ? detectGen(name) : null;
  const subsemnatul = gen ? subsemnatulForm(gen) : "Subsemnatul(a)";
  const domiciliat = gen ? domiciliatForm(gen) : "domiciliat(ă)";

  let text = formalText;

  // 1. Strip "Fotografii atașate: <URL>" blocks. Pattern covers both classic
  // and colon-prefixed forms, and removes dash-bulleted supabase URLs below.
  text = text.replace(
    /\n*Fotografii?\s+ata[șs]at[eă](?:\s*\([^)]*\))?\s*:?\s*\n?(?:\s*[-•*]\s*https?:\/\/\S+\n?)+/gi,
    "\n",
  );
  // Stray supabase storage URLs on their own lines.
  text = text.replace(/^\s*[-•*]?\s*https?:\/\/\S*supabase\S+\s*$/gim, "");

  // 2. Rewrite the Subsemnatul/Subsemnata paragraph.
  if (name && address) {
    const subsemnatulLine = `${subsemnatul} ${name}, ${domiciliat} în ${address}, vă adresez prezenta sesizare în temeiul OG 27/2002.`;
    const re = /(Subsemnat(?:ul|a|ul\(a\)|a\/Subsemnatul)?)\b[^\n]*$/im;
    if (re.test(text)) {
      text = text.replace(re, subsemnatulLine);
    } else if (!/Subsemnat/i.test(text)) {
      // No identity line at all — inject one after "Bună ziua,"
      text = text.replace(/(Bun[ăa] ziua,?)/i, `$1\n\n${subsemnatulLine}`);
    }
  }

  // 3. Rewrite the signature block. "Cu respect," then name then date.
  if (name) {
    const sigRe = /Cu\s+(respect|stim[ăa]),?\s*\n[^\n]*(?:\n[^\n]*)?$/i;
    const sigBlock = `Cu respect,\n${name}\n${today}`;
    if (sigRe.test(text)) {
      text = text.replace(sigRe, sigBlock);
    } else {
      text = `${text.trimEnd()}\n\n${sigBlock}`;
    }
  }

  // 4. Collapse 3+ blank lines to exactly one blank line.
  text = text.replace(/\n{3,}/g, "\n\n").trim();

  return text;
}

export function buildFormalText(input: MailtoInput): string {
  const tipLabel = SESIZARE_TIPURI.find((t) => t.value === input.tip)?.label ?? "";
  const today = formatRoDate();
  const numarFoto = input.imagini?.length ?? 0;
  const evidence =
    numarFoto > 0
      ? `\n\nAnexez ${numarFoto} ${numarFoto === 1 ? "fotografie realizată" : "fotografii realizate"} la fața locului, disponibile la codul sesizării ${input.code ?? ""}.\n`
      : "";

  if (input.formal_text) {
    const rewritten = rewriteFormalText(input.formal_text, input);
    // Append the photo-count line (no URLs!) if we have photos.
    return numarFoto > 0 && !/Anexez\s+\d+\s+fotografi/i.test(rewritten)
      ? `${rewritten}${evidence}`
      : rewritten;
  }

  // Fallback: classic structure with proper gender agreement
  const gen = input.author_name ? detectGen(input.author_name) : null;
  const subsemnatul = gen ? subsemnatulForm(gen) : "Subsemnatul(a)";
  const domiciliat = gen ? domiciliatForm(gen) : "domiciliat(ă)";

  return `Bună ziua,

${subsemnatul} ${input.author_name || "[NUMELE]"}, ${domiciliat} în ${input.author_address || "[ADRESA]"}, mă adresez instituției dumneavoastră cu următoarea sesizare, semnalată astăzi, ${today}.

Vă aduc la cunoștință faptul că am observat ${tipLabel.toLowerCase()}, situată la adresa: ${input.locatie}. ${input.descriere}${evidence}
Vă propun, ca soluție concretă, intervenția echipelor competente pentru remedierea situației semnalate.

Vă mulțumesc anticipat și vă rog să îmi comunicați numărul de înregistrare al prezentei sesizări, conform OG 27/2002.

Cu respect,
${input.author_name || "[NUMELE]"}
${today}`;
}

export function buildEmailPayload(input: MailtoInput): EmailPayload {
  const recipients = getAuthoritiesFor(input.tip, input.sector ?? null);
  const tipLabel = SESIZARE_TIPURI.find((t) => t.value === input.tip)?.label ?? "";
  const subject = `Sesizare ${tipLabel} — ${input.locatie}`;
  const body = buildFormalText(input);
  return {
    to: recipients.primary.map((a) => a.email),
    cc: recipients.cc.map((a) => a.email),
    subject,
    body,
    recipients,
  };
}

export function buildMailtoLink(input: MailtoInput): string {
  const p = buildEmailPayload(input);
  const cc = p.cc.length > 0 ? `&cc=${p.cc.join(",")}` : "";
  return `mailto:${p.to.join(",")}?subject=${encodeURIComponent(p.subject)}${cc}&body=${encodeURIComponent(p.body)}`;
}

export function buildGmailLink(input: MailtoInput): string {
  const p = buildEmailPayload(input);
  const params = new URLSearchParams({
    view: "cm",
    fs: "1",
    to: p.to.join(","),
    su: p.subject,
    body: p.body,
  });
  if (p.cc.length > 0) params.set("cc", p.cc.join(","));
  return `https://mail.google.com/mail/?${params.toString()}`;
}

export function buildOutlookLink(input: MailtoInput): string {
  const p = buildEmailPayload(input);
  const params = new URLSearchParams({
    path: "/mail/action/compose",
    to: p.to.join(","),
    subject: p.subject,
    body: p.body,
  });
  if (p.cc.length > 0) params.set("cc", p.cc.join(","));
  return `https://outlook.live.com/owa/?${params.toString()}`;
}

export function buildYahooLink(input: MailtoInput): string {
  const p = buildEmailPayload(input);
  const params = new URLSearchParams({
    to: p.to.join(","),
    subject: p.subject,
    body: p.body,
  });
  if (p.cc.length > 0) params.set("cc", p.cc.join(","));
  return `https://compose.mail.yahoo.com/?${params.toString()}`;
}

export function getRecipientsLabel(tip: string, sector?: string | null): string {
  return getAuthoritiesFor(tip, sector ?? null).label;
}
