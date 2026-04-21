import { NextResponse } from "next/server";
import { z } from "zod";
import * as Sentry from "@sentry/nextjs";
import { listSesizari, createSesizare } from "@/lib/sesizari/repository";
import { generateUniqueCode } from "@/lib/sesizari/codes";
import { createSupabaseServer } from "@/lib/supabase/server";
import { rateLimitAsync, getClientIp } from "@/lib/ratelimit";
import { sanitizeText, escapeHtml } from "@/lib/sanitize";
import { humanizeSupabaseError } from "@/lib/supabase/errors";
import { sendEmail, emailTemplate } from "@/lib/email/resend";
import { invalidateSesizariCache } from "@/lib/cached-queries";
import { polishSesizare } from "@/lib/sesizari/polish";
import { forwardGeocode } from "@/lib/sesizari/geocoding";

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
  sector: z.enum(["S1", "S2", "S3", "S4", "S5", "S6"]).optional().nullable().default(null),
  county: z.string().max(3).optional().nullable(),       // "CJ", "B", etc.
  locality: z.string().max(100).optional().nullable(),    // "Cluj-Napoca", etc.
  lat: z.number().min(43.5).max(48.3),  // Romania lat range (actual)
  lng: z.number().min(20.2).max(29.7),  // Romania lng range (actual)
  descriere: z.string().min(10, "Descrierea trebuie să aibă minim 10 caractere").max(2000),
  formal_text: z.string().max(5000).optional().nullable(),
  imagini: z.array(z.string().url()).max(5).default([]),
  publica: z.boolean().default(true),
  // Honeypot: bots fill all fields, humans don't see this.
  // Accept any value here (mobile autofill sometimes fills it) — we check manually below.
  _honey: z.string().optional().default(""),
});

// Great-circle distance in km between two WGS84 points. Used to detect
// "the user's GPS was clearly wrong" at sesizare creation time — if parsed
// coords are >20 km from a Nominatim forward-geocode of their text, we
// trust the text.
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  try {
    const rows = await listSesizari({
      tip: searchParams.get("tip") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      sector: searchParams.get("sector") ?? undefined,
      county: searchParams.get("county") ?? undefined,
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
  const rl = await rateLimitAsync(`sesizari-create:${ip}`, { limit: 5, windowMs: 10 * 60_000 });
  if (!rl.success) {
    return NextResponse.json(
      { error: "Prea multe sesizări create. Încearcă în 10 min." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const parsed = createSchema.parse(body);

    // Honeypot: if filled, silent drop with fake success — the bot thinks it worked,
    // we don't pollute the DB, and real users who hit this via mobile autofill also get a 200.
    if (parsed._honey && parsed._honey.length > 0) {
      return NextResponse.json({ data: { code: "XXXXXX", titlu: parsed.titlu } });
    }

    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    const code = await generateUniqueCode();

    // Polish title + descriere + locatie via AI before saving. User input
    // is often ALL CAPS, imperative and without diacritics — not something
    // we want as the public face of the sesizare. Fast model, ~200ms.
    const polished = await polishSesizare({
      titlu: sanitizeText(parsed.titlu, 200),
      descriere: sanitizeText(parsed.descriere, 2000),
      locatie: sanitizeText(parsed.locatie, 300),
      tip: parsed.tip,
    });

    // If the submitted lat/lng doesn't match the location text (common when
    // the user skipped GPS and we fell back to a default center), re-forward-
    // geocode the polished location text and use those coordinates instead.
    let finalLat = parsed.lat;
    let finalLng = parsed.lng;
    try {
      const hit = await forwardGeocode(polished.locatie);
      if (hit) {
        // If the parsed lat/lng is >20km away from the geocoded result,
        // the user's coords are almost certainly wrong — prefer geocode.
        const distKm = haversineKm(parsed.lat, parsed.lng, hit.lat, hit.lng);
        if (distKm > 20) {
          finalLat = hit.lat;
          finalLng = hit.lng;
        }
      }
    } catch { /* silent — keep original coords */ }

    try {
      const row = await createSesizare({
        code,
        user_id: user?.id ?? null,
        ...parsed,
        author_name: sanitizeText(parsed.author_name, 120),
        titlu: polished.titlu,
        locatie: polished.locatie,
        descriere: polished.descriere,
        lat: finalLat,
        lng: finalLng,
      });

      // Bust stats cache so /impact, LiveStatsBar, /api/v1/stats see the new
      // sesizare immediately instead of waiting up to 5 min for the TTL.
      invalidateSesizariCache();

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
              <p>Salut <strong>${escapeHtml(parsed.author_name)}</strong>,</p>
              <p>Sesizarea ta a fost înregistrată cu succes pe Civia.</p>
              <table style="background:#f1f5f9;border-radius:8px;padding:16px;width:100%;margin:16px 0">
                <tr><td style="color:#64748b;font-size:12px;padding:4px 0">Cod unic</td><td style="font-weight:700;font-size:18px;color:#1C4ED8">${escapeHtml(code)}</td></tr>
                <tr><td style="color:#64748b;font-size:12px;padding:4px 0">Titlu</td><td>${escapeHtml(sanitizeText(parsed.titlu, 100))}</td></tr>
                <tr><td style="color:#64748b;font-size:12px;padding:4px 0">Locație</td><td>${escapeHtml(sanitizeText(parsed.locatie, 100))}</td></tr>
              </table>
              <p>Poți urmări statusul sesizării oricând:</p>
            `,
            ctaText: "Vezi sesizarea ta",
            ctaUrl: `${siteUrl}/sesizari/${code}`,
          }),
        }).catch((err) => {
          // fire-and-forget, but report to Sentry so we know if Resend breaks
          Sentry.captureException(err, { tags: { kind: "sesizare_email" }, extra: { code } });
        });
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
