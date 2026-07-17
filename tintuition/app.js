import { TintuitionRun, RULES } from './gameEngine.js';

const $ = selector => document.querySelector(selector);
const run = new TintuitionRun();
const controls = {
  hue: $('#hue-slider'), saturation: $('#saturation-slider'), brightness: $('#brightness-slider')
};
const storageKey = 'tintuition:stats:v2';
const welcomeKey = 'tintuition:welcome:v2';
let deadline = 0;
let frame = 0;
let soundEnabled = false;
let nudgeTimer = 0;
let bestAtRunStart = readStats().bestScore;

function readStats() {
  try { return { bestScore: 0, bestLevel: 1, bestCombo: 0, runs: 0, achievements: [], ...JSON.parse(localStorage.getItem(storageKey)) }; }
  catch { return { bestScore: 0, bestLevel: 1, bestCombo: 0, runs: 0, achievements: [] }; }
}

function writeStats(stats) { localStorage.setItem(storageKey, JSON.stringify(stats)); renderStats(); }
function colour({ hue, saturation, brightness }) { return `hsl(${hue} ${saturation}% ${brightness}%)`; }

function hslToHex({ hue, saturation, brightness }) {
  const s = saturation / 100, l = brightness / 100;
  const channel = n => { const k = (n + hue / 30) % 12; return l - s * Math.min(l, 1 - l) * Math.max(-1, Math.min(k - 3, 9 - k, 1)); };
  return `#${[channel(0), channel(8), channel(4)].map(value => Math.round(255 * value).toString(16).padStart(2, '0')).join('').toUpperCase()}`;
}

function guess() { return { hue: +controls.hue.value, saturation: +controls.saturation.value, brightness: +controls.brightness.value }; }

function renderMix() {
  const current = guess();
  $('#your-color').style.background = colour(current);
  $('#player-hex').textContent = hslToHex(current);
  $('#hue-value').textContent = `${current.hue}°`;
  $('#saturation-value').textContent = `${current.saturation}%`;
  $('#brightness-value').textContent = `${current.brightness}%`;
  document.documentElement.style.setProperty('--hue', current.hue);
  document.documentElement.style.setProperty('--sat', `${current.saturation}%`);
  document.documentElement.style.setProperty('--light', `${current.brightness}%`);
}

function renderRun() {
  $('#level').textContent = run.level;
  $('#score').textContent = run.score.toLocaleString();
  $('#combo').textContent = `×${Math.max(1, run.combo)}`;
  $('#lives').textContent = `${'● '.repeat(run.lives)}${'○ '.repeat(RULES.startingLives - run.lives)}`.trim();
  $('#lives').setAttribute('aria-label', `${run.lives} ${run.lives === 1 ? 'life' : 'lives'}`);
}

function renderStats() {
  const stats = readStats();
  $('#best-score').textContent = stats.bestScore.toLocaleString();
  $('#best-level').textContent = stats.bestLevel;
  $('#best-combo').textContent = stats.bestCombo;
  $('#runs-played').textContent = stats.runs;
}

function resetSliders() {
  controls.hue.value = 180; controls.saturation.value = 50; controls.brightness.value = 50; renderMix();
}

function setPlaying(playing) {
  $('#controls').setAttribute('aria-disabled', String(!playing));
  Object.values(controls).forEach(control => { control.disabled = !playing; });
  document.querySelectorAll('.nudge').forEach(button => { button.disabled = !playing; });
  $('#lock-button').hidden = !playing;
  $('#start-button').hidden = playing || run.level > 1 || run.lives < RULES.startingLives;
}

function beginRound() {
  const target = run.beginRound();
  resetSliders();
  $('#target-color').style.background = colour(target);
  $('#target-color').replaceChildren();
  $('#round-callout').innerHTML = `<strong>Level ${run.level}.</strong><span>${Math.round(run.duration / 1000)} seconds—make it count.</span>`;
  setPlaying(true);
  deadline = performance.now() + run.duration;
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(tick);
  tone(420, .05);
}

function tick(now) {
  if (!run.active) return;
  const remaining = Math.max(0, deadline - now);
  const ratio = remaining / run.duration;
  $('#timer-fill').style.width = `${ratio * 100}%`;
  $('#timer-fill').classList.toggle('danger', ratio < .2);
  if (remaining <= 0) resolveRound(0);
  else frame = requestAnimationFrame(tick);
}

function gradeFor(error) { if (error <= 5) return ['S', 'Perfect pitch.']; if (error <= 12) return ['A', 'Exceptional eye.']; if (error <= 20) return ['B', 'Sharp instinct.']; if (error <= 30) return ['C', 'Colour matched.']; return ['×', 'Not quite.']; }

