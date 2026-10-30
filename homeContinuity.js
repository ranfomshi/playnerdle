const GAMES = [
  { slug: 'werdle', name: 'Werdle', limit: 5 },
  { slug: 'wordbridge', name: 'Word Bridge', limit: 3 },
  { slug: 'wordmash', name: 'Word Mash', limit: 6 },
];

function read(storage, key) {
  try { return JSON.parse(storage.getItem(key) || 'null'); } catch { return null; }
}

function londonDay(now) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(now);
}

function utcDay(now) { return now.toISOString().slice(0, 10); }

function localDay(now) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function attemptCount(value, limit) {
  return Array.isArray(value) && value.length <= limit ? value.length : 0;
}

// Only these daily modes save an in-progress attempt. Do not infer resumability
// from the shared game_start event or from an unfinished game on another day.
export function getHomeContinuity(storage, now = new Date()) {
  const london = londonDay(now);
  const utc = utcDay(now);
  const werdle = read(storage, 'werdle:v2');
  const bridge = read(storage, `wordBridge:${london}`);
  const mash = read(storage, `wordmash-state-${utc}`);
  const progress = read(storage, 'bludle:daily-progress:v1');
  const lastStart = read(storage, 'bludle:last-game-start:v1');
  const states = {
    werdle: {
      attempts: werdle?.daily?.date === london ? attemptCount(werdle.daily.guesses, 5) : 0,
      finished: werdle?.daily?.date === london &&
        (['won', 'lost'].includes(werdle.daily.status) || werdle.daily.guesses?.length >= 5),
    },
    wordbridge: {
      attempts: attemptCount(bridge?.attempts, 3),
      finished: bridge?.finished === true || bridge?.attempts?.length >= 3,
    },
    wordmash: {
      attempts: attemptCount(mash?.attempts, 6),
      finished: mash?.solved === true || (Array.isArray(mash?.attempts) && mash.attempts.length >= 6),
    },
  };
  const completed = new Set(progress?.date === localDay(now) && Array.isArray(progress.completed)
    ? progress.completed : []);
  const hasPlayed = (Number.isFinite(lastStart?.at) && lastStart.at <= now.getTime()) ||
    Number(werdle?.stats?.played) > 0 ||
    (Array.isArray(progress?.completed) && progress.completed.length > 0) ||
    Object.values(states).some(state => state.attempts > 0);
  if (!hasPlayed) return null;

  const resumable = GAMES.filter(game => {
    const state = states[game.slug];
    return state.attempts > 0 && state.attempts < game.limit && !state.finished && !completed.has(game.slug);
  }).sort((a, b) => Number(b.slug === lastStart?.slug) - Number(a.slug === lastStart?.slug));
  const unplayed = [...GAMES.slice(1), GAMES[0]].filter(game => states[game.slug].attempts === 0 &&
    !states[game.slug].finished && !completed.has(game.slug));
  const picks = [
    ...resumable.map(game => ({
      ...game, kind: 'resume', attemptsSaved: states[game.slug].attempts,
      detail: `${game.limit - states[game.slug].attempts} ${game.limit - states[game.slug].attempts === 1 ? 'try' : 'tries'} left`,
    })),
    ...unplayed.map(game => ({ ...game, kind: 'unplayed_daily', attemptsSaved: 0, detail: 'Today’s puzzle' })),
  ].slice(0, 2);
  return picks;
}
