import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { computeBadges } from "@/lib/badges";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Auth required" }, { status: 401 });

  const admin = createSupabaseAdmin();
  const [sesizari, votes, comments, verifications, resolved] = await Promise.all([
    admin.from("sesizari").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    admin.from("sesizare_votes").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    admin.from("sesizare_comments").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    admin.from("sesizare_verifications").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    admin.from("sesizari").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "rezolvat"),
  ]);

  const badges = computeBadges({
    sesizari: sesizari.count ?? 0,
    votes: votes.count ?? 0,
    comments: comments.count ?? 0,
    verifications: verifications.count ?? 0,
    resolved: resolved.count ?? 0,
  });

  return NextResponse.json({
    data: badges,
  });
}
