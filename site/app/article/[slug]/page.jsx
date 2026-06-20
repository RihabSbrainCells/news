import { notFound } from "next/navigation";
import Link from "next/link";
import { marked } from "marked";
import { getArticle, getAllSlugs } from "../../../lib/content";

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
    openGraph: {
      title: a.title,
      description: a.summary,
      type: "article",
      publishedTime: a.date,
      images: a.cover ? [a.cover] : [],
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

  return (
    <article className="article">
      <Link href="/" className="back">← All stories</Link>

      <header className="article__head">
        <div className="article__meta">
          {a.country && <span className="tag">{a.country}</span>}
          <time>{fmt(a.date)}</time>
        </div>
        <h1>{a.title}</h1>
        {a.summary && <p className="standfirst">{a.summary}</p>}
      </header>

      {a.cover && (
        <figure className="article__cover">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={a.cover} alt="" />
          {a.credit?.source && (
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
      )}

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
