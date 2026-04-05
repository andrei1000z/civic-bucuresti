// Remove fake/mock sesizari from DB (entries with codes like SES-2025-0xxx)
// Usage: npm run clean-mock

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("❌ Missing env vars.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log("🧹 Ștergere sesizări mock (SES-2025-*)...");

  const { data, error } = await supabase
    .from("sesizari")
    .delete()
    .like("code", "SES-2025-%")
    .select("code");

  if (error) {
    console.error("❌ Eroare:", error.message);
    process.exit(1);
  }

  console.log(`✅ Șters ${data?.length ?? 0} sesizări mock.`);
  console.log("   Acum platforma conține doar sesizări reale de la cetățeni.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
