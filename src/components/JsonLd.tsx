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

/**
 * HowTo schema for /ghiduri/* — civic guide pages that walk users
 * through a concrete procedure (contest an amendă, register an NGO,
 * claim Legea 544/2001 data). Google uses this to power Featured
 * Snippets + the rich "step-by-step" cards on guide queries.
 */
export function HowToJsonLd({
  name,
  description,
  url,
  steps,
  totalTime,
  estimatedCost,
}: {
  name: string;
  description: string;
  url: string;
  steps: Array<{ name: string; text: string; url?: string }>;
  /** ISO 8601 duration, e.g. "PT30M" for 30 min, "PT2H" for 2h. */
  totalTime?: string;
  /** Plain-text cost, e.g. "0 lei" or "100 lei". */
  estimatedCost?: string;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    description: description.slice(0, 280),
    inLanguage: "ro-RO",
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/apple-icon` },
    },
    ...(totalTime ? { totalTime } : {}),
    ...(estimatedCost
      ? { estimatedCost: { "@type": "MonetaryAmount", currency: "RON", value: estimatedCost } }
      : {}),
    step: steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
      ...(s.url ? { url: s.url } : {}),
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
    />
  );
}

/**
 * GovernmentService schema — one per active sesizare. Tells search
 * engines this is a civic complaint with a formal recipient authority
 * and a specific problem type; eligible for structured sitelinks on
 * "sesizare {tip}" queries.
 */
export function GovernmentServiceJsonLd({
  code,
  titlu,
  tip,
  locatie,
  descriere,
  url,
  providerName,
  createdAt,
  status,
}: {
  code: string;
  titlu: string;
  tip: string;
  locatie: string;
  descriere?: string;
  url: string;
  providerName: string;
  createdAt: string;
  status: string;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "GovernmentService",
    name: titlu.slice(0, 110),
    serviceType: `Sesizare civică — ${tip}`,
    description: (descriere || titlu).slice(0, 280),
    areaServed: { "@type": "AdministrativeArea", name: locatie },
    provider: { "@type": "GovernmentOrganization", name: providerName },
    url,
    identifier: code,
    inLanguage: "ro-RO",
    dateCreated: createdAt,
    additionalProperty: {
      "@type": "PropertyValue",
      name: "status",
      value: status,
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
    />
  );
}

/**
 * Event schema for /evenimente/[slug] — historical civic events
 * (Colectiv, Rahova explosion, elections) surface in Google's "historical
 * event" panel and rich search results.
 */
export function HistoricalEventJsonLd({
  name,
  description,
  startDate,
  endDate,
  url,
  location,
  image,
}: {
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  url: string;
  location?: string;
  image?: string;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Event",
    name,
    description: description.slice(0, 300),
    startDate,
    ...(endDate ? { endDate } : {}),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    inLanguage: "ro-RO",
    organizer: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    ...(location
      ? { location: { "@type": "Place", name: location, address: { "@type": "PostalAddress", addressCountry: "RO" } } }
      : {}),
    ...(image ? { image: [image] } : {}),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
    />
  );
}
