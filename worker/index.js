import fs from "node:fs/promises";
import { config } from "./config.js";
import { fetchDailyTrends } from "./trends.js";
import { searchWeb } from "./search.js";
import { generateArticle, slugify } from "./generate.js";
import { sourceCover } from "./images.js";
import { cloneRepo, writeArticleFile, articleExists, commitAndPush } from "./git.js";

async function gatherTrends() {
  const out = [];
  const seen = new Set();
  for (const country of config.countries) {
    const trends = await fetchDailyTrends(country);
    for (const t of trends) {
      const key = `${t.keyword.toLowerCase()}::${country}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ ...t, country });
    }
  }
  // highest-ranked first, capped
  return out.sort((a, b) => a.rank - b.rank).slice(0, config.maxArticlesPerRun * 2);
}

async function main() {
  console.log(`\n=== run @ ${new Date().toISOString()} ===`);

  const trends = await gatherTrends();
  if (!trends.length) {
    console.log("No trends today.");
    return;
  }

  const { git, dir } = await cloneRepo();
  console.log(`Cloned repo → ${dir}`);

  let written = 0;
  const today = new Date().toISOString().slice(0, 10);

  for (const trend of trends) {
    if (written >= config.maxArticlesPerRun) break;

    const slug = slugify(trend.keyword);
    if (await articleExists(dir, slug)) {
      console.log(`• exists, skip: ${slug}`);
      continue;
    }

    try {
      console.log(`→ ${trend.keyword} (${trend.country})`);
      const research = await searchWeb(trend.keyword);
      if (!research.results.length) {
        console.warn("  no search results, skip");
        continue;
      }

      const article = await generateArticle({
        keyword: trend.keyword,
        country: trend.country,
        research,
      });

      // unique slug from the actual title (better than the raw keyword)
      let finalSlug = slugify(article.title) || slug;
      if (await articleExists(dir, finalSlug)) finalSlug = `${finalSlug}-${Date.now().toString(36)}`;

      const { coverPath, credit } = await sourceCover({
        repoRoot: dir,
        slug: finalSlug,
        keyword: trend.keyword,
        title: article.title,
      });

      await writeArticleFile(dir, {
        slug: finalSlug,
        title: article.title,
        summary: article.summary,
        country: trend.country,
        date: today,
        cover: coverPath,
        credit,
        tags: article.tags,
        sources: article.sources,
        body: article.body,
      });

      written += 1;
      console.log(`  ✓ wrote ${finalSlug}.md${coverPath ? " (+cover)" : ""}`);
    } catch (err) {
      console.error(`  ✗ ${trend.keyword}:`, err.message);
    }
  }

  if (written > 0) {
    const pushed = await commitAndPush(git, `Add ${written} article(s) — ${today}`);
    console.log(pushed ? `Pushed ${written} article(s).` : "No push needed.");
  } else {
    console.log("No new articles this run.");
  }

  // tidy temp clone
  await fs.rm(dir, { recursive: true, force: true });
  console.log("=== done ===\n");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
