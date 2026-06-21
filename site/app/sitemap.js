import { getAllArticles, getCountryCounts } from "../lib/content";
import { SITE_URL } from "../lib/seo";

// Country pages with zero articles are deliberately excluded — they're
// also marked noindex in app/country/[code]/page.jsx, so keeping them out
// of the sitemap too avoids submitting thin-content URLs to crawlers.
export default function sitemap() {
  const articles = getAllArticles();
  const countryCodes = [...getCountryCounts().keys()];

  return [
    { url: `${SITE_URL}/`, changeFrequency: "hourly", priority: 1 },
    { url: `${SITE_URL}/countries`, changeFrequency: "daily", priority: 0.6 },
    ...articles.map((a) => ({
      url: `${SITE_URL}/article/${a.slug}`,
      lastModified: a.date || undefined,
      changeFrequency: "weekly",
      priority: 0.8,
    })),
    ...countryCodes.map((code) => ({
      url: `${SITE_URL}/country/${code.toLowerCase()}`,
      changeFrequency: "daily",
      priority: 0.5,
    })),
  ];
}
