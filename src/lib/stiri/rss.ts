import Parser from "rss-parser";
import { detectCounties } from "./county-keywords";

export interface RssArticle {
  url: string;
  title: string;
  excerpt: string;
  content: string;
  source: string;
  category: string;
  author: string | null;
  image_url: string | null;
  published_at: string;
  counties: string[]; // county IDs matched from content
}

interface Feed {
  url: string;
  source: string;
}

/**
 * National RSS feeds — no keyword filtering at fetch time.
 * County tagging happens via detectCounties() on the full text.
 */
const FEEDS: Feed[] = [
  // National
  { url: "https://www.digi24.ro/rss", source: "Digi24" },
  { url: "https://www.hotnews.ro/rss", source: "Hotnews" },
  { url: "https://www.g4media.ro/feed", source: "G4Media" },
  { url: "https://www.mediafax.ro/rss", source: "Mediafax" },
  { url: "https://www.news.ro/rss", source: "News.ro" },
  // Local / regional — more county coverage
  { url: "https://b365.ro/feed/", source: "B365.ro" },
  { url: "https://www.monitorulcj.ro/rss", source: "Monitorul CJ" },
  { url: "https://www.ziaruldeiasi.ro/rss", source: "Ziarul de Iași" },
  { url: "https://www.opiniatimisoarei.ro/feed", source: "Opinia Timișoarei" },
  { url: "https://www.stiridecluj.ro/rss.xml", source: "Știri de Cluj" },
  { url: "https://www.editiadedimineata.ro/feed", source: "Ediția de Dimineață" },
  { url: "https://www.stiridinromania.ro/feed", source: "Știri din România" },
];

// Simple category classifier from keywords in title + excerpt
export function classifyCategory(text: string): string {
  const lower = text.toLowerCase();
  if (/metrou|metrorex|stb|autobuz|tramvai|bilet|abonament|trafic|pasaj|centură|transport public/.test(lower)) return "transport";
  if (/urbanism|pug|puz|construcții|construire|imobiliar|cartier|bloc/.test(lower)) return "urbanism";
  // word-boundary on "parc" / "parcuri" / "parcurile" so "parcare" / "parcaj" don't false-match.
  if (/aer|poluare|\bparc(uri|ul|urile)?\b|verde|copac|mediu|deșeu|salubri|climă/.test(lower)) return "mediu";
  if (/accident|incendiu|poliție|furt|siguranță|violență|jandarm/.test(lower)) return "siguranta";
  if (/primar|consiliu|buget|primărie|pmb|hotărâre|taxe|alegeri|guvern|ministru/.test(lower)) return "administratie";
  if (/festival|concert|protest|manifest|eveniment|paradă/.test(lower)) return "eveniment";
  return "administratie";
}

export function cleanText(html: string | undefined): string {
  if (!html) return "";
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .trim();
}

function extractImage(item: { content?: string; enclosure?: { url?: string }; [key: string]: unknown }): string | null {
  // Try enclosure
  if (item.enclosure?.url) return item.enclosure.url;
  // Try media:content
  const mediaContent = item["media:content"] as { $?: { url?: string } } | undefined;
  if (mediaContent?.$?.url) return mediaContent.$.url;
  // Try media:thumbnail
  const mediaThumbnail = item["media:thumbnail"] as { $?: { url?: string } } | undefined;
  if (mediaThumbnail?.$?.url) return mediaThumbnail.$.url;
  // Try itunes:image
  const itunesImage = item["itunes:image"] as { $?: { href?: string } } | undefined;
  if (itunesImage?.$?.href) return itunesImage.$.href;
  // Try to extract from content HTML
  const content = (item.content || "") as string;
  const match = content.match(/<img[^>]+src=["']([^"']+)["']/);
  if (match && match[1]) return match[1];
  // Try og:image from description HTML
  const desc = (item["content:encoded"] || item.content || "") as string;
  const ogMatch = desc.match(/og:image[^>]+content=["']([^"']+)["']/);
  if (ogMatch && ogMatch[1]) return ogMatch[1];
  return null;
}

export async function fetchFeed(feed: Feed): Promise<RssArticle[]> {
  const parser = new Parser({
    timeout: 15000,
    customFields: {
      item: [
        ["media:content", "media:content"],
        ["media:thumbnail", "media:thumbnail"],
        ["content:encoded", "contentEncoded"],
      ],
    },
  });

  try {
    const result = await parser.parseURL(feed.url);
    const articles: RssArticle[] = [];

    for (const item of result.items ?? []) {
      if (!item.link || !item.title) continue;

      const title = item.title;
      const content = cleanText(item["contentEncoded"] as string) || cleanText(item.content) || "";
      const excerpt = cleanText(item.contentSnippet) || content.slice(0, 240);
      const searchText = `${title} ${excerpt}`;

      // Detect counties from article text
      const counties = detectCounties(searchText);

      const itemAny = item as unknown as Record<string, unknown>;
      articles.push({
        url: item.link,
        title,
        excerpt: excerpt.slice(0, 500),
        content: content.slice(0, 2000),
        source: feed.source,
        category: classifyCategory(searchText),
        author: (itemAny.creator as string) || (itemAny.author as string) || null,
        image_url: extractImage(itemAny as { content?: string; enclosure?: { url?: string }; [key: string]: unknown }),
        published_at: item.isoDate || item.pubDate || new Date().toISOString(),
        counties,
      });
    }
    return articles;
  } catch (e) {
    console.error(`Failed to fetch ${feed.source}:`, (e as Error).message);
    return [];
  }
}

/**
 * Fetch og:image from an article URL. Fast timeout, best-effort.
 */
async function fetchOgImage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Civia/1.0 (civia.ro)" },
      redirect: "follow",
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    // Extract og:image
    const match = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

export interface FetchAllResult {
  articles: RssArticle[];
  perFeed: Array<{ source: string; count: number; ok: boolean }>;
}

/**
 * Fetch all feeds, returning articles + per-source diagnostic.
 * Use the diagnostic to detect dead feeds in production logs.
 */
export async function fetchAllFeedsWithDiag(): Promise<FetchAllResult> {
  const results = await Promise.allSettled(FEEDS.map((f) => fetchFeed(f)));
  const articles: RssArticle[] = [];
  const perFeed: FetchAllResult["perFeed"] = [];

  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    const f = FEEDS[i];
    if (!f) continue;
    if (r?.status === "fulfilled") {
      articles.push(...r.value);
      perFeed.push({ source: f.source, count: r.value.length, ok: true });
      if (r.value.length === 0) {
        console.warn(`[stiri] ${f.source} returned 0 articles`);
      }
    } else {
      perFeed.push({ source: f.source, count: 0, ok: false });
      console.error(`[stiri] ${f.source} REJECTED:`, (r?.reason as Error)?.message);
    }
  }

  // Scrape OG images for articles that don't have one (batch, max 20 at a time)
  const noImage = articles.filter((a) => !a.image_url);
  const batch = noImage.slice(0, 30); // limit to avoid timeout
  if (batch.length > 0) {
    const images = await Promise.all(batch.map((a) => fetchOgImage(a.url)));
    batch.forEach((a, i) => {
      if (images[i]) a.image_url = images[i];
    });
  }

  return { articles, perFeed };
}

/** Backwards-compat: old call site only wanted the articles. */
export async function fetchAllFeeds(): Promise<RssArticle[]> {
  const { articles } = await fetchAllFeedsWithDiag();
  return articles;
}
