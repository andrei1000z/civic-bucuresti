import { NextResponse } from "next/server";
import { z } from "zod";
import { upsertVote, removeVote, getSesizareByCode } from "@/lib/sesizari/repository";
import { createSupabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const voteSchema = z.object({
  value: z.union([z.literal(-1), z.literal(1), z.literal(0)]),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Auth required" }, { status: 401 });
    }

    const sesizare = await getSesizareByCode(code);
    if (!sesizare) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await req.json();
    const { value } = voteSchema.parse(body);

    if (value === 0) {
      await removeVote({ sesizareId: sesizare.id, userId: user.id });
    } else {
      await upsertVote({ sesizareId: sesizare.id, userId: user.id, value });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error" }, { status: 400 });
    }
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
