const DAY_KEY = 'currentDay';
const PLAYED_KEY = 'playedToday';
const TIME_KEY = 'reactionTime';
const FALSE_START_KEY = 'reactionFalseStart';
const HISTORY_KEY = 'historicScores';

const elements = {
  card: document.querySelector('#reaction-card'),
  button: document.querySelector('#gameButton'),
  buttonLabel: document.querySelector('#button-label'),
  kicker: document.querySelector('#result-kicker'),
  value: document.querySelector('#reaction-value'),
  unit: document.querySelector('#reaction-unit'),
  title: document.querySelector('#result-title'),
  feedback: document.querySelector('#feedback'),
  effects: document.querySelector('#effect-layer'),
  help: document.querySelector('#instructions-dialog'),
  stats: document.querySelector('#stats-dialog'),
};

const tiers = [
  { id: 'impossible', max: 159, kicker: 'Did time just bend?', title: 'That was otherworldly.', copy: 'Either you saw the future or your nervous system has cheat codes.', intensity: 1.35, particles: 54, colours: ['#7c3aed', '#22d3ee', '#f8d34d', '#ffffff'] },
  { id: 'lightning', max: 199, kicker: 'Top-tier reflexes', title: 'Absolutely ridiculous.', copy: 'That is a genuinely exceptional reaction. Blink and everyone else misses it.', intensity: 1.2, particles: 44, colours: ['#f5b700', '#ff6b35', '#2f5fde', '#ffffff'] },
  { id: 'elite', max: 249, kicker: 'Elite territory', title: 'Seriously quick.', copy: 'You are operating at the sharp end of human reaction speed.', intensity: 1, particles: 32, colours: ['#1f9d66', '#6ee7b7', '#2f5fde', '#ffffff'] },
  { id: 'sharp', max: 319, kicker: 'Fast hands', title: 'Sharp.', copy: 'Comfortably quick. The signal barely had time to exist.', intensity: .72, particles: 20, colours: ['#2f5fde', '#82a6f3', '#ffffff'] },
  { id: 'solid', max: 419, kicker: 'Human, confirmed', title: 'Respectable.', copy: 'A solid response with room to take a few more milliseconds off.', intensity: .42, particles: 10, colours: ['#4e5875', '#9aa3bc', '#ffffff'] },
  { id: 'sleepy', max: 599, kicker: 'Were you distracted?', title: 'A little leisurely.', copy: 'The signal arrived, made a cup of tea, and then you clicked it.', intensity: .7, particles: 14, colours: ['#58709e', '#9fb8d8', '#dce9f3'] },
  { id: 'glacial', max: Infinity, kicker: 'Continental drift detected', title: 'Glacial.', copy: 'Historians will debate what happened in the gap between green and click.', intensity: 1.2, particles: 28, colours: ['#267a9d', '#8ed4e8', '#d9f4ff', '#ffffff'] },
];

let signalAt = 0;
let signalTimer = 0;
let phase = 'idle';

function dayKey() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/London',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function dayNumber() {
  return Math.floor(new Date(`${dayKey()}T12:00:00Z`).getTime() / 86400000);
}

function dailyDelay() {
  let seed = dayNumber() ^ 0x9e3779b9;
  seed = Math.imul(seed ^ (seed >>> 16), 0x21f0aaad);
  seed = Math.imul(seed ^ (seed >>> 15), 0x735a2d97);
  return 1700 + ((seed ^ (seed >>> 15)) >>> 0) % 2800;
}

function readHistory() {
  try {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    return Array.isArray(history) ? history.filter(entry => Number.isFinite(Number(entry.reactionTime))) : [];
  } catch {
    return [];
  }
}

function saveResult(reactionTime, falseStart = false) {
  localStorage.setItem(PLAYED_KEY, 'true');
  localStorage.setItem(TIME_KEY, String(reactionTime));
  localStorage.setItem(FALSE_START_KEY, String(falseStart));
  const history = readHistory();
  history.push({ date: dayKey(), reactionTime, falseStart });
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(-60)));
}

function tierFor(reactionTime) {
  return tiers.find(tier => reactionTime <= tier.max);
}

function resetEffects() {
  elements.effects.replaceChildren();
  elements.card.classList.remove('result-fallback');
}

