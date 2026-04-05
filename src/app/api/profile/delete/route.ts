import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

// GDPR: Right to be forgotten — delete user + anonymize sesizari
export async function DELETE() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Auth required" }, { status: 401 });

  const admin = createSupabaseAdmin();

  try {
    // Anonymize sesizari (keep public record)
    await admin
      .from("sesizari")
      .update({ user_id: null, author_email: null, author_name: "Utilizator anonim" })
      .eq("user_id", user.id);

    // Delete votes
    await admin.from("sesizare_votes").delete().eq("user_id", user.id);

    // Anonymize comments
    await admin
      .from("sesizare_comments")
      .update({ user_id: null, author_name: "[șters]" })
      .eq("user_id", user.id);

    // Delete profile
    await admin.from("profiles").delete().eq("id", user.id);

    // Delete auth user (cascades)
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Eroare ștergere";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
