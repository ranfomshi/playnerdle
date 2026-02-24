const STORAGE_KEY = 'seequence-best-score';

const state = {
  active: false,
  score: 0,
  level: 1,
  sequence: [],
  bestScore: Number(localStorage.getItem(STORAGE_KEY) || 0),
};

const palette = ['#ef4444', '#22c55e', '#3b82f6', '#eab308', '#f97316', '#a855f7', '#06b6d4', '#ec4899'];

const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best-score');
const levelEl = document.getElementById('level');
const statusEl = document.getElementById('status');
const sequenceDisplay = document.getElementById('sequence-display');
const optionsEl = document.getElementById('options');
const startBtn = document.getElementById('start-btn');

function shuffle(items) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function updateHud() {
  scoreEl.textContent = state.score;
  levelEl.textContent = state.level;
  bestEl.textContent = state.bestScore;
}

function getDifficulty() {
  const sequenceLength = Math.min(2 + Math.floor((state.level - 1) / 2), 7);
  const optionCount = Math.min(3 + Math.floor((state.level - 1) / 2), 6);
  const showMs = Math.max(900 - (state.level - 1) * 70, 420);
  return { sequenceLength, optionCount, showMs };
}

function createSequence(len) {
  return shuffle(palette).slice(0, len);
}

function renderOptions(options) {
  optionsEl.innerHTML = '';

  options.forEach((option) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'option-btn';
    btn.setAttribute('role', 'listitem');

    const seq = document.createElement('div');
    seq.className = 'option-seq';

    option.forEach((colour) => {
      const swatch = document.createElement('span');
      swatch.className = 'option-swatch';
      swatch.style.backgroundColor = colour;
      seq.appendChild(swatch);
    });

    btn.appendChild(seq);
    btn.addEventListener('click', () => checkAnswer(option));
    optionsEl.appendChild(btn);
  });
}

function optionKey(option) {
  return option.join('|');
}

function buildOptions(correctSequence, optionCount) {
  const options = [correctSequence];
  const used = new Set([optionKey(correctSequence)]);

  while (options.length < optionCount) {
    const candidate = shuffle(correctSequence);
    const key = optionKey(candidate);
    if (!used.has(key)) {
      used.add(key);
      options.push(candidate);
    }
  }

  return shuffle(options);
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function playSequence() {
  const { showMs } = getDifficulty();
  sequenceDisplay.innerHTML = '';

  for (const colour of state.sequence) {
    const swatch = document.createElement('div');
    swatch.className = 'sequence-pill';
    swatch.style.backgroundColor = colour;
    sequenceDisplay.innerHTML = '';
    sequenceDisplay.appendChild(swatch);
    await wait(showMs);

    sequenceDisplay.innerHTML = '';
    await wait(180);
  }
}

function saveBest() {
  if (state.score > state.bestScore) {
    state.bestScore = state.score;
    localStorage.setItem(STORAGE_KEY, String(state.bestScore));
  }
}

function gameOver() {
  state.active = false;
  saveBest();
  updateHud();
  statusEl.textContent = `Game over! Final score: ${state.score}. Press Start to try again.`;
}

function checkAnswer(option) {
  if (!state.active) return;

  if (optionKey(option) === optionKey(state.sequence)) {
    state.score += 1;
    state.level += 1;
    statusEl.textContent = 'Correct! Next level...';
    updateHud();
    startRound();
    return;
  }

  gameOver();
}

async function startRound() {
  if (!state.active) return;

  optionsEl.innerHTML = '';
  const { sequenceLength, optionCount } = getDifficulty();
  state.sequence = createSequence(sequenceLength);
  statusEl.textContent = `Level ${state.level}: Watch carefully...`;

  await playSequence();

  if (!state.active) return;

  sequenceDisplay.innerHTML = '';
  statusEl.textContent = 'Select the correct sequence order.';
  renderOptions(buildOptions(state.sequence, optionCount));
}

function startGame() {
  state.active = true;
  state.score = 0;
  state.level = 1;
  updateHud();
  statusEl.textContent = 'Get ready...';
  startRound();
}

bestEl.textContent = state.bestScore;
startBtn.addEventListener('click', startGame);
updateHud();
