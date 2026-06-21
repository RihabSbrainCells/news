import Link from "next/link";
import { flagEmoji } from "../lib/countries";

// Only ever fed countries with real coverage (count > 0) — an honest
// "trending" strip beats a wall of "no stories yet" chips. Renders nothing
// if there's no coverage anywhere yet, rather than show an empty section.
export default function TrendingCountries({ countries }) {
  if (countries.length === 0) return null;

  return (
    <section className="trending" aria-label="Trending countries">
      <p className="section-label">📈 Trending Countries</p>
      <div className="trending__scroll">
        {countries.map((c) => (
          <Link key={c.code} href={`/country/${c.code.toLowerCase()}`} className="trending__chip">
            <span aria-hidden="true">{flagEmoji(c.code)}</span> {c.name}
            <span className="trending__count">
              {c.count} {c.count === 1 ? "story" : "stories"}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
