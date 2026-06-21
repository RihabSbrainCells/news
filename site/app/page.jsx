import Link from "next/link";
import { getAllArticles, getCountryCounts } from "../lib/content";
import { COUNTRIES, popularCountries } from "../lib/countries";
import CountryPicker from "../components/CountryPicker";

function fmt(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function Home() {
  const articles = getAllArticles();
  const [lead, ...rest] = articles;

  const counts = getCountryCounts();
  const countries = COUNTRIES.map((c) => ({ ...c, count: counts.get(c.code) || 0 }));
  const popular = popularCountries().map((c) => ({ ...c, count: counts.get(c.code) || 0 }));

  return (
    <main className="home">
      <header className="masthead">
        <div className="masthead__mark">
          <span className="masthead__ember" aria-hidden="true" />
          <span className="masthead__name">Emberline</span>
        </div>
        <p className="masthead__tag">What the world is searching for, today.</p>
      </header>

      <section className="home__picker" aria-label="Browse news by country">
        <CountryPicker countries={countries} popular={popular} compact />
      </section>

      {articles.length === 0 && <p className="empty">No stories yet. Check back shortly.</p>}

      {lead && (
        <Link href={`/article/${lead.slug}`} className="lead">
          {lead.cover && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={lead.cover} alt="" className="lead__img" />
          )}
          <div className="lead__body">
            <div className="card__meta">
              {lead.country && <span className="tag">{lead.country}</span>}
              <time>{fmt(lead.date)}</time>
            </div>
            <h2 className="lead__title">{lead.title}</h2>
            {lead.summary && <p className="lead__sum">{lead.summary}</p>}
          </div>
        </Link>
      )}

      <section className="grid">
        {rest.map((a) => (
          <Link key={a.slug} href={`/article/${a.slug}`} className="card">
            <div className="card__meta">
              {a.country && <span className="tag">{a.country}</span>}
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
