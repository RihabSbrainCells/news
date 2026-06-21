import Link from "next/link";
import { getAllArticles, getCountryCounts } from "../lib/content";
import { COUNTRIES, countryName } from "../lib/countries";
import CountryPicker from "../components/CountryPicker";
import TrendingCountries from "../components/TrendingCountries";
import WorldMap from "../components/WorldMap";
import CoverImage from "../components/CoverImage";

// Below this, the hero subhead names the exact coverage count; below it,
// a specific number reads as "barely started" rather than "global", so we
// fall back to a confidence-neutral line instead of advertising the gap.
const COVERAGE_CALLOUT_THRESHOLD = 5;

function fmt(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function Home() {
  const articles = getAllArticles();
  const [lead, ...rest] = articles;

  const counts = getCountryCounts();
  const countries = COUNTRIES.map((c) => ({ ...c, count: counts.get(c.code) || 0 }));
  const coveredCount = counts.size;
  const trending = countries
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  return (
    <main className="home">
      <nav className="topnav">
        <Link href="/" className="topnav__brand">
          <span className="brand-dot" aria-hidden="true" />
          Emberline
        </Link>
        <div className="topnav__links">
          <Link href="/#map" className="topnav__link">🌍 Explore</Link>
          <Link href="/countries" className="topnav__link">📍 Countries</Link>
        </div>
      </nav>

      <header className="hero">
        <p className="hero__eyebrow">🌍 World Pulse</p>
        <h1 className="hero__title">What the world is searching for, today.</h1>
        <p className="hero__sub">
          {coveredCount >= COVERAGE_CALLOUT_THRESHOLD
            ? `Live coverage in ${coveredCount} countries. Search any nation to jump straight to its stories.`
            : "Search any country for what's emerging there. New coverage added daily."}
        </p>
        <CountryPicker countries={countries} compact showChips={false} />
      </header>

      <section className="home__map" id="map" aria-label="World coverage map">
        <p className="section-label">🌎 Global Pulse</p>
        <WorldMap countries={countries} counts={counts} />
      </section>

      {articles.length === 0 && <p className="empty">No stories yet. Check back shortly.</p>}

      {lead && (
        <>
          <p className="section-label">Top Story</p>
          <Link href={`/article/${lead.slug}`} className="lead">
            <CoverImage src={lead.cover} country={lead.country} className="lead__img" />
            <div className="lead__body">
              <div className="card__meta">
                <span className="badge badge--hot">🔥 Trending</span>
                {lead.country && <span className="tag">{countryName(lead.country.toUpperCase())}</span>}
                {lead.tags?.[0] && <span className="topic">{lead.tags[0]}</span>}
                <time>{fmt(lead.date)}</time>
                <span className="readtime">{lead.readingMinutes} min read</span>
              </div>
              <h2 className="lead__title">{lead.title}</h2>
              {lead.summary && <p className="lead__sum">{lead.summary}</p>}
            </div>
          </Link>
        </>
      )}

      {rest.length > 0 && <p className="section-label">More Stories</p>}
      <section className="grid">
        {rest.map((a) => (
          <Link key={a.slug} href={`/article/${a.slug}`} className="card">
            <CoverImage src={a.cover} country={a.country} className="card__img" />
            <div className="card__body">
              <div className="card__meta">
                {a.country && <span className="tag">{countryName(a.country.toUpperCase())}</span>}
                <time>{fmt(a.date)}</time>
                <span className="readtime">{a.readingMinutes} min read</span>
              </div>
              <h3 className="card__title">{a.title}</h3>
              {a.summary && <p className="card__sum">{a.summary}</p>}
            </div>
          </Link>
        ))}
      </section>

      <TrendingCountries countries={trending} />
    </main>
  );
}