function resolveRound(forcedRatio) {
  if (!run.active) return;
  cancelAnimationFrame(frame);
  const remaining = Math.max(0, deadline - performance.now());
  const ratio = forcedRatio ?? remaining / run.duration;
  const target = { ...run.target };
  const player = guess();
  const result = run.resolve(player, ratio);
  setPlaying(false);
  renderRun();
  const [grade, title] = gradeFor(result.total);
  $('#result-grade').textContent = grade;
  $('#result-title').textContent = title;
  $('#result-kicker').textContent = result.success ? 'COLOUR MATCHED' : 'LIFE LOST';
  $('#result-target').style.background = colour(target);
  $('#result-player').style.background = colour(player);
  $('#result-error').textContent = result.total;
  $('#result-points').textContent = `+${result.points.toLocaleString()}`;
  $('#result-time').textContent = `${(remaining / 1000).toFixed(1)}s`;
  $('#channel-results').innerHTML = Object.entries(result.channels).map(([name, value]) => `<span>${name[0].toUpperCase() + name.slice(1)} Δ ${value}</span>`).join('');
  $('#next-button').textContent = result.gameOver ? 'See run summary' : result.success ? 'Next level →' : 'Try next colour →';
  updateRecords();
  checkAchievements(result);
  tone(result.success ? 660 : 180, result.success ? .12 : .18);
  $('#result-dialog').showModal();
}

function updateRecords(finished = false) {
  const stats = readStats();
  stats.bestScore = Math.max(stats.bestScore, run.score);
  stats.bestLevel = Math.max(stats.bestLevel, run.level);
  stats.bestCombo = Math.max(stats.bestCombo, run.combo);
  if (finished) stats.runs += 1;
  writeStats(stats);
}

function checkAchievements(result) {
  const stats = readStats();
  const candidates = [
    [result.success, 'first-match', 'First colour matched'],
    [result.total <= 5, 'near-perfect', 'Near-perfect vision'],
    [run.combo >= 3, 'combo-3', 'Three-colour combo'],
    [run.level >= 6, 'level-6', 'Spectrum climber']
  ];
  const unlocked = candidates.find(([condition, id]) => condition && !stats.achievements.includes(id));
  if (!unlocked) return;
  stats.achievements.push(unlocked[1]); writeStats(stats);
  $('#achievement-text').textContent = unlocked[2]; $('#achievement').classList.add('show');
  setTimeout(() => $('#achievement').classList.remove('show'), 2800);
}

function showGameOver() {
  updateRecords(true);
  $('#final-level').textContent = run.level;
  $('#final-score').textContent = run.score.toLocaleString();
  $('#new-best').hidden = run.score <= bestAtRunStart || run.score === 0;
  $('#gameover-dialog').showModal();
}

function next() {
  $('#result-dialog').close();
  if (run.lives === 0) showGameOver(); else beginRound();
}

function restart() {
  $('#gameover-dialog').close(); run.reset(); bestAtRunStart = readStats().bestScore; renderRun(); beginRound();
}

function nudge(channel, step) {
  controls[channel].value = Math.max(+controls[channel].min, Math.min(+controls[channel].max, +controls[channel].value + step)); renderMix();
}

function startNudge(button) {
  const action = () => nudge(button.dataset.channel, +button.dataset.step);
  action(); clearInterval(nudgeTimer); nudgeTimer = setInterval(action, 90);
}

function tone(frequency, duration) {
  if (!soundEnabled) return;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  const context = new AudioContext(), oscillator = context.createOscillator(), gain = context.createGain();
  oscillator.frequency.value = frequency; gain.gain.setValueAtTime(.05, context.currentTime); gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + duration);
  oscillator.connect(gain).connect(context.destination); oscillator.start(); oscillator.stop(context.currentTime + duration);
}

Object.values(controls).forEach(slider => slider.addEventListener('input', renderMix));
document.querySelectorAll('.nudge').forEach(button => {
  button.addEventListener('pointerdown', () => startNudge(button));
  button.addEventListener('pointerup', () => clearInterval(nudgeTimer));
  button.addEventListener('pointerleave', () => clearInterval(nudgeTimer));
  button.addEventListener('pointercancel', () => clearInterval(nudgeTimer));
});
document.addEventListener('pointerup', () => clearInterval(nudgeTimer));
$('#start-button').addEventListener('click', beginRound);
$('#lock-button').addEventListener('click', () => resolveRound());
$('#next-button').addEventListener('click', next);
$('#restart-button').addEventListener('click', restart);
$('#help-button').addEventListener('click', () => $('#help-dialog').showModal());
$('#stats-button').addEventListener('click', () => { renderStats(); $('#stats-dialog').showModal(); });
$('#sound-button').addEventListener('click', event => { soundEnabled = !soundEnabled; event.currentTarget.setAttribute('aria-pressed', String(soundEnabled)); event.currentTarget.setAttribute('aria-label', soundEnabled ? 'Turn sound off' : 'Turn sound on'); tone(520, .06); });
document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
document.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('click', event => { if (event.target === dialog && !['result-dialog', 'gameover-dialog'].includes(dialog.id)) dialog.close(); }));

resetSliders(); renderRun(); renderStats(); setPlaying(false);
if (!localStorage.getItem(welcomeKey)) { $('#help-dialog').showModal(); localStorage.setItem(welcomeKey, 'true'); }
