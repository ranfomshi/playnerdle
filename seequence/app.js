import { SeequenceRun, RULES, sequenceKey } from './gameEngine.js';

const $ = selector => document.querySelector(selector);
const run = new SeequenceRun();
const storageKey = 'seequence:stats:v2';
const welcomeKey = 'seequence:welcome:v2';
const labels = ['A', 'B', 'C', 'D'];
let playbackToken = 0;
let soundEnabled = false;
let bestAtRunStart = readStats().bestScore;

const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
const toCss = colour => `rgb(${colour.r} ${colour.g} ${colour.b})`;

function readStats() {
  try { return { bestScore: 0, bestLevel: 1, bestStreak: 0, runs: 0, achievements: [], ...JSON.parse(localStorage.getItem(storageKey)) }; }
  catch { return { bestScore: 0, bestLevel: 1, bestStreak: 0, runs: 0, achievements: [] }; }
}

function writeStats(stats) { localStorage.setItem(storageKey, JSON.stringify(stats)); renderStats(); }

function renderRun() {
  $('#level').textContent = run.level; $('#score').textContent = run.score.toLocaleString(); $('#streak').textContent = run.streak;
  $('#lives').textContent = `${'● '.repeat(run.lives)}${'○ '.repeat(RULES.lives - run.lives)}`.trim();
  $('#lives').setAttribute('aria-label', `${run.lives} ${run.lives === 1 ? 'life' : 'lives'}`);
}

function renderStats() {
  const stats = readStats();
  $('#best-score').textContent = stats.bestScore.toLocaleString(); $('#best-level').textContent = stats.bestLevel; $('#best-streak').textContent = stats.bestStreak; $('#runs-played').textContent = stats.runs;
}

function renderProgress(length, seen = -1) {
  $('#sequence-progress').replaceChildren(...Array.from({ length }, (_, index) => {
    const dot = document.createElement('i'); if (index <= seen) dot.className = 'seen'; return dot;
  }));
}

function setStatus(title, copy) { $('#status').innerHTML = `<strong>${title}</strong><span>${copy}</span>`; }

function colourTone(colour, duration = .08) {
  if (!soundEnabled) return;
  const AudioContext = window.AudioContext || window.webkitAudioContext; if (!AudioContext) return;
  const context = new AudioContext(), oscillator = context.createOscillator(), gain = context.createGain();
  oscillator.frequency.value = 220 + (colour.r + colour.g * 2 + colour.b * 3) / 4; gain.gain.setValueAtTime(.045, context.currentTime); gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + duration);
  oscillator.connect(gain).connect(context.destination); oscillator.start(); oscillator.stop(context.currentTime + duration);
}

async function playSequence(sequence) {
  const token = ++playbackToken;
  $('#answers').hidden = true; $('#answers').style.display = 'none'; $('#start-button').hidden = true;
  setStatus('Watch carefully.', `${sequence.length} colours—order matters.`); renderProgress(sequence.length);
  for (let index = 0; index < sequence.length; index += 1) {
    if (token !== playbackToken) return;
    const colour = sequence[index], orb = $('#memory-orb');
    orb.style.background = toCss(colour); orb.style.setProperty('--glow', `rgba(${colour.r},${colour.g},${colour.b},.42)`); orb.classList.add('flash');
    $('#orb-number').textContent = index + 1; $('#orb-label').textContent = `OF ${sequence.length}`; renderProgress(sequence.length, index); colourTone(colour);
    await sleep(RULES.colourDuration * .78); orb.classList.remove('flash'); await sleep(RULES.colourDuration * .22);
  }
  if (token !== playbackToken) return;
  const orb = $('#memory-orb'); orb.style.background = ''; $('#orb-number').textContent = '?'; $('#orb-label').textContent = 'CHOOSE';
  setStatus('Which sequence did you see?', 'Find the exact colours in the exact order.'); renderAnswers(run.options); $('#answers').hidden = false; $('#answers').style.removeProperty('display');
}

function swatches(sequence, className = 'answer-swatch') {
  return sequence.map(colour => `<span class="${className}" style="background:${toCss(colour)}"></span>`).join('');
}

function renderAnswers(options) {
  $('#answers').innerHTML = options.map((option, index) => `<button class="answer-button" type="button" data-index="${index}" aria-label="Option ${labels[index]}"><span class="answer-label">${labels[index]}</span><span class="answer-sequence">${swatches(option)}</span></button>`).join('');
  $('#answers').querySelectorAll('button').forEach(button => button.addEventListener('click', () => choose(+button.dataset.index)));
}