function createParticles(tier) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return [];
  const particles = [];
  for (let index = 0; index < tier.particles; index += 1) {
    const particle = document.createElement('i');
    particle.className = `reaction-particle${tier.id === 'glacial' || tier.id === 'sleepy' ? ' snow' : ''}`;
    particle.style.setProperty('--particle-colour', tier.colours[index % tier.colours.length]);
    elements.effects.append(particle);
    particles.push(particle);
  }
  return particles;
}

function createFalseStartShards() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return [];
  return Array.from({ length: 30 }, (_, index) => {
    const shard = document.createElement('i');
    shard.className = 'reaction-particle shard';
    shard.style.setProperty('--particle-colour', index % 3 === 0 ? '#232a42' : '#d6394a');
    elements.effects.append(shard);
    return shard;
  });
}

async function animateResult(tier, reactionTime, particles, restored) {
  if (restored || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const motion = await window.BludleMotion?.load();
  if (!motion) {
    elements.card.classList.add('result-fallback');
    return;
  }

  const { gsap } = motion;
  const number = { value: tier.id === 'false-start' ? 0 : Math.max(0, reactionTime * .35) };
  const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
  timeline
    .fromTo(elements.card, { scale: .975 }, { scale: 1, duration: .46 })
    .fromTo(elements.kicker, { autoAlpha: 0, y: -12 }, { autoAlpha: 1, y: 0, duration: .3 }, '<')
    .fromTo(elements.value, { autoAlpha: 0, scale: .55, y: 20 }, { autoAlpha: 1, scale: 1, y: 0, duration: .62, ease: 'back.out(1.8)' }, '<.04')
    .fromTo([elements.title, elements.feedback], { autoAlpha: 0, y: 15 }, { autoAlpha: 1, y: 0, duration: .34, stagger: .07 }, '<.22');

  if (tier.id !== 'false-start') {
    gsap.to(number, {
      value: reactionTime,
      duration: .72,
      ease: tier.id === 'glacial' ? 'power1.inOut' : 'power3.out',
      onUpdate: () => { elements.value.textContent = Math.round(number.value); },
    });
  }

  if (tier.id === 'false-start') {
    gsap.fromTo(elements.card, { x: -13, rotation: -.35 }, { x: 13, rotation: .35, duration: .055, repeat: 9, yoyo: true, clearProps: 'transform' });
  }

  particles.forEach((particle, index) => {
    if (tier.id === 'glacial' || tier.id === 'sleepy') {
      gsap.set(particle, { left: `${4 + (index * 37) % 92}%`, y: -20, opacity: .85, scale: .5 + (index % 4) * .2 });
      gsap.to(particle, {
        y: 560,
        x: ((index % 7) - 3) * 18,
        rotation: index * 31,
        opacity: 0,
        duration: 1.5 + (index % 6) * .18,
        delay: (index % 9) * .045,
        ease: 'power1.in',
      });
      return;
    }
    const angle = (Math.PI * 2 * index) / Math.max(1, particles.length);
    const distance = (170 + (index % 7) * 24) * tier.intensity;
    gsap.set(particle, { opacity: 1, scale: .6 + (index % 4) * .25, rotation: index * 29 });
    gsap.to(particle, {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      rotation: 240 + index * 37,
      opacity: 0,
      scale: .2,
      duration: .72 + (index % 5) * .12,
      delay: (index % 6) * .018,
      ease: 'power2.out',
    });
  });
}

function presentResult(reactionTime, { falseStart = false, restored = false } = {}) {
  clearTimeout(signalTimer);
  phase = 'complete';
  resetEffects();

  const tier = falseStart
    ? { id: 'false-start', kicker: 'Disqualified', title: 'You jumped the light.', copy: 'The signal was still red. Today’s attempt has evaporated spectacularly.', intensity: 1.2, particles: 30, colours: ['#d6394a', '#232a42', '#ffffff'] }
    : tierFor(reactionTime);
  const particles = restored ? [] : falseStart ? createFalseStartShards() : createParticles(tier);

  document.body.dataset.reactionTier = tier.id;
  elements.card.dataset.state = 'result';
  elements.kicker.textContent = restored ? 'Today’s result' : tier.kicker;
  elements.value.textContent = falseStart ? 'TOO SOON' : String(reactionTime);
  elements.unit.hidden = falseStart;
  elements.title.textContent = tier.title;
  elements.feedback.textContent = tier.copy;
  elements.buttonLabel.textContent = 'Played today';
  elements.button.disabled = true;
  elements.button.querySelector('.trigger-dot').hidden = true;

  animateResult(tier, reactionTime, particles, restored);
}

function falseStart() {
  if (phase !== 'waiting') return;
  const penalty = 5000;
  saveResult(penalty, true);
  presentResult(penalty, { falseStart: true });
}

function finishReaction() {
  if (phase !== 'signal') return;
  const reactionTime = Math.max(1, Math.round(performance.now() - signalAt));
  saveResult(reactionTime);
  presentResult(reactionTime);
}

function showSignal() {
  if (phase !== 'waiting') return;
  phase = 'signal';
  signalAt = performance.now();
  elements.card.dataset.state = 'signal';
  elements.kicker.textContent = 'Now!';
  elements.value.textContent = 'GO';
  elements.title.textContent = 'Hit it!';
  elements.feedback.textContent = 'Click the green button immediately.';
  elements.buttonLabel.textContent = 'Click!';
}

function startGame() {
  if (phase !== 'idle') return;
  phase = 'waiting';
  resetEffects();
  document.body.dataset.reactionTier = 'waiting';
  elements.card.dataset.state = 'waiting';
  elements.kicker.textContent = 'Do not click yet';
  elements.value.textContent = 'HOLD';
  elements.unit.hidden = true;
  elements.title.textContent = 'Wait for green.';
  elements.feedback.textContent = 'Anticipating the signal counts as a false start.';
  elements.buttonLabel.textContent = 'Hold…';
  signalTimer = window.setTimeout(showSignal, dailyDelay());
  window.BludleMotion?.load();
}

function handleButton() {
  if (phase === 'idle') startGame();
  else if (phase === 'waiting') falseStart();
  else if (phase === 'signal') finishReaction();
}

function renderHistory() {
  const history = readHistory();
  const graph = document.querySelector('#reactionGraph');
  graph.replaceChildren();
  if (!history.length) {
    graph.textContent = 'Complete today’s test to start your history.';
    document.querySelector('#best-time').textContent = '—';
    document.querySelector('#average-time').textContent = '—';
    document.querySelector('#attempt-count').textContent = '0';
    return;
  }

  const recent = history.slice(-16);
  const validTimes = history.filter(entry => !entry.falseStart && Number(entry.reactionTime) < 5000).map(entry => Number(entry.reactionTime));
  const best = validTimes.length ? Math.min(...validTimes) : null;
  const average = validTimes.length ? Math.round(validTimes.reduce((sum, value) => sum + value, 0) / validTimes.length) : null;
  const graphMax = Math.max(650, ...recent.map(entry => Math.min(Number(entry.reactionTime), 1000)));

  recent.forEach(entry => {
    const value = Number(entry.reactionTime);
    const bar = document.createElement('i');
    const falseStart = entry.falseStart || value >= 5000;
    bar.className = `history-bar${value === best ? ' best' : ''}${falseStart ? ' false-start' : ''}`;
    bar.style.height = `${Math.max(8, (Math.min(value, 1000) / graphMax) * 100)}%`;
    bar.title = `${entry.date}: ${falseStart ? 'false start' : `${value} ms`}`;
    graph.append(bar);
  });

  document.querySelector('#best-time').textContent = best === null ? '—' : `${best} ms`;
  document.querySelector('#average-time').textContent = average === null ? '—' : `${average} ms`;
  document.querySelector('#attempt-count').textContent = String(history.length);
}

function initialise() {
  const storedDay = localStorage.getItem(DAY_KEY);
  if (storedDay !== dayKey()) {
    localStorage.removeItem(PLAYED_KEY);
    localStorage.removeItem(FALSE_START_KEY);
    localStorage.setItem(DAY_KEY, dayKey());
  }

  if (localStorage.getItem(PLAYED_KEY) === 'true') {
    const reactionTime = Number(localStorage.getItem(TIME_KEY));
    const falseStart = localStorage.getItem(FALSE_START_KEY) === 'true';
    if (Number.isFinite(reactionTime)) presentResult(reactionTime, { falseStart, restored: true });
  }
}

elements.button.addEventListener('click', handleButton);
document.querySelector('#help-button').addEventListener('click', () => elements.help.showModal());
document.querySelector('#stats-button').addEventListener('click', () => { renderHistory(); elements.stats.showModal(); });
document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
document.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('click', event => {
  if (event.target === dialog) dialog.close();
}));

initialise();
