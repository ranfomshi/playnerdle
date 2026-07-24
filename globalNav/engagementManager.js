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
    if (pendingNext) track('next_game_start', { from_game: pendingNext.from, to_game: currentGame.slug });
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

  function recommendations(completedToday) {
    const candidates = [...currentGame.related, ...games.filter(game => game.category === currentGame.category).map(game => game.slug), ...games.map(game => game.slug)];
    const unique = [...new Set(candidates)].filter(slug => slug !== currentGame.slug && gameBySlug.has(slug));
    const fresh = unique.filter(slug => !completedToday.includes(slug));
    return [...fresh, ...unique.filter(slug => !fresh.includes(slug))].slice(0, 2).map(slug => gameBySlug.get(slug));
  }

  function cardStyles() {
    return `
      :host{all:initial;display:block;margin:20px 0 4px;color:#191b20;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
      *{box-sizing:border-box}.card{border:1px solid #d9d5ca;border-radius:14px;background:#f8f6f0;padding:16px;text-align:left;box-shadow:0 8px 24px rgba(25,27,32,.08)}
      .top{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}.eyebrow{margin:0 0 4px;color:#7b493b;font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase}
      h2{margin:0;color:#191b20;font-size:19px;line-height:1.2;letter-spacing:-.02em}p{margin:6px 0 0;color:#5b5b58;font-size:14px;line-height:1.4}
      .progress{flex:0 0 auto;border-left:1px solid #d9d5ca;padding-left:14px;text-align:right}.progress strong{display:block;color:#191b20;font-size:18px}.progress span{color:#6a6965;font-size:11px}
      .choices{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:14px}a{display:flex;min-height:47px;align-items:center;justify-content:space-between;gap:8px;border:1px solid #cbc5b8;border-radius:10px;background:#fff;color:#191b20;padding:11px 12px;font-size:14px;font-weight:750;text-decoration:none}
      a:first-child{border-color:#ef5b3f;background:#ef5b3f;color:#fff}a:hover{transform:translateY(-1px);box-shadow:0 5px 14px rgba(25,27,32,.1)}small{display:block;margin-top:10px;color:#77746d;font-size:11px;line-height:1.35}
      @media(max-width:520px){.top{display:block}.progress{margin-top:10px;border:0;border-top:1px solid #d9d5ca;padding:9px 0 0;text-align:left}.progress strong,.progress span{display:inline}.choices{grid-template-columns:1fr}}
    `;
  }

  function renderRecirculation(surface, progress, streak) {
    if (document.getElementById('bludle-engagement-host')) return;
    const host = document.createElement('div');
    host.id = 'bludle-engagement-host';
    const root = host.attachShadow({ mode: 'open' });
    const choices = recommendations(progress.completed);
    const heading = choices[0] ? `Keep the run going with ${choices[0].name}.` : 'That is today’s run complete.';
    root.innerHTML = `<style>${cardStyles()}</style><section class="card" aria-labelledby="bludle-next-title">
      <div class="top"><div><p class="eyebrow">Play next</p><h2 id="bludle-next-title">${heading}</h2></div>
      <div class="progress"><strong>${progress.completed.length} played</strong><span> today · ${streak} day streak</span></div></div>
      <div class="choices">${choices.map((game, index) => `<a href="/${game.slug}/" data-slug="${game.slug}" data-position="${index + 1}"><span>${game.name}</span><span aria-hidden="true">→</span></a>`).join('')}</div>
      <small>Progress stays on this device. No account or notification permission required.</small>
    </section>`;
    root.querySelectorAll('a[data-slug]').forEach(link => link.addEventListener('click', () => {
      const next = { from: currentGame.slug, to: link.dataset.slug, position: Number(link.dataset.position), clickedAt: Date.now() };
      write(sessionStorage, PENDING_KEY, next);
      track('next_game_click', {
        from_game: currentGame.slug,
        to_game: next.to,
        recommendation_position: next.position,
        completed_today_count: progress.completed.length,
        landing_page: landing.landing_page,
        landing_channel: landing.landing_channel
      });
    }));

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
      track('next_game_complete', { from_game: pendingNext.from, to_game: currentGame.slug, time_to_complete_seconds: durationSeconds });
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
