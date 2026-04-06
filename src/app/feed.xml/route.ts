import { createSupabaseServer } from "@/lib/supabase/server";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // 1 hour

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sector = searchParams.get("sector"); // ?sector=S3
  try {
    const supabase = await createSupabaseServer();
    let query = supabase
      .from("sesizari_feed")
      .select("code, titlu, descriere, locatie, sector, status, tip, created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    if (sector && /^S[1-6]$/.test(sector)) query = query.eq("sector", sector);
    const { data } = await query;

    const rows = (data ?? []) as Array<{
      code: string;
      titlu: string;
      descriere: string;
      locatie: string;
      sector: string;
      status: string;
      tip: string;
      created_at: string;
    }>;

    const now = new Date().toUTCString();

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)} — Sesizări Publice${sector ? ` ${sector}` : ""}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>ro-RO</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${rows.map((r) => `    <item>
      <title>${escapeXml(r.titlu)}</title>
      <link>${SITE_URL}/sesizari/${r.code}</link>
      <guid isPermaLink="true">${SITE_URL}/sesizari/${r.code}</guid>
      <pubDate>${new Date(r.created_at).toUTCString()}</pubDate>
      <category>${escapeXml(r.tip)}</category>
      <description>${escapeXml(`[${r.status.toUpperCase()}] ${r.descriere.slice(0, 300)} — ${r.locatie}, ${r.sector}`)}</description>
    </item>`).join("\n")}
  </channel>
</rss>`;

    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "error";
    return new Response(`<error>${escapeXml(msg)}</error>`, {
      status: 500,
      headers: { "Content-Type": "application/xml" },
    });
  }
}
