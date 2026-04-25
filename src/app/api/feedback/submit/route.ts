import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "node:crypto";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { rateLimitAsync, getClientIp } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

const schema = z.object({
  text: z.string().trim().min(10, "Minim 10 caractere").max(3000),
  email: z.string().email().optional().or(z.literal("")),
  topic: z.enum(["gdpr", "bug", "idee", "contact", "altele"]).optional(),
  page_path: z.string().max(200).optional(),
  _honey: z.string().optional(),
});

export async function POST(req: Request) {
  const ip = getClientIp(req);

  // 5 submisii / 30 min per IP — feedback nu e spam-y de obicei
  const rl = await rateLimitAsync(`feedback-submit:${ip}`, {
    limit: 5,
    windowMs: 30 * 60_000,
  });
  if (!rl.success) {
    return NextResponse.json(
      { error: `Prea multe mesaje. Așteaptă ${Math.ceil(rl.resetIn / 1000)}s.` },
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

  if (parsed.data._honey) {
    return NextResponse.json({ ok: true, spam: true }, { status: 202 });
  }

  const ipHash = crypto.createHash("sha256").update(ip).digest("hex");

  const admin = createSupabaseAdmin();
  const { data, error } = await admin
    .from("feedback_submissions")
    .insert({
      text: parsed.data.text,
      email: parsed.data.email || null,
      topic: parsed.data.topic || "altele",
      page_path: parsed.data.page_path || null,
      ip_hash: ipHash,
      user_agent: req.headers.get("user-agent")?.slice(0, 500) ?? null,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, id: (data as { id: string }).id });
}
