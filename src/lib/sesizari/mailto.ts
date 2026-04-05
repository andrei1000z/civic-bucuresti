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

export function buildFormalText(input: MailtoInput): string {
  const tipLabel = SESIZARE_TIPURI.find((t) => t.value === input.tip)?.label ?? "";
  const today = new Date().toLocaleDateString("ro-RO");

  if (input.formal_text) {
    // AI already generated the full classic-style letter — append image refs only
    const imagesBlock = input.imagini && input.imagini.length > 0
      ? `\n\nFotografii atașate:\n${input.imagini.map((u) => `- ${u}`).join("\n")}`
      : "";
    return `${input.formal_text}${imagesBlock}`;
  }

  // Fallback: classic structure with proper gender agreement
  const gen = input.author_name ? detectGen(input.author_name) : null;
  const subsemnatul = gen ? subsemnatulForm(gen) : "Subsemnatul(a)";
  const domiciliat = gen ? domiciliatForm(gen) : "domiciliat(ă)";

  return `Bună ziua,

${subsemnatul} ${input.author_name || "[NUMELE]"}, ${domiciliat} în ${input.author_address || "[ADRESA]"}, mă adresez instituției dumneavoastră cu următoarea sesizare.

Vă aduc la cunoștință faptul că am observat ${tipLabel.toLowerCase()}, situată la adresa: ${input.locatie}. ${input.descriere}
${input.imagini && input.imagini.length > 0 ? `\nFotografii atașate (ca dovadă):\n${input.imagini.map((u) => `- ${u}`).join("\n")}\n` : ""}
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
