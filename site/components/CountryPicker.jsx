"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { flagEmoji } from "../lib/countries";

// Search-first country picker. Renders fully on the server with query=""
// so crawlers and AI agents see every country link without running JS —
// the search box is progressive enhancement on top of that, not a
// requirement for discoverability.
export default function CountryPicker({ countries, popular = [], compact = false, showChips = true, popularLabel = "Popular today" }) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return countries;
    return countries.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase() === q
    );
  }, [query, countries]);

  const searching = query.trim().length > 0;
  const visible = compact && searching ? results.slice(0, 8) : results;

  return (
    <div className="picker">
      <label className="picker__label" htmlFor="country-search">
        Search countries
      </label>
      <div className="picker__inputwrap">
        <svg className="picker__icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.6" />
          <path d="M14 14L18 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <input
          id="country-search"
          type="search"
          className="picker__input"
          placeholder="Search countries, e.g. Morocco"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
        />
      </div>

      {searching ? (
        <ul className="picker__results" role="listbox" aria-label="Matching countries">
          {visible.length === 0 && <li className="picker__empty">No matching countries.</li>}
          {visible.map((c) => (
            <li key={c.code}>
              <Link href={`/country/${c.code.toLowerCase()}`} className="picker__row">
                <span aria-hidden="true">{flagEmoji(c.code)}</span>
                <span>{c.name}</span>
                {!!c.count && <span className="picker__count">{c.count}</span>}
              </Link>
            </li>
          ))}
        </ul>
      ) : showChips ? (
        <>
          <p className="picker__section-label">{popularLabel}</p>
          <div className="picker__chips">
            {popular.map((c) => (
              <Link key={c.code} href={`/country/${c.code.toLowerCase()}`} className="picker__chip">
                <span aria-hidden="true">{flagEmoji(c.code)}</span> {c.name}
                <span className="picker__chip-count">
                  {c.count ? `${c.count} ${c.count === 1 ? "story" : "stories"}` : "no stories yet"}
                </span>
              </Link>
            ))}
          </div>

          {!compact && (
            <>
              <p className="picker__section-label">All countries</p>
              <ul className="picker__results picker__results--grid">
                {countries.map((c) => (
                  <li key={c.code}>
                    <Link href={`/country/${c.code.toLowerCase()}`} className="picker__row">
                      <span aria-hidden="true">{flagEmoji(c.code)}</span>
                      <span>{c.name}</span>
                      {!!c.count && <span className="picker__count">{c.count}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      ) : null}

      {compact && (
        <Link href="/countries" className="picker__more">
          Browse all {countries.length} countries →
        </Link>
      )}
    </div>
  );
}
