import { NextResponse } from "next/server";
import { z } from "zod";
import * as Sentry from "@sentry/nextjs";
import { createSupabaseServer } from "@/lib/supabase/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { getSesizareByCode } from "@/lib/sesizari/repository";
import { rateLimitAsync } from "@/lib/ratelimit";
import { SESIZARE_TICKET_PROPOSABLE } from "@/lib/sesizari/status";

export const dynamic = "force-dynamic";

const schema = z.object({
  proposed_status: z.enum(SESIZARE_TICKET_PROPOSABLE),
  note: z
    .string()
    .trim()
    .min(5, "Adaugă o notă cu detalii despre update (minim 5 caractere)")
    .max(1000),
  proof_url: z.string().url().optional().nullable(),
});

/**
 * Citizens propose a status update on a sesizare. Admin approves /
 * rejects from /admin/sesizari/tickets. Approval flips the sesizare
 * status + writes a timeline row.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Auth required" }, { status: 401 });
  }

  // Cap per-user submission rate so a frustrated user can't flood the
  // admin queue. 5 tickets / 10 min is generous for a real flow but
  // tight enough to catch abuse.
  const rl = await rateLimitAsync(`status-ticket:${user.id}`, {
    limit: 5,
    windowMs: 10 * 60_000,
  });
  if (!rl.success) {
    return NextResponse.json(
      { error: "Ai trimis prea multe propuneri. Încearcă în 10 min." },
      { status: 429 },
    );
  }

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? "Input invalid";
    return NextResponse.json({ error: first }, { status: 400 });
  }

  const sesizare = await getSesizareByCode(code);
  if (!sesizare) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Don't propose the same status the sesizare is already in — that's
  // a no-op the admin would just close.
  if (sesizare.status === parsed.data.proposed_status) {
    return NextResponse.json(
      { error: `Sesizarea e deja la statusul „${parsed.data.proposed_status}".` },
      { status: 400 },
    );
  }

  // Don't allow more than one pending ticket per (user, sesizare) — if
  // the user wants to revise, they can wait for the admin decision.
  const admin = createSupabaseAdmin();
  const { data: existing } = await admin
    .from("sesizare_status_tickets")
    .select("id")
    .eq("sesizare_id", sesizare.id)
    .eq("user_id", user.id)
    .eq("decision", "pending")
    .maybeSingle();
  if (existing) {
    return NextResponse.json(
      { error: "Ai deja o propunere în așteptare pentru această sesizare." },
      { status: 409 },
    );
  }

  const { data: row, error } = await admin
    .from("sesizare_status_tickets")
    .insert({
      sesizare_id: sesizare.id,
      user_id: user.id,
      proposed_status: parsed.data.proposed_status,
      note: parsed.data.note,
      proof_url: parsed.data.proof_url ?? null,
    })
    .select()
    .single();

  if (error) {
    Sentry.captureException(error, {
      tags: { kind: "status_ticket_insert" },
      extra: { code, status: parsed.data.proposed_status },
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: row });
}

/** GET — return the caller's own tickets for this sesizare. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ data: [] });

  const sesizare = await getSesizareByCode(code);
  if (!sesizare) return NextResponse.json({ data: [] });

  const admin = createSupabaseAdmin();
  const { data, error } = await admin
    .from("sesizare_status_tickets")
    .select("id, proposed_status, note, proof_url, decision, decision_note, created_at, decided_at")
    .eq("sesizare_id", sesizare.id)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) return NextResponse.json({ data: [] });
  return NextResponse.json({ data: data ?? [] });
}
