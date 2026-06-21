import Link from "next/link";
import CountryPicker from "../../components/CountryPicker";
import { COUNTRIES, popularCountries } from "../../lib/countries";
import { getCountryCounts } from "../../lib/content";
import { breadcrumbJsonLd } from "../../lib/seo";

export const metadata = {
  title: "Browse News by Country",
  description:
    "Search or browse world news by country — every nation, one search box, updated daily.",
  alternates: { canonical: "/countries" },
};

export default function CountriesPage() {
  const counts = getCountryCounts();
  const countries = COUNTRIES.map((c) => ({ ...c, count: counts.get(c.code) || 0 }));
  const popular = popularCountries().map((c) => ({ ...c, count: counts.get(c.code) || 0 }));

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Countries", path: "/countries" },
  ]);

  return (
    <main className="page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <Link href="/" className="back">← Home</Link>
      <header className="page__head">
        <h1>Browse by Country</h1>
        <p className="page__lede">
          Search any country, or jump to one of the markets we&apos;re covering today.
        </p>
      </header>

      <CountryPicker countries={countries} popular={popular} />
    </main>
  );
}
