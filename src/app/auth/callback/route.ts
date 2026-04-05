import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Sanitize the `next` redirect param — prevent open redirects.
 * Only allow same-origin absolute paths (must start with "/" and not "//").
 */
function safeNext(raw: string | null): string {
  if (!raw) return "/";
  // Must start with single "/", not "//" (protocol-relative URL)
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/";
  // Reject javascript:, data: etc embedded via encoding
  if (raw.includes("\\") || raw.toLowerCase().includes("javascript:")) return "/";
  return raw;
}

export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));

  if (code) {
    const supabase = await createSupabaseServer();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/error`);
}
