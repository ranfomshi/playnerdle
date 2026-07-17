const ROUND_CONFIG = [
  { study: 5000, distraction: 0 },
  { study: 4500, distraction: 600 },
  { study: 4000, distraction: 900 },
  { study: 3500, distraction: 1200 },
  { study: 3000, distraction: 1500 },
];

const storage = {
  history: 'afterimageHistory',
  today: 'afterimageToday',
  intro: 'afterimageIntroSeen',
};

const localDate = () => {
  const date = new Date();
  const part = value => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${part(date.getMonth() + 1)}-${part(date.getDate())}`;
};

function seedFromString(value) {
  let seed = 2166136261;
  for (const character of value) {
    seed ^= character.charCodeAt(0);
    seed = Math.imul(seed, 16777619);
  }
  return seed >>> 0;
}

function randomGenerator(seed) {
  return () => {
    seed |= 0;
    seed = seed + 0x6D2B79F5 | 0;
    let value = Math.imul(seed ^ seed >>> 15, 1 | seed);
    value = value + Math.imul(value ^ value >>> 7, 61 | value) ^ value;
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}

function hslToRgb(hue, saturation, lightness) {
  const s = saturation / 100;
  const l = lightness / 100;
  const chroma = (1 - Math.abs(2 * l - 1)) * s;
  const section = hue / 60;
  const secondary = chroma * (1 - Math.abs(section % 2 - 1));
  const channels = section < 1 ? [chroma, secondary, 0] : section < 2 ? [secondary, chroma, 0] : section < 3 ? [0, chroma, secondary] : section < 4 ? [0, secondary, chroma] : section < 5 ? [secondary, 0, chroma] : [chroma, 0, secondary];
  const match = l - chroma / 2;
  return channels.map(channel => Math.round((channel + match) * 255));
}

const dateKey = localDate();
const random = randomGenerator(seedFromString(`afterimage-${dateKey}`));
const targets = ROUND_CONFIG.map(() => hslToRgb(Math.floor(random() * 360), 48 + Math.floor(random() * 31), 34 + Math.floor(random() * 35)));

const els = {
  phases: [...document.querySelectorAll('.phase')],
  ready: document.querySelector('#ready-phase'),
  study: document.querySelector('#study-phase'),
  distraction: document.querySelector('#distraction-phase'),
  mix: document.querySelector('#mix-phase'),
  reveal: document.querySelector('#reveal-phase'),
  start: document.querySelector('#start-round'),
  submit: document.querySelector('#submit-mix'),
  next: document.querySelector('#next-round'),
  swatch: document.querySelector('#memory-swatch'),
  guess: document.querySelector('#guess-swatch'),
  numbers: ['red', 'green', 'blue'].map(channel => document.querySelector(`#${channel}-number`)),
  ranges: ['red', 'green', 'blue'].map(channel => document.querySelector(`#${channel}-range`)),
  result: document.querySelector('#result-dialog'),
  stats: document.querySelector('#stats-dialog'),
  help: document.querySelector('#help-dialog'),
  toast: document.querySelector('#snackbar'),
};

let round = 0;
let roundResults = [];
let countdownFrame = 0;
let completedResult = null;

const clamp = value => Math.max(0, Math.min(255, Number(value) || 0));
const rgb = channels => `rgb(${channels.join(', ')})`;
const values = () => els.numbers.map(input => clamp(input.value));

function readJson(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
  catch { return fallback; }
}

function setPhase(phase) {
  els.phases.forEach(panel => { panel.hidden = panel !== phase; });
}

function updateRoundHeader() {
  document.querySelector('#round-value').textContent = `${round + 1} / ${ROUND_CONFIG.length}`;
  document.querySelector('#study-value').textContent = `${(ROUND_CONFIG[round].study / 1000).toFixed(1)}s`;
  document.querySelector('#average-value').textContent = roundResults.length ? `${Math.round(roundResults.reduce((sum, item) => sum + item.accuracy, 0) / roundResults.length)}%` : '--';
}

function prepareRound() {
  updateRoundHeader();
  document.querySelector('#round-kicker').textContent = `Round ${round + 1}`;
  document.querySelector('#round-title').textContent = round === 0 ? 'Ready to remember?' : 'Clear the last colour.';
  document.querySelector('#round-intro').textContent = round === 0 ? 'You will have five seconds with the colour. Once it disappears, rebuild it from memory.' : `This colour stays for ${(ROUND_CONFIG[round].study / 1000).toFixed(1)} seconds${ROUND_CONFIG[round].distraction ? ', followed by a visual interruption.' : '.'}`;
  els.start.innerHTML = `${round === 0 ? 'Show me the colour' : 'Start next memory'} <span aria-hidden="true">&rarr;</span>`;
  document.querySelector('#game-status').textContent = `Round ${round + 1} is ready.`;
  setPhase(els.ready);
}

