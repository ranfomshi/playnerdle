const ROUND_COUNT = 10;
const TODAY_KEY = 'secondSightToday';
const HISTORY_KEY = 'secondSightHistory';

const dimensions = {
  lightness: {
    directions: ['lighter', 'darker'],
    explanation: 'Only lightness changed; the colour direction and intensity stayed fixed.',
  },
  chroma: {
    directions: ['more vivid', 'more muted'],
    explanation: 'Only intensity changed; vivid moves away from grey while muted moves towards it.',
  },
  redGreen: {
    directions: ['redder', 'greener'],
    explanation: 'Only the red–green colour axis changed; brightness stayed fixed.',
  },
  yellowBlue: {
    directions: ['yellower', 'bluer'],
    explanation: 'Only the yellow–blue colour axis changed; brightness stayed fixed.',
  },
};

const schedule = [
  ['lightness', .105, 1250, 260],
  ['chroma', .068, 1150, 320],
  ['redGreen', .085, 1050, 380],
  ['yellowBlue', .078, 950, 460],
  ['lightness', .050, 850, 550],
  ['chroma', .038, 780, 650],
  ['redGreen', .055, 700, 760],
  ['yellowBlue', .050, 630, 880],
  ['lightness', .026, 570, 1000],
  ['mixed', .022, 500, 1150],
];

const DIRECTIONAL_DELTA_FLOOR = .046;

const els = Object.fromEntries([
  'round-value', 'score-value', 'streak-value', 'phase-pill', 'first-dot', 'second-dot',
  'colour-window', 'colour-field', 'interference', 'stage-copy', 'round-number', 'phase-title',
  'phase-copy', 'start-round', 'exposure-label', 'exposure-name', 'exposure-count', 'answer-panel',
  'answer-grid', 'reveal-panel', 'reveal-kicker', 'reveal-title', 'round-points', 'first-reveal',
  'second-reveal', 'explanation', 'next-round', 'round-track', 'game-status', 'help-dialog',
  'stats-dialog', 'result-dialog', 'stats-button', 'help-button', 'share-button', 'result-mark',
  'result-title', 'result-summary', 'final-score', 'final-accuracy', 'best-streak', 'final-lightness',
  'final-chroma', 'final-hue', 'lightness-bar', 'chroma-bar', 'hue-bar', 'round-pips',
  'games-played', 'record-average', 'record-best', 'current-streak', 'snackbar',
].map(id => [id, document.getElementById(id)]));

const dateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function hashSeed(value) {
  let hash = 2166136261;
  for (const char of value) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function randomFactory(seed) {
  return () => {
    seed += 0x6D2B79F5;
    let value = seed;
    value = Math.imul(value ^ value >>> 15, value | 1);
    value ^= value + Math.imul(value ^ value >>> 7, value | 61);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}

function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
function colourString(colour) { return `oklab(${(colour.l * 100).toFixed(2)}% ${colour.a.toFixed(4)} ${colour.b.toFixed(4)})`; }
function read(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } }
function write(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Storage is optional. */ } }

function trackAnswer(properties) {
  if (window.BludleEngagement?.gameEvent) {
    window.BludleEngagement.gameEvent('second_sight_answer', properties);
    return;
  }
  window.__bludleGameplayEventQueue = window.__bludleGameplayEventQueue || [];
  window.__bludleGameplayEventQueue.push({ eventName: 'second_sight_answer', properties });
}

