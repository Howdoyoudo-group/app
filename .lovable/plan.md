## Problem

Two related friction points:

1. **Floating Home pill blocks content.** Most pages render `GlobalHomeButton` — a `fixed top-3 left-3` lime pill with no backdrop — which overlaps cards/headings as you scroll. Side Hustles instead uses a full-width fixed bar (`bg-background` + bottom border + `pt-28` on content), so the bar scrolls as one unit and never sits over anything.
2. **Hamburger menu is only reachable from the homepage.** The mobile hamburger lives inside `SiteHeader`, which only renders on a handful of routes. On every other page (Side Hustles, topic pages, Employers, HowdyApp, Learning, etc.) users have to navigate back to `/` just to open the menu.

## Goal

Replace the floating Home pill with a Side-Hustles-style sticky top bar **and** put the hamburger menu inside that bar so the full nav is reachable from anywhere.

## Approach

### 1. Extract the mobile menu panel

Pull the mobile menu UI out of `SiteHeader.tsx` into a new reusable component `src/components/GlobalMobileMenu.tsx`. It owns:

- The hamburger button (Menu / X icon, current circular pill styling).
- The `AnimatePresence` slide-down panel with the existing groups: Explore, Jobs, For Partners, MyInbox, My Profile, sign-in/out.
- The same auth-aware behavior (`useAuth`, photo URL, etc.) currently in `SiteHeader`.

`SiteHeader` then simply renders `<GlobalMobileMenu />` in place of its inline hamburger + panel, so behavior on the homepage is unchanged.

### 2. Rewrite `GlobalHomeButton.tsx` as a sticky bar

- Outer: `fixed top-0 inset-x-0 z-50 bg-background border-b border-border`.
- Inner container: `← Home` on the left, `howdoyoudo.group` wordmark in the center (matching Side Hustles), and `<GlobalMobileMenu />` on the right.
- Render a sibling spacer `<div class="h-16" />` so consuming pages don't need per-page `pt-*` edits.
- Keep the existing early-return for `/` and `/home-v2`.
- Extend the early-return list to skip routes that already render `SiteHeader` (Feed, Marketplace, MyJobs, Learning, Members, etc.) to avoid stacking two bars. `SiteHeader` itself now contains the same hamburger, so nothing is lost.

### 3. Remove duplicate bespoke headers

Pages that already render their own `← Home` + wordmark bar (`SideHustles.tsx`, `SideHustleTopic.tsx`, `ResourceTopic.tsx`, and any others surfaced during the edit) — delete their inline `<header>` and the `pt-28` they used to compensate for it. They'll inherit the new global bar automatically.

## Out of scope

- Visual redesign of the bar or menu (kept identical to current Side Hustles header and current `SiteHeader` mobile panel).
- Desktop nav changes — `SiteHeader`'s desktop dropdowns stay exactly as they are.
- Any backend, content, or routing changes.

## Files touched

- `src/components/GlobalMobileMenu.tsx` — new, extracted from `SiteHeader`.
- `src/components/SiteHeader.tsx` — replace inline hamburger + mobile panel with `<GlobalMobileMenu />`.
- `src/components/GlobalHomeButton.tsx` — rewrite as sticky bar with Home + wordmark + `<GlobalMobileMenu />` + spacer + expanded skip list.
- `src/pages/SideHustles.tsx`, `src/pages/SideHustleTopic.tsx`, `src/pages/ResourceTopic.tsx` (and any other duplicate-header page) — remove bespoke header + matching `pt-28`.

## Verification

- On Side Hustles, a topic page, Employers, CompanyOcadoLogistics, HowdyApp: the bar stays put while scrolling, never overlaps content, and the hamburger opens the full Explore / Jobs / Partners / MyInbox menu.
- On `/`, `/feed`, `/jobs`, `/marketplace`: no duplicate bar above `SiteHeader`; its hamburger still works.
- Mobile (390px): bar fits cleanly, no horizontal overflow, hamburger panel positions correctly under the new sticky bar.
