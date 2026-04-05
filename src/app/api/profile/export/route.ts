import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

// GDPR: Right to data portability — JSON export of all user data
export async function GET() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Auth required" }, { status: 401 });

  const admin = createSupabaseAdmin();

  const [profile, sesizari, votes, comments] = await Promise.all([
    admin.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    admin.from("sesizari").select("*").or(`user_id.eq.${user.id},author_email.eq.${user.email}`),
    admin.from("sesizare_votes").select("*").eq("user_id", user.id),
    admin.from("sesizare_comments").select("*").eq("user_id", user.id),
  ]);

  const exportData = {
    export_date: new Date().toISOString(),
    user: {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
    },
    profile: profile.data,
    sesizari: sesizari.data ?? [],
    votes: votes.data ?? [],
    comments: comments.data ?? [],
  };

  const filename = `civia-export-${user.email?.split("@")[0]}-${new Date().toISOString().slice(0, 10)}.json`;
  return new Response(JSON.stringify(exportData, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
