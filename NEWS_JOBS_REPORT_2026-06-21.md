# Daily News & Jobs Report — Howdoyoudo

**Report generated:** 2026-06-22
**Period requested:** "yesterday" (2026-06-21)

## ⚠️ Finding: news content pipeline has not run since 19 June

The content pipeline (`fetch-rss-news` → `breaking_news` table, `scrape-articles` → `articles` table) last successfully wrote rows on **2026-06-19** (~18:01–18:02 UTC). There is **zero** new content for 2026-06-20 or 2026-06-21 — the pipeline appears to have stalled or its cron stopped firing for 2-3 days, even though the **jobs pipeline is healthy** (last run 2026-06-22 06:06 UTC, on schedule).

Recommend checking the `fetch-rss-news` and `scrape-articles` cron jobs / Edge Function logs in Supabase to find why they stopped after the 19th (PERPLEXITY_API_KEY issue, rate limit, or cron disabled are the likely causes).

Because there's no data for the actual "yesterday" window, the table below uses the **last day the pipeline ran (19 June 2026)** so the report isn't empty — all 33 industries did get updated that day.

## Source breakdown caveat

The database does not persist a per-article "discovered via Perplexity vs Google" flag — `fetch-rss-news` tags items internally as `perplexity` or `google` during verification but **strips that field before insert** (see `supabase/functions/fetch-rss-news/index.ts:537`). So the true Perplexity/Google split can't be reconstructed from stored data. What *can* be reported reliably is by **pipeline/table**:

- **Articles (in-depth)** — `articles` table, sourced exclusively via Perplexity (`scrape-articles` function)
- **Breaking news (headlines)** — `breaking_news` table, sourced via a **mix of Perplexity + Google News RSS** (`fetch-rss-news` function) — not separable per-row in the DB today

If you want a true Perplexity/Google split going forward, `source_kind` would need to be added as a real column on `breaking_news` instead of being dropped before insert.

## News updates by industry — 19 June 2026 (last successful run)

| Industry | Articles (Perplexity) | Breaking News (Perplexity+Google) | Total stories |
|---|---|---|---|
| Bakery | 0 | 24 | 24 |
| Beauty | 0 | 33 | 33 |
| Beer | 0 | 26 | 26 |
| Building | 0 | 19 | 19 |
| Cars | 1 | 15 | 16 |
| Charity | 3 | 16 | 19 |
| Coffee | 0 | 33 | 33 |
| Delivery | 0 | 16 | 16 |
| Estate Agency | 1 | 15 | 16 |
| Farming | 0 | 20 | 20 |
| Fashion | 9 | 14 | 23 |
| Film and TV | 10 | 21 | 31 |
| Fixing | 1 | 18 | 19 |
| Food & Drink | 1 | 18 | 19 |
| Football | 0 | 32 | 32 |
| Footwear | 0 | 17 | 17 |
| Formula 1 | 0 | 9 | 9 |
| Gaming | 0 | 17 | 17 |
| Grocery | 0 | 23 | 23 |
| Health | 0 | 25 | 25 |
| Horse Racing | 4 | 21 | 25 |
| Influencing | 0 | 4 | 4 |
| Interior Design | 1 | 14 | 15 |
| Jewellery | 0 | 32 | 32 |
| Journalism | 2 | 12 | 14 |
| Money | 0 | 27 | 27 |
| Music | 9 | 9 | 18 |
| Pets | 1 | 14 | 15 |
| Physiotherapy | 0 | 30 | 30 |
| Psychotherapy | 1 | 19 | 20 |
| Teaching | 0 | 19 | 19 |
| Travel | 4 | 10 | 14 |
| Wellness | 1 | 21 | 22 |
| **TOTAL** | **49** | **643** | **692** |

All 33 industries received at least some content on 19 June. Influencing (4) and Formula 1 (9) had the lowest volume; Beauty (33) and Coffee (33) had the highest.

## Total job count by industry (live in DB, as of 2026-06-22)

| Industry | Jobs |
|---|---|
| Bakery | 456 |
| Beauty | 589 |
| Beer | 671 |
| Building | 9,472 |
| Cars | 580 |
| Charity | 1,584 |
| Coffee | 497 |
| Delivery | 8,376 |
| Estate Agency | 1,175 |
| Farming | 886 |
| Fashion | 635 |
| Film and TV | 48 |
| Fixing | 9,011 |
| Food & Drink | 1,030 |
| Football | 555 |
| Footwear | 1,260 |
| Formula 1 | 511 |
| Gaming | 2,128 |
| Grocery | 712 |
| Health | 6,415 |
| Horse Racing | 335 |
| Influencing | 141 |
| Interior Design | 4,555 |
| Jewellery | 367 |
| Journalism | 213 |
| Money | 1,839 |
| Music | 181 |
| Pets | 624 |
| Physiotherapy | 144 |
| Psychotherapy | 403 |
| Teaching | 2,588 |
| Travel | 1,564 |
| Wellness | 1,115 |
| **TOTAL** | **59,665** |

Note: total here (59,665) differs slightly from the 61,303 row count on the `jobs` table because a handful of rows have an `industry` value outside the 33 canonical slugs (likely legacy/unmapped categories) — worth a quick audit if exact reconciliation matters.

Top 3 by volume: Building (9,472), Fixing (9,011), Delivery (8,376). Lowest: Film and TV (48), Physiotherapy (144), Influencing (141).
