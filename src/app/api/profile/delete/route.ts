import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { rateLimitAsync } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

// GDPR: Right to be forgotten — delete user + anonymize sesizari
export async function DELETE() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Auth required" }, { status: 401 });

  // This is irreversible — an attacker who steals a session shouldn't
  // be able to spam the endpoint; a legit user can only trigger it
  // through a confirm dialog anyway, so 3/hour is generous.
  const rl = await rateLimitAsync(`profile-delete:${user.id}`, { limit: 3, windowMs: 60 * 60_000 });
  if (!rl.success) {
    return NextResponse.json(
      { error: "Prea multe încercări de ștergere. Încearcă mai târziu." },
      { status: 429 }
    );
  }

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
