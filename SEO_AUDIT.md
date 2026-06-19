# Bludle SEO and Ad Revenue Audit

_Last updated: 2026-06-19_

## Executive summary

Bludle already has a strong static-site SEO base: indexable game pages, AdSense, analytics, canonical URLs, social metadata, FAQ content, and several topic landing pages. The next growth opportunity is to make every important page serve a clear search intent, improve crawl discovery, and add ad-safe content depth that increases pageviews without pushing users into accidental clicks.

## Highest-priority recommendations implemented in this pass

1. **Create more search-intent landing pages** for non-branded discovery queries such as free browser games, no-download games, brain-training games, logic puzzle games, games like Wordle, and games like Connections.
2. **Refresh XML sitemap coverage** so new landing pages and existing topic pages are easier for search engines to discover.
3. **Standardize structured data** on core playable game pages with `WebApplication` markup that describes each game as a free browser-playable app.
4. **Add FAQ and internal-link content** on the new landing pages to capture long-tail queries and route visitors to multiple games per session.
5. **Protect ad revenue** by keeping ads in labelled content sections, away from primary game controls, and by using reserved ad panels to reduce layout shift.

## Current strengths

- AdSense is already installed site-wide on many pages.
- The homepage includes canonical metadata, social cards, structured data, and FAQ schema.
- Existing landing pages target useful clusters including Wordle alternatives, colour puzzle games, reaction games, and daily word games.
- The site has a broad catalogue of browser games that can support many internal-link clusters.

## Current risks and opportunities

- Some older pages have short or generic descriptions and could be expanded over time.
- Topic pages should be kept distinct to avoid thin or duplicated content.
- Internal links should consistently point from informational pages to playable games and from game pages to related collections.
- Ad slots should remain labelled and separated from gameplay controls to protect policy compliance and user trust.

## Next suggested follow-up work

- Add game-specific FAQ blocks to the top 8 playable pages.
- Add breadcrumb schema across landing pages and game pages.
- Build a lightweight related-games component reused across game pages.
- Review Core Web Vitals after deployment, especially CLS around ad containers and font loading.