function runCountdown(duration) {
  const start = performance.now();
  const tick = now => {
    const remaining = Math.max(0, duration - (now - start));
    document.querySelector('#countdown').textContent = (remaining / 1000).toFixed(1);
    if (remaining > 0) countdownFrame = requestAnimationFrame(tick);
  };
  cancelAnimationFrame(countdownFrame);
  countdownFrame = requestAnimationFrame(tick);
}

function buildDistraction() {
  const grid = document.querySelector('#distraction-grid');
  grid.replaceChildren();
  for (let index = 0; index < 24; index += 1) {
    const tile = document.createElement('span');
    const hue = Math.floor(random() * 360);
    tile.style.background = `hsl(${hue} ${55 + Math.floor(random() * 35)}% ${38 + Math.floor(random() * 35)}%)`;
    tile.style.animationDelay = `${index * 12}ms`;
    grid.append(tile);
  }
}

function resetMixer() {
  els.numbers.forEach(input => { input.value = 128; });
  els.ranges.forEach(input => { input.value = 128; });
  updateMix();
}

function showMixer() {
  resetMixer();
  setPhase(els.mix);
  document.querySelector('#game-status').textContent = 'The target is gone. Rebuild the colour you remember.';
  els.ranges[0].focus({ preventScroll: true });
}

function startRound() {
  if (completedResult) {
    renderResult(completedResult);
    return;
  }
  const target = targets[round];
  setPhase(els.study);
  els.swatch.style.background = rgb(target);
  runCountdown(ROUND_CONFIG[round].study);
  document.querySelector('#game-status').textContent = 'Study the colour. Its values are hidden.';
  window.setTimeout(() => {
    cancelAnimationFrame(countdownFrame);
    if (ROUND_CONFIG[round].distraction === 0) {
      showMixer();
      return;
    }
    buildDistraction();
    setPhase(els.distraction);
    document.querySelector('#game-status').textContent = 'Keep the vanished colour in mind.';
    window.setTimeout(showMixer, ROUND_CONFIG[round].distraction);
  }, ROUND_CONFIG[round].study);
}

function updateMix(changedIndex) {
  if (Number.isInteger(changedIndex)) {
    const value = clamp(els.numbers[changedIndex].value);
    els.numbers[changedIndex].value = value;
    els.ranges[changedIndex].value = value;
  }
  const channels = values();
  els.guess.style.background = rgb(channels);
  document.querySelector('#mix-rgb').textContent = rgb(channels);
}

function revealRound() {
  const target = targets[round];
  const guess = values();
  const differences = guess.map((value, index) => Math.abs(value - target[index]));
  const error = differences.reduce((sum, value) => sum + value, 0);
  const accuracy = Math.round((1 - error / 765) * 100);
  roundResults.push({ accuracy, error });

  document.querySelector('#target-reveal').style.background = rgb(target);
  document.querySelector('#guess-reveal').style.background = rgb(guess);
  document.querySelector('#target-rgb').textContent = rgb(target);
  document.querySelector('#guess-rgb').textContent = rgb(guess);
  ['red', 'green', 'blue'].forEach((channel, index) => { document.querySelector(`#${channel}-difference`).textContent = differences[index]; });
  document.querySelector('#round-accuracy').textContent = `${accuracy}%`;
  document.querySelector('#reveal-title').textContent = accuracy >= 92 ? 'Still vivid.' : accuracy >= 82 ? 'A strong afterimage.' : accuracy >= 70 ? 'The shape of it survived.' : 'That one slipped away.';
  document.querySelector('#reveal-copy').textContent = `Total RGB difference: ${error}. Lower is better.`;
  els.next.innerHTML = round === ROUND_CONFIG.length - 1 ? 'See today\'s result' : 'Next colour <span aria-hidden="true">&rarr;</span>';
  updateRoundHeader();
  setPhase(els.reveal);
  document.querySelector('#game-status').textContent = `Round ${round + 1}: ${accuracy}% memory accuracy.`;
}

