import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * Admin queue: list status tickets joined with the parent sesizare and
 * the proposer's display name. Default filter is `pending` so the queue
 * leads with the work that's left.
 *
 * Query: ?decision=pending|approved|rejected|all (default pending),
 *        ?limit=N (default 50, max 200)
 *
 * Two FKs to `profiles` (user_id, decided_by) make PostgREST auto-join
 * fragile, so we fan out manually with the service-role client and
 * stitch the result in JS.
 */
export async function GET(req: Request) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Auth required" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if ((profile as { role?: string } | null)?.role !== "admin") {
    return NextResponse.json({ error: "Admin required" }, { status: 403 });
  }

  const url = new URL(req.url);
  const decisionParam = url.searchParams.get("decision") ?? "pending";
  const decision = ["pending", "approved", "rejected"].includes(decisionParam)
    ? decisionParam
    : decisionParam === "all"
    ? null
    : "pending";
  const limit = Math.max(1, Math.min(200, Number(url.searchParams.get("limit") ?? 50)));

  const admin = createSupabaseAdmin();
  let query = admin
    .from("sesizare_status_tickets")
    .select("id, sesizare_id, proposed_status, note, proof_url, decision, decision_note, decided_at, created_at, user_id, decided_by")
    .order("created_at", { ascending: decision === "pending" })
    .limit(limit);

  if (decision) query = query.eq("decision", decision);

  const { data: tickets, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const list = tickets ?? [];

  if (list.length === 0) return NextResponse.json({ data: [] });

  // Stitch sesizari + proposer names. One fetch per join keeps the
  // payload small and avoids PostgREST FK-disambiguation foot-guns.
  const sesizareIds = Array.from(new Set(list.map((t) => t.sesizare_id)));
  const userIds = Array.from(
    new Set(
      list.flatMap((t) => [t.user_id, t.decided_by].filter((v): v is string => !!v)),
    ),
  );

  const [{ data: sesizari }, { data: profiles }] = await Promise.all([
    admin
      .from("sesizari")
      .select("id, code, titlu, status, locatie, tip")
      .in("id", sesizareIds),
    userIds.length > 0
      ? admin
          .from("profiles")
          .select("id, display_name, full_name")
          .in("id", userIds)
      : Promise.resolve({ data: [] as Array<{ id: string; display_name: string; full_name: string | null }> }),
  ]);

  const sesizareById = new Map((sesizari ?? []).map((s) => [s.id, s]));
  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

  const enriched = list.map((t) => ({
    ...t,
    sesizare: sesizareById.get(t.sesizare_id) ?? null,
    proposer: profileById.get(t.user_id) ?? null,
    decided_by_profile: t.decided_by ? profileById.get(t.decided_by) ?? null : null,
  }));

  return NextResponse.json({ data: enriched });
}
