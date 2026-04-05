// Standalone script to fetch RSS news into Supabase
// Usage: npm run fetch-stiri

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { fetchAllFeeds } from "../src/lib/stiri/rss";

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
  console.log("📰 Fetching RSS feeds...");
  const articles = await fetchAllFeeds();
  console.log(`   → ${articles.length} articole de la ${new Set(articles.map((a) => a.source)).size} surse`);

  if (articles.length === 0) {
    console.log("⚠️  No articles found.");
    return;
  }

  const bySource = articles.reduce((acc, a) => {
    acc[a.source] = (acc[a.source] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  Object.entries(bySource).forEach(([src, count]) => console.log(`   · ${src}: ${count}`));

  console.log("💾 Upsert în Supabase...");
  const { error } = await supabase
    .from("stiri_cache")
    .upsert(articles, { onConflict: "url", ignoreDuplicates: true });

  if (error) {
    console.error("❌ Insert failed:", error.message);
    process.exit(1);
  }

  console.log(`✅ Cache actualizat cu succes.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
