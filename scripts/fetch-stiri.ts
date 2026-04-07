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

async function ensureCountiesColumn() {
  // Try to add counties column if it doesn't exist
  const { error } = await supabase.rpc("exec_sql" as string, {
    query: "ALTER TABLE public.stiri_cache ADD COLUMN IF NOT EXISTS counties text[] DEFAULT '{}'",
  } as Record<string, unknown>);
  if (error) {
    // RPC might not exist — column may already exist, that's fine
    console.log("ℹ️  counties column check: ", error.message.includes("exec_sql") ? "RPC not available (apply migration manually)" : error.message);
  }
}

async function main() {
  await ensureCountiesColumn();

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

  // Show county distribution
  const withCounty = articles.filter((a) => a.counties.length > 0);
  console.log(`   → ${withCounty.length}/${articles.length} articole cu județ detectat`);

  console.log("💾 Upsert în Supabase...");

  // Try with counties field first, fallback without it
  const rows = articles.map((a) => ({
    url: a.url,
    title: a.title,
    excerpt: a.excerpt,
    content: a.content,
    source: a.source,
    category: a.category,
    author: a.author,
    image_url: a.image_url,
    published_at: a.published_at,
    counties: a.counties,
  }));

  const { error } = await supabase
    .from("stiri_cache")
    .upsert(rows, { onConflict: "url", ignoreDuplicates: true });

  if (error) {
    if (error.message.includes("counties")) {
      console.log("⚠️  counties column not yet in DB — upserting without it...");
      const rowsWithout = articles.map((a) => ({
        url: a.url,
        title: a.title,
        excerpt: a.excerpt,
        content: a.content,
        source: a.source,
        category: a.category,
        author: a.author,
        image_url: a.image_url,
        published_at: a.published_at,
      }));
      const { error: e2 } = await supabase
        .from("stiri_cache")
        .upsert(rowsWithout, { onConflict: "url", ignoreDuplicates: true });
      if (e2) {
        console.error("❌ Insert failed:", e2.message);
        process.exit(1);
      }
      console.log("⚠️  Articolele au fost inserate FĂRĂ counties. Aplică migrația 012 în Supabase SQL Editor.");
    } else {
      console.error("❌ Insert failed:", error.message);
      process.exit(1);
    }
  }

  console.log(`✅ Cache actualizat cu succes.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
