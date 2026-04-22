/**
 * Runtime env-var accessors. Each call validates the var is present
 * AND non-empty, throwing a clear Romanian error at first use if it
 * isn't. Beats the opaque `undefined is not a string` crashes we'd
 * otherwise get from Supabase / Groq client initializers.
 *
 * Why runtime not boot: Next.js builds on Vercel run in contexts
 * where some vars are scoped (preview vs prod) and others are only
 * set at runtime (edge functions). A module-level `throw` at import
 * time would kill every build. Throwing at first actual use means
 * a 500 at call time instead of a build failure — still loud enough
 * to catch, won't false-positive on build.
 */

function required(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new Error(
      `[env] Variabila de mediu ${name} lipsește sau e goală. ` +
      `Verifică setările în Vercel (Project Settings → Environment Variables) ` +
      `sau în .env.local pentru dezvoltare locală.`
    );
  }
  return value;
}

function optional(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim() !== "" ? value : undefined;
}

export const ENV = {
  // Required — app breaks without these.
  SUPABASE_URL: () => required("NEXT_PUBLIC_SUPABASE_URL"),
  SUPABASE_ANON_KEY: () => required("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  SUPABASE_SERVICE_ROLE_KEY: () => required("SUPABASE_SERVICE_ROLE_KEY"),
  GROQ_API_KEY: () => required("GROQ_API_KEY"),
  SITE_URL: () => required("NEXT_PUBLIC_SITE_URL"),

  // Optional — features degrade gracefully when missing.
  RESEND_API_KEY: () => optional("RESEND_API_KEY"),
  UPSTASH_REDIS_REST_URL: () => optional("UPSTASH_REDIS_REST_URL"),
  UPSTASH_REDIS_REST_TOKEN: () => optional("UPSTASH_REDIS_REST_TOKEN"),
  SENTRY_DSN: () => optional("NEXT_PUBLIC_SENTRY_DSN"),
  PLAUSIBLE_DOMAIN: () => optional("NEXT_PUBLIC_PLAUSIBLE_DOMAIN"),
  CRON_SECRET: () => optional("CRON_SECRET"),
  GOOGLE_OAUTH_ENABLED: () => optional("NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED") === "true",
};

/**
 * Convenience: is the env considered "production" for the purpose of
 * silencing dev-only console logs, enabling Sentry, etc. Checks both
 * NODE_ENV and Vercel's VERCEL_ENV (preview vs production).
 */
export function isProd(): boolean {
  return (
    process.env.NODE_ENV === "production" &&
    process.env.VERCEL_ENV !== "preview"
  );
}
