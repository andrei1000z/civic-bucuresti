import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "node:crypto";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { rateLimitAsync, getClientIp } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

const schema = z.object({
  text: z.string().trim().min(20, "Minim 20 caractere").max(2000),
  image_url: z.string().url().optional(),
  email: z.string().email().optional().or(z.literal("")),
  _honey: z.string().optional(), // anti-bot
});

export async function POST(req: Request) {
  const ip = getClientIp(req);

  // Rate limit: 3 submisii / 10 min per IP
  const rl = await rateLimitAsync(`intrerupere-submit:${ip}`, {
    limit: 3,
    windowMs: 10 * 60_000,
  });
  if (!rl.success) {
    return NextResponse.json(
      { error: `Prea multe submisii. Așteaptă ${Math.ceil(rl.resetIn / 1000)}s.` },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.resetIn / 1000)) } },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body invalid" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Date invalide";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  const { text, image_url, email, _honey } = parsed.data;

  // Honeypot — bot-ul completează câmpuri ascunse
  if (_honey) {
    return NextResponse.json({ ok: true, spam: true }, { status: 202 });
  }

  const ipHash = crypto.createHash("sha256").update(ip).digest("hex");

  const admin = createSupabaseAdmin();
  const { data, error } = await admin
    .from("interruption_submissions")
    .insert({
      text,
      image_url: image_url || null,
      email: email || null,
      ip_hash: ipHash,
      user_agent: req.headers.get("user-agent")?.slice(0, 500) ?? null,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: (data as { id: string }).id });
}
