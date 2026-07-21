# SEO / AI-Search Checklist

Started 2026-07-21. Full plan and rationale: this was planned in a Claude session — ask
Claude to re-read `~/.claude/plans/swift-puzzling-rossum.md` for the underlying detail,
or see `SESSION_LOG.md`. This file is the tickable, at-a-glance version.

**The strategy in one line:** don't try to out-rank Indeed/LinkedIn/Reed for "find a
job" — go after (1) Google's Jobs rich-result feature for long-tail searches, and (2)
"career discovery" content, which none of the big job boards compete on.

Two tracks below: items marked **[YOU]** need Woody/Andrew outside the codebase — mostly
clicking through external dashboards, nothing Claude can do on your behalf. Items marked
**[CLAUDE]** are pure code changes.

---

## Phase 0 — Policy decision (5 min, do regardless of everything else)

- [x] **[YOU]** Say go on: split `robots.txt` so it still blocks AI *training* scrapers
      (GPTBot, ClaudeBot, CCBot, etc. — protects content from being used to train
      models) but **allows** the AI *answer* bots (OAI-SearchBot, ChatGPT-User,
      PerplexityBot, Perplexity-User, Google-Extended) — right now ALL of these are
      blocked, which directly prevents HDYD from ever appearing in ChatGPT Search,
      Perplexity answers, or Google AI Overviews. This reverses a deliberate earlier
      choice, hence the separate sign-off.
- [x] **[CLAUDE]** Make the robots.txt change once you say go. **Done, live, verified
      2026-07-21** — confirmed all 5 answer bots now return `Allow: /` on the production
      `robots.txt`.

## Your three account setups (do any time, needed before their linked phase completes)

- [ ] **[YOU]** [Google Search Console](https://search.google.com/search-console) — add
      the property. `index.html` already has a verification tag, so this may already be
      half-done. Submit the sitemap once Phase 1 makes it dynamic.
- [ ] **[YOU]** [Bing Webmaster Tools](https://www.bing.com/webmasters) — can import
      straight from Search Console. ~5 minutes.
- [ ] **[YOU]** **GA4** (chosen over Vercel Analytics — pairs with Search Console under
      the same Google account). Steps:
      1. [analytics.google.com](https://analytics.google.com) → **Admin** → **Create
         Account** → name it `Howdoyoudo`.
      2. **Create a Property** → name `Howdoyoudo`, timezone **United Kingdom**,
         currency **GBP**.
      3. Business details — pick whatever's closest, doesn't affect anything technical.
      4. Data collection → **Web**.
      5. Site URL `https://www.howdoyoudo.co.uk`, stream name `Howdoyoudo main site`.
      6. Copy the **Measurement ID** (`G-XXXXXXXXXX`) from the Data Stream screen and
         send it to Claude — that's the only thing needed to wire it in.

## Phase 1 — Foundations

- [x] **[CLAUDE]** Wire the GA4 measurement ID into the site once you've sent it over,
      verify via GA4's Realtime report. **Done, live, verified 2026-07-21** — ID
      `G-PPVT9V863C` deployed in `index.html`; confirmed firing via live-browser
      `dataLayer`/`gtag` inspection. **[YOU]**: check GA4 → Reports → Realtime
      yourself for the final confirmation from your own account.
- [x] **[CLAUDE]** Rebuild `sitemap.xml` as dynamically generated (currently static,
      hand-maintained, and already missing Politics + Theatre) — pulled from the
      canonical industries/roles/companies data so nothing can silently go missing
      again. **Done, live, verified 2026-07-21** — `https://www.howdoyoudo.co.uk/sitemap.xml`
      now serves 178 URLs including Politics and Theatre, generated fresh from
      `src/data/industries.ts` / `src/data/roles.ts` + the `employer_companies` table.
- [ ] **[YOU]** Submit the new sitemap in Search Console + Bing Webmaster Tools.

## Phase 2 — Wire up code that's already written

- [ ] **[CLAUDE]** Give `/roles/:slug` pages real titles/descriptions (~60 pages) — the
      generator function already exists, just isn't called.
- [ ] **[CLAUDE]** Same for `/company/:slug` pages (~45 pages).
- [ ] **[CLAUDE]** Add SEO tags to `/briefings` — genuinely unique daily AI-written
      content that's currently invisible to search engines.

## Phase 3 — Job listings in Google's Jobs feature, properly

- [ ] **[CLAUDE]** Extend the job structured-data markup so it's per-industry (e.g.
      `/music` carries live music jobs), not just one global batch of 25 on the
      marketplace page.
- [ ] **[YOU]** Sanity-check a couple of industry pages with [Google's Rich Results
      Test](https://search.google.com/test/rich-results) once shipped.

## Phase 4 — Show up in AI-generated answers specifically

- [ ] **[CLAUDE]** Add FAQ-style structured data to industry pages ("What jobs are
      there in music?" etc.) — this is the format AI Overviews and ChatGPT answers
      most often lift word-for-word. Nothing like this exists yet.

## Phase 5 — Bigger plays, scope later once 1–4 are shipped and measured

- [ ] Pre-rendering so non-JS crawlers see full content (needs its own scoping —
      no such tooling exists today).
- [ ] Turn the daily industry briefings into a public, dated content archive —
      probably the single best long-term traffic asset, since it's the one thing
      Indeed/LinkedIn structurally can't copy. Needs a product decision on how much
      history to make public, not just an engineering change.

---

## How we'll know it's working

Weekly, once analytics + Search Console are live: organic sessions (GA4) and search
impressions/clicks (Search Console). Everything else on this list is a leading
indicator — these two numbers are the actual proof.
