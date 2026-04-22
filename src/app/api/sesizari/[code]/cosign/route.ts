import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { getSesizareByCode } from "@/lib/sesizari/repository";
import { rateLimitAsync, getClientIp } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

/**
 * POST /api/sesizari/[code]/cosign
 *
 * Fires when a second citizen opens the "Trimite și tu sesizarea" dialog
 * and actually lands on the email provider. Writes a timeline event so
 * followers of the sesizare see "A mai depus cineva pe data X la ora Y"
 * without having to expose the co-signer's identity on the public page.
 *
 * Anonymous is fine — anyone viewing the sesizare can co-sign. We still
 * rate-limit per IP so a single bot can't pump the counter.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const ip = getClientIp(req);
  const rl = await rateLimitAsync(`cosign:${ip}`, { limit: 10, windowMs: 60 * 60_000 });
  if (!rl.success) {
    return NextResponse.json(
      { error: "Prea multe co-semnături. Mai încearcă peste o oră." },
      { status: 429 },
    );
  }

  const { code } = await params;
  const sesizare = await getSesizareByCode(code);
  if (!sesizare) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Capture viewer context for analytics; row itself stays anonymous.
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  const admin = createSupabaseAdmin();
  const { error } = await admin.from("sesizare_timeline").insert({
    sesizare_id: sesizare.id,
    event_type: "cosemnat",
    description: "Un alt cetățean a trimis și el această sesizare la autorități",
    created_by: user?.id ?? null,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
