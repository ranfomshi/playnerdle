import { routes, routePathData } from './routes.js?v=1';

const STORAGE_KEY = 'trak:v2';
const MAX_LIVES = 3;
const elements = {
  track: document.querySelector('#track'), signal: document.querySelector('#signal'), target: document.querySelector('#target'), marker: document.querySelector('#result-marker'), routePath: document.querySelector('#route-path'),
  level: document.querySelector('#level-value'), best: document.querySelector('#best-value'), route: document.querySelector('#route-value'), lives: document.querySelector('#lives-value'),
  phasePill: document.querySelector('.phase-pill'), phaseLabel: document.querySelector('#phase-label'), title: document.querySelector('#round-title'), message: document.querySelector('#round-message'),
  start: document.querySelector('#start-button'), help: document.querySelector('#help-dialog'), gameover: document.querySelector('#gameover-dialog'), sound: document.querySelector('#sound-button'),
};

const loadStats = () => { try { return { best: 1, hits: 0, ...JSON.parse(localStorage.getItem(STORAGE_KEY)) }; } catch { return { best: 1, hits: 0 }; } };
const stats = loadStats();
const game = { level: 1, lives: MAX_LIVES, hits: 0, state: 'ready', phase: 0, visibleTime: 0, lastTime: 0, frame: 0, muted: localStorage.getItem('trak:muted') === 'true' };

function route() { return [...routes].reverse().find((item) => game.level >= item.from); }
function phaseSpeed() { return .31 + (game.level - 1) * .018; }
function visibleDuration() { return 2.8 + Math.floor((game.level - 1) / 5) * .65; }
function targetSize() { return Math.max(46, 88 - (game.level - 1) * 3); }
function pixelPoint(point) { const pad = 16; return { x: pad + point.x * (elements.track.clientWidth - pad * 2), y: pad + point.y * (elements.track.clientHeight - pad * 2) }; }

function updateHud() {
  const activeRoute = route();
  elements.level.textContent = game.level; elements.best.textContent = stats.best; elements.route.textContent = activeRoute.name; elements.routePath.setAttribute('d', routePathData(activeRoute));
  const zone = pixelPoint(activeRoute.point(activeRoute.targetPhase)); const size = targetSize();
  elements.target.style.cssText = `left:${zone.x}px;top:${zone.y}px;width:${size}px;height:${size}px`;
  elements.lives.textContent = Array.from({ length: MAX_LIVES }, (_, index) => index < game.lives ? '●' : '○').join(' ');
  elements.lives.setAttribute('aria-label', `${game.lives} ${game.lives === 1 ? 'life' : 'lives'}`);
  elements.sound.setAttribute('aria-pressed', String(game.muted)); elements.sound.setAttribute('aria-label', game.muted ? 'Enable sounds' : 'Mute sounds');
}

