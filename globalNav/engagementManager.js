(function () {
  'use strict';

  if (window.__bludleEngagementLoaded) return;
  window.__bludleEngagementLoaded = true;

  const PROGRESS_KEY = 'bludle:daily-progress:v1';
  const STREAK_KEY = 'bludle:play-streak:v1';
  const LANDING_KEY = 'bludle:landing-context:v1';
  const PENDING_KEY = 'bludle:next-game:v1';
  const SESSION_COUNT_KEY = 'bludle:session-game-count:v1';

  const games = [
    { slug: 'werdle', name: 'Werdle', category: 'Word', related: ['glyph', 'bludle', 'codle'] },
    { slug: 'bludle', name: 'Bludle', category: 'Word', related: ['werdle', 'glyph', 'codle'] },
    { slug: 'codle', name: 'Codle', category: 'Word', related: ['bludle', 'wordmash', 'borrowedletters'] },
    { slug: 'connex', name: 'Connex', category: 'Word', related: ['wordmash', 'werdle', 'glyph'] },
    { slug: 'wordmash', name: 'Word Mash', category: 'Word', related: ['borrowedletters', 'connex', 'werdle'] },
    { slug: 'glyph', name: 'Glyph', category: 'Word', related: ['bludle', 'werdle', 'borrowedletters'] },
    { slug: 'borrowedletters', name: 'Borrowed Letters', category: 'Word', related: ['wordmash', 'glyph', 'codle'] },
    { slug: 'shiftyfades', name: 'Shifty Fades', category: 'Colour', related: ['guesshue', 'colormatch', 'tintuition'] },
    { slug: 'colormatch', name: 'Colour Match', category: 'Colour', related: ['tintuition', 'afterimage', 'shiftyfades'] },
    { slug: 'afterimage', name: 'Afterimage', category: 'Colour', related: ['colormatch', 'deadcentre', 'seequence'] },
    { slug: 'chromalock', name: 'Chroma Lock', category: 'Colour', related: ['tintuition', 'alternate', 'guesshue'] },
    { slug: 'guesshue', name: 'Guess Hue', category: 'Colour', related: ['shiftyfades', 'reaction', 'tintuition'] },
    { slug: 'tintuition', name: 'Tintuition', category: 'Colour', related: ['colormatch', 'chromalock', 'shiftyfades'] },
    { slug: 'hunt', name: 'XY Marks the Spot', category: 'Logic', related: ['deadcentre', 'trak', 'seequence'] },
    { slug: 'seequence', name: 'Seequence', category: 'Logic', related: ['afterimage', 'deadcentre', 'trak'] },
    { slug: 'deadcentre', name: 'Dead Centre', category: 'Logic', related: ['afterimage', 'hunt', 'trak'] },
    { slug: 'heardle', name: 'Heardle', category: 'Audio', related: ['werdle', 'connex', 'seequence'] },
    { slug: 'reaction', name: 'Reaction', category: 'Speed', related: ['alternate', 'guesshue', 'trak'] },
    { slug: 'alternate', name: 'Alternate', category: 'Speed', related: ['reaction', 'chromalock', 'guesshue'] },
    { slug: 'trak', name: 'Trak', category: 'Speed', related: ['deadcentre', 'reaction', 'hunt'] }
  ];

  const gameBySlug = new Map(games.map(game => [game.slug, game]));
  const handoffs = {
    werdle: { slug: 'glyph', id: 'word_to_shape', reason: 'You found a word from letter clues. Now find one from the shape its letters leave behind.' },
    glyph: { slug: 'borrowedletters', id: 'shape_to_repair', reason: 'Keep those word instincts switched on, then repair five words by moving their missing letters.' },
    borrowedletters: { slug: 'wordmash', id: 'repair_to_mash', reason: 'You have untangled misplaced letters. Next, build words quickly from a fresh set.' },
    wordmash: { slug: 'connex', id: 'build_to_group', reason: 'You have built the words. Now spot the hidden relationship that connects them.' },
    connex: { slug: 'werdle', id: 'group_to_daily', reason: 'Finish the word run with the flagship five-letter daily challenge.' },
    bludle: { slug: 'codle', id: 'colour_to_cipher', reason: 'Swap colour clues for a letter cipher while keeping the same five-letter focus.' },
    codle: { slug: 'bludle', id: 'cipher_to_colour', reason: 'You cracked the cipher. Now decode a five-letter word using only shades of blue.' },
    shiftyfades: { slug: 'guesshue', id: 'match_to_name', reason: 'You matched the colour by eye. Now see whether you can name its exact hue.' },
    guesshue: { slug: 'tintuition', id: 'name_to_instinct', reason: 'You named the hue. Next, trust your colour instinct under pressure.' },
    tintuition: { slug: 'colormatch', id: 'instinct_to_mix', reason: 'Put that colour instinct to work by mixing the target yourself.' },
    colormatch: { slug: 'afterimage', id: 'mix_to_memory', reason: 'You rebuilt a colour with controls. Now try rebuilding one from memory.' },
    afterimage: { slug: 'deadcentre', id: 'memory_to_precision', reason: 'Switch from visual memory to pure precision with one carefully placed guess.' },
    chromalock: { slug: 'alternate', id: 'timing_to_switch', reason: 'Keep the quick reactions, then handle a rule that changes beneath you.' },
    alternate: { slug: 'chromalock', id: 'switch_to_timing', reason: 'You handled the changing rule. Now stop a moving colour at exactly the right moment.' },
    hunt: { slug: 'deadcentre', id: 'coordinates_to_precision', reason: 'You narrowed down the coordinates. Now test that spatial instinct with a single shot.' },
    deadcentre: { slug: 'trak', id: 'precision_to_focus', reason: 'Carry that precision into a moving target that rewards focus and timing.' },
    seequence: { slug: 'afterimage', id: 'sequence_to_memory', reason: 'You held a sequence in mind. Next, hold a colour there after it disappears.' },
    reaction: { slug: 'alternate', id: 'reaction_to_control', reason: 'Raw speed is only the start. Next, react while the rule keeps changing.' },
    trak: { slug: 'hunt', id: 'focus_to_coordinates', reason: 'You tracked a moving target. Now narrow down a hidden point from coordinate clues.' },
    heardle: { slug: 'werdle', id: 'sound_to_word', reason: 'Move from recognising a sound to solving the flagship daily word.' }
  };
  const normalizePath = path => (path || '/').toLowerCase().replace(/\/index\.html$/, '').replace(/^\/+|\/+$/g, '');
  const currentSlug = normalizePath(window.location.pathname).split('/')[0];
  const currentGame = gameBySlug.get(currentSlug);

  function read(storage, key, fallback) {
    try {
      const value = storage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  }

  function write(storage, key, value) {
    try { storage.setItem(key, JSON.stringify(value)); } catch { /* Storage can be unavailable. */ }
  }

  function remove(storage, key) {
    try { storage.removeItem(key); } catch { /* Storage can be unavailable. */ }
  }

  function dateKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function yesterdayKey() {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return dateKey(date);
  }

  function track(eventName, properties = {}) {
    const params = Object.fromEntries(Object.entries(properties).filter(([, value]) => value !== undefined && value !== null && value !== ''));
    if (typeof window.gtag === 'function') window.gtag('event', eventName, params);
    if (window.mixpanel && typeof window.mixpanel.track === 'function') window.mixpanel.track(eventName, params);
  }

  function detectLanding() {
    const existing = read(sessionStorage, LANDING_KEY, null);
    if (existing) return existing;

    const query = new URLSearchParams(window.location.search);
    const source = (query.get('utm_source') || '').toLowerCase();
    const medium = (query.get('utm_medium') || '').toLowerCase();
    let referrer = '';
    try { referrer = document.referrer ? new URL(document.referrer).hostname.toLowerCase() : ''; } catch { /* Ignore malformed referrers. */ }

    const engines = [
      ['google', /(^|\.)google\./], ['bing', /(^|\.)bing\.com$/], ['duckduckgo', /(^|\.)duckduckgo\.com$/],
      ['yahoo', /(^|\.)search\.yahoo\.com$/], ['ecosia', /(^|\.)ecosia\.org$/]
    ];
    const matchedEngine = engines.find(([name, pattern]) => pattern.test(referrer) || source === name || source.includes(name))?.[0];
    const channel = matchedEngine || medium === 'organic' ? 'organic_search' : source || referrer ? 'referral' : 'direct';
    const landing = {
      landing_page: window.location.pathname || '/',
      landing_channel: channel,
      search_engine: matchedEngine || undefined,
      landed_at: Date.now()
    };
    write(sessionStorage, LANDING_KEY, landing);
    if (channel === 'organic_search') track('search_landing', landing);
    return landing;
  }

  const landing = detectLanding();

  function progressForToday() {
    const stored = read(localStorage, PROGRESS_KEY, null);
    return stored?.date === dateKey() ? stored : { date: dateKey(), completed: [] };
  }

  function recordCompletion(slug) {
    const progress = progressForToday();
    if (!progress.completed.includes(slug)) progress.completed.push(slug);
    write(localStorage, PROGRESS_KEY, progress);

    const savedStreak = read(localStorage, STREAK_KEY, { count: 0, lastDate: '' });
    if (savedStreak.lastDate !== dateKey()) {
      savedStreak.count = savedStreak.lastDate === yesterdayKey() ? savedStreak.count + 1 : 1;
      savedStreak.lastDate = dateKey();
      write(localStorage, STREAK_KEY, savedStreak);
    }
    return { progress, streak: savedStreak.count };
  }

  function gameFromHref(href) {
    try { return gameBySlug.get(normalizePath(new URL(href, window.location.origin).pathname).split('/')[0]); } catch { return undefined; }
  }

  document.addEventListener('click', event => {
    const link = event.target.closest?.('a[href]');
    if (!link) return;
    const destination = gameFromHref(link.href);
    if (!destination || link.closest('#bludle-engagement-host')) return;
    track('game_link_click', {
      destination_game: destination.slug,
      source_page: window.location.pathname,
      source_game: currentGame?.slug,
      landing_page: landing.landing_page,
      landing_channel: landing.landing_channel
    });
  }, true);

  if (!currentGame) return;

  let started = false;
  let completed = false;
  let startedAt = 0;
  let pendingNext = read(sessionStorage, PENDING_KEY, null);

  if (pendingNext?.to === currentGame.slug) {
    track('next_game_arrival', {
      from_game: pendingNext.from,
      to_game: pendingNext.to,
      recommendation_position: pendingNext.position,
      recommendation_id: pendingNext.recommendationId,
      landing_page: landing.landing_page,
      landing_channel: landing.landing_channel
    });
  } else if (pendingNext) {
    remove(sessionStorage, PENDING_KEY);
    pendingNext = null;
  }

  track('game_page_view', {
    game_name: currentGame.slug,
    game_category: currentGame.category.toLowerCase(),
    landing_page: landing.landing_page,
    landing_channel: landing.landing_channel,
    search_engine: landing.search_engine,
    is_next_game: Boolean(pendingNext)
  });

  function startGame(trigger = 'interaction') {
    if (started) return;
    started = true;
    startedAt = performance.now();
    const sessionGameNumber = Number(sessionStorage.getItem(SESSION_COUNT_KEY) || 0) + 1;
    try { sessionStorage.setItem(SESSION_COUNT_KEY, String(sessionGameNumber)); } catch { /* Ignore. */ }
    track('game_start', {
      game_name: currentGame.slug,
      game_category: currentGame.category.toLowerCase(),
      start_trigger: trigger,
      session_game_number: sessionGameNumber,
      landing_page: landing.landing_page,
      landing_channel: landing.landing_channel,
      search_engine: landing.search_engine,
      is_next_game: Boolean(pendingNext),
      previous_game: pendingNext?.from
    });
    if (pendingNext) track('next_game_start', { from_game: pendingNext.from, to_game: currentGame.slug, recommendation_id: pendingNext.recommendationId });
    scheduleCompletionCheck();
  }

  function isMeaningfulInteraction(target) {
    if (!(target instanceof Element)) return false;
    if (target.closest('#navbar-container, .bludle-discovery, .related-games, .related-card, .ad-card, .ad-stack, [class*="advert"], [id*="help" i], [id*="stats" i]')) return false;
    const control = target.closest('button, input, select, textarea, canvas, [role="button"], [data-key], .cell, .tile');
    if (!control || control.closest('a[href]')) return false;
    const label = (control.textContent || control.getAttribute('aria-label') || '').trim().toLowerCase();
    return !/(share|view.*result|close|back to|how to|statistics|sound)/.test(label);
  }

  document.addEventListener('pointerdown', event => {
    if (isMeaningfulInteraction(event.target)) startGame('pointer');
  }, true);
  document.addEventListener('submit', event => {
    if (!event.target.closest('.bludle-discovery')) startGame('submit');
  }, true);
  document.addEventListener('keydown', event => {
    if (event.ctrlKey || event.metaKey || event.altKey || event.key === 'Escape' || event.key === 'Tab') return;
    const target = event.target;
    if (target instanceof Element && target.closest('#navbar-container, dialog[id*="help" i], dialog[id*="stats" i]')) return;
    startGame('keyboard');
  }, true);

  function visible(selector) {
    const element = document.querySelector(selector);
    if (!element) return null;
    if (element instanceof HTMLDialogElement) return element.open ? element : null;
    if (element.hidden) return null;
    const style = getComputedStyle(element);
    return style.display !== 'none' && style.visibility !== 'hidden' ? element : null;
  }

  function textMatches(selector, pattern) {
    const element = document.querySelector(selector);
    return element && pattern.test(element.textContent || '') ? element : null;
  }

  const completionRules = {
    werdle: () => textMatches('#attempt-label', /solved in|round complete/i) && (visible('#stats-dialog') || document.querySelector('.game-card')),
    bludle: () => visible('#resultDialog'),
    codle: () => visible('#result-dialog'),
    connex: () => visible('#gameOverModal'),
    wordmash: () => visible('#result'),
    glyph: () => visible('.complete-state'),
    borrowedletters: () => visible('#result-dialog'),
    shiftyfades: () => visible('#gameOverModal') || visible('#winModal'),
    colormatch: () => visible('#result-dialog'),
    afterimage: () => textMatches('#game-status', /daily challenge complete/i) && (visible('#result-dialog') || document.querySelector('.game-card')),
    chromalock: () => visible('#gameover-dialog'),
    guesshue: () => visible('#result-dialog'),
    tintuition: () => visible('#gameover-dialog'),
    hunt: () => visible('#result-dialog'),
    seequence: () => visible('#gameover-dialog'),
    deadcentre: () => textMatches('#game-status', /daily challenge complete/i) && (visible('#result-dialog') || document.querySelector('.game-card')),
    heardle: () => visible('#statsModal'),
    reaction: () => textMatches('#gameButton', /played today/i)?.closest('.reaction-card'),
    alternate: () => visible('#result-dialog'),
    trak: () => visible('#gameover-dialog')
  };

  function inferOutcome(surface) {
    const copy = (surface?.textContent || '').toLowerCase();
    if (/(out of guesses|signal lost|game over|went cold|false start|just missed|attempts used)/.test(copy)) return 'lost';
    if (/(solved|decoded|brilliant|complete|found|perfect|matched|nailed|won)/.test(copy)) return 'completed';
    return 'finished';
  }

  function recommendation(completedToday) {
    const curated = handoffs[currentGame.slug];
    const candidates = [curated?.slug, ...currentGame.related, ...games.filter(game => game.category === currentGame.category).map(game => game.slug), ...games.map(game => game.slug)];
    const unique = [...new Set(candidates)].filter(slug => slug && slug !== currentGame.slug && gameBySlug.has(slug));
    const slug = unique.find(candidate => !completedToday.includes(candidate)) || unique[0];
    const game = gameBySlug.get(slug);
    if (!game) return null;
    const isCurated = slug === curated?.slug;
    return {
      game,
      id: isCurated ? curated.id : `${currentGame.slug}_to_${slug}_fresh`,
      reason: isCurated ? curated.reason : `A fresh ${game.category.toLowerCase()} challenge, chosen to keep today's run moving.`,
      strategy: isCurated ? 'curated_pair' : 'fresh_fallback'
    };
  }

  function cardStyles() {
    return `
      :host{all:initial;display:block;margin:20px 0 4px;color:#191b20;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
      *{box-sizing:border-box}.card{overflow:hidden;border:1px solid #dce1ec;border-radius:16px;background:#fff;text-align:left;box-shadow:0 8px 20px rgba(22,41,95,.1)}
      .top{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding:18px 18px 14px}.eyebrow{margin:0 0 5px;color:#1c3993;font-size:11px;font-weight:800;letter-spacing:.1em;text-transform:uppercase}
      h2{margin:0;color:#141928;font-size:21px;line-height:1.2;letter-spacing:-.025em}.reason{max-width:52ch;margin:7px 0 0;color:#4e5875;font-size:14px;line-height:1.45}
      .progress{flex:0 0 auto;border-left:1px solid #dce1ec;padding-left:14px;text-align:right}.progress strong{display:block;color:#141928;font-size:18px}.progress span{color:#707a99;font-size:11px}
      .next{display:flex;align-items:center;justify-content:space-between;gap:18px;margin:0 18px 18px;padding:14px 15px;border-radius:10px;background:#2249be;color:#fff;text-decoration:none;transition:background 150ms ease,transform 150ms ease}.next:hover{background:#1c3993;transform:translateY(-1px)}.next:focus-visible{outline:3px solid #82a6f3;outline-offset:3px}
      .next strong{display:block;font-size:16px}.next small{display:block;margin-top:2px;color:#d9e4fc;font-size:11px;font-weight:500}.action{flex:0 0 auto;font-size:13px;font-weight:800}
      .disclosure{margin:0;padding:11px 18px;border-top:1px solid #ebeef5;background:#f6f8fc;color:#707a99;font-size:11px;line-height:1.35}
      @media(max-width:520px){.top{display:block}.progress{margin-top:12px;border:0;border-top:1px solid #dce1ec;padding:10px 0 0;text-align:left}.progress strong,.progress span{display:inline}.next{align-items:flex-end}.action{font-size:0}.action::after{content:'Go';font-size:13px}}
      @media(prefers-reduced-motion:reduce){.next{transition:none}}
    `;
  }

  function renderRecirculation(surface, progress, streak) {
    if (document.getElementById('bludle-engagement-host')) return;
    const host = document.createElement('div');
    host.id = 'bludle-engagement-host';
    const root = host.attachShadow({ mode: 'open' });
    const next = recommendation(progress.completed);
    if (!next) return;
    root.innerHTML = `<style>${cardStyles()}</style><section class="card" aria-labelledby="bludle-next-title">
      <div class="top"><div><p class="eyebrow">Your next game</p><h2 id="bludle-next-title">Keep the run going with ${next.game.name}.</h2><p class="reason">${next.reason}</p></div>
      <div class="progress"><strong>${progress.completed.length} played</strong><span> today &middot; ${streak} day streak</span></div></div>
      <a class="next" href="/${next.game.slug}/" data-slug="${next.game.slug}" data-recommendation-id="${next.id}"><span><strong>Play ${next.game.name}</strong><small>${next.game.category} challenge</small></span><span class="action">Start next &rarr;</span></a>
      <p class="disclosure">Progress stays on this device. No account or notification permission required.</p>
    </section>`;
    track('next_game_recommendation_view', {
      from_game: currentGame.slug,
      to_game: next.game.slug,
      recommendation_id: next.id,
      recommendation_strategy: next.strategy,
      completed_today_count: progress.completed.length,
      landing_page: landing.landing_page,
      landing_channel: landing.landing_channel
    });
    root.querySelector('a[data-slug]').addEventListener('click', event => {
      const link = event.currentTarget;
      const pending = { from: currentGame.slug, to: link.dataset.slug, position: 1, recommendationId: link.dataset.recommendationId, clickedAt: Date.now() };
      write(sessionStorage, PENDING_KEY, pending);
      track('next_game_click', {
        from_game: currentGame.slug,
        to_game: pending.to,
        recommendation_position: 1,
        recommendation_id: pending.recommendationId,
        recommendation_strategy: next.strategy,
        completed_today_count: progress.completed.length,
        landing_page: landing.landing_page,
        landing_channel: landing.landing_channel
      });
    });

    const target = surface?.querySelector?.('.modal-content') || surface || document.querySelector('main') || document.body;
    target.append(host);
  }

  function completeGame(surface, details = {}) {
    if (completed) return;
    if (!started) startGame(details.trigger || 'completion');
    completed = true;
    const { progress, streak } = recordCompletion(currentGame.slug);
    const durationSeconds = Math.max(1, Math.round((performance.now() - startedAt) / 1000));
    const properties = {
      game_name: currentGame.slug,
      game_category: currentGame.category.toLowerCase(),
      outcome: details.outcome || inferOutcome(surface),
      time_to_complete_seconds: durationSeconds,
      completed_today_count: progress.completed.length,
      play_streak_days: streak,
      landing_page: landing.landing_page,
      landing_channel: landing.landing_channel,
      search_engine: landing.search_engine,
      is_next_game: Boolean(pendingNext),
      previous_game: pendingNext?.from
    };
    track('game_complete', properties);
    if (pendingNext) {
      track('next_game_complete', { from_game: pendingNext.from, to_game: currentGame.slug, recommendation_id: pendingNext.recommendationId, time_to_complete_seconds: durationSeconds });
      remove(sessionStorage, PENDING_KEY);
      pendingNext = null;
    }
    renderRecirculation(surface, progress, streak);
    window.dispatchEvent(new CustomEvent('bludle:game-complete', { detail: properties }));
  }

  let checkScheduled = false;
  function checkForCompletion() {
    checkScheduled = false;
    if (!started || completed) return;
    const surface = completionRules[currentGame.slug]?.();
    if (surface) completeGame(surface);
  }

  function scheduleCompletionCheck() {
    if (checkScheduled || completed) return;
    checkScheduled = true;
    requestAnimationFrame(checkForCompletion);
  }

  const observer = new MutationObserver(scheduleCompletionCheck);
  observer.observe(document.documentElement, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['open', 'hidden', 'style', 'class', 'disabled'] });

  window.BludleEngagement = Object.freeze({
    start: details => startGame(details?.trigger || 'explicit'),
    complete: details => completeGame(details?.surface || document.querySelector('main'), details || {}),
    track
  });
}());
