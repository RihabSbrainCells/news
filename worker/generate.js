import Anthropic from "@anthropic-ai/sdk";
import { config } from "./config.js";

const anthropic = new Anthropic({ apiKey: config.anthropicKey });

export function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const SYSTEM = `You are a staff writer for an online news publication.
You write original, accurate, well-structured articles that SYNTHESIZE
information across multiple sources. You never copy or lightly reword a
single source — you read the research, find what is consistent across
sources, and write a fresh piece in your own voice.

Rules:
- Write in clean, neutral, journalistic English.
- Only state facts supported by the provided research. If the research is
  thin or contradictory, say what is known and flag what is unconfirmed.
- Never fabricate quotes, statistics, names, or dates.
- No clickbait. The headline must reflect the actual content.
- Attribute notable claims in-text (e.g. "according to reporting from ...").
- Output VALID JSON only, no markdown fences.`;

export async function generateArticle({ keyword, country, research }) {
  const sourceList = research.results
    .map((r, i) => `[${i + 1}] ${r.title} — ${r.url}\n    ${r.snippet}`)
    .join("\n");

  const userPrompt = `Topic (trending in ${country}): "${keyword}"

${research.answerBox ? `Quick answer: ${research.answerBox}\n` : ""}${
    research.knowledgeGraph
      ? `Background: ${research.knowledgeGraph.title} — ${research.knowledgeGraph.description}\n`
      : ""
  }
Research snippets from current web sources:
${sourceList}

Write an original news article of 400–650 words that synthesizes the
above. Do not mirror any single source's structure or wording.

Return JSON with exactly these fields:
{
  "title": "headline, <= 70 chars, no trailing period",
  "summary": "1–2 sentence meta description, <= 160 chars",
  "body": "the article in markdown, with a short intro and 2–4 sections using ## subheadings",
  "tags": ["3-6", "lowercase", "topic", "tags"],
  "sources": [{ "title": "...", "url": "..." }]
}

For "sources", include only the URLs from the research above that you
actually relied on.`;

  const msg = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2000,
    system: SYSTEM,
    messages: [{ role: "user", content: userPrompt }],
  });

  const text = msg.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("")
    .replace(/```json\s*|\s*```/g, "")
    .trim();

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error(`Model returned non-JSON for "${keyword}"`);
  }
  if (!parsed.title || !parsed.body) throw new Error(`Incomplete article for "${keyword}"`);

  return {
    title: parsed.title,
    summary: parsed.summary ?? "",
    body: parsed.body,
    tags: Array.isArray(parsed.tags) ? parsed.tags : [],
    sources: Array.isArray(parsed.sources) ? parsed.sources : [],
  };
}

// Editorial image prompt for the AI fallback.
export async function imagePrompt(keyword, title) {
  const msg = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 200,
    system:
      "You write concise prompts for an editorial cover image. The image " +
      "must be a tasteful, photographic or illustrative scene with NO text, " +
      "NO recognizable real people, NO logos or brands. One sentence.",
    messages: [
      { role: "user", content: `Article headline: "${title}" (topic: ${keyword}). Write the image prompt.` },
    ],
  });
  return msg.content.filter((b) => b.type === "text").map((b) => b.text).join("").trim();
}
