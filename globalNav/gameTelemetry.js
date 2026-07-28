(function () {
  'use strict';

  if (window.BludleGameTelemetry) return;

  const SCHEMA_VERSION = 2;
  const formats = {
    werdle: 'hybrid', bludle: 'session', codle: 'daily', connex: 'session', wordmash: 'daily',
    glyph: 'daily', borrowedletters: 'daily', shiftyfades: 'session', colormatch: 'session',
    afterimage: 'daily', chromalock: 'session', guesshue: 'session', tintuition: 'session',
    hunt: 'session', seequence: 'session', deadcentre: 'daily', heardle: 'session',
    reaction: 'daily', alternate: 'session', trak: 'session'
  };

  const text = selector => document.querySelector(selector)?.textContent?.trim() || '';
  const numericText = value => {
    const match = String(value || '').replace(/,/g, '').match(/-?\d+(?:\.\d+)?/);
    return match ? Number(match[0]) : undefined;
  };
  const number = selector => numericText(text(selector));
  const count = selector => document.querySelectorAll(selector).length;
  const sumNumbers = values => {
    const present = values.filter(value => value !== undefined);
    return present.length ? present.reduce((total, value) => total + value, 0) : undefined;
  };
  const mode = selector => text(selector).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 40) || undefined;
  const milliseconds = selector => {
    const value = number(selector);
    if (value === undefined) return undefined;
    return /(?:^|\s)s(?:ec(?:ond)?s?)?\b/i.test(text(selector)) ? Math.round(value * 1000) : Math.round(value);
  };
  const filledRows = (rowSelector, tileSelector) => [...document.querySelectorAll(rowSelector)]
    .filter(row => [...row.querySelectorAll(tileSelector)].some(tile => tile.textContent.trim())).length;

  function puzzleDay() {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit'
    }).format(new Date());
  }

  const adapters = {
    werdle: () => ({
      game_mode: document.querySelector('[data-mode][aria-pressed="true"]')?.dataset.mode,
      attempts_used: filledRows('#board .board-row', '.tile')
    }),
    bludle: () => ({ attempts_used: filledRows('#board .guess-row', '.guess-tile') }),
    codle: () => ({
      score: number('#result-score'), attempts_used: number('#result-attempts'),
      streak: number('#result-streak'), rule_name: mode('#rule-name'), difficulty: mode('#rule-level')
    }),
    connex: () => ({
      groups_solved: number('#groups-found'), lives_remaining: number('#lives'),
      mistakes_used: Math.max(0, 5 - (number('#lives') ?? 5))
    }),
    wordmash: () => ({ attempts_used: number('#attempts-count') }),
    glyph: () => ({
      score: number('#final-score'), rounds_completed: count('#round-pips span') || number('#round-value')
    }),
    borrowedletters: () => ({
      score: number('#final-score'), attempts_used: number('#passes-used'), hints_used: number('#hints-used')
    }),
    shiftyfades: () => ({ level_reached: number('#finalLevel') ?? number('#level') }),
    colormatch: () => ({
      error_red: number('#result-red'), error_green: number('#result-green'), error_blue: number('#result-blue'),
      error_total: sumNumbers([number('#result-red'), number('#result-green'), number('#result-blue')])
    }),
    afterimage: () => ({
      accuracy_percent: number('#final-accuracy'), error_total: number('#final-error'),
      error_red: number('#red-difference'), error_green: number('#green-difference'), error_blue: number('#blue-difference'),
      rounds_completed: count('#round-pips span')
    }),
    chromalock: () => ({
      level_reached: number('#final-level') ?? number('#level'), accuracy_percent: number('#accuracyText'),
      error_degrees: number('#differenceText'), lives_remaining: number('#lives')
    }),
    guesshue: () => ({
      streak: number('#result-streak'), average_response_ms: milliseconds('#result-average'), difficulty: mode('#level-value')
    }),
    tintuition: () => ({ level_reached: number('#final-level'), score: number('#final-score') }),
    hunt: () => ({ difficulty: mode('#mode-label'), scans_remaining: number('#scan-label') }),
    seequence: () => ({
      level_reached: number('#final-level'), score: number('#final-score'), streak: number('#streak'),
      sequence_length: number('#result-length')
    }),
    deadcentre: () => ({
      accuracy_percent: number('#final-accuracy'), average_distance_percent: number('#final-distance'),
      rounds_completed: count('#round-pips span')
    }),
    heardle: () => ({ level_reached: number('#levelDisplay'), lives_remaining: number('#livesDisplay') }),
    reaction: () => ({ reaction_ms: numericText(localStorage.getItem('reactionTime')) }),
    alternate: () => ({
      score: number('#final-score'), average_response_ms: milliseconds('#final-average'),
      fastest_response_ms: milliseconds('#final-fastest')
    }),
    trak: () => ({ level_reached: number('#summary-level'), rounds_completed: number('#summary-hits') })
  };

  function clean(properties) {
    return Object.fromEntries(Object.entries(properties).filter(([, value]) =>
      value !== undefined && value !== null && value !== '' &&
      (typeof value !== 'number' || Number.isFinite(value))
    ));
  }

  function context(slug) {
    const day = puzzleDay();
    return {
      telemetry_schema_version: SCHEMA_VERSION,
      puzzle_day: day,
      puzzle_id: `${slug}:${day}`,
      game_format: formats[slug] || 'session'
    };
  }

  function snapshot(slug) {
    let metrics = {};
    try { metrics = adapters[slug]?.() || {}; } catch { /* A missing optional game element should not affect play. */ }
    return clean({ ...context(slug), ...metrics });
  }

  document.documentElement.dataset.bludleTelemetrySchema = String(SCHEMA_VERSION);
  window.BludleGameTelemetry = Object.freeze({ context, snapshot });
}());
