import { SITE_NAME, SITE_URL, SITE_DESCRIPTION } from "@/lib/constants";

/**
 * Escape </script> sequences inside JSON-LD to prevent XSS breakout.
 * Also escapes < and > as unicode in strings.
 */
function safeJsonLd(obj: unknown): string {
  return JSON.stringify(obj)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

export function OrganizationJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    // Use the dynamic apple-icon route (180x180) as the Organization logo
    logo: `${SITE_URL}/apple-icon`,
    description: SITE_DESCRIPTION,
    address: {
      "@type": "PostalAddress",
      addressCountry: "RO",
    },
    areaServed: {
      "@type": "Country",
      name: "România",
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
    />
  );
}

export function WebsiteJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: "ro-RO",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/sesizari?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
    />
  );
}

export function NewsArticleJsonLd({
  headline,
  description,
  url,
  datePublished,
  author,
  publisher,
  image,
}: {
  headline: string;
  description?: string;
  url: string;
  datePublished: string;
  author?: string;
  publisher?: string;
  image?: string;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: headline.slice(0, 110),
    description: description?.slice(0, 300),
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    datePublished,
    dateModified: datePublished,
    author: author
      ? { "@type": "Person", name: author }
      : { "@type": "Organization", name: publisher || SITE_NAME },
    publisher: {
      "@type": "Organization",
      name: publisher || SITE_NAME,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/apple-icon` },
    },
    ...(image ? { image: [image] } : {}),
    inLanguage: "ro-RO",
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
    />
  );
}
