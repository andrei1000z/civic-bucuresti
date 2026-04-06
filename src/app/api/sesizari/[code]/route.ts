import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { getSesizareByCode } from "@/lib/sesizari/repository";

export const dynamic = "force-dynamic";

/**
 * DELETE /api/sesizari/[code] — only the author can delete their own sesizare.
 * CASCADE in DB handles votes/comments/timeline/verifications/follows.
 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  try {
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Trebuie să fii conectat" }, { status: 401 });
    }

    const sesizare = await getSesizareByCode(code);
    if (!sesizare) {
      return NextResponse.json({ error: "Sesizare inexistentă" }, { status: 404 });
    }

    // Only author can delete (by user_id OR matching email)
    const isAuthor = sesizare.user_id === user.id || sesizare.author_email === user.email;
    if (!isAuthor) {
      return NextResponse.json(
        { error: "Doar autorul poate șterge sesizarea" },
        { status: 403 }
      );
    }

    const admin = createSupabaseAdmin();
    const { error } = await admin.from("sesizari").delete().eq("id", sesizare.id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Eroare server";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
