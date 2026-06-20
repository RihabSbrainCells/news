import { config } from "./config.js";

export async function searchWeb(keyword) {
  const res = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: { "X-API-KEY": config.serperKey, "Content-Type": "application/json" },
    body: JSON.stringify({ q: keyword, num: 8 }),
  });
  if (!res.ok) throw new Error(`Serper ${res.status}: ${await res.text()}`);

  const data = await res.json();
  const organic = (data.organic ?? []).slice(0, 8).map((r) => ({
    title: r.title,
    snippet: r.snippet ?? "",
    url: r.link,
    date: r.date ?? null,
  }));

  return {
    keyword,
    answerBox: data.answerBox?.snippet ?? data.answerBox?.answer ?? null,
    knowledgeGraph: data.knowledgeGraph
      ? { title: data.knowledgeGraph.title, description: data.knowledgeGraph.description ?? "" }
      : null,
    results: organic,
  };
}
