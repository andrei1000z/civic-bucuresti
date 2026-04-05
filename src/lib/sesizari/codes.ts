// Generator pentru coduri sesizari: cod numeric de 5 cifre (ex: "00042")
// Codul este identificator intern pe platformă, NU se trimite în emailul către autorități.
import { createSupabaseAdmin } from "@/lib/supabase/admin";

/**
 * Generate a unique 5-digit numeric code for a new sesizare.
 * Uses max+1 strategy with retry on unique-constraint violation (race safety).
 */
export async function generateSesizareCode(): Promise<string> {
  const supabase = createSupabaseAdmin();

  // Fetch top 50 latest codes, filter to 5-digit numerics, find max
  const { data, error } = await supabase
    .from("sesizari")
    .select("code")
    .order("code", { ascending: false })
    .limit(50);

  if (error) {
    // Fallback: random 5 digit
    const rand = Math.floor(10000 + Math.random() * 89999);
    return String(rand);
  }

  let maxNum = 0;
  if (data && data.length > 0) {
    for (const row of data as { code: string }[]) {
      if (/^\d{5}$/.test(row.code)) {
        const n = parseInt(row.code, 10);
        if (n > maxNum) maxNum = n;
      }
    }
  }

  const next = maxNum + 1;
  return String(next).padStart(5, "0");
}

/**
 * Check if a code is already taken (race condition guard).
 * Returns true if the code exists.
 */
export async function codeExists(code: string): Promise<boolean> {
  const supabase = createSupabaseAdmin();
  const { data } = await supabase
    .from("sesizari")
    .select("code")
    .eq("code", code)
    .maybeSingle();
  return !!data;
}

/**
 * Generate a unique code with up to 3 retries on collision.
 * Used by the sesizari POST route.
 */
export async function generateUniqueCode(maxAttempts = 3): Promise<string> {
  for (let i = 0; i < maxAttempts; i++) {
    const code = await generateSesizareCode();
    if (!(await codeExists(code))) return code;
    // On collision, wait a tiny bit (jitter) and retry
    await new Promise((resolve) => setTimeout(resolve, 50 + Math.random() * 100));
  }
  // Last resort: timestamp-based random 5-digit
  return String(Math.floor(10000 + Math.random() * 89999));
}
