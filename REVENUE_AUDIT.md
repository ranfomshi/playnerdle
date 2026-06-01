# Bludle Growth & Revenue Audit (May 28, 2026)

## Executive summary

Bludle already has strong foundations: broad game inventory, crawlable static pages, working sitemap/LLM guidance, blog content, and ad monetization plumbing. The biggest opportunities now are **(1) traffic compounding** and **(2) monetization per session**.

If executed well over 90 days, a realistic directional outcome is:
- **+20–45% organic sessions** (SEO + AI referral growth),
- **+12–30% ad revenue/session** (placement + viewability + session depth),
- **new non-ad revenue stream** from supporter subscriptions.

> Note: impact ranges are directional estimates and should be validated with A/B tests and analytics.

---

## Audit scope and method

This audit was based on repository-level review of site templates, SEO/AI discovery files, monetization hooks, and analytics instrumentation.

Reviewed artifacts include:
- Home page metadata + structured data (`index.html`)
- Crawl/indexing controls (`robots.txt`, `sitemap.xml`)
- AI discovery guidance (`llms.txt`, `llms-full.txt`)
- Existing revenue review baseline (`REVENUE_AUDIT.md`)

No live analytics exports (GA4/AdSense/Mixpanel) were available in-repo, so all impacts are model-based.

---

## What is already strong

1. **Discoverability foundation exists**
   - Sitemap is present and broad.
   - Canonical metadata and social cards are present.
   - LLM-specific discovery docs (`llms.txt`, `llms-full.txt`) are already live.

2. **Content surface area is large**
   - Multiple game pages with intent diversity (word, logic, colour, reaction).
   - Blog section for informational search and long-tail capture.

3. **Monetization stack exists**
   - AdSense and ads seller declaration are in place.
   - Support/donation intent already exists (can be converted into a fuller funnel).

---

## Priority opportunities: traffic growth

## 1) Build high-intent SEO landing clusters (biggest traffic lever)

**Opportunity:** Create and interlink dedicated landing pages for high-volume intents:
- “Wordle alternatives”
- “daily word games online”
- “no download brain games”
- “colour puzzle games”
- “reaction games browser”

**Why it matters:** Current structure is game-first; intent-first pages capture broader search demand and route users to games.

**Potential impact (90 days):**
- Organic clicks: **+12–30%**
- New users: **+10–25%**

**Execution notes:**
- 8–15 landing pages total.
- Each page should include: intent intro, top 3 recommendations, direct links, FAQ schema.
- Internal links from home/blog and between related intents.

---

## 2) Expand blog into conversion-focused topic program

**Opportunity:** Shift blog from occasional posts to a repeatable publishing cadence:
- 2–3 posts/week for 8 weeks.
- Mix of “best X games,” “how to improve at Y,” and “today’s puzzle strategy.”

**Why it matters:** Blog captures informational traffic and channels users into playable pages.

**Potential impact (90 days):**
- Organic impressions: **+20–60%**
- Referral traffic to game pages from blog: **+10–20%**

**Execution notes:**
- Add strong above-fold “Play now” block on each post.
- Add “Related games” cards mid/post article.

---

## 3) AI referral optimization (GEO / LLM answer inclusion)

**Opportunity:** Strengthen assistant-readable sources and keep freshness high.

**Why it matters:** AI assistants increasingly drive recommendation clicks for “best free games” style prompts.

**Potential impact (90 days):**
- AI/chat referral sessions: **+10–35%**

**Execution notes:**
- Update `llms.txt`/`llms-full.txt` at least biweekly when games/content change.
- Add intent-specific snippets and explicit top picks by user need.
- Add a lightweight “For AI assistants” page linked from footer.

---

## 4) Improve CTR from SERP and social previews

**Opportunity:** Programmatically tighten title/description patterns per game and blog page.

**Why it matters:** Bludle already ranks for relevant terms; CTR lifts are often faster than ranking lifts.

