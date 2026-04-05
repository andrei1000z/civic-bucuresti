// Generator pentru coduri sesizari: SES-YYYY-NNNN
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export async function generateSesizareCode(): Promise<string> {
  const year = new Date().getFullYear();
  const supabase = createSupabaseAdmin();

  // Find the highest code from this year
  const { data, error } = await supabase
    .from("sesizari")
    .select("code")
    .like("code", `SES-${year}-%`)
    .order("code", { ascending: false })
    .limit(1);

  if (error) {
    const rand = Math.floor(1000 + Math.random() * 8999);
    return `SES-${year}-${rand}`;
  }

  let nextNum = 1;
  if (data && data.length > 0) {
    const lastCode = (data[0] as { code: string }).code;
    const match = lastCode.match(/SES-\d{4}-(\d+)/);
    if (match) {
      nextNum = parseInt(match[1], 10) + 1;
    }
  }

  return `SES-${year}-${String(nextNum).padStart(4, "0")}`;
}