function streakFor(history) {
  if (!history.length) return 0;
  const dates = new Set(history.map(item => item.date));
  const cursor = new Date(`${dateKey}T12:00:00`);
  if (!dates.has(dateKey)) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (dates.has(localDateFor(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function localDateFor(date) {
  const part = value => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${part(date.getMonth() + 1)}-${part(date.getDate())}`;
}

function resultFromRounds() {
  const totalError = roundResults.reduce((sum, item) => sum + item.error, 0);
  return {
    date: dateKey,
    accuracy: Math.round(roundResults.reduce((sum, item) => sum + item.accuracy, 0) / roundResults.length),
    totalError,
    rounds: roundResults.map(item => item.accuracy),
  };
}

function renderResult(result, open = true) {
  document.querySelector('#result-mark').textContent = `${result.accuracy}%`;
  document.querySelector('#result-title').textContent = result.accuracy >= 90 ? 'The colours stayed with you.' : result.accuracy >= 80 ? 'A clear colour memory.' : result.accuracy >= 70 ? 'A solid trace remained.' : 'Tomorrow brings five fresh colours.';
  document.querySelector('#result-summary').textContent = `Across five vanished colours, your average memory accuracy was ${result.accuracy}%.`;
  document.querySelector('#final-accuracy').textContent = `${result.accuracy}%`;
  document.querySelector('#final-error').textContent = result.totalError;
  document.querySelector('#best-round').textContent = `${Math.max(...result.rounds)}%`;
  document.querySelector('#round-pips').innerHTML = result.rounds.map((value, index) => `<span title="Round ${index + 1}">${value}%</span>`).join('');
  if (open && !els.result.open) els.result.showModal();
}

function finishGame() {
  const result = resultFromRounds();
  completedResult = result;
  localStorage.setItem(storage.today, JSON.stringify(result));
  const history = readJson(storage.history, []).filter(item => item.date !== dateKey);
  history.push({ date: dateKey, accuracy: result.accuracy });
  localStorage.setItem(storage.history, JSON.stringify(history.slice(-100)));
  renderStats();
  renderResult(result);
  document.querySelector('#round-title').textContent = 'Today\'s colours are complete.';
  document.querySelector('#round-intro').textContent = `You remembered five colours with ${result.accuracy}% average accuracy. A new set arrives tomorrow.`;
  els.start.textContent = 'View today\'s result';
  setPhase(els.ready);
  document.querySelector('#round-value').textContent = '5 / 5';
  document.querySelector('#average-value').textContent = `${result.accuracy}%`;
  document.querySelector('#game-status').textContent = 'Daily challenge complete. Come back tomorrow.';
}

function nextRound() {
  if (round === ROUND_CONFIG.length - 1) {
    finishGame();
    return;
  }
  round += 1;
  prepareRound();
}

function renderStats() {
  const history = readJson(storage.history, []);
  const average = history.length ? Math.round(history.reduce((sum, item) => sum + item.accuracy, 0) / history.length) : null;
  document.querySelector('#games-played').textContent = history.length;
  document.querySelector('#record-average').textContent = average === null ? '--' : `${average}%`;
  document.querySelector('#record-best').textContent = history.length ? `${Math.max(...history.map(item => item.accuracy))}%` : '--';
  document.querySelector('#current-streak').textContent = streakFor(history);
}

function toast(message) {
  els.toast.textContent = message;
  els.toast.classList.add('show');
  window.setTimeout(() => els.toast.classList.remove('show'), 2200);
}

async function shareResult() {
  const result = readJson(storage.today, null);
  if (!result || result.date !== dateKey) return;
  const text = `Afterimage ${result.accuracy}%\n${result.rounds.map(value => `${value}%`).join('  ')}\nFive colours. No second look.`;
  try {
    if (navigator.share) await navigator.share({ title: 'Afterimage', text, url: location.href });
    else await navigator.clipboard.writeText(`${text}\n${location.href}`);
    toast(navigator.share ? 'Share sheet opened' : 'Result copied');
  } catch (error) {
    if (error.name !== 'AbortError') toast('Could not share this result');
  }
}

els.ranges.forEach((range, index) => range.addEventListener('input', () => {
  els.numbers[index].value = range.value;
  updateMix();
}));
els.numbers.forEach((input, index) => input.addEventListener('input', () => updateMix(index)));
els.start.addEventListener('click', startRound);
els.submit.addEventListener('click', revealRound);
els.next.addEventListener('click', nextRound);
document.querySelector('#help-button').addEventListener('click', () => els.help.showModal());
document.querySelector('#stats-button').addEventListener('click', () => { renderStats(); els.stats.showModal(); });
document.querySelector('#share-button').addEventListener('click', shareResult);
document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));

const savedResult = readJson(storage.today, null);
renderStats();
if (savedResult?.date === dateKey) {
  completedResult = savedResult;
  roundResults = savedResult.rounds.map(accuracy => ({ accuracy, error: 0 }));
  document.querySelector('#round-title').textContent = 'Today\'s colours are complete.';
  document.querySelector('#round-intro').textContent = `You remembered five colours with ${savedResult.accuracy}% average accuracy. A new set arrives tomorrow.`;
  els.start.textContent = 'View today\'s result';
  document.querySelector('#round-value').textContent = '5 / 5';
  document.querySelector('#study-value').textContent = '--';
  document.querySelector('#average-value').textContent = `${savedResult.accuracy}%`;
  document.querySelector('#game-status').textContent = 'Daily challenge complete. Come back tomorrow.';
} else {
  prepareRound();
  if (!localStorage.getItem(storage.intro)) {
    els.help.showModal();
    localStorage.setItem(storage.intro, 'true');
  }
}
