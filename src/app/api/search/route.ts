import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { ghiduri } from "@/data/ghiduri";
import { evenimente } from "@/data/evenimente";

export const dynamic = "force-dynamic";

interface SearchResult {
  type: "sesizare" | "ghid" | "eveniment" | "stire" | "page";
  title: string;
  url: string;
  excerpt?: string;
  meta?: string;
}

const STATIC_PAGES: SearchResult[] = [
  { type: "page", title: "Hărți", url: "/harti", excerpt: "Piste bicicletă, metrou, parcuri — OSM" },
  { type: "page", title: "Sesizări", url: "/sesizari", excerpt: "Depune sesizări către autorități" },
  { type: "page", title: "Bilete", url: "/bilete", excerpt: "STB, Metrorex, abonamente" },
  { type: "page", title: "Statistici", url: "/statistici", excerpt: "AQI, accidente, scorecard primării" },
  { type: "page", title: "Știri", url: "/stiri", excerpt: "Din surse verificate București" },
  { type: "page", title: "Istoric primari", url: "/istoric", excerpt: "Primarii București din 1990" },
  { type: "page", title: "Cum funcționează PMB", url: "/cum-functioneaza", excerpt: "Structura PMB + CGMB" },
  { type: "page", title: "Evenimente", url: "/evenimente", excerpt: "Evenimente majore istorice" },
  { type: "page", title: "Ghiduri", url: "/ghiduri", excerpt: "Ghiduri pentru cetățeni" },
  { type: "page", title: "Contul tău", url: "/cont", excerpt: "Profil + sesizările tale" },
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim().toLowerCase();
  if (!q || q.length < 2) return NextResponse.json({ data: [] });

  const results: SearchResult[] = [];

  // Static pages
  for (const p of STATIC_PAGES) {
    if (p.title.toLowerCase().includes(q) || p.excerpt?.toLowerCase().includes(q)) {
      results.push(p);
    }
  }

  // Ghiduri
  for (const g of ghiduri) {
    if (
      g.titlu.toLowerCase().includes(q) ||
      g.descriere.toLowerCase().includes(q)
    ) {
      results.push({
        type: "ghid",
        title: g.titlu,
        url: `/ghiduri/${g.slug}`,
        excerpt: g.descriere.slice(0, 120),
      });
    }
  }

  // Evenimente
  for (const e of evenimente) {
    if (
      e.titlu.toLowerCase().includes(q) ||
      e.descriere.toLowerCase().includes(q)
    ) {
      results.push({
        type: "eveniment",
        title: e.titlu,
        url: `/evenimente/${e.slug}`,
        excerpt: e.descriere.slice(0, 120),
        meta: e.data,
      });
    }
  }

  // Sesizari (DB)
  try {
    const supabase = await createSupabaseServer();
    const { data } = await supabase
      .from("sesizari_feed")
      .select("code, titlu, locatie, sector, status, descriere")
      .or(`titlu.ilike.%${q}%,locatie.ilike.%${q}%,descriere.ilike.%${q}%`)
      .limit(10);
    for (const s of (data ?? []) as Array<{ code: string; titlu: string; locatie: string; sector: string; status: string; descriere: string }>) {
      results.push({
        type: "sesizare",
        title: s.titlu,
        url: `/sesizari/${s.code}`,
        excerpt: `${s.locatie} · ${s.sector}`,
        meta: s.status,
      });
    }
  } catch {
    // ignore
  }

  // Stiri (DB)
  try {
    const supabase = await createSupabaseServer();
    const { data } = await supabase
      .from("stiri_cache")
      .select("title, url, excerpt, source")
      .or(`title.ilike.%${q}%,excerpt.ilike.%${q}%`)
      .limit(5);
    for (const s of (data ?? []) as Array<{ title: string; url: string; excerpt: string; source: string }>) {
      results.push({
        type: "stire",
        title: s.title,
        url: s.url,
        excerpt: s.excerpt?.slice(0, 120) ?? "",
        meta: s.source,
      });
    }
  } catch {
    // ignore
  }

  return NextResponse.json({ data: results.slice(0, 30) });
}
