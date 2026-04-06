import { NextResponse } from "next/server";
import { z } from "zod";
import { listSesizari, createSesizare } from "@/lib/sesizari/repository";
import { generateUniqueCode } from "@/lib/sesizari/codes";
import { createSupabaseServer } from "@/lib/supabase/server";
import { rateLimit, getClientIp } from "@/lib/ratelimit";
import { sanitizeText } from "@/lib/sanitize";
import { humanizeSupabaseError } from "@/lib/supabase/errors";

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
  // Honeypot: bots fill all fields, humans don't see this
  _honey: z.string().max(0).optional().default(""),
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
