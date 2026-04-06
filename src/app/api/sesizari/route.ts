import { NextResponse } from "next/server";
import { z } from "zod";
import { listSesizari, createSesizare } from "@/lib/sesizari/repository";
import { generateUniqueCode } from "@/lib/sesizari/codes";
import { createSupabaseServer } from "@/lib/supabase/server";
import { rateLimit, getClientIp } from "@/lib/ratelimit";
import { sanitizeText } from "@/lib/sanitize";
import { humanizeSupabaseError } from "@/lib/supabase/errors";
import { sendEmail, emailTemplate } from "@/lib/email/resend";

export const dynamic = "force-dynamic";

const VALID_TIPURI = [
  "groapa", "trotuar", "iluminat", "copac", "gunoi", "parcare",
  "stalpisori", "canalizare", "semafor", "pietonal",
  "graffiti", "mobilier", "zgomot", "animale", "transport",
  "altele",
] as const;

// Lenient validation: accept empty strings for optional fields
const createSchema = z.object({
  author_name: z.string().min(2, "Numele trebuie să aibă minim 2 caractere").max(120),
  author_email: z.union([z.string().email(), z.literal(""), z.null()]).optional().transform((v) => (v === "" ? null : v)),
  tip: z.enum(VALID_TIPURI),
  titlu: z.string().min(3, "Titlul trebuie să aibă minim 3 caractere").max(200),
  locatie: z.string().min(3, "Locația trebuie să aibă minim 3 caractere").max(300),
  sector: z.enum(["S1", "S2", "S3", "S4", "S5", "S6"]),
  lat: z.number().min(43).max(46),
  lng: z.number().min(25).max(27),
  descriere: z.string().min(10, "Descrierea trebuie să aibă minim 10 caractere").max(2000),
  formal_text: z.string().max(5000).optional().nullable(),
  imagini: z.array(z.string().url()).max(5).default([]),
  publica: z.boolean().default(true),
  // Honeypot: bots fill all fields, humans don't see this.
  // Accept any value here (mobile autofill sometimes fills it) — we check manually below.
  _honey: z.string().optional().default(""),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  try {
    const rows = await listSesizari({
      tip: searchParams.get("tip") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      sector: searchParams.get("sector") ?? undefined,
      sort: (searchParams.get("sort") as "recent" | "votate") ?? "recent",
      limit: Number(searchParams.get("limit") ?? 50),
      offset: Number(searchParams.get("offset") ?? 0),
    });
    return NextResponse.json(
      { data: rows },
      { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" } }
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = rateLimit(`sesizari-create:${ip}`, { limit: 5, windowMs: 10 * 60_000 });
  if (!rl.success) {
    return NextResponse.json(
      { error: "Prea multe sesizări create. Încearcă în 10 min." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const parsed = createSchema.parse(body);

    // Honeypot check: if filled, silently reject (bot detected).
    // Don't show the field name to the user — just generic error.
    if (parsed._honey && parsed._honey.length > 0) {
      return NextResponse.json({ error: "Sesizare invalidă" }, { status: 400 });
    }

    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    const code = await generateUniqueCode();
    try {
      const row = await createSesizare({
        code,
        user_id: user?.id ?? null,
        ...parsed,
        author_name: sanitizeText(parsed.author_name, 120),
        titlu: sanitizeText(parsed.titlu, 200),
        locatie: sanitizeText(parsed.locatie, 300),
        descriere: sanitizeText(parsed.descriere, 2000),
      });

      // Send confirmation email (non-blocking — don't delay response)
      const authorEmail = parsed.author_email;
      if (authorEmail) {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://civia.ro";
        sendEmail({
          to: authorEmail,
          subject: `Sesizare ${code} — înregistrată pe Civia`,
          html: emailTemplate({
            title: "Sesizare înregistrată",
            preheader: `Codul tău: ${code}. Urmărește statusul pe civia.ro.`,
            body: `
              <p>Salut <strong>${parsed.author_name}</strong>,</p>
              <p>Sesizarea ta a fost înregistrată cu succes pe Civia.</p>
              <table style="background:#f1f5f9;border-radius:8px;padding:16px;width:100%;margin:16px 0">
                <tr><td style="color:#64748b;font-size:12px;padding:4px 0">Cod unic</td><td style="font-weight:700;font-size:18px;color:#1C4ED8">${code}</td></tr>
                <tr><td style="color:#64748b;font-size:12px;padding:4px 0">Titlu</td><td>${sanitizeText(parsed.titlu, 100)}</td></tr>
                <tr><td style="color:#64748b;font-size:12px;padding:4px 0">Locație</td><td>${sanitizeText(parsed.locatie, 100)}</td></tr>
              </table>
              <p>Poți urmări statusul sesizării oricând:</p>
            `,
            ctaText: "Vezi sesizarea ta",
            ctaUrl: `${siteUrl}/sesizari/${code}`,
          }),
        }).catch(() => {}); // fire-and-forget
      }

      return NextResponse.json({ data: row });
    } catch (dbErr) {
      const human = humanizeSupabaseError(dbErr);
      return NextResponse.json({ error: human.message }, { status: human.status });
    }
  } catch (e) {
    if (e instanceof z.ZodError) {
      // Human-readable error for the first issue
      const firstIssue = e.issues[0];
      const friendly = firstIssue?.message ?? "Date invalide";
      const field = firstIssue?.path.join(".");
      return NextResponse.json(
        { error: `${friendly}${field ? ` (${field})` : ""}`, details: e.issues },
        { status: 400 }
      );
    }
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