function setPhase(state, label) { game.state = state; elements.phasePill.className = `phase-pill ${state}`; elements.phaseLabel.textContent = label; }
function setCopy(title, message) { elements.title.textContent = title; elements.message.textContent = message; }
function beginRound() {
  cancelAnimationFrame(game.frame); game.phase = Math.random() * .12; game.visibleTime = 0; game.lastTime = 0; updateHud();
  elements.signal.className = 'signal'; elements.marker.className = 'result-marker'; elements.track.disabled = false; elements.start.disabled = true; elements.start.hidden = true;
  setPhase('watching', 'Signal visible'); setCopy(`${route().name} · Level ${game.level}`, 'Lock onto the signal and learn its rhythm.'); game.frame = requestAnimationFrame(tick);
}
function tick(time) {
  if (game.state !== 'watching' && game.state !== 'hidden') return;
  if (!game.lastTime) game.lastTime = time;
  const delta = Math.min((time - game.lastTime) / 1000, .05); game.lastTime = time; game.phase = (game.phase + delta * phaseSpeed()) % 2; game.visibleTime += delta;
  const point = pixelPoint(route().point(game.phase)); elements.signal.style.transform = `translate(${point.x}px, ${point.y}px) translate(-50%,-50%)`;
  if (game.state === 'watching' && game.visibleTime >= visibleDuration()) { elements.signal.classList.add('hidden'); setPhase('hidden', 'Signal hidden'); setCopy('Keep following it.', 'Tap the field when its centre reaches the target.'); tone(520, .05); }
  game.frame = requestAnimationFrame(tick);
}
function stopSignal() {
  if (game.state === 'watching') { setCopy('Not yet.', 'Wait for the signal to disappear before stopping it.'); return; }
  if (game.state !== 'hidden') return;
  cancelAnimationFrame(game.frame); elements.track.disabled = true; elements.signal.className = 'signal revealed';
  const signalPoint = pixelPoint(route().point(game.phase)); elements.signal.style.transform = `translate(${signalPoint.x}px, ${signalPoint.y}px) translate(-50%,-50%)`;
  elements.marker.style.left = `${signalPoint.x}px`; elements.marker.style.top = `${signalPoint.y}px`; elements.marker.classList.add('show');
  const targetPoint = pixelPoint(route().point(route().targetPhase)); const hit = Math.hypot(signalPoint.x - targetPoint.x, signalPoint.y - targetPoint.y) <= targetSize() / 2;
  setPhase('result', hit ? 'On target' : 'Missed');
  if (hit) { game.hits += 1; stats.hits += 1; game.level += 1; stats.best = Math.max(stats.best, game.level); saveStats(); updateHud(); tone(760, .09); setCopy('Perfect read.', 'You held the route. The next signal moves faster.'); }
  else { game.lives -= 1; updateHud(); tone(180, .12); setCopy('Just missed.', game.lives ? `${game.lives} ${game.lives === 1 ? 'life' : 'lives'} remaining. Recalibrate.` : 'Your focus run is complete.'); }
  if (!game.lives) window.setTimeout(endGame, 900); else window.setTimeout(beginRound, 1150);
}
function endGame() { setPhase('ready', 'Session complete'); elements.start.hidden = false; elements.start.disabled = false; elements.start.textContent = 'Start a new run →'; document.querySelector('#summary-level').textContent = game.level; document.querySelector('#summary-hits').textContent = game.hits; elements.gameover.showModal(); }
function restart() { game.level = 1; game.lives = MAX_LIVES; game.hits = 0; elements.gameover.close(); updateHud(); beginRound(); }
function saveStats() { localStorage.setItem(STORAGE_KEY, JSON.stringify(stats)); }
let audioContext;
function tone(frequency, duration) { if (game.muted) return; try { audioContext ||= new AudioContext(); const oscillator = audioContext.createOscillator(); const gain = audioContext.createGain(); oscillator.frequency.value = frequency; gain.gain.setValueAtTime(.035, audioContext.currentTime); gain.gain.exponentialRampToValueAtTime(.001, audioContext.currentTime + duration); oscillator.connect(gain).connect(audioContext.destination); oscillator.start(); oscillator.stop(audioContext.currentTime + duration); } catch {} }

elements.start.addEventListener('click', () => { game.level = 1; game.lives = MAX_LIVES; game.hits = 0; updateHud(); beginRound(); });
elements.track.addEventListener('click', stopSignal);
document.addEventListener('keydown', (event) => { if ((event.code === 'Space' || event.code === 'Enter') && (game.state === 'watching' || game.state === 'hidden')) { event.preventDefault(); stopSignal(); } });
document.querySelector('#help-button').addEventListener('click', () => { if (game.state === 'watching' || game.state === 'hidden') { cancelAnimationFrame(game.frame); game.state = 'paused'; } elements.help.showModal(); });
document.querySelectorAll('.dialog-close,[data-close]').forEach((button) => button.addEventListener('click', () => button.closest('dialog').close()));
elements.help.addEventListener('close', () => { if (game.state === 'paused') { game.lastTime = 0; setPhase(elements.signal.classList.contains('hidden') ? 'hidden' : 'watching', elements.signal.classList.contains('hidden') ? 'Signal hidden' : 'Signal visible'); game.frame = requestAnimationFrame(tick); } });
document.querySelector('#restart-button').addEventListener('click', restart);
elements.sound.addEventListener('click', () => { game.muted = !game.muted; localStorage.setItem('trak:muted', String(game.muted)); updateHud(); });
document.addEventListener('visibilitychange', () => { if (document.hidden && (game.state === 'watching' || game.state === 'hidden')) { cancelAnimationFrame(game.frame); game.state = 'paused-visibility'; setCopy('Round paused.', 'Return to continue from the same position.'); } else if (!document.hidden && game.state === 'paused-visibility') { game.lastTime = 0; setPhase(elements.signal.classList.contains('hidden') ? 'hidden' : 'watching', elements.signal.classList.contains('hidden') ? 'Signal hidden' : 'Signal visible'); game.frame = requestAnimationFrame(tick); } });
window.addEventListener('resize', updateHud);
updateHud();
if (!localStorage.getItem('trak:welcomed')) { localStorage.setItem('trak:welcomed', '1'); elements.help.showModal(); }