**Potential impact:**
- SERP CTR: **+5–15%** where rankings already exist.

**Execution notes:**
- Use keyword + outcome + differentiator formulas.
- Ensure unique descriptions across all game pages.

---

## Priority opportunities: revenue growth

## 5) Ad inventory tuning by template (home/game/blog)

**Opportunity:** Move from mostly passive monetization to tuned placements by page type.

**Why it matters:** Same traffic can generate more revenue with better ad density, placement, and viewability.

**Potential impact:**
- Ad impressions/session: **+10–25%**
- Ad RPM: **+8–20%**

**Execution notes:**
- Keep gameplay area clean; place ads at natural breaks.
- Reserve slot heights to reduce CLS.
- Compare Auto Ads only vs hybrid explicit placements.

---

## 6) Session-depth optimization (“Play next” loops)

**Opportunity:** Add personalized next-game recommendations after round completion.

**Why it matters:** Extra pages/session compound both ad revenue and retention.

**Potential impact:**
- Pages/session: **+8–18%**
- Revenue/session: **+6–15%**

**Execution notes:**
- Recommendation logic by category and session behavior.
- A/B test card order, copy, and CTA style.

---

## 7) Add non-ad monetization: supporter tier

**Opportunity:** Launch low-friction subscription support option:
- Ad-free experience,
- optional theme pack,
- supporter badge / early game access.

**Why it matters:** Diversifies revenue and improves margin stability.

**Potential impact (after launch):**
- Non-ad revenue share: **3–10%** in early phase.

**Execution notes:**
- Start with one annual + one monthly plan.
- Add post-win/support prompts with frequency caps.

---

## Highest-value recommendations matrix

| Recommendation | Type | Effort | Time to impact | Potential impact |
|---|---|---:|---:|---|
| Intent landing page cluster (8–15 pages) | Traffic | Medium | 3–8 weeks | +12–30% organic clicks |
| Blog cadence + conversion CTAs | Traffic | Medium | 2–6 weeks | +20–60% impressions; +10–20% game referrals |
| AI referral optimization via llms docs | Traffic | Low | 1–4 weeks | +10–35% AI referral sessions |
| Template-level ad placement tuning | Revenue | Medium | 1–4 weeks | +8–20% RPM; +10–25% ad views/session |
| Post-game “Play next” experimentation | Revenue | Medium | 2–6 weeks | +8–18% pages/session |
| Supporter tier launch | Revenue | Medium-High | 4–10 weeks | 3–10% non-ad revenue share |

---

## 90-day execution plan

### Days 1–14 (fastest wins)
1. Baseline dashboard (organic, AI referral, RPM proxy, pages/session).
2. Ad placement test on one high-traffic game template + one blog template.
3. Publish 4 new intent landing pages.
4. Publish 4 blog posts with strong game CTAs.

### Days 15–45
1. Expand landing pages to 10+.
2. Run 2 rounds of post-game recommendation A/B tests.
3. Refresh `llms.txt` and `llms-full.txt` with top intent snippets.
4. Add email capture test (optional) for returning traffic.

### Days 46–90
1. Launch supporter plan MVP.
2. Scale content publishing cadence.
3. Roll out winning ad and recommendation variants to top pages.
4. Build monthly review process (traffic + monetization + retention).

---

## KPIs to monitor weekly

### Traffic KPIs
- Organic clicks, impressions, CTR (by page type)
- AI/chat referral sessions (source/medium)
- New users per landing page cluster
- Blog → game click-through rate

### Revenue KPIs
- Ad impressions/session
- Viewability and RPM by template
- Pages/session and session duration
- Support CTA CTR, checkout start rate, conversion rate
- Non-ad revenue share

---

## Guardrails

- Protect gameplay UX: no intrusive ads inside active puzzle loops.
- Keep Core Web Vitals stable while increasing ad density.
- Frequency-cap monetization prompts.
- Optimize for long-term retention, not only short-term RPM.

