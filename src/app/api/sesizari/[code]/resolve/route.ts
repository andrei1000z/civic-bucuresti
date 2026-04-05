import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServer } from "@/lib/supabase/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { getSesizareByCode } from "@/lib/sesizari/repository";
import { humanizeSupabaseError } from "@/lib/supabase/errors";

export const dynamic = "force-dynamic";

const resolveSchema = z.object({
  resolved_photo_url: z.string().url().optional().nullable(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  try {
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Auth required" }, { status: 401 });

    const sesizare = await getSesizareByCode(code);
    if (!sesizare) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Only author can mark resolved (by user_id OR by matching email)
    const isAuthor = sesizare.user_id === user.id || sesizare.author_email === user.email;
    if (!isAuthor) {
      return NextResponse.json(
        { error: "Doar autorul sesizării poate marca ca rezolvată" },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const parsed = resolveSchema.parse(body);

    const admin = createSupabaseAdmin();
    const { error } = await admin
      .from("sesizari")
      .update({
        status: "rezolvat",
        resolved_at: new Date().toISOString(),
        resolved_by_author: true,
        resolved_photo_url: parsed.resolved_photo_url ?? null,
      })
      .eq("id", sesizare.id);

    if (error) {
      const h = humanizeSupabaseError(error);
      return NextResponse.json({ error: h.message }, { status: h.status });
    }

    // Adaugă eveniment în timeline
    await admin.from("sesizare_timeline").insert({
      sesizare_id: sesizare.id,
      event_type: "rezolvat",
      description: "Marcată ca rezolvată de autor",
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Input invalid" }, { status: 400 });
    }
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
