import { notFound } from "next/navigation";
import Link from "next/link";
import { marked } from "marked";
import { getArticle, getAllSlugs } from "../../../lib/content";
import { countryName, flagEmoji } from "../../../lib/countries";
import { newsArticleJsonLd, breadcrumbJsonLd } from "../../../lib/seo";
import CoverImage from "../../../components/CoverImage";

// fully static — no DB, no ISR needed; rebuild happens on git push
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }) {
  const a = getArticle(params.slug);
  if (!a) return {};
  return {
    title: a.title,
    description: a.summary,
    alternates: { canonical: `/article/${a.slug}` },
    openGraph: {
      title: a.title,
      description: a.summary,
      type: "article",
      publishedTime: a.date,
      images: a.cover ? [a.cover] : [],
    },
    twitter: {
      card: a.cover ? "summary_large_image" : "summary",
      title: a.title,
      description: a.summary,
    },
  };
}

function fmt(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default function ArticlePage({ params }) {
  const a = getArticle(params.slug);
  if (!a) notFound();
  const html = marked.parse(a.body);

  const breadcrumbItems = [{ name: "Home", path: "/" }];
  if (a.country) {
    breadcrumbItems.push({
      name: countryName(a.country.toUpperCase()),
      path: `/country/${a.country.toLowerCase()}`,
    });
  }
  breadcrumbItems.push({ name: a.title, path: `/article/${a.slug}` });

  const articleLd = newsArticleJsonLd(a);
  const breadcrumbLd = breadcrumbJsonLd(breadcrumbItems);

  return (
    <article className="article">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <Link href="/" className="back">← All stories</Link>

      <header className="article__head">
        <div className="article__meta">
          {a.country && (
            <Link href={`/country/${a.country.toLowerCase()}`} className="tag">
              {flagEmoji(a.country.toUpperCase())} {countryName(a.country.toUpperCase())}
            </Link>
          )}
          <time>{fmt(a.date)}</time>
          <span className="readtime">{a.readingMinutes} min read</span>
        </div>
        <h1>{a.title}</h1>
        {a.summary && <p className="standfirst">{a.summary}</p>}
      </header>

      <figure className="article__cover">
        <CoverImage src={a.cover} country={a.country} alt="" />
        {a.cover && a.credit?.source && (
          <figcaption>
            {a.credit.author ? (
              <>
                Photo:{" "}
                {a.credit.author_url ? (
                  <a href={a.credit.author_url} target="_blank" rel="noopener noreferrer nofollow">
                    {a.credit.author}
                  </a>
                ) : (
                  a.credit.author
                )}{" "}
                / {a.credit.source}
              </>
            ) : (
              a.credit.source
            )}
          </figcaption>
        )}
      </figure>

      <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />

      {a.sources?.length > 0 && (
        <footer className="sources">
          <h2>Sources</h2>
          <ul>
            {a.sources.map((s, i) => (
              <li key={i}>
                <a href={s.url} target="_blank" rel="noopener noreferrer nofollow">
                  {s.title || s.url}
                </a>
              </li>
            ))}
          </ul>
          <p className="disclosure">
            This article was synthesized from the sources above with AI
            assistance and reviewed before publication.
          </p>
        </footer>
      )}
    </article>
  );
}
