import "dotenv/config";

function required(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export const config = {
  anthropicKey: required("ANTHROPIC_API_KEY"),
  serperKey: required("SERPER_API_KEY"),

  // Git target: the repo Vercel deploys from.
  repoUrl: required("REPO_URL"),          // https://github.com/you/your-news-site.git
  repoBranch: process.env.REPO_BRANCH || "main",
  gitToken: required("GIT_TOKEN"),        // GitHub PAT with repo write
  gitAuthorName: process.env.GIT_AUTHOR_NAME || "news-bot",
  gitAuthorEmail: process.env.GIT_AUTHOR_EMAIL || "bot@example.com",

  // Where in the repo content + images live.
  contentDir: process.env.CONTENT_DIR || "content/articles",
  imageDir: process.env.IMAGE_DIR || "public/covers",

  // Image sourcing (optional).
  pexelsKey: process.env.PEXELS_API_KEY || "",
  imageApiUrl: process.env.IMAGE_API_URL || "",
  imageApiKey: process.env.IMAGE_API_KEY || "",
  imageModel: process.env.IMAGE_MODEL || "gpt-image-1",

  // Behaviour
  countries: (process.env.COUNTRIES || "US").split(",").map((c) => c.trim()),
  maxArticlesPerRun: Number(process.env.MAX_ARTICLES_PER_RUN || 5),
};
