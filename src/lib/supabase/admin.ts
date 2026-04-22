import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { ENV } from "@/lib/env";

// ⚠️ Server-only. Uses service_role key — bypasses RLS.
// NEVER import this from client components.

let cached: SupabaseClient | null = null;

export function createSupabaseAdmin(): SupabaseClient {
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
