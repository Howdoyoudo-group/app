---
name: SerpAPI Google Jobs Fallback
description: SerpAPI Google Jobs wired into industry-health-monitor as a quota-capped fallback for unhealthy industries only.
type: feature
---
- Free tier (100 searches/month). Hard cap `SERPAPI_MONTHLY_CAP = 95` tracked in `serpapi_usage` table (month text PK + count int).
- Only fires for industries flagged unhealthy this run (max 3/run via MAX_REFETCHES_PER_RUN). Worst case: ~90 searches/month.
- Kill switch: `SERPAPI_ENABLED=false` env var.
- Per-industry query map `SERPAPI_QUERIES` in `industry-health-monitor/index.ts`; falls back to `<slug humanised> jobs`.
- Calls `engine=google_jobs&gl=uk&hl=en&location=United Kingdom`, parses `jobs_results[]`, upserts to `jobs` table on `url` conflict.
- Stats surfaced per industry in health-log `checks[]` as `serpapi_searches`, `serpapi_inserted`, `serpapi_error`.
