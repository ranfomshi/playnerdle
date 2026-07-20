# Bludle search foundations

Last updated: 2026-07-20

## Canonical policy

- Public host: `https://bludle.com`
- Directory pages use a trailing slash.
- Numbered journal articles, privacy and terms use clean extensionless URLs.
- Netlify permanently redirects the retired `www` host, `.html` aliases, the old Colour Match path and the legacy Nerdle route.

## Indexable inventory

The sitemap contains 59 deliberate canonical URLs: the homepage, 20 games, 10 selection guides, the journal index and 23 articles, About, Editorial Policy, Privacy and Terms. Utility, prototype, duplicate and error pages are `noindex` and excluded.

## Maintenance commands

```text
node scripts/apply-search-foundations.mjs
node scripts/generate-sitemap.mjs
node scripts/generate-redirects.mjs
node scripts/generate-ai-catalogue.mjs
powershell -ExecutionPolicy Bypass -File scripts/generate-social-cards.ps1
node scripts/audit-search.mjs
```

`scripts/site-data.mjs` is the shared source for game facts, guides, social metadata, sitemap routes and AI-readable catalogues. The search-quality GitHub workflow prevents missing canonicals, duplicate titles, broken internal links, invalid JSON-LD and sitemap drift.

## Automated discovery

- `robots.txt` permits normal crawling and explicitly documents access for OAI-SearchBot.
- `llms.txt` and `llms-full.txt` are generated from the factual game catalogue. They are supplementary documentation, not a substitute for indexable HTML.
- The IndexNow workflow submits changed canonical URLs after a push to `main`.
- ChatGPT, Perplexity, Copilot and Gemini referrals are recorded as `discovery_referral` analytics events when identifiable.

## External follow-up

These require account access or real traffic and cannot be completed from the repository alone:

1. Verify the apex property in Google Search Console and Bing Webmaster Tools, then submit `https://bludle.com/sitemap.xml`.
2. Inspect Google’s canonical selection after recrawl and request indexing for the homepage and highest-value games.
3. Monitor Core Web Vitals with field data; synthetic scores alone are not enough.
4. Confirm analytics events and `utm_source=chatgpt.com` referrals in the production analytics accounts.
5. Review advertising/cookie consent settings and the privacy policy with an appropriate legal adviser.
6. Add genuinely first-party findings—such as anonymised difficulty or completion patterns—only when real, consented data exists.
