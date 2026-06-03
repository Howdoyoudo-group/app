---
name: Headline Sources
description: Daily briefings pull RSS-first (Google News UK), Perplexity sonar fallback only when RSS < 5 headlines.
type: feature
---
**Cost-optimised RSS-first strategy** (May 2026 onwards):

1. `refresh-all-content` (06:00 daily) calls `fetch-rss-news` for every industry first — free Google News RSS, UK-targeted queries.
2. Only industries returning **< 5 RSS headlines** trigger a fallback call to `scrape-articles`.
3. `scrape-articles` uses Perplexity **`sonar`** (not `sonar-pro`) with a single query (was 3 parallel angles). ~15× cheaper per call.
4. If UK-focused Perplexity call returns 0 articles, broad global search retries once.

**Why:** Perplexity at sonar-pro × 3 angles × 29 industries × daily ≈ $300/mo. New approach ~$15–30/mo with no quality drop on healthy industries.

**Kill switch:** lower `RSS_THRESHOLD` in `refresh-all-content/index.ts` to use Perplexity more aggressively.
