import Parser from "rss-parser";

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
}

interface Feed {
  url: string;
  source: string;
  // Keywords to filter Bucharest-related content (empty = all articles)
  mustInclude?: string[];
}

const BUCHAREST_KEYWORDS = [
  "bucurești", "bucuresti", "capitală", "capitala",
  "pmb", "stb", "metrorex", "metrou",
  "sector 1", "sector 2", "sector 3", "sector 4", "sector 5", "sector 6",
  "s1", "s2", "s3", "s4", "s5", "s6",
  "nicușor", "bujduveanu",
  "unirii", "victoriei", "herăstrău", "pipera", "berceni", "rahova", "militari", "titan",
  "cotroceni", "floreasca", "dorobanți", "colentina", "pantelimon", "drumul taberei",
];

const FEEDS: Feed[] = [
  {
    url: "https://www.digi24.ro/rss",
    source: "Digi24",
    mustInclude: BUCHAREST_KEYWORDS,
  },
  {
    url: "https://b365.ro/feed/",
    source: "B365.ro",
    // B365 e deja focused pe București — nu filtrez
  },
  {
    url: "https://www.hotnews.ro/rss",
    source: "Hotnews București",
    mustInclude: BUCHAREST_KEYWORDS,
  },
  {
    url: "https://www.g4media.ro/feed",
    source: "G4Media",
    mustInclude: BUCHAREST_KEYWORDS,
  },
  {
    url: "https://www.europa-libera.org/api/",
    source: "Europa Liberă",
    mustInclude: [...BUCHAREST_KEYWORDS, "primărie", "primaria"],
  },
];

// Simple category classifier from keywords in title + excerpt
function classifyCategory(text: string): string {
  const lower = text.toLowerCase();
  if (/metrou|metrorex|stb|autobuz|tramvai|bilet|abonament|trafic|pasaj|centură/.test(lower)) return "transport";
  if (/urbanism|pug|puz|construcții|construire|imobiliar|cartier|bloc/.test(lower)) return "urbanism";
  if (/aer|poluare|parc|verde|copac|mediu|deșeu|salubri/.test(lower)) return "mediu";
  if (/accident|incendiu|poliție|furt|siguranță|violență|jandarm/.test(lower)) return "siguranta";
  if (/primar|consiliu|buget|primărie|pmb|hotărâre|taxe/.test(lower)) return "administratie";
  if (/festival|concert|protest|manifest|eveniment|paradă/.test(lower)) return "eveniment";
  return "administratie";
}

function cleanText(html: string | undefined): string {
  if (!html) return "";
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function extractImage(item: { content?: string; enclosure?: { url?: string }; [key: string]: unknown }): string | null {
  // Try enclosure first
  if (item.enclosure?.url) return item.enclosure.url;
  // Try media:content
  const mediaContent = item["media:content"] as { $?: { url?: string } } | undefined;
  if (mediaContent?.$?.url) return mediaContent.$.url;
  // Try to extract from content HTML
  const content = (item.content || "") as string;
  const match = content.match(/<img[^>]+src=["']([^"']+)["']/);
  if (match) return match[1];
  return null;
}

export async function fetchFeed(feed: Feed): Promise<RssArticle[]> {
  const parser = new Parser({
    timeout: 15000,
    customFields: {
      item: [
        ["media:content", "media:content"],
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
      const searchText = `${title} ${excerpt}`.toLowerCase();

      // Filter by keywords if specified
      if (feed.mustInclude && feed.mustInclude.length > 0) {
        const hasKeyword = feed.mustInclude.some((kw) => searchText.includes(kw));
        if (!hasKeyword) continue;
      }

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
      });
    }
    return articles;
  } catch (e) {
    console.error(`Failed to fetch ${feed.source}:`, (e as Error).message);
    return [];
  }
}

export async function fetchAllFeeds(): Promise<RssArticle[]> {
  const results = await Promise.all(FEEDS.map((f) => fetchFeed(f)));
  return results.flat();
}
