import Link from "next/link";
import { flagEmoji } from "../lib/countries";

// Renders just the horizontal chip row — the section wrapper (which also
// holds the world-map toggle card alongside it) lives in app/page.jsx so
// the two can share one row.
export default function TrendingCountries({ countries }) {
  if (countries.length === 0) {
    return <p className="trending__empty">No trending countries yet.</p>;
  }

  return (
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
  );
}
