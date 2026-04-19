# Bludle Revenue Audit (April 19, 2026)

## Executive summary

Bludle has a strong base for ad monetization (sitewide AdSense script, broad catalog, internal cross-linking, and fresh SEO/blog content), but revenue is likely being left on the table because ad inventory appears under-configured and conversion funnels are under-instrumented.

The fastest revenue gains should come from:

1. **Ad inventory optimization** (confirm Auto Ads is active and add explicit placements on highest-RPM templates).
2. **Session depth improvements** (stronger “play next” loops + event-level tracking for game-to-game transitions).
3. **Alternative monetization layer** (premium no-ads/supporter tier + clearer donation CTAs where intent is highest).

---

## Scope and method

This audit is based on repository review of:

- Home and navigation templates.
- Core game templates.
- Blog and supporting content.
- Analytics and ad integration files.

No production traffic data is present in-repo, so projected impact is directional and should be validated with A/B testing.

---

## What is working well

- **AdSense is installed broadly** via the shared publisher script across the site.
- **Authorized seller declaration is in place** (`ads.txt` configured).
- **Cross-promotion exists** (related games and global nav links).
- **Content marketing exists and is current** (blog with recent 2026 posts).
- **Dual analytics stack is present** (GA + Mixpanel plumbing available for behavior events).

These fundamentals mean you can improve revenue without rebuilding the stack.

---

## Key revenue gaps

## 1) Ad implementation may be too passive

Observation:
- I found broad inclusion of the AdSense script, but no explicit `<ins class="adsbygoogle">` placements or slot config in templates reviewed.

Risk:
- If Auto Ads is not tuned aggressively, you may be serving fewer high-value impressions than possible.
- Even with Auto Ads active, explicit placements around high-attention areas usually improve controllability and RPM.

Recommendation:
- Verify current Auto Ads settings in AdSense.
- Add explicit ad units (responsive display + in-article/in-feed where appropriate) to:
  - home page between game rows,
  - below game result/state change points,
  - blog post body and near post-end CTA.
- Keep CLS low with reserved ad containers.

---

## 2) Limited monetization beyond ads and donation

Observation:
- Current secondary monetization appears to be mainly Buy Me a Coffee placement.

Risk:
- Revenue concentration in one ad network + optional tip flow limits upside.

Recommendation:
- Add a **supporter tier** (e.g., no ads, custom themes, streak/history exports, early access games).
- Offer annual plan with clear value framing.
- Add lightweight checkout/paywall provider later (Paddle/Lemon Squeezy/Stripe hosted checkout).

---

## 3) Funnel instrumentation is incomplete for revenue decisions

Observation:
- There is event tracking for some interactions, but no clear standardized events for ad-view context, session depth milestones, or outbound donation conversion funnel.

Risk:
- Hard to identify which game templates and traffic sources drive highest ARPU and retention.

Recommendation:
- Define a core event schema:
  - `session_start`, `game_start`, `game_complete`, `play_next_click`,
  - `ad_eligible_view`, `support_cta_view`, `support_cta_click`, `support_checkout_start`, `support_conversion`.
- Send shared properties: `game_name`, `mode`, `device_type`, `traffic_source`, `session_game_count`, `country`.
- Build one dashboard with RPM proxy metrics and session-depth cohorts.

---

## 4) Cross-sell UX exists, but can be monetization-optimized

Observation:
- Related games are injected globally, and home supports filtering/search.

Risk:
- Current “related games” behavior is generic and not clearly optimized for yield (e.g., moving users into higher-RPM pages or longer-session modes).

Recommendation:
- Use rule-based recommendations first:
  - after speed game → suggest short speed/colour game,
  - after word game fail/win → suggest “quick rematch” + one adjacent word game,
  - prioritize games with stronger completion loops.
- Track recommendation CTR and downstream session length.

---

## 5) Blog monetization surface is underdeveloped

Observation:
- Blog index and posts help SEO and discovery, but monetization touchpoints are limited.

Recommendation:
- Add in-content ad placements and sticky footer ad tests on article templates.
- Add contextual “Play now” and “Try next game” CTAs in every post.
- Add newsletter capture (optional) to re-activate users at near-zero CAC.

---

## 6) Performance and script load pressure can suppress ad yield

Observation:
- Some pages load multiple third-party scripts (analytics, logging, ads), and some pages carry substantial inline CSS/JS.

Risk:
- Slower first interaction can lower session depth and ad viewability.

Recommendation:
- Audit Core Web Vitals page-by-page.
- Delay non-critical scripts until idle where possible.
- Keep ad containers stable to avoid layout shifts.

---

## Prioritized roadmap (90 days)

## Days 1–14 (highest certainty)

1. Confirm current AdSense Auto Ads setup and reporting splits by page type (home/game/blog).
2. Implement standardized revenue/funnel event taxonomy in GA + Mixpanel.
3. Add explicit, low-risk ad placements on blog templates + one game template.
4. Add stronger support CTA variants (end-of-game modal + footer card).

**Primary KPI targets:**
- +10–20% ad impressions/session,
- +5–10% pages/session,
- measurable support-CTA CTR baseline.

## Days 15–45

1. A/B test “play next” module variants after game completion.
2. Add explicit ad placements on top 3 traffic games.
3. Launch email capture test (exit-intent or post-win panel).
4. Start simple supporter MVP waitlist or checkout landing page.

**Primary KPI targets:**
- +10–15% session depth,
- +8–15% ad RPM on tested templates,
- first non-ad conversion baseline.

## Days 46–90

1. Release paid supporter plan (ad-free + perks).
2. Build monetization dashboard (sessions, eCPM proxy, ARPDAU proxy, conversion).
3. Expand SEO articles targeting “game alternatives” and “daily puzzle strategy” clusters.
4. Introduce event-driven recommendation ranking (not static list order).

**Primary KPI targets:**
- non-ad revenue share >5%,
- sustained session depth lift,
- diversified monetization risk.

---

## Experiment backlog (ranked)

1. **Explicit ad units vs Auto Ads only** on game pages.
2. **End-of-game modal CTA**: “Play next” vs “Support Bludle” vs mixed layout.
3. **Donation CTA copy tests**: “Keep games free” vs “Remove ads + support”.
4. **Recommendation logic tests**: category-match vs popularity vs completion-rate based.
5. **Blog template monetization**: in-content ad density variants.
6. **Supporter pricing tests**: monthly vs annual anchoring.

---

## Risks and guardrails

- Do not over-insert ads on puzzle interaction screens; protect gameplay quality.
- Keep ad density compliant with Google policy and user experience best practices.
- Avoid modal spam; frequency cap all monetization prompts.
- Measure retention alongside revenue so short-term RPM gains don’t degrade DAU.

---

## Implementation checklist

- [ ] Define canonical event schema and implement consistently.
- [ ] Create template map by monetization role: discovery (home/blog), gameplay (game pages), conversion (support).
- [ ] Add 2–3 explicit ad placements with reserved space.
- [ ] Add post-game recommendation module A/B tests.
- [ ] Add support funnel tracking end-to-end.
- [ ] Stand up weekly monetization review dashboard.

---

## Repo-specific evidence reviewed

- Sitewide AdSense loader is present across major templates.
- `ads.txt` includes direct Google seller record.
- Home has categorized game discovery and a support tile.
- Navigation script injects related games and share button.
- Mixpanel + GA event hooks are partially implemented.

