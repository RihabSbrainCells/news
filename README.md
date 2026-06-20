# News Engine (Git-based, no database)

Trend-driven static news site. A worker pulls Google Trends, researches each
keyword, has an LLM **synthesize** an original article, writes it as a Markdown
file (plus a cover image in `public/covers`), commits, and pushes. The push
triggers a Vercel rebuild and the story goes live. **No database, no storage
bills** — the Git repo is the datastore.

```
cron → worker: trends → search → LLM synthesize → write .md + image
     → git commit + push  ─────────────────────────▶  GitHub
                                                         │ push hook
                                                         ▼
                                                   Vercel rebuild → static site
```

## Two pieces

- `worker/` — the automation. Runs on a schedule (Railway / Render / GitHub
  Actions). Clones your site repo, writes files, pushes.
- `site/` — the Next.js site. Reads Markdown from `content/articles/` at build
  time. **This is what you push to GitHub and connect to Vercel.**

## Setup

### 1. The site repo
1. Put the contents of `site/` in a new GitHub repo.
2. Import it into Vercel (framework auto-detected as Next.js). Deploy.
3. The included sample article means it builds green immediately.

### 2. A GitHub token for the worker
Create a fine-grained Personal Access Token with **Contents: read & write** on
that one repo. This is the worker's `GIT_TOKEN`.

### 3. The worker
```bash
cd worker
cp .env.example .env     # fill in keys + REPO_URL + GIT_TOKEN
npm install
npm start                # one run: writes + pushes real articles
```

Get keys: Serper (serper.dev), Pexels (pexels.com/api, optional), an image API
(optional AI fallback).

### Schedule it (GitHub Actions example)
```yaml
on:
  schedule: [{ cron: "0 */6 * * *" }]
  workflow_dispatch:
jobs:
  run:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: cd worker && npm ci && npm start
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          SERPER_API_KEY: ${{ secrets.SERPER_API_KEY }}
          REPO_URL: ${{ secrets.REPO_URL }}
          GIT_TOKEN: ${{ secrets.GIT_TOKEN }}
          PEXELS_API_KEY: ${{ secrets.PEXELS_API_KEY }}
          COUNTRIES: "US,GB"
          MAX_ARTICLES_PER_RUN: "5"
```
(Run the worker from its *own* repo, or a subfolder — just point `REPO_URL` at
the **site** repo it should write into.)

## How content is stored

Each article is `content/articles/<slug>.md`:

```markdown
---
title: "..."
slug: "..."
summary: "..."
country: "US"
date: "2026-06-21"
cover: "/covers/<slug>.jpg"
credit: "{...json...}"
tags: ["a", "b"]
sources: "[{...json...}]"
---

Body in markdown...
```

Editing = edit the file and commit (locally or via GitHub's web editor).
Deleting = delete the file and commit. Dedupe is by filename, so the worker
won't re-create an article whose slug already exists.

## Tradeoffs of this design (known + accepted)

- **Publish lag:** going live = commit + Vercel rebuild (~1–2 min), not instant.
- **No draft queue:** the worker publishes straight to the repo. To review
  first, change the Action to open a PR instead of pushing to `main`.
- **Build time grows with article count** — fine into the low thousands. If you
  ever generate at very high volume for years, revisit (paginate, or move old
  posts to an archive). Not a near-term concern.
- **Images are committed** to `public/covers`. Lean for a while; if the repo
  gets heavy, switch `images.js` to upload to Cloudflare R2 / Vercel Blob and
  store the URL instead of a local path.

## Staying publishable

- The generator **synthesizes and cites** rather than rewording one source —
  keep it that way; that's what avoids Google's scaled-content-abuse penalties.
- Every article lists its sources and a disclosure line.
- Start with one country / one niche before scaling breadth.

## Tuning

| Want | Change |
|------|--------|
| More/less output | `MAX_ARTICLES_PER_RUN` |
| More countries | `COUNTRIES` (+ extend `COUNTRY_NAMES` in `trends.js`) |
| Article voice/length | the `SYSTEM` + prompt in `worker/generate.js` |
| Cover source | `PEXELS_API_KEY` (stock), `IMAGE_API_*` (AI fallback) |
| Where files land | `CONTENT_DIR`, `IMAGE_DIR` |
| Review before live | change the Action to open a PR, not push to main |
