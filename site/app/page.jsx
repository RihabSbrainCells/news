import Link from "next/link";
import { getAllArticles, getCountryCounts } from "../lib/content";
import { COUNTRIES, countryName } from "../lib/countries";
import CountryPicker from "../components/CountryPicker";
import TrendingCountries from "../components/TrendingCountries";
import WorldMap from "../components/WorldMap";
import CoverImage from "../components/CoverImage";
import { IconGlobe, IconMenu, IconArrowRight, IconTrendingUp, IconDot } from "../components/Icons";

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
          <Link href="/countries" className="topnav__link">
            <IconGlobe className="topnav__icon" /> Countries
          </Link>
          <details className="navmenu">
            <summary className="navmenu__summary" aria-label="Menu">
              <IconMenu className="navmenu__icon" />
            </summary>
            <div className="navmenu__body">
              <Link href="/" className="navmenu__link">Home</Link>
              <Link href="/countries" className="navmenu__link">Countries</Link>
            </div>
          </details>
        </div>
      </nav>

      <header className="hero">
        <p className="hero__eyebrow"><IconGlobe className="hero__eyebrow-icon" /> World Pulse</p>
        <h1 className="hero__title">Track what every country is talking about, today.</h1>
        <p className="hero__sub">
          {coveredCount >= COVERAGE_CALLOUT_THRESHOLD
            ? `Live coverage in ${coveredCount} countries — explore the biggest stories from each.`
            : "Search any country for the stories shaping it right now."}
        </p>
        <CountryPicker countries={countries} compact showChips={false} />
      </header>

      <section className="trending" aria-label="Trending countries and world map">
        <p className="section-label"><IconTrendingUp className="section-label__icon" /> Trending Countries</p>
        <div className="trending__row">
          <TrendingCountries countries={trending} />
          <details className="maptoggle">
            <summary className="maptoggle__summary">
              <IconGlobe className="maptoggle__icon" />
              <span>View world map</span>
              <IconArrowRight className="maptoggle__arrow" />
            </summary>
            <div className="maptoggle__body">
              <p className="section-label"><IconGlobe className="section-label__icon" /> Global Pulse</p>
              <WorldMap countries={countries} counts={counts} />
            </div>
          </details>
        </div>
      </section>

      {articles.length === 0 && <p className="empty">No stories yet. Check back shortly.</p>}

      {lead && (
        <section className="home__lead" aria-label="Top story">
          <p className="section-label">Top Story</p>
          <Link href={`/article/${lead.slug}`} className="lead">
            <div className="lead__media">
              <CoverImage src={lead.cover} country={lead.country} className="lead__img" />
              <div className="lead__overlays">
                <span className="badge badge--hot"><IconDot className="badge__icon" /> Trending</span>
                <span className="badge badge--time">{lead.readingMinutes} min read</span>
              </div>
            </div>
            <div className="lead__body">
              <div className="card__meta">
                {lead.country && <span className="tag">{countryName(lead.country.toUpperCase())}</span>}
                {lead.tags?.[0] && <span className="topic">{lead.tags[0]}</span>}
                <time>{fmt(lead.date)}</time>
              </div>
              <h2 className="lead__title">{lead.title}</h2>
              {lead.summary && <p className="lead__sum">{lead.summary}</p>}
              <span className="lead__cta">
                <IconArrowRight className="lead__cta-icon" /> Read the full story
              </span>
            </div>
          </Link>
        </section>
      )}

      {rest.length > 0 && (
        <section className="home__more" aria-label="More stories">
          <p className="section-label">More Stories</p>
          <div className="grid">
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
          </div>
        </section>
      )}
    </main>
  );
}
