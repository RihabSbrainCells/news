import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { simpleGit } from "simple-git";
import { config } from "./config.js";

// Build an authenticated clone URL from REPO_URL + GIT_TOKEN.
function authedUrl() {
  const u = new URL(config.repoUrl);
  // https://<token>@github.com/owner/repo.git
  u.username = config.gitToken;
  return u.toString();
}

/** Shallow-clone the repo into a temp dir, return { git, dir }. */
export async function cloneRepo() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "news-repo-"));
  const git = simpleGit();
  await git.clone(authedUrl(), dir, ["--depth", "1", "--branch", config.repoBranch]);
  const repo = simpleGit(dir);
  await repo.addConfig("user.name", config.gitAuthorName);
  await repo.addConfig("user.email", config.gitAuthorEmail);
  return { git: repo, dir };
}

// YAML-escape a scalar string for frontmatter.
function yamlString(s) {
  return `"${String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

/**
 * Write one article as a Markdown file with YAML frontmatter.
 * Returns the relative repo path written.
 */
export async function writeArticleFile(repoRoot, article) {
  const absDir = path.join(repoRoot, config.contentDir);
  await fs.mkdir(absDir, { recursive: true });

  const fm = [
    "---",
    `title: ${yamlString(article.title)}`,
    `slug: ${yamlString(article.slug)}`,
    `summary: ${yamlString(article.summary)}`,
    `country: ${yamlString(article.country)}`,
    `date: ${yamlString(article.date)}`,
    article.cover ? `cover: ${yamlString(article.cover)}` : null,
    article.credit ? `credit: ${yamlString(JSON.stringify(article.credit))}` : null,
    `tags: [${article.tags.map((t) => yamlString(t)).join(", ")}]`,
    `sources: ${yamlString(JSON.stringify(article.sources))}`,
    "---",
  ]
    .filter((line) => line !== null && line !== undefined)
    .join("\n");

  // Blank line between the closing --- and the body so the frontmatter
  // block is always well-formed.
  const fileContents = `${fm}\n\n${article.body}\n`;

  const rel = path.join(config.contentDir, `${article.slug}.md`);
  await fs.writeFile(path.join(repoRoot, config.contentDir, `${article.slug}.md`), fileContents);
  return rel;
}

/** Does an article file already exist? (dedupe across runs) */
export async function articleExists(repoRoot, slug) {
  try {
    await fs.access(path.join(repoRoot, config.contentDir, `${slug}.md`));
    return true;
  } catch {
    return false;
  }
}

/** Stage everything, commit, push. Returns true if anything was pushed. */
export async function commitAndPush(git, message) {
  await git.add(".");
  const status = await git.status();
  if (status.files.length === 0) {
    console.log("Nothing to commit.");
    return false;
  }
  await git.commit(message);
  await git.push("origin", config.repoBranch);
  return true;
}