function generateRounds() {
  const random = randomFactory(hashSeed(`second-sight-${dateKey()}`));
  return schedule.map(([scheduledDimension, delta, exposure, gap], index) => {
    const dimension = scheduledDimension === 'mixed'
      ? ['lightness', 'chroma', 'redGreen', 'yellowBlue'][Math.floor(random() * 4)]
      : scheduledDimension;
    const isDirectional = dimension === 'redGreen' || dimension === 'yellowBlue';
    const effectiveDelta = isDirectional ? Math.max(delta, DIRECTIONAL_DELTA_FLOOR) : delta;
    const directionIndex = random() < .5 ? 0 : 1;
    const angle = random() * Math.PI * 2;
    // Directional rounds use a safer central gamut so browser gamut mapping
    // cannot flatten the very red/green/yellow/blue change being tested.
    const chroma = isDirectional ? .040 + random() * .055 : .055 + random() * .085;
    const first = {
      l: isDirectional ? .50 + random() * .20 : .47 + random() * .28,
      a: Math.cos(angle) * chroma,
      b: Math.sin(angle) * chroma,
    };
    const second = { ...first };
    if (dimension === 'lightness') second.l = clamp(first.l + (directionIndex === 0 ? effectiveDelta : -effectiveDelta), .30, .88);
    if (dimension === 'chroma') {
      const length = Math.hypot(first.a, first.b);
      const target = clamp(length + (directionIndex === 0 ? effectiveDelta : -effectiveDelta), .018, .22);
      second.a = first.a / length * target;
      second.b = first.b / length * target;
    }
    if (dimension === 'redGreen') second.a = clamp(first.a + (directionIndex === 0 ? effectiveDelta : -effectiveDelta), -.22, .22);
    if (dimension === 'yellowBlue') second.b = clamp(first.b + (directionIndex === 0 ? effectiveDelta : -effectiveDelta), -.22, .22);
    return {
      index, dimension, answer: dimensions[dimension].directions[directionIndex], delta: effectiveDelta,
      exposure, gap, first, second,
    };
  });
}

const rounds = generateRounds();
let state = read(TODAY_KEY, null);
if (!state || state.date !== dateKey()) {
  state = { date: dateKey(), round: 0, score: 0, streak: 0, bestStreak: 0, answers: [], complete: false };
}
let choiceStartedAt = 0;
let timer = null;

function setPhase(phase) {
  els['colour-window'].hidden = ['answer', 'reveal'].includes(phase);
  els['stage-copy'].hidden = phase !== 'ready';
  els['answer-panel'].hidden = phase !== 'answer';
  els['reveal-panel'].hidden = phase !== 'reveal';
  els['exposure-label'].hidden = !['first', 'second'].includes(phase);
  els['colour-field'].classList.toggle('visible', ['first', 'second'].includes(phase));
  els.interference.classList.toggle('visible', phase === 'gap');
  els['phase-pill'].textContent = ({ ready: 'Ready', first: 'First colour', gap: 'Hold it', second: 'Second colour', answer: 'Your call', reveal: 'Revealed' })[phase];
}

function renderProgress() {
  els['round-value'].textContent = `${Math.min(state.round + 1, ROUND_COUNT)} / ${ROUND_COUNT}`;
  els['score-value'].textContent = state.score.toLocaleString('en-GB');
  els['streak-value'].textContent = state.streak;
  els['round-number'].textContent = Math.min(state.round + 1, ROUND_COUNT);
  els['round-track'].innerHTML = Array.from({ length: ROUND_COUNT }, (_, index) => {
    const result = state.answers[index];
    const className = result ? (result.correct ? 'correct' : 'incorrect') : index === state.round && !state.complete ? 'current' : '';
    return `<span class="${className}" aria-label="Round ${index + 1}${result ? (result.correct ? ': correct' : ': incorrect') : ''}"></span>`;
  }).join('');
}

function wait(duration) { return new Promise(resolve => { timer = window.setTimeout(resolve, duration); }); }

async function playSequence() {
  const round = rounds[state.round];
  els['start-round'].disabled = true;
  els['first-dot'].className = 'active';
  els['second-dot'].className = '';
  setPhase('first');
  els['colour-field'].style.background = colourString(round.first);
  els['exposure-name'].textContent = 'First colour';
  els['exposure-count'].textContent = '1';
  els['game-status'].textContent = 'First colour showing.';
  await wait(round.exposure);

  els['first-dot'].className = 'seen';
  setPhase('gap');
  els['game-status'].textContent = 'Hold the first colour in mind.';
  await wait(round.gap);

  els['second-dot'].className = 'active';
  setPhase('second');
  els['colour-field'].style.background = colourString(round.second);
  els['exposure-name'].textContent = 'Second colour';
  els['exposure-count'].textContent = '2';
  els['game-status'].textContent = 'Second colour showing.';
  await wait(round.exposure);

  els['second-dot'].className = 'seen';
  showAnswers(round);
}

function answerOptions(round) {
  const all = Object.values(dimensions).flatMap(item => item.directions);
  const optionCount = state.round < 2 ? 4 : state.round < 5 ? 6 : 8;
  const ownPair = dimensions[round.dimension].directions;
  const random = randomFactory(hashSeed(`${dateKey()}-${state.round}-answers`));
  const others = all.filter(item => !ownPair.includes(item)).sort(() => random() - .5);
  return [...ownPair, ...others.slice(0, optionCount - 2)].sort(() => random() - .5);
}

