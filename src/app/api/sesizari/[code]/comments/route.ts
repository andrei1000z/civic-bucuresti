import { NextResponse } from "next/server";
import { z } from "zod";
import { addComment, getComments, getSesizareByCode } from "@/lib/sesizari/repository";
import { createSupabaseServer } from "@/lib/supabase/server";
import { rateLimitAsync } from "@/lib/ratelimit";
import { sanitizeText } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

const commentSchema = z.object({
  body: z.string().min(1).max(2000),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const sesizare = await getSesizareByCode(code);
    if (!sesizare) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const comments = await getComments(sesizare.id);
    return NextResponse.json({ data: comments });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

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
    const parsed = commentSchema.parse(body);

    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .maybeSingle();
    const displayName = (profile as { display_name: string } | null)?.display_name;

    const rl = await rateLimitAsync(`comment:${user.id}`, { limit: 10, windowMs: 60_000 });
    if (!rl.success) {
      return NextResponse.json({ error: "Prea multe comentarii" }, { status: 429 });
    }

    const row = await addComment({
      sesizareId: sesizare.id,
      userId: user.id,
      authorName: displayName ?? user.email?.split("@")[0] ?? "Cetățean",
      body: sanitizeText(parsed.body, 2000),
    });
    return NextResponse.json({ data: row });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error" }, { status: 400 });
    }
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
