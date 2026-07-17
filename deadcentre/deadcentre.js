const ROUND_CONFIG = [
  { size: 36, flash: 1200, blank: 350 },
  { size: 34, flash: 1100, blank: 400 },
  { size: 32, flash: 1000, blank: 450 },
  { size: 30, flash: 900, blank: 500 },
  { size: 28, flash: 800, blank: 575 },
  { size: 26, flash: 700, blank: 650 },
  { size: 24, flash: 625, blank: 725 },
  { size: 22, flash: 550, blank: 800 },
];

const storage = {
  history: 'deadCentreHistory',
  today: 'deadCentreToday',
  intro: 'deadCentreIntroSeen',
};

const localDateFor = date => {
  const part = value => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${part(date.getMonth() + 1)}-${part(date.getDate())}`;
};
const dateKey = localDateFor(new Date());

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

const random = randomGenerator(seedFromString(`dead-centre-${dateKey}`));
const targets = ROUND_CONFIG.map(() => ({ x: .12 + random() * .76, y: .14 + random() * .72 }));

const els = {
  board: document.querySelector('#memory-board'),
  target: document.querySelector('#target-marker'),
  guess: document.querySelector('#guess-marker'),
  keyboard: document.querySelector('#keyboard-marker'),
  connector: document.querySelector('#connector'),
  message: document.querySelector('#board-message'),
  action: document.querySelector('#action-button'),
  resultRow: document.querySelector('#round-result'),
  status: document.querySelector('#game-status'),
  result: document.querySelector('#result-dialog'),
  stats: document.querySelector('#stats-dialog'),
  help: document.querySelector('#help-dialog'),
  toast: document.querySelector('#snackbar'),
};

let round = 0;
let phase = 'ready';
let roundResults = [];
let keyboardPosition = { x: .5, y: .5 };
let completedResult = null;

function readJson(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
  catch { return fallback; }
}

function position(element, point) {
  element.style.setProperty('--x', point.x);
  element.style.setProperty('--y', point.y);
}

function updateHeader() {
  document.querySelector('#round-value').textContent = `${round + 1} / ${ROUND_CONFIG.length}`;
  document.querySelector('#size-value').textContent = `${ROUND_CONFIG[round].size}px`;
  const scores = roundResults.map(item => item.accuracy);
  document.querySelector('#average-value').textContent = scores.length ? `${Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length)}%` : '--';
  document.querySelector('#best-value').textContent = scores.length ? `${Math.max(...scores)}%` : '--';
}

function prepareRound() {
  phase = 'ready';
  updateHeader();
  els.board.disabled = true;
  els.board.className = 'memory-board';
  els.resultRow.hidden = true;
  els.message.textContent = 'Press start when you are ready';
  document.querySelector('#phase-label').textContent = `Round ${round + 1}`;
  document.querySelector('#board-heading').textContent = round === 0 ? 'Find your focus.' : 'Make a fresh mental map.';
  document.querySelector('#board-instruction').textContent = `The target appears for ${(ROUND_CONFIG[round].flash / 1000).toFixed(2).replace(/0$/, '')} seconds, then the board goes blank.`;
  els.action.disabled = false;
  els.action.innerHTML = `Start round <span aria-hidden="true">&rarr;</span>`;
  els.status.textContent = `Round ${round + 1} is ready.`;
}

function startRound() {
  if (completedResult) {
    renderResult(completedResult);
    return;
  }
  if (phase !== 'ready') return;
  phase = 'showing';
  els.action.disabled = true;
  els.resultRow.hidden = true;
  els.board.disabled = true;
  els.board.className = 'memory-board is-showing';
  els.board.style.setProperty('--target-size', `${ROUND_CONFIG[round].size}px`);
  position(els.target, targets[round]);
  els.message.textContent = '';
  document.querySelector('#phase-label').textContent = 'Study';
  document.querySelector('#board-heading').textContent = 'Fix on the centre.';
  document.querySelector('#board-instruction').textContent = 'Use the board edges and grid to anchor its exact position.';
  els.status.textContent = 'Study the target centre.';

  window.setTimeout(() => {
    phase = 'blank';
    els.board.className = 'memory-board';
    els.message.textContent = 'Hold the point...';
    document.querySelector('#phase-label').textContent = 'Hold';
    document.querySelector('#board-heading').textContent = 'Keep it still.';
    els.status.textContent = 'The target has vanished. Hold its position.';
    window.setTimeout(enablePlacement, ROUND_CONFIG[round].blank);
  }, ROUND_CONFIG[round].flash);
}

function enablePlacement() {
  phase = 'placing';
  keyboardPosition = { x: .5, y: .5 };
  position(els.keyboard, keyboardPosition);
  els.board.disabled = false;
  els.board.className = 'memory-board is-placing';
  els.message.textContent = 'Place the remembered centre';
  document.querySelector('#phase-label').textContent = 'Place';
  document.querySelector('#board-heading').textContent = 'Where was its centre?';
  document.querySelector('#board-instruction').textContent = 'Click or tap once. Keyboard: arrows to position, then Enter.';
  els.status.textContent = 'The board is ready for your placement.';
  els.board.focus({ preventScroll: true });
}

function drawConnector(from, to) {
  const boardRect = els.board.getBoundingClientRect();
  const start = { x: from.x * boardRect.width, y: from.y * boardRect.height };
  const end = { x: to.x * boardRect.width, y: to.y * boardRect.height };
  const distance = Math.hypot(end.x - start.x, end.y - start.y);
  const angle = Math.atan2(end.y - start.y, end.x - start.x) * 180 / Math.PI;
  els.connector.style.left = `${start.x}px`;
  els.connector.style.top = `${start.y}px`;
  els.connector.style.width = `${distance}px`;
  els.connector.style.transform = `rotate(${angle}deg)`;
}

function submitPlacement(point) {
  if (phase !== 'placing') return;
  phase = 'revealed';
  const target = targets[round];
  const distance = Math.hypot(point.x - target.x, point.y - target.y) / Math.SQRT2 * 100;
  const accuracy = Math.max(0, Math.round(100 - distance * 3));
  roundResults.push({ accuracy, distance });
  position(els.guess, point);
  position(els.target, target);
  drawConnector(point, target);
  els.board.disabled = true;
  els.board.className = 'memory-board is-revealed';
  els.message.textContent = 'Target and placement revealed';
  document.querySelector('#round-score').textContent = `${accuracy}%`;
  document.querySelector('#round-distance').textContent = `${distance.toFixed(1)}% of board`;
  document.querySelector('#round-verdict').textContent = accuracy >= 95 ? 'Almost dead centre.' : accuracy >= 85 ? 'A precise placement.' : accuracy >= 70 ? 'The position held.' : 'The point drifted in memory.';
  els.resultRow.hidden = false;
  updateHeader();
  document.querySelector('#phase-label').textContent = 'Revealed';
  document.querySelector('#board-heading').textContent = `${accuracy}% accurate.`;
  document.querySelector('#board-instruction').textContent = 'Red is your placement. Blue is the true centre.';
  els.status.textContent = `Round ${round + 1}: ${accuracy}% accuracy, ${distance.toFixed(1)}% from the target.`;
  els.action.disabled = false;
  els.action.innerHTML = round === ROUND_CONFIG.length - 1 ? 'See today\'s result' : 'Next round <span aria-hidden="true">&rarr;</span>';
}

function boardClick(event) {
  if (phase !== 'placing') return;
  const rect = els.board.getBoundingClientRect();
  submitPlacement({ x: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)), y: Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height)) });
}

function boardKeydown(event) {
  if (phase !== 'placing') return;
  const movement = event.shiftKey ? .01 : .025;
  const keys = { ArrowLeft: [-movement,0], ArrowRight: [movement,0], ArrowUp: [0,-movement], ArrowDown: [0,movement] };
  if (keys[event.key]) {
    event.preventDefault();
    keyboardPosition.x = Math.max(0, Math.min(1, keyboardPosition.x + keys[event.key][0]));
    keyboardPosition.y = Math.max(0, Math.min(1, keyboardPosition.y + keys[event.key][1]));
    position(els.keyboard, keyboardPosition);
  } else if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    submitPlacement(keyboardPosition);
  }
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

function resultFromRounds() {
  return {
    date: dateKey,
    accuracy: Math.round(roundResults.reduce((sum, item) => sum + item.accuracy, 0) / roundResults.length),
    averageDistance: roundResults.reduce((sum, item) => sum + item.distance, 0) / roundResults.length,
    rounds: roundResults.map(item => item.accuracy),
  };
}

function renderResult(result, open = true) {
  document.querySelector('#result-mark').textContent = `${result.accuracy}%`;
  document.querySelector('#result-title').textContent = result.accuracy >= 92 ? 'Your mental map barely moved.' : result.accuracy >= 82 ? 'A remarkably steady eye.' : result.accuracy >= 70 ? 'Most points stayed anchored.' : 'The blank space fought back.';
  document.querySelector('#result-summary').textContent = `Across eight vanished targets, your average accuracy was ${result.accuracy}%.`;
  document.querySelector('#final-accuracy').textContent = `${result.accuracy}%`;
  document.querySelector('#final-distance').textContent = `${result.averageDistance.toFixed(1)}%`;
  document.querySelector('#best-round').textContent = `${Math.max(...result.rounds)}%`;
  document.querySelector('#round-pips').innerHTML = result.rounds.map((value, index) => `<span title="Round ${index + 1}">${value}</span>`).join('');
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
  showCompletedState(result);
}

function showCompletedState(result) {
  phase = 'complete';
  els.board.disabled = true;
  els.board.className = 'memory-board';
  els.message.textContent = 'A new map arrives tomorrow';
  els.resultRow.hidden = true;
  document.querySelector('#phase-label').textContent = 'Complete';
  document.querySelector('#board-heading').textContent = 'Today\'s map is complete.';
  document.querySelector('#board-instruction').textContent = `Eight points placed with ${result.accuracy}% average accuracy.`;
  document.querySelector('#round-value').textContent = '8 / 8';
  document.querySelector('#size-value').textContent = '--';
  document.querySelector('#average-value').textContent = `${result.accuracy}%`;
  document.querySelector('#best-value').textContent = `${Math.max(...result.rounds)}%`;
  els.action.disabled = false;
  els.action.textContent = 'View today\'s result';
  els.status.textContent = 'Daily challenge complete. Come back tomorrow.';
}

function actionClick() {
  if (completedResult) {
    renderResult(completedResult);
    return;
  }
  if (phase === 'ready') startRound();
  else if (phase === 'revealed') {
    if (round === ROUND_CONFIG.length - 1) finishGame();
    else { round += 1; prepareRound(); }
  }
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
  const result = completedResult || readJson(storage.today, null);
  if (!result || result.date !== dateKey) return;
  const text = `Dead Centre ${result.accuracy}%\n${result.rounds.map(value => String(value).padStart(2,' ')).join('  ')}\nEight points. No landmarks.`;
  try {
    if (navigator.share) await navigator.share({ title: 'Dead Centre', text, url: location.href });
    else await navigator.clipboard.writeText(`${text}\n${location.href}`);
    toast(navigator.share ? 'Share sheet opened' : 'Result copied');
  } catch (error) {
    if (error.name !== 'AbortError') toast('Could not share this result');
  }
}

els.board.addEventListener('click', boardClick);
els.board.addEventListener('keydown', boardKeydown);
els.action.addEventListener('click', actionClick);
document.querySelector('#help-button').addEventListener('click', () => els.help.showModal());
document.querySelector('#stats-button').addEventListener('click', () => { renderStats(); els.stats.showModal(); });
document.querySelector('#share-button').addEventListener('click', shareResult);
document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));

const savedResult = readJson(storage.today, null);
renderStats();
if (savedResult?.date === dateKey) {
  completedResult = savedResult;
  showCompletedState(savedResult);
} else {
  prepareRound();
  if (!localStorage.getItem(storage.intro)) {
    els.help.showModal();
    localStorage.setItem(storage.intro, 'true');
  }
}