function showAnswers(round) {
  setPhase('answer');
  const options = answerOptions(round);
  els['answer-grid'].innerHTML = options.map((answer, index) => `<button class="answer-button" type="button" data-answer="${answer}" data-key="${index + 1}">${answer[0].toUpperCase()}${answer.slice(1)}</button>`).join('');
  els['answer-grid'].querySelectorAll('button').forEach(button => button.addEventListener('click', () => submitAnswer(button.dataset.answer)));
  choiceStartedAt = performance.now();
  els['game-status'].textContent = 'Choose how the second colour differed.';
  els['answer-grid'].querySelector('button')?.focus({ preventScroll: true });
}

function submitAnswer(selected) {
  const round = rounds[state.round];
  const correct = selected === round.answer;
  const responseMs = Math.round(performance.now() - choiceStartedAt);
  const speedBonus = correct ? Math.max(0, 450 - Math.floor(responseMs / 20)) : 0;
  const difficulty = 100 + state.round * 55;
  const streakBonus = correct ? state.streak * 40 : 0;
  const points = correct ? difficulty + speedBonus + streakBonus : 0;
  state.streak = correct ? state.streak + 1 : 0;
  state.bestStreak = Math.max(state.bestStreak, state.streak);
  state.score += points;
  state.answers.push({ dimension: round.dimension, selected, answer: round.answer, correct, points, responseMs });
  write(TODAY_KEY, state);
  trackAnswer({
    round_number: state.round + 1,
    dimension: round.dimension,
    direction: round.answer,
    correct,
    response_ms: responseMs,
    perceptual_delta: round.delta,
  });

  els['reveal-kicker'].textContent = correct ? 'You saw it' : 'Not quite';
  els['reveal-title'].textContent = correct
    ? `The second colour was ${round.answer}.`
    : `It was ${round.answer}, not ${selected}.`;
  els['round-points'].textContent = correct ? `+${points.toLocaleString('en-GB')}` : 'Miss';
  els['round-points'].classList.toggle('miss', !correct);
  els['first-reveal'].style.background = colourString(round.first);
  els['second-reveal'].style.background = colourString(round.second);
  els.explanation.textContent = dimensions[round.dimension].explanation;
  els['next-round'].innerHTML = state.round === ROUND_COUNT - 1 ? 'See my profile <span aria-hidden="true">→</span>' : 'Next comparison <span aria-hidden="true">→</span>';
  setPhase('reveal');
  renderProgress();
  els['game-status'].textContent = correct ? `Correct. ${points} points.` : `The second colour was ${round.answer}.`;
  els['next-round'].focus({ preventScroll: true });
}

function nextRound() {
  state.round += 1;
  if (state.round >= ROUND_COUNT) {
    completeGame();
    return;
  }
  write(TODAY_KEY, state);
  els['first-dot'].className = '';
  els['second-dot'].className = '';
  els['start-round'].disabled = false;
  els['phase-title'].textContent = state.round < 4 ? 'Watch for the change.' : state.round < 8 ? 'The differences are narrowing.' : 'Now trust the smallest impression.';
  els['phase-copy'].textContent = state.round < 4
    ? 'One perceptual quality will change. The colours will never overlap.'
    : 'Viewing time is shorter and the pause is longer, but exactly one quality still changes.';
  setPhase('ready');
  renderProgress();
  els['game-status'].textContent = `Round ${state.round + 1} is ready.`;
  els['start-round'].focus({ preventScroll: true });
}

function dimensionScore(dimensionNames) {
  const answers = state.answers.filter(answer => dimensionNames.includes(answer.dimension));
  return answers.length ? Math.round(answers.filter(answer => answer.correct).length / answers.length * 100) : null;
}

function profile() {
  return {
    lightness: dimensionScore(['lightness']),
    chroma: dimensionScore(['chroma']),
    hue: dimensionScore(['redGreen', 'yellowBlue']),
  };
}

function completeGame() {
  state.complete = true;
  state.round = ROUND_COUNT;
  write(TODAY_KEY, state);
  const accuracy = Math.round(state.answers.filter(answer => answer.correct).length / ROUND_COUNT * 100);
  const history = read(HISTORY_KEY, []);
  if (!history.some(day => day.date === state.date)) {
    history.push({ date: state.date, score: state.score, accuracy });
    write(HISTORY_KEY, history.slice(-120));
  }
  els['game-status'].textContent = 'Daily challenge complete.';
  renderProgress();
  showResult();
}

