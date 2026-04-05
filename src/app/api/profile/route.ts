import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServer } from "@/lib/supabase/server";
import { sanitizeText } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

// Convert "" → null (Zod schema doesn't accept empty strings with min)
const emptyToNull = (v: unknown) => (v === "" ? null : v);

const updateSchema = z.object({
  display_name: z.preprocess(emptyToNull, z.string().min(2).max(80).nullable().optional()),
  full_name: z.preprocess(emptyToNull, z.string().min(2).max(120).nullable().optional()),
  address: z.preprocess(emptyToNull, z.string().min(3).max(300).nullable().optional()),
  phone: z.preprocess(emptyToNull, z.string().max(30).nullable().optional()),
});

export async function GET() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Auth required" }, { status: 401 });

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: { ...(data ?? {}), email: user.email } });
}

export async function PUT(req: Request) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Auth required" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = updateSchema.parse(body);

    // Build update object — null means "clear field", undefined means "don't change"
    const updates: Record<string, string | null> = {};
    if (parsed.display_name !== undefined) {
      updates.display_name = parsed.display_name ? sanitizeText(parsed.display_name, 80) : null;
    }
    if (parsed.full_name !== undefined) {
      updates.full_name = parsed.full_name ? sanitizeText(parsed.full_name, 120) : null;
    }
    if (parsed.address !== undefined) {
      updates.address = parsed.address ? sanitizeText(parsed.address, 300) : null;
    }
    if (parsed.phone !== undefined) {
      updates.phone = parsed.phone ? sanitizeText(parsed.phone, 30) : null;
    }

    // Ensure profile row exists (might not if trigger didn't fire)
    await supabase
      .from("profiles")
      .upsert(
        { id: user.id, display_name: updates.display_name || user.email?.split("@")[0] || "Cetățean" },
        { onConflict: "id" }
      );

    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id)
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  } catch (e) {
    if (e instanceof z.ZodError) {
      const firstIssue = e.issues[0];
      const msg = firstIssue?.message ?? "Date invalide";
      const field = firstIssue?.path.join(".");
      return NextResponse.json(
        { error: `${msg}${field ? ` (${field})` : ""}`, details: e.issues },
        { status: 400 }
      );
    }
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
