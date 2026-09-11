const canvas = document.querySelector('#game-canvas');
const context = canvas.getContext('2d');
const playfield = document.querySelector('#playfield');
const overlay = document.querySelector('#game-overlay');
const startButton = document.querySelector('#start-button');
const soundButton = document.querySelector('#sound-button');
const resultDialog = document.querySelector('#result-dialog');

const state = {
  phase: 'ready', score: 0, streak: 0, lives: 3, angle: -Math.PI / 2,
  direction: 1, target: .35, targetSize: .62, speed: 1.42, lastTime: 0,
  best: Number(localStorage.getItem('arcShiftBest') || 0), previousBest: 0,
  hits: 0, misses: 0, bestStreak: 0, sound: true,
};

let geometry = { width: 0, height: 0, x: 0, y: 0, radius: 0 };
let audioContext;

function trackGameEvent(eventName, properties) {
  if (window.BludleEngagement?.gameEvent) {
    window.BludleEngagement.gameEvent(eventName, properties);
    return;
  }
  window.__bludleGameplayEventQueue = window.__bludleGameplayEventQueue || [];
  window.__bludleGameplayEventQueue.push({ eventName, properties });
}

function resize() {
  const rect = playfield.getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(rect.width * ratio);
  canvas.height = Math.round(rect.height * ratio);
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  geometry = { width: rect.width, height: rect.height, x: rect.width / 2, y: rect.height / 2, radius: Math.min(rect.width, rect.height) * .35 };
  draw();
}

function normalise(angle) { return (angle % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2); }
function angularDistance(a, b) { return Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b))); }

function draw() {
  const { width, height, x, y, radius } = geometry;
  context.clearRect(0, 0, width, height);
  context.save();
  context.translate(x, y);

  context.beginPath();
  context.arc(0, 0, radius, 0, Math.PI * 2);
  context.strokeStyle = '#272d43';
  context.lineWidth = 3;
  context.stroke();

  context.save();
  context.shadowColor = '#806dff';
  context.shadowBlur = 18;
  context.beginPath();
  context.arc(0, 0, radius, state.target - state.targetSize / 2, state.target + state.targetSize / 2);
  context.strokeStyle = '#8e7cff';
  context.lineWidth = 13;
  context.lineCap = 'round';
  context.stroke();
  context.restore();

  const px = Math.cos(state.angle) * radius;
  const py = Math.sin(state.angle) * radius;
  context.beginPath();
  context.arc(px, py, 9, 0, Math.PI * 2);
  context.fillStyle = '#ffffff';
  context.shadowColor = '#ffffff';
  context.shadowBlur = 15;
  context.fill();
  context.shadowBlur = 0;
  context.beginPath();
  context.arc(px, py, 3, 0, Math.PI * 2);
  context.fillStyle = '#7765ed';
  context.fill();

  context.beginPath();
  context.arc(0, 0, radius * .56, 0, Math.PI * 2);
  context.strokeStyle = 'rgba(128,139,171,.1)';
  context.lineWidth = 1;
  context.stroke();
  context.restore();
}

