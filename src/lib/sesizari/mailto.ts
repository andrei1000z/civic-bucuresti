import { SESIZARE_TIPURI } from "@/lib/constants";
import { getAuthoritiesFor, type ResolvedRecipients } from "./authorities";
import { buildParkingLegalText, type ParkingJurisdiction } from "./parking";

export interface MailtoInput {
  tip: string;
  titlu: string;
  locatie: string;
  sector?: string | null;
  lat?: number | null;
  lng?: number | null;
  descriere: string;
  formal_text?: string | null;
  author_name: string;
  author_email?: string | null;
  author_address?: string | null;
  imagini?: string[];
  code?: string;
  /** Parking-specific legal metadata. Only used when tip === "parcare". */
  parking?: {
    plate?: string | null;
    jurisdiction?: ParkingJurisdiction | null;
  };
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
  //
  // The tricky bit: the AI-generated opener often contains the user's
  // address with internal commas ("Strada X 12, Sector 5"). A naive
  // greedy rewrite then re-inserts the sector comma on top of the tail
  // we're trying to keep ("Sector 5, Sector 5, și doresc..."). Fix:
  // match the identity clause up to a verb marker via LOOKAHEAD so the
  // preamble after it ("și doresc...", "vă aduc...", ".") stays intact
  // OUTSIDE the replacement span — no doubling possible.
  if (name && address) {
    // Sentinel for "end of address" — same rules as scrub-public:
    // stops at " și/şi/si/vă/va/mă/ma/îmi/imi/doresc/solicit/adresez/
    // aduc" verb cues, end of sentence (.?!), paragraph break, or EOS.
    const END = String.raw`(?=\s*(?:\s+(?:și|şi|si)\s+\w+|\s+(?:vă|va|mă|ma|îmi|imi|doresc|solicit|adresez|aduc)\b|[.?!]\s|\n\s*\n|$))`;

    // New style: "Mă numesc {name}, locuiesc (pe|în) {address}" — replace
    // the captured span with our corrected version. Tail is not captured
    // and stays as-is.
    const newStyleRe = new RegExp(
      String.raw`M[ăa]\s+numesc\s+[^,\n]+,\s*locuiesc\s+(?:pe|în|in)\s+[^\n]+?${END}`,
      "gim",
    );
    text = text.replace(newStyleRe, `Mă numesc ${name}, locuiesc în ${address}`);

    // Legacy "Subsemnatul/Subsemnata X, domiciliat(ă) pe/în Y" → same
    // new-style landing. Lookahead keeps the tail intact here too.
    const legacyRe = new RegExp(
      String.raw`Subsemnat(?:ul|a|ul\(a\)|a\/Subsemnatul)?\s+[^,\n]+,\s*domiciliat(?:\(?ă\)?|ă|a)?\s+(?:pe|în|in)\s+[^\n]+?${END}`,
      "gim",
    );
    text = text.replace(
      legacyRe,
      `Mă numesc ${name}, locuiesc în ${address}`,
    );

    // Fallback: no identity line at all — inject after "Bună ziua,"
    if (!/M[ăa]\s+numesc/i.test(text) && !/Subsemnat/i.test(text)) {
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

  // Parking: skip the generic AI template and use the legally-tuned
  // version the user specified — structured body citing OUG 195/2002 +
  // art. 39, plate number highlighted, jurisdiction-aware opener.
  // Required inputs: plate + jurisdiction. If either is missing we fall
  // through to the generic path so the form still produces *something*.
  if (input.tip === "parcare" && input.parking?.plate && input.parking.jurisdiction) {
    const recipients = getAuthoritiesFor(
      input.tip,
      input.sector ?? null,
      null,
      input.locatie,
      { jurisdiction: input.parking.jurisdiction },
    );
    const authorityName = recipients.primary[0]?.name ?? "Autoritatea competentă";
    return buildParkingLegalText({
      authorityName,
      authorName: input.author_name || "[NUMELE]",
      authorAddress: input.author_address || "[ADRESA]",
      plate: input.parking.plate,
      jurisdiction: input.parking.jurisdiction,
      locatie: input.locatie,
      lat: input.lat ?? null,
      lng: input.lng ?? null,
      photoCount: numarFoto,
    });
  }

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
  const recipients = getAuthoritiesFor(
    input.tip,
    input.sector ?? null,
    null,
    input.locatie,
    input.parking ? { jurisdiction: input.parking.jurisdiction ?? null } : undefined,
  );
  const tipLabel = SESIZARE_TIPURI.find((t) => t.value === input.tip)?.label ?? "";
  let subject = `Sesizare ${tipLabel} — ${input.locatie}`;
  if (input.tip === "parcare" && input.parking?.plate) {
    // Police mailrooms search inbox by plate number when triaging
    // parking complaints — putting it in the subject shaves days off
    // the response time.
    subject = `Sesizare parcare neregulamentară — ${input.parking.plate} — ${input.locatie}`;
  }
  // Plain-text body: strip the bold markers the parking template uses.
  // Mail clients receiving text/plain can't render bold anyway.
  const body = buildFormalText(input).replace(/\[\[BOLD]]([^[]+?)\[\[\/BOLD]]/g, "$1");
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

export function getRecipientsLabel(
  tip: string,
  sector?: string | null,
  locationText?: string | null,
  parking?: { jurisdiction?: ParkingJurisdiction | null },
): string {
  return getAuthoritiesFor(
    tip,
    sector ?? null,
    null,
    locationText ?? null,
    parking ? { jurisdiction: parking.jurisdiction ?? null } : undefined,
  ).label;
}