function beginRound() {
  const round = run.beginRound(); renderRun(); playSequence(round.sequence);
}

function choose(index) {
  if (!run.active) return;
  const selection = run.options[index], result = run.choose(selection), buttons = [...$('#answers').querySelectorAll('button')];
  buttons.forEach((button, buttonIndex) => { button.disabled = true; if (sequenceKey(run.options[buttonIndex]) === sequenceKey(run.sequence)) button.classList.add('correct'); });
  if (!result.correct) buttons[index].classList.add('wrong');
  renderRun(); updateRecords(); showResult(result); checkAchievements(result);
}

function showResult(result) {
  $('#result-mark').textContent = result.correct ? '✓' : '×';
  $('#result-kicker').textContent = result.correct ? 'SEQUENCE FOUND' : 'LIFE LOST';
  $('#result-title').textContent = result.correct ? (run.streak >= 3 ? 'Memory on fire.' : 'Perfect recall.') : 'Order matters.';
  $('#result-copy').textContent = result.correct ? 'You held every colour in the right place.' : 'Here is the sequence you were looking for.';
  $('#correct-sequence').innerHTML = swatches(run.sequence, 'result-swatch');
  $('#result-points').textContent = `+${result.points.toLocaleString()}`; $('#result-streak').textContent = run.streak; $('#result-length').textContent = run.sequence.length;
  $('#next-button').innerHTML = result.gameOver ? 'See run summary <span>→</span>' : 'Next sequence <span>→</span>';
  const resultDialog = $('#result-dialog');
  resultDialog.showModal();
  window.dispatchEvent(new CustomEvent('bludle:level-summary', {
    detail: { surface: resultDialog, level: run.level, outcome: result.correct ? 'advanced' : 'life_lost' }
  }));
}

function next() { $('#result-dialog').close(); if (run.lives === 0) showGameOver(); else beginRound(); }

function updateRecords(finished = false) {
  const stats = readStats(); stats.bestScore = Math.max(stats.bestScore, run.score); stats.bestLevel = Math.max(stats.bestLevel, run.level); stats.bestStreak = Math.max(stats.bestStreak, run.streak); if (finished) stats.runs += 1; writeStats(stats);
}

function checkAchievements(result) {
  const stats = readStats(), candidates = [[result.correct, 'first', 'First pattern found'], [run.streak >= 3, 'streak-3', 'Three-sequence streak'], [run.level >= 6, 'six-colours', 'Six-colour memory'], [run.level >= 7, 'max-memory', 'Maximum sequence']];
  const unlocked = candidates.find(([condition, id]) => condition && !stats.achievements.includes(id)); if (!unlocked) return;
  stats.achievements.push(unlocked[1]); writeStats(stats); $('#achievement-text').textContent = unlocked[2]; $('#achievement').classList.add('show'); setTimeout(() => $('#achievement').classList.remove('show'), 2800);
}

function showGameOver() {
  updateRecords(true); $('#final-level').textContent = run.level; $('#final-score').textContent = run.score.toLocaleString(); $('#new-best').hidden = run.score <= bestAtRunStart || run.score === 0; $('#gameover-dialog').showModal();
}

function restart() { $('#gameover-dialog').close(); run.reset(); bestAtRunStart = readStats().bestScore; renderRun(); beginRound(); }

$('#start-button').addEventListener('click', beginRound); $('#next-button').addEventListener('click', next); $('#restart-button').addEventListener('click', restart);
$('#help-button').addEventListener('click', () => $('#help-dialog').showModal()); $('#stats-button').addEventListener('click', () => { renderStats(); $('#stats-dialog').showModal(); });
$('#sound-button').addEventListener('click', event => { soundEnabled = !soundEnabled; event.currentTarget.setAttribute('aria-pressed', String(soundEnabled)); event.currentTarget.setAttribute('aria-label', soundEnabled ? 'Turn sound off' : 'Turn sound on'); });
document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
document.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('click', event => { if (event.target === dialog && !['result-dialog','gameover-dialog'].includes(dialog.id)) dialog.close(); }));
document.addEventListener('keydown', event => { if (!run.active || $('#answers').hidden || !/^[1-4]$/.test(event.key)) return; const button = $(`#answers [data-index="${+event.key - 1}"]`); button?.click(); });

renderRun(); renderStats(); renderProgress(3);
if (!localStorage.getItem(welcomeKey)) { $('#help-dialog').showModal(); localStorage.setItem(welcomeKey, 'true'); }
