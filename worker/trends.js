import googleTrends from "google-trends-api";

const COUNTRY_NAMES = {
  US: "united_states", GB: "united_kingdom", CA: "canada", AU: "australia",
  IN: "india", DE: "germany", FR: "france", BR: "brazil", JP: "japan", NG: "nigeria",
};

export async function fetchDailyTrends(countryCode) {
  if (!COUNTRY_NAMES[countryCode]) {
    console.warn(`No country mapping for "${countryCode}" — skipping`);
    return [];
  }
  try {
    const raw = await googleTrends.dailyTrends({ geo: countryCode });
    const parsed = JSON.parse(raw);
    const days = parsed?.default?.trendingSearchesDays ?? [];
    const today = days[0]?.trendingSearches ?? [];
    return today
      .map((t, i) => ({
        keyword: t.title?.query?.trim(),
        traffic: t.formattedTraffic ?? null,
        rank: i + 1,
      }))
      .filter((t) => t.keyword);
  } catch (err) {
    console.error(`Trends fetch failed for ${countryCode}:`, err.message);
    return [];
  }
}

export { COUNTRY_NAMES };
