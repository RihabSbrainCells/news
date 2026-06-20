import fs from "node:fs/promises";
import path from "node:path";
import { config } from "./config.js";
import { imagePrompt } from "./generate.js";

async function searchPexels(query) {
  if (!config.pexelsKey) return null;
  try {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(
      query
    )}&per_page=1&orientation=landscape`;
    const res = await fetch(url, { headers: { Authorization: config.pexelsKey } });
    if (!res.ok) return null;
    const data = await res.json();
    const photo = data.photos?.[0];
    if (!photo) return null;
    return {
      url: photo.src?.large2x || photo.src?.large || photo.src?.original,
      credit: {
        source: "Pexels",
        author: photo.photographer,
        author_url: photo.photographer_url,
        origin_url: photo.url,
      },
    };
  } catch (err) {
    console.error("Pexels error:", err.message);
    return null;
  }
}

async function generateAIImage(keyword, title) {
  if (!config.imageApiUrl || !config.imageApiKey) return null;
  try {
    const prompt = await imagePrompt(keyword, title);
    const res = await fetch(config.imageApiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.imageApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.imageModel,
        prompt,
        n: 1,
        size: "1536x1024",
        response_format: "b64_json",
      }),
    });
    if (!res.ok) {
      console.error("Image API:", res.status, await res.text());
      return null;
    }
    const data = await res.json();
    const item = data.data?.[0];
    let buffer;
    if (item?.b64_json) buffer = Buffer.from(item.b64_json, "base64");
    else if (item?.url) buffer = Buffer.from(await (await fetch(item.url)).arrayBuffer());
    else return null;
    return { buffer, ext: "png", credit: { source: "AI-generated" } };
  } catch (err) {
    console.error("AI image error:", err.message);
    return null;
  }
}

async function fetchToBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) return null;
  const ct = res.headers.get("content-type") || "image/jpeg";
  return { buffer: Buffer.from(await res.arrayBuffer()), ext: ct.includes("png") ? "png" : "jpg" };
}

/**
 * Source a cover and WRITE it into the cloned repo's image dir.
 * Returns { coverPath (web path like /covers/slug.jpg), credit } or nulls.
 *
 * @param repoRoot  absolute path to the cloned repo
 * @param slug      article slug (used as filename)
 */
export async function sourceCover({ repoRoot, slug, keyword, title }) {
  const absDir = path.join(repoRoot, config.imageDir);
  await fs.mkdir(absDir, { recursive: true });

  // web path = imageDir minus a leading "public" (Next serves public/ at /)
  const webBase = "/" + config.imageDir.replace(/^public\//, "");

  // 1. stock
  const stock = await searchPexels(keyword);
  if (stock?.url) {
    const fetched = await fetchToBuffer(stock.url);
    if (fetched) {
      const file = `${slug}.${fetched.ext}`;
      await fs.writeFile(path.join(absDir, file), fetched.buffer);
      return { coverPath: `${webBase}/${file}`, credit: stock.credit };
    }
  }

  // 2. AI fallback
  const ai = await generateAIImage(keyword, title);
  if (ai?.buffer) {
    const file = `${slug}.${ai.ext}`;
    await fs.writeFile(path.join(absDir, file), ai.buffer);
    return { coverPath: `${webBase}/${file}`, credit: ai.credit };
  }

  return { coverPath: null, credit: null };
}
