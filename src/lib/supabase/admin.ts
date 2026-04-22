import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { ENV } from "@/lib/env";

// ⚠️ Server-only. Uses service_role key — bypasses RLS.
// NEVER import this from client components.

let cached: SupabaseClient | null = null;

export function createSupabaseAdmin(): SupabaseClient {
  // Runtime tripwire: if this factory is ever called from a browser
  // context, fail loudly instead of silently crashing inside the SDK
  // when it can't find the service-role env var. Env vars without
  // NEXT_PUBLIC_ prefix are stripped at build — so the key is never
  // actually exposed — but the import itself is a wiring mistake.
  if (typeof window !== "undefined") {
    throw new Error(
      "[supabase/admin] Called from a browser context. " +
      "Admin client holds service_role and MUST stay server-side. " +
      "Use @/lib/supabase/client for client components, or " +
      "@/lib/supabase/server for server components that need a user session.",
    );
  }
  if (cached) return cached;
  // ENV.* throws a specific Romanian error if the var is missing,
  // instead of the prior "undefined" runtime crash deep in the SDK.
  cached = createClient(ENV.SUPABASE_URL(), ENV.SUPABASE_SERVICE_ROLE_KEY(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  return cached;
}
