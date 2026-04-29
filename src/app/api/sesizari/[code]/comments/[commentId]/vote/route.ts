import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServer } from "@/lib/supabase/server";
import { rateLimitAsync } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

const voteSchema = z.object({
  value: z.union([z.literal(-1), z.literal(1), z.literal(0)]),
});

/**
 * POST /api/sesizari/{code}/comments/{commentId}/vote
 * Body: { value: -1 | 0 | 1 }
 *   1  = like (upvote)
 *  -1  = dislike (downvote)
 *   0  = remove vote
 *
 * Auth: required.
 * Rate-limit: 30/min per user.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ code: string; commentId: string }> },
) {
  try {
    const { commentId } = await params;
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Auth required" }, { status: 401 });
    }

    const rl = await rateLimitAsync(`comment-vote:${user.id}`, {
      limit: 30,
      windowMs: 60_000,
    });
    if (!rl.success) {
      return NextResponse.json({ error: "Prea multe voturi. Încearcă peste un minut." }, { status: 429 });
    }

    const body = await req.json();
    const { value } = voteSchema.parse(body);

    if (value === 0) {
      // Remove vote
      const { error } = await supabase
        .from("sesizare_comment_votes")
        .delete()
        .eq("comment_id", commentId)
        .eq("user_id", user.id);
      if (error) throw error;
    } else {
      // Upsert (one vote per (comment, user) — unique constraint în DB)
      const { error } = await supabase
        .from("sesizare_comment_votes")
        .upsert(
          { comment_id: commentId, user_id: user.id, value },
          { onConflict: "comment_id,user_id" },
        );
      if (error) throw error;
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
