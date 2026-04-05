// Generator pentru coduri sesizari: cod numeric de 5 cifre (ex: "00042")
// Codul este identificator intern pe platformă, NU se trimite în emailul către autorități.
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export async function generateSesizareCode(): Promise<string> {
  const supabase = createSupabaseAdmin();

  // Găsim cel mai mare cod numeric existent (inclusiv cele vechi SES-YYYY-NNNN → ignorate)
  // Căutăm doar coduri strict numerice de 5 cifre.
  const { data, error } = await supabase
    .from("sesizari")
    .select("code")
    .order("code", { ascending: false })
    .limit(50); // luăm un set mic, filtrăm local pentru doar coduri numerice

  if (error) {
    // Fallback: random 5 digit
    const rand = Math.floor(10000 + Math.random() * 89999);
    return String(rand);
  }

  let maxNum = 0;
  if (data && data.length > 0) {
    for (const row of data as { code: string }[]) {
      // doar coduri strict numerice (5 cifre)
      if (/^\d{5}$/.test(row.code)) {
        const n = parseInt(row.code, 10);
        if (n > maxNum) maxNum = n;
      }
    }
  }

  const next = maxNum + 1;
  // dacă trecem peste 99999 (improbabil), extindem (nu limităm artificial)
  return String(next).padStart(5, "0");
}
