// Seed script: populate Supabase with mock sesizari
// Usage: npx tsx scripts/seed-supabase.ts

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { sesizari } from "../src/data/sesizari";

config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("❌ Missing env vars. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log(`🌱 Seeding ${sesizari.length} sesizări...`);

  // Clear existing mock data (only entries with SES-2025-* codes)
  const { error: delError } = await supabase
    .from("sesizari")
    .delete()
    .like("code", "SES-2025-%");
  if (delError) {
    console.warn("⚠️  Could not clean old seed data:", delError.message);
  }

  // Insert mock sesizari
  const rows = sesizari.map((s) => ({
    code: s.id,
    user_id: null,
    author_name: s.autor,
    author_email: null,
    tip: s.tip,
    titlu: s.titlu,
    locatie: s.locatie,
    sector: s.sector,
    lat: s.coords[0],
    lng: s.coords[1],
    descriere: s.descriere,
    formal_text: null,
    status: s.status,
    imagini: s.imagini,
    publica: s.publica,
    moderation_status: "approved" as const,
    created_at: new Date(s.data).toISOString(),
  }));

  const { data, error } = await supabase.from("sesizari").insert(rows).select();

  if (error) {
    console.error("❌ Insert failed:", error.message);
    process.exit(1);
  }

  console.log(`✅ Inserted ${data.length} sesizări.`);

  // Add some timeline events for realism
  const inLucruSesizari = data.filter((s) => s.status === "in-lucru" || s.status === "rezolvat");
  console.log(`📍 Adding timeline events for ${inLucruSesizari.length} sesizări...`);

  for (const ses of inLucruSesizari) {
    const events: Array<{ sesizare_id: string; event_type: string; description: string }> = [
      { sesizare_id: ses.id, event_type: "inregistrata", description: "Sesizare înregistrată la registratură (cod oficial generat)" },
      { sesizare_id: ses.id, event_type: "rutata", description: "Trimisă la direcția de specialitate" },
    ];
    if (ses.status === "rezolvat") {
      events.push(
        { sesizare_id: ses.id, event_type: "in_teren", description: "Verificare pe teren efectuată" },
        { sesizare_id: ses.id, event_type: "rezolvat", description: "Problemă rezolvată de echipa responsabilă" }
      );
    } else {
      events.push({ sesizare_id: ses.id, event_type: "in_teren", description: "Inspector pe teren" });
    }
    await supabase.from("sesizare_timeline").insert(events);
  }

  console.log("✅ Seed complet!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