function gradeFor(accuracy) {
  if (accuracy === 100) return ['S', 'Perfect recall. Nothing escaped you.'];
  if (accuracy >= 80) return ['A', 'A remarkably sharp colour memory.'];
  if (accuracy >= 60) return ['B', 'Strong instincts through the subtle rounds.'];
  if (accuracy >= 40) return ['C', 'A solid eye with room to calibrate.'];
  return ['D', 'The colours were slippery today.'];
}

function showResult() {
  const correct = state.answers.filter(answer => answer.correct).length;
  const accuracy = Math.round(correct / ROUND_COUNT * 100);
  const [grade, summary] = gradeFor(accuracy);
  const scores = profile();
  els['result-mark'].textContent = grade;
  els['result-title'].textContent = `${correct} of ${ROUND_COUNT} changes identified.`;
  els['result-summary'].textContent = summary;
  els['final-score'].textContent = state.score.toLocaleString('en-GB');
  els['final-accuracy'].textContent = `${accuracy}%`;
  els['best-streak'].textContent = state.bestStreak;
  [['lightness', 'final-lightness', 'lightness-bar'], ['chroma', 'final-chroma', 'chroma-bar'], ['hue', 'final-hue', 'hue-bar']].forEach(([key, valueId, barId]) => {
    const value = scores[key];
    els[valueId].textContent = value === null ? '--' : `${value}%`;
    els[barId].style.width = `${value || 0}%`;
  });
  els['round-pips'].innerHTML = state.answers.map((answer, index) => `<span class="${answer.correct ? 'correct' : 'incorrect'}" title="Round ${index + 1}: ${answer.correct ? 'correct' : 'incorrect'}"></span>`).join('');
  if (!els['result-dialog'].open) els['result-dialog'].showModal();
}

function updateStats() {
  const history = read(HISTORY_KEY, []);
  const average = history.length ? Math.round(history.reduce((sum, day) => sum + day.accuracy, 0) / history.length) : null;
  const best = history.length ? Math.max(...history.map(day => day.accuracy)) : null;
  let streak = 0;
  const dates = new Set(history.map(day => day.date));
  const cursor = new Date();
  if (!dates.has(dateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (dates.has(dateKey(cursor))) { streak += 1; cursor.setDate(cursor.getDate() - 1); }
  els['games-played'].textContent = history.length;
  els['record-average'].textContent = average === null ? '--' : `${average}%`;
  els['record-best'].textContent = best === null ? '--' : `${best}%`;
  els['current-streak'].textContent = streak;
}

function snackbar(message) {
  els.snackbar.textContent = message;
  els.snackbar.classList.add('show');
  window.setTimeout(() => els.snackbar.classList.remove('show'), 1800);
}

async function shareResult() {
  const correct = state.answers.filter(answer => answer.correct).length;
  const blocks = state.answers.map(answer => answer.correct ? '🟦' : '⬜').join('');
  const text = `Second Sight ${state.date}\n${correct}/${ROUND_COUNT} · ${state.score.toLocaleString('en-GB')} points\n${blocks}\nhttps://bludle.com/secondsight/`;
  try {
    if (navigator.share) await navigator.share({ title: 'Second Sight', text });
    else { await navigator.clipboard.writeText(text); snackbar('Result copied'); }
  } catch (error) {
    if (error?.name !== 'AbortError') snackbar('Could not share result');
  }
}

els['start-round'].addEventListener('click', playSequence);
els['next-round'].addEventListener('click', nextRound);
els['help-button'].addEventListener('click', () => els['help-dialog'].showModal());
els['stats-button'].addEventListener('click', () => { updateStats(); els['stats-dialog'].showModal(); });
els['share-button'].addEventListener('click', shareResult);
document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => button.closest('dialog')?.close()));
document.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); }));

window.addEventListener('keydown', event => {
  if (els['answer-panel'].hidden || !/^[1-8]$/.test(event.key)) return;
  els['answer-grid'].querySelectorAll('button')[Number(event.key) - 1]?.click();
});

setPhase('ready');
renderProgress();
updateStats();
if (state.complete) {
  els['game-status'].textContent = 'Daily challenge complete.';
  window.setTimeout(showResult, 180);
}
