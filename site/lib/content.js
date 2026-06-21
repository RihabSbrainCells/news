import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "content/articles");

function safeParse(json, fallback) {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

function readingMinutes(body) {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function readAll() {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf8");
      const { data, content } = matter(raw);
      return {
        slug: data.slug || file.replace(/\.md$/, ""),
        title: data.title || "Untitled",
        summary: data.summary || "",
        country: data.country || "",
        date: data.date || "",
        cover: data.cover || null,
        credit: typeof data.credit === "string" ? safeParse(data.credit, null) : data.credit || null,
        tags: Array.isArray(data.tags) ? data.tags : [],
        sources: typeof data.sources === "string" ? safeParse(data.sources, []) : data.sources || [],
        readingMinutes: readingMinutes(content),
        body: content,
      };
    });
}

export function getAllArticles() {
  return readAll().sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getArticle(slug) {
  return readAll().find((a) => a.slug === slug) || null;
}

export function getAllSlugs() {
  return readAll().map((a) => a.slug);
}

export function getArticlesByCountry(code) {
  return getAllArticles().filter((a) => a.country.toUpperCase() === code.toUpperCase());
}

// Country codes that currently have at least one article, with counts —
// drives which /country pages are statically generated and indexable.
export function getCountryCounts() {
  const counts = new Map();
  for (const a of readAll()) {
    if (!a.country) continue;
    const code = a.country.toUpperCase();
    counts.set(code, (counts.get(code) || 0) + 1);
  }
  return counts;
}
