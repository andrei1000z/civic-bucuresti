import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getSesizareByCode, upsertVerification } from "@/lib/sesizari/repository";
import { humanizeSupabaseError } from "@/lib/supabase/errors";
import { invalidateSesizariCache } from "@/lib/cached-queries";
import { rateLimitAsync } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

const verifySchema = z.object({
  agrees: z.boolean(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  try {
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Trebuie să fii conectat" }, { status: 401 });
    }

    const rl = await rateLimitAsync(`verify:${user.id}`, { limit: 10, windowMs: 60_000 });
    if (!rl.success) {
      return NextResponse.json({ error: "Prea multe verificări" }, { status: 429 });
    }

    const sesizare = await getSesizareByCode(code);
    if (!sesizare) {
      return NextResponse.json({ error: "Sesizare inexistentă" }, { status: 404 });
    }

    if (sesizare.status !== "rezolvat") {
      return NextResponse.json(
        { error: "Poți verifica doar sesizări marcate rezolvate" },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const parsed = verifySchema.parse(body);

    await upsertVerification({
      sesizareId: sesizare.id,
      userId: user.id,
      agrees: parsed.agrees,
    });

    invalidateSesizariCache();
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Input invalid" }, { status: 400 });
    }
    const h = humanizeSupabaseError(e);
    return NextResponse.json({ error: h.message }, { status: h.status });
  }
}
