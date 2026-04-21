import { SESIZARE_TIPURI } from "@/lib/constants";
import { getAuthoritiesFor, type ResolvedRecipients } from "./authorities";

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

  let text = formalText;

  // 1. Strip "Fotografii atașate: <URL>" blocks. Pattern covers both classic
  // and colon-prefixed forms, and removes dash-bulleted supabase URLs below.
  text = text.replace(
    /\n*Fotografii?\s+ata[șs]at[eă](?:\s*\([^)]*\))?\s*:?\s*\n?(?:\s*[-•*]\s*https?:\/\/\S+\n?)+/gi,
    "\n",
  );
  // Stray supabase storage URLs on their own lines.
  text = text.replace(/^\s*[-•*]?\s*https?:\/\/\S*supabase\S+\s*$/gim, "");

  // 2. Rewrite the identity paragraph. New template uses "Mă numesc X,
  // locuiesc în Y..."; legacy templates used "Subsemnatul X, domiciliat
  // în Y...". Handle both so co-signing works on older formal_texts too.
  if (name && address) {
    // New style line — what the current prompt produces.
    const newStyleRe = /^\s*Mă\s+numesc\s+[^,\n]+,\s*locuiesc\s+(?:\s*pe|\s*în)?[^\n]*$/im;
    // Keep the preamble the AI already wrote after the comma ("doresc să vă
    // aduc la cunoștință…") — we only swap the name + address part.
    text = text.replace(newStyleRe, (match) => {
      const afterLocuiesc = match.match(/locuiesc\s+(?:pe\s+|în\s+)?[^,\n]+(,\s*.*)$/i);
      const tail = afterLocuiesc?.[1] ?? " și doresc să vă aduc la cunoștință o problemă care necesită intervenția dumneavoastră.";
      return `Mă numesc ${name}, locuiesc în ${address}${tail}`;
    });

    // Legacy "Subsemnatul/Subsemnata..." — replace with new style so every
    // email lands in the same format.
    const legacyRe = /(Subsemnat(?:ul|a|ul\(a\)|a\/Subsemnatul)?)\b[^\n]*$/im;
    if (legacyRe.test(text)) {
      text = text.replace(
        legacyRe,
        `Mă numesc ${name}, locuiesc în ${address} și doresc să vă aduc la cunoștință o problemă care necesită intervenția dumneavoastră.`,
      );
    }

    // Fallback: no identity line at all — inject after "Bună ziua,"
    if (!newStyleRe.test(text) && !/Subsemnat/i.test(text) && !/Mă\s+numesc/i.test(text)) {
      text = text.replace(
        /(Bun[ăa] ziua,?)/i,
        `$1\n\nMă numesc ${name}, locuiesc în ${address} și doresc să vă aduc la cunoștință o problemă care necesită intervenția dumneavoastră.`,
      );
    }
  }

  // 3. Rewrite the signature block. "Cu stimă," or "Cu respect," then
  // name then date.
  if (name) {
    const sigRe = /Cu\s+(respect|stim[ăa]),?\s*\n[^\n]*(?:\n[^\n]*)?$/i;
    const sigBlock = `Cu stimă,\n${name}\n${today}`;
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
      ? `\n\nAnexez ${numarFoto} ${numarFoto === 1 ? "fotografie" : "fotografii"}.\n`
      : "";

  if (input.formal_text) {
    const rewritten = rewriteFormalText(input.formal_text, input);
    // Append the photo-count line (no URLs!) if we have photos.
    return numarFoto > 0 && !/Anexez\s+\d+\s+fotografi/i.test(rewritten)
      ? `${rewritten}${evidence}`
      : rewritten;
  }

  // Fallback: narrative template in the same style as the AI prompt.
  // Used when AI hasn't run yet (no formal_text) — keeps the email
  // format consistent regardless of whether AI was invoked.
  const name = input.author_name || "[NUMELE]";
  const address = input.author_address || "[ADRESA]";
  const problem = tipLabel ? tipLabel.toLowerCase() : "situație";

  return `Bună ziua,

Mă numesc ${name}, locuiesc în ${address} și doresc să vă aduc la cunoștință o problemă care afectează calitatea vieții pe ${input.locatie}.

Astăzi, ${today}, am observat ${problem} în această zonă. ${input.descriere}${evidence}
Pentru a rezolva această situație, vă solicit respectuos să luați următoarele măsuri:

1. Verificare la fața locului: constatarea situației și identificarea autorităților competente.
2. Intervenție corespunzătoare: remedierea problemei în termen rezonabil.
3. Comunicare răspuns: informare privind măsurile luate, conform OG 27/2002.

De asemenea, vă rog să îmi furnizați un număr de înregistrare pentru această sesizare, pentru a putea urmări progresul soluționării.

Vă mulțumesc anticipat pentru atenția acordată.

Cu stimă,
${name}
${today}`;
}

export function buildEmailPayload(input: MailtoInput): EmailPayload {
  const recipients = getAuthoritiesFor(input.tip, input.sector ?? null, null, input.locatie);
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

export function getRecipientsLabel(tip: string, sector?: string | null, locationText?: string | null): string {
  return getAuthoritiesFor(tip, sector ?? null, null, locationText ?? null).label;
}
