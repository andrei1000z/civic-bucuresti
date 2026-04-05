// Apply all SQL migrations to Supabase — runs files in lexicographic order
// Usage: npm run migrate

import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";
import { config } from "dotenv";

config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

// Extract project ref from URL: https://xxx.supabase.co
const projectRef = new URL(SUPABASE_URL).hostname.split(".")[0];
const apiUrl = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;

async function runSql(sql: string, label: string): Promise<void> {
  console.log(`\n▶ ${label}`);
  // Supabase Management API doesn't accept service_role key — needs Personal Access Token.
  // Fallback: use PostgREST via pg-http endpoint (not reliable for DDL).
  // Safest bet: use the SQL REST endpoint via service_role with rpc exec_sql if exists,
  // OR instruct user to paste into SQL Editor.

  // Attempt via fetch to a helper RPC if present, else fallback instructions
  const url = `${SUPABASE_URL}/rest/v1/rpc/exec_sql`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SERVICE_KEY!,
        Authorization: `Bearer ${SERVICE_KEY}`,
      },
      body: JSON.stringify({ sql }),
    });
    if (res.ok) {
      console.log(`  ✓ OK`);
      return;
    }
    if (res.status === 404) {
      throw new Error("exec_sql RPC missing");
    }
    const err = await res.text();
    throw new Error(`${res.status}: ${err.slice(0, 200)}`);
  } catch (e) {
    throw new Error(`${label} failed: ${e instanceof Error ? e.message : e}`);
  }
}

async function main() {
  const migrationsDir = join(process.cwd(), "supabase", "migrations");
  const schemaFile = join(process.cwd(), "supabase", "schema.sql");

  const files: { path: string; name: string }[] = [];
  if (existsSync(schemaFile)) files.push({ path: schemaFile, name: "schema.sql" });
  if (existsSync(migrationsDir)) {
    for (const f of readdirSync(migrationsDir).sort()) {
      if (f.endsWith(".sql")) files.push({ path: join(migrationsDir, f), name: `migrations/${f}` });
    }
  }

  if (files.length === 0) {
    console.error("❌ No SQL files found");
    process.exit(1);
  }

  console.log(`🗄️  Found ${files.length} SQL files:`);
  for (const f of files) console.log(`   · ${f.name}`);

  // Check if exec_sql helper RPC exists; if not, print instructions
  try {
    const check = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: SERVICE_KEY!, Authorization: `Bearer ${SERVICE_KEY}` },
      body: JSON.stringify({ sql: "select 1" }),
    });
    if (check.status === 404) {
      throw new Error("helper missing");
    }
  } catch {
    console.log("\n⚠️  `exec_sql` RPC nu există în Supabase.");
    console.log("    Pentru ca `npm run migrate` să meargă automat, rulează o dată în SQL Editor:");
    console.log("    ────────────────────────────────────────────────────────────");
    console.log(`    create or replace function public.exec_sql(sql text)`);
    console.log(`    returns json language plpgsql security definer as $$`);
    console.log(`    begin execute sql; return '{"ok":true}'::json; end; $$;`);
    console.log("    ────────────────────────────────────────────────────────────");
    console.log("\n    ALTERNATIV: copiază fișierele manual în SQL Editor:");
    for (const f of files) console.log(`       • ${f.name}`);
    process.exit(1);
  }

  let applied = 0;
  for (const f of files) {
    const sql = readFileSync(f.path, "utf-8");
    try {
      await runSql(sql, f.name);
      applied++;
    } catch (e) {
      console.error(`  ✗ ${e instanceof Error ? e.message : e}`);
    }
  }

  console.log(`\n✅ ${applied}/${files.length} migrations aplicate.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
