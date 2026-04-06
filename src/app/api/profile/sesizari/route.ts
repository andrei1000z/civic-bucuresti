import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Auth required" }, { status: 401 });

  // Use admin to fetch regardless of publica flag (user sees own sesizari always).
  // Two separate queries instead of .or() to avoid PostgREST filter injection via email.
  const admin = createSupabaseAdmin();
  const [byUserId, byEmail] = await Promise.all([
    admin
      .from("sesizari")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(200),
    user.email
      ? admin
          .from("sesizari")
          .select("*")
          .eq("author_email", user.email)
          .order("created_at", { ascending: false })
          .limit(200)
      : Promise.resolve({ data: [] as Array<{ id: string; created_at: string }>, error: null }),
  ]);
  if (byUserId.error) return NextResponse.json({ error: byUserId.error.message }, { status: 500 });

  // Merge + de-dup by id, then re-sort + limit
  const seen = new Set<string>();
  const merged = [...(byUserId.data ?? []), ...(byEmail.data ?? [])]
    .filter((s) => {
      const id = (s as { id: string }).id;
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    })
    .sort((a, b) =>
      ((b as { created_at: string }).created_at).localeCompare((a as { created_at: string }).created_at)
    )
    .slice(0, 200);

  return NextResponse.json({ data: merged });
}
