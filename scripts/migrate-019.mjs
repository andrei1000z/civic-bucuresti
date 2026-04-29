// Ad-hoc: aplică doar migrarea 019_comment_replies_votes.sql pe Supabase prod.
// Folosește RPC-ul exec_sql (security definer) cu service_role key.
// Usage: node scripts/migrate-019.mjs

import { readFileSync } from "fs";
import { join } from "path";
import { config } from "dotenv";

config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("❌ Missing Supabase env vars");
  process.exit(1);
}

const migrationFile = join(process.cwd(), "supabase", "migrations", "019_comment_replies_votes.sql");
const sql = readFileSync(migrationFile, "utf-8");

console.log("📤 Trimit migrarea 019 către Supabase...");
console.log(`   Length: ${sql.length} chars`);

const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
  },
  body: JSON.stringify({ sql }),
});

if (!res.ok) {
  const err = await res.text();
  console.error(`❌ ${res.status}: ${err}`);
  process.exit(1);
}

const json = await res.json();
console.log("✅ Migrarea aplicată:", JSON.stringify(json));

// Verificare: coloana parent_comment_id există?
const checkRes = await fetch(
  `${SUPABASE_URL}/rest/v1/sesizare_comments?select=id,parent_comment_id&limit=1`,
  {
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
    },
  },
);
console.log(`\n🔍 Verificare schema sesizare_comments.parent_comment_id: ${checkRes.status === 200 ? "✅ OK" : "❌ " + checkRes.status}`);

// Verificare: tabela sesizare_comment_votes există?
const checkVotes = await fetch(
  `${SUPABASE_URL}/rest/v1/sesizare_comment_votes?select=id&limit=1`,
  {
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
    },
  },
);
console.log(`🔍 Verificare tabela sesizare_comment_votes: ${checkVotes.status === 200 ? "✅ OK" : "❌ " + checkVotes.status}`);