function beep(frequency, duration = .07) {
  if (!state.sound) return;
  audioContext ||= new AudioContext();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.frequency.value = frequency;
  oscillator.type = 'sine';
  gain.gain.setValueAtTime(.09, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(.001, audioContext.currentTime + duration);
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
}

function updateHud() {
  document.querySelector('#score').textContent = String(state.score).padStart(2, '0');
  document.querySelector('#best').textContent = String(state.best).padStart(2, '0');
  document.querySelector('#speed').textContent = `${(state.speed / 1.42).toFixed(1)}×`;
  document.querySelector('#centre-score').textContent = state.score;
  document.querySelector('#centre-label').textContent = state.phase === 'playing' ? 'Score' : 'Ready';
  document.querySelector('#combo-label').textContent = state.streak > 2 ? `${state.streak} hit streak` : 'Find your rhythm';
  const pips = [...document.querySelectorAll('#lives i')];
  pips.forEach((pip, index) => pip.classList.toggle('lost', index >= state.lives));
  document.querySelector('#lives').setAttribute('aria-label', `${state.lives} ${state.lives === 1 ? 'life' : 'lives'} remaining`);
}

function placeTarget() {
  const travel = .9 + Math.random() * 2.5;
  state.target = normalise(state.angle + state.direction * travel);
}

function flash(message, miss = false) {
  const element = document.querySelector('#flash-message');
  element.textContent = message;
  element.classList.toggle('miss', miss);
  element.classList.add('show');
  clearTimeout(flash.timer);
  flash.timer = setTimeout(() => element.classList.remove('show'), 600);
}

function act() {
  if (state.phase !== 'playing') return;
  const timingError = angularDistance(state.angle, state.target);
  const targetWindow = state.targetSize;
  const speed = state.speed;
  const hit = timingError <= targetWindow / 2;
  if (hit) {
    state.streak += 1;
    state.bestStreak = Math.max(state.bestStreak, state.streak);
    state.hits += 1;
    state.score += 1 + Math.floor(state.streak / 8);
    state.best = Math.max(state.best, state.score);
    localStorage.setItem('arcShiftBest', state.best);
    state.direction *= -1;
    state.speed = Math.min(4.1, state.speed + .055);
    state.targetSize = Math.max(.16, state.targetSize - .012);
    placeTarget();
    flash(state.streak > 7 && state.streak % 8 === 0 ? 'BONUS +2' : 'SHIFT');
    beep(470 + Math.min(state.streak, 14) * 22);
  } else {
    state.lives -= 1;
    state.misses += 1;
    state.streak = 0;
    flash('MISS', true);
    beep(130, .16);
  }
  trackGameEvent('arc_shift_attempt', {
    attempt_number: state.hits + state.misses,
    result: hit ? 'hit' : 'miss',
    score: state.score,
    streak: state.streak,
    lives_remaining: state.lives,
    timing_error_degrees: Number((timingError * 180 / Math.PI).toFixed(2)),
    target_window_degrees: Number((targetWindow * 180 / Math.PI).toFixed(2)),
    speed_multiplier: Number((speed / 1.42).toFixed(2)),
  });
  updateHud();
  if (!hit && state.lives <= 0) endGame();
}

function startGame(event) {
  event?.stopPropagation();
  if (resultDialog.open) resultDialog.close();
  state.phase = 'playing'; state.score = 0; state.streak = 0; state.lives = 3;
  state.hits = 0; state.misses = 0; state.bestStreak = 0; state.previousBest = state.best;
  state.angle = -Math.PI / 2; state.direction = 1; state.speed = 1.42; state.targetSize = .62;
  state.target = .45;
  state.lastTime = performance.now();
  overlay.hidden = true;
  document.querySelector('#status').textContent = 'Tap while the runner is inside the bright arc.';
  updateHud();
}

function endGame() {
  state.phase = 'ended';
  const newBest = state.score > state.previousBest;
  document.querySelector('#result-kicker').textContent = newBest ? 'New personal best' : 'Run complete';
  document.querySelector('#result-title').textContent = state.score < 5
    ? 'The orbit got away.'
    : state.score < 12 ? 'You found the rhythm.' : 'Precision under pressure.';
  document.querySelector('#result-copy').textContent = state.score < 5
    ? 'Wait for the runner to settle inside the whole arc before you shift.'
    : 'Every clean reversal made the next timing window tighter.';
  document.querySelector('#final-score').textContent = state.score;
  document.querySelector('#final-hits').textContent = state.hits;
  document.querySelector('#final-streak').textContent = state.bestStreak;
  document.querySelector('#final-speed').textContent = `${(state.speed / 1.42).toFixed(1)}×`;
  document.querySelector('#status').textContent = 'Three misses. Start a new run when ready.';
  trackGameEvent('arc_shift_run_complete', {
    score: state.score,
    hits: state.hits,
    misses: state.misses,
    attempts: state.hits + state.misses,
    best_streak: state.bestStreak,
    speed_multiplier: Number((state.speed / 1.42).toFixed(2)),
    new_best: newBest,
  });
  resultDialog.showModal();
}

function frame(time) {
  if (state.phase === 'playing') {
    const elapsed = Math.min((time - state.lastTime) / 1000, .05);
    state.angle = normalise(state.angle + state.direction * state.speed * elapsed);
    state.lastTime = time;
    draw();
  }
  requestAnimationFrame(frame);
}

playfield.addEventListener('pointerdown', event => { if (!event.target.closest('button')) act(); });
window.addEventListener('keydown', event => {
  if ((event.code === 'Space' || event.code === 'Enter') && !document.querySelector('dialog[open]')) {
    event.preventDefault();
    if (state.phase === 'playing') act(); else startGame();
  }
});
startButton.addEventListener('click', startGame);
document.querySelector('#replay-button').addEventListener('click', startGame);
document.querySelector('#share-button').addEventListener('click', async () => {
  const result = `Arc Shift — ${state.score} points · ${state.hits} hits · ${state.bestStreak} best streak\nhttps://bludle.com/arcshift/`;
  try {
    await navigator.clipboard.writeText(result);
    document.querySelector('#share-button').textContent = 'Copied';
    setTimeout(() => { document.querySelector('#share-button').textContent = 'Share result'; }, 1500);
  } catch { /* Clipboard access is optional. */ }
});
soundButton.addEventListener('click', () => {
  state.sound = !state.sound;
  soundButton.setAttribute('aria-pressed', String(state.sound));
  soundButton.setAttribute('aria-label', state.sound ? 'Mute game sounds' : 'Enable game sounds');
});
document.querySelector('#how-button').addEventListener('click', () => document.querySelector('#how-dialog').showModal());
document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
new ResizeObserver(resize).observe(playfield);
updateHud();
requestAnimationFrame(frame);
