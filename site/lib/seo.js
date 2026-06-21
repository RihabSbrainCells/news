// Single source of truth for the canonical origin. Set NEXT_PUBLIC_SITE_URL
// in Vercel once a domain is attached; falls back to a placeholder so local
// builds still produce valid (if not-yet-correct) absolute URLs.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://emberline.news"
).replace(/\/$/, "");

export const SITE_NAME = "Emberline";

export function absoluteUrl(path = "/") {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function newsArticleJsonLd(article) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.summary,
    datePublished: article.date,
    dateModified: article.date,
    image: article.cover ? [absoluteUrl(article.cover)] : undefined,
    inLanguage: "en",
    author: { "@type": "Organization", name: SITE_NAME },
    publisher: { "@type": "Organization", name: SITE_NAME },
    mainEntityOfPage: { "@type": "WebPage", "@id": absoluteUrl(`/article/${article.slug}`) },
    citation: (article.sources || []).map((s) => s.url),
  };
}

export function breadcrumbJsonLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function countryCollectionJsonLd(countryName, code, articles) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${countryName} News`,
    description: `Latest news stories about ${countryName}.`,
    url: absoluteUrl(`/country/${code.toLowerCase()}`),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: articles.map((a, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: absoluteUrl(`/article/${a.slug}`),
        name: a.title,
      })),
    },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/countries?q={search_term}` },
      "query-input": "required name=search_term",
    },
  };
}
