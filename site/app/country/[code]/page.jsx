import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticlesByCountry, getCountryCounts } from "../../../lib/content";
import { COUNTRIES, countryName, flagEmoji } from "../../../lib/countries";
import { countryCollectionJsonLd, breadcrumbJsonLd } from "../../../lib/seo";

const VALID_CODES = new Set(COUNTRIES.map((c) => c.code));

// Statically generate only countries that already have coverage; codes
// without articles still resolve (dynamicParams defaults to true) but are
// marked noindex below so empty pages don't get crawled as thin content.
export function generateStaticParams() {
  return [...getCountryCounts().keys()].map((code) => ({ code: code.toLowerCase() }));
}

export function generateMetadata({ params }) {
  const code = params.code.toUpperCase();
  if (!VALID_CODES.has(code)) return {};
  const name = countryName(code);
  const articles = getArticlesByCountry(code);
  const hasStories = articles.length > 0;

  return {
    title: `${name} News`,
    description: hasStories
      ? `${articles.length} ${articles.length === 1 ? "story" : "stories"} from ${name}, updated daily.`
      : `Latest news from ${name}. Check back soon for new stories.`,
    alternates: { canonical: `/country/${code.toLowerCase()}` },
    robots: hasStories ? undefined : { index: false, follow: true },
    openGraph: { title: `${name} News`, type: "website" },
  };
}

function fmt(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function CountryPage({ params }) {
  const code = params.code.toUpperCase();
  if (!VALID_CODES.has(code)) notFound();

  const name = countryName(code);
  const articles = getArticlesByCountry(code);

  const collectionLd = countryCollectionJsonLd(name, code, articles);
  const breadcrumbLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Countries", path: "/countries" },
    { name, path: `/country/${code.toLowerCase()}` },
  ]);

  return (
    <main className="page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <Link href="/countries" className="back">← All countries</Link>

      <header className="page__head">
        <h1>
          <span aria-hidden="true">{flagEmoji(code)}</span> {name}
        </h1>
      </header>

      {articles.length === 0 && (
        <p className="empty">No stories from {name} yet. Check back soon.</p>
      )}

      <section className="grid">
        {articles.map((a) => (
          <Link key={a.slug} href={`/article/${a.slug}`} className="card">
            <div className="card__meta">
              <time>{fmt(a.date)}</time>
            </div>
            <h3 className="card__title">{a.title}</h3>
            {a.summary && <p className="card__sum">{a.summary}</p>}
          </Link>
        ))}
      </section>
    </main>
  );
}
