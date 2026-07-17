import { AlternateGame, REACTION_BUDGET_MS, randomWait, rankForScore } from './gameEngine.js';

const $ = selector => document.querySelector(selector);
const statsKey = 'alternate:stats:v2';
const welcomeKey = 'alternate:welcome:v2';
const game = new AlternateGame();
let signalTimeout;
let clockInterval;
let soundEnabled = false;

function readStats() {
  try {
    return { runs: 0, bestScore: 0, fastestMs: 0, bestAverageMs: 0, ...JSON.parse(localStorage.getItem(statsKey)) };
  } catch {
    return { runs: 0, bestScore: 0, fastestMs: 0, bestAverageMs: 0 };
  }
}

function writeStats(stats) {
  localStorage.setItem(statsKey, JSON.stringify(stats));
  renderStats();
}

const formatMs = value => value ? `${Math.round(value)}ms` : '—';

function renderStats() {
  const stats = readStats();
  $('#high-score').textContent = stats.bestScore;
  $('#runs-played').textContent = stats.runs;
  $('#record-score').textContent = stats.bestScore;
  $('#record-fastest').textContent = formatMs(stats.fastestMs);
  $('#record-average').textContent = formatMs(stats.bestAverageMs);
}

function render(now = performance.now()) {
  const arena = $('#arena');
  arena.className = `arena ${game.state}${game.state === 'ready' ? ` colour-${game.colourIndex}` : ''}`;
  $('#score').textContent = game.score;
  $('#last-reaction').textContent = formatMs(game.reactions.at(-1));
  $('#average-reaction').textContent = formatMs(game.averageReactionMs);

  const states = {
    idle: ['READY', 'Start the run', 'Tap here or press Space'],
    waiting: ['HOLD', 'Wait for it…', game.reactions.length ? `Last hit: ${formatMs(game.reactions.at(-1))}` : 'Do not tap yet'],
    ready: ['SIGNAL LIVE', 'TAP NOW', 'Click or press Space'],
    over: ['RUN OVER', game.reason === 'false-start' ? 'Too soon' : 'Budget spent', 'Open your run summary']
  };
  const [chip, title, copy] = states[game.state];
  $('#state-chip').textContent = chip;
  $('#arena-title').textContent = title;
  $('#arena-copy').textContent = copy;

  const elapsed = game.elapsed(now);
  $('#budget-time').textContent = `${(elapsed / 1000).toFixed(2)} / 5.00s`;
  $('#budget-fill').style.width = `${elapsed / REACTION_BUDGET_MS * 100}%`;
  const progress = $('.budget-track');
  progress.setAttribute('aria-valuenow', String(Math.round(elapsed)));
}

function clearTimers() {
  clearTimeout(signalTimeout);
  clearInterval(clockInterval);
}

function scheduleSignal() {
  clearTimers();
  signalTimeout = setTimeout(() => {
    if (!game.arm(performance.now())) return;
    tone(620, .055);
    render();
    clockInterval = setInterval(() => {
      const result = game.tick(performance.now());
      render();
      if (result) finishRun(result);
    }, 32);
  }, randomWait());
}

function startRun() {
  clearTimers();
  game.reset();
  game.start();
  $('#run-message').innerHTML = '<strong>Hold:</strong> the waiting time is free. React only when the arena switches.';
  render();
  scheduleSignal();
}

function resetToIdle() {
  clearTimers();
  game.reset();
  $('#run-message').innerHTML = '<strong>How it works:</strong> waiting is free. Only your reaction times use the five-second budget.';
  render();
}

function activate() {
  if (game.state === 'idle') { startRun(); return; }
  if (game.state === 'over') return;
  const result = game.press(performance.now());
  if (!result) return;
  if (result.type === 'hit') {
    clearTimers();
    tone(result.reactionMs < 250 ? 880 : 720, .045);
    $('#run-message').innerHTML = `<strong>${formatMs(result.reactionMs)}:</strong> hit ${result.score} landed. Hold for the next switch.`;
    render();
    scheduleSignal();
  } else if (result.type === 'game-over') finishRun(result);
}

function finishRun(result) {
  clearTimers();
  render();
  const previous = readStats();
  const isRecord = game.score > previous.bestScore;
  const stats = { ...previous, runs: previous.runs + 1, bestScore: Math.max(previous.bestScore, game.score) };
  if (game.fastestReactionMs) stats.fastestMs = previous.fastestMs ? Math.min(previous.fastestMs, game.fastestReactionMs) : game.fastestReactionMs;
  if (game.averageReactionMs) stats.bestAverageMs = previous.bestAverageMs ? Math.min(previous.bestAverageMs, game.averageReactionMs) : game.averageReactionMs;
  writeStats(stats);

  const falseStart = result.reason === 'false-start';
  $('#run-message').innerHTML = falseStart ? '<strong>False start:</strong> wait for the full colour switch before reacting.' : '<strong>Budget spent:</strong> run complete. Faster hits will fit more reactions into five seconds.';
  $('#result-mark').textContent = falseStart ? '×' : '⚡';
  $('#result-mark').classList.toggle('false-start', falseStart);
  $('#result-kicker').textContent = falseStart ? 'FALSE START' : 'RUN COMPLETE';
  $('#result-title').textContent = falseStart ? 'Patience first.' : `${rankForScore(game.score)} reactions.`;
  $('#result-copy').textContent = falseStart ? 'You tapped before the signal changed. The run ends immediately, but your record is ready for another attempt.' : 'Your five-second reaction budget is spent. Faster responses will stretch the next run further.';
  $('#final-score').textContent = game.score;
  $('#final-average').textContent = formatMs(game.averageReactionMs);
  $('#final-fastest').textContent = formatMs(game.fastestReactionMs);
  $('#final-rank').textContent = rankForScore(game.score);
  $('#new-record').hidden = !isRecord || game.score === 0;
  $('#result-dialog').showModal();
}

function tone(frequency, duration) {
  if (!soundEnabled) return;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  const context = new AudioContext();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(.04, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + duration);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + duration);
}

$('#arena').addEventListener('click', activate);
$('#retry-button').addEventListener('click', () => { $('#result-dialog').close(); startRun(); });
$('#sound-button').addEventListener('click', event => {
  soundEnabled = !soundEnabled;
  event.currentTarget.setAttribute('aria-pressed', String(soundEnabled));
  event.currentTarget.setAttribute('aria-label', soundEnabled ? 'Turn sound off' : 'Turn sound on');
  if (soundEnabled) tone(520, .05);
});
$('#help-button').addEventListener('click', () => { if (game.state === 'waiting' || game.state === 'ready') resetToIdle(); $('#help-dialog').showModal(); });
$('#stats-button').addEventListener('click', () => { if (game.state === 'waiting' || game.state === 'ready') resetToIdle(); renderStats(); $('#stats-dialog').showModal(); });
document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
document.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('click', event => { if (event.target === dialog && dialog.id !== 'result-dialog') dialog.close(); }));
document.addEventListener('keydown', event => {
  if (event.code !== 'Space' || document.querySelector('dialog[open]')) return;
  if (event.target instanceof HTMLButtonElement && event.target !== $('#arena')) return;
  event.preventDefault();
  activate();
});

renderStats();
render();
if (!localStorage.getItem(welcomeKey)) {
  $('#help-dialog').showModal();
  localStorage.setItem(welcomeKey, 'true');
}
