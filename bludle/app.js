import { ANSWERS, ALLOWED } from './words.js';

const MAX_GUESSES = 4;
const STORAGE_KEY = 'bludle:stats:v2';
const WELCOME_KEY = 'bludle:welcomed:v2';

const elements = {
  cipher: document.querySelector('#cipher'), board: document.querySelector('#board'),
  form: document.querySelector('#guessForm'), input: document.querySelector('#guessInput'),
  message: document.querySelector('#message'), attempts: document.querySelector('#attempts'),
  submit: document.querySelector('.submit-button'), help: document.querySelector('#helpDialog'),
  stats: document.querySelector('#statsDialog'), result: document.querySelector('#resultDialog'),
  answer: document.querySelector('#answer'), resultMark: document.querySelector('#resultMark'),
  resultKicker: document.querySelector('#resultKicker'), resultTitle: document.querySelector('#resultTitle')
};

let secret;
let guesses;
let finished;

const shadeFor = letter => `rgba(0, 0, 255, ${(letter.charCodeAt(0) - 96) / 26})`;

function chooseWord(previous) {
  let next;
  do next = ANSWERS[Math.floor(Math.random() * ANSWERS.length)]; while (next === previous && ANSWERS.length > 1);
  return next;
}

function startGame() {
  const previous = secret;
  secret = chooseWord(previous);
  guesses = [];
  finished = false;
  elements.input.disabled = false;
  elements.submit.disabled = false;
  elements.input.value = '';
  setMessage('Use the shade guide to decode each letter.');
  render();
  elements.input.focus();
}

function render() {
  elements.cipher.replaceChildren(...[...secret].map((letter, index) => {
    const tile = document.createElement('div');
    tile.className = 'cipher-tile';
    tile.style.backgroundColor = shadeFor(letter);
    tile.setAttribute('aria-label', `Hidden shade ${index + 1}`);
    return tile;
  }));

  const rows = Array.from({ length: MAX_GUESSES }, (_, rowIndex) => {
    const row = document.createElement('div');
    row.className = `guess-row${rowIndex === guesses.length && !finished ? ' current' : ''}`;
    row.setAttribute('aria-label', guesses[rowIndex] ? `Guess ${rowIndex + 1}: ${guesses[rowIndex]}` : `Empty guess ${rowIndex + 1}`);
    for (let column = 0; column < 5; column += 1) {
      const tile = document.createElement('div');
      tile.className = 'guess-tile';
      const letter = guesses[rowIndex]?.[column];
      if (letter) {
        tile.textContent = letter.toUpperCase();
        tile.style.backgroundColor = shadeFor(letter);
        if (letter === secret[column]) {
          const check = document.createElement('span');
          check.className = 'exact';
          check.textContent = '✓';
          check.setAttribute('aria-label', 'Exact match');
          tile.append(check);
        }
      }
      row.append(tile);
    }
    return row;
  });
  elements.board.replaceChildren(...rows);
  const remaining = MAX_GUESSES - guesses.length;
  elements.attempts.textContent = `${remaining} attempt${remaining === 1 ? '' : 's'} left`;
}

function setMessage(text, type = '') {
  elements.message.textContent = text;
  elements.message.className = `message${type ? ` ${type}` : ''}`;
}

function submitGuess(event) {
  event.preventDefault();
  if (finished) return;
  const guess = elements.input.value.trim().toLowerCase();
  if (!/^[a-z]{5}$/.test(guess)) {
    setMessage('Enter exactly five letters.', 'error');
    elements.input.focus();
    return;
  }
  if (!ALLOWED.has(guess)) {
    setMessage('That word is not in the word list.', 'error');
    elements.input.select();
    return;
  }
  guesses.push(guess);
  elements.input.value = '';
  if (guess === secret) finish(true);
  else if (guesses.length === MAX_GUESSES) finish(false);
  else {
    render();
    setMessage('Compare the shades and exact-position ticks.');
  }
}

function finish(won) {
  finished = true;
  elements.input.disabled = true;
  elements.submit.disabled = true;
  render();
  updateStats(won);
  setMessage(won ? `Decoded in ${guesses.length}!` : `The word was ${secret.toUpperCase()}.`, won ? 'success' : 'error');
  elements.answer.textContent = secret.toUpperCase();
  elements.resultMark.textContent = won ? '✓' : secret[0].toUpperCase();
  elements.resultMark.style.background = won ? 'var(--green)' : 'var(--blue)';
  elements.resultMark.style.color = won ? '#063624' : '#fff';
  elements.resultKicker.textContent = won ? 'Spectrum decoded' : 'Four attempts used';
  elements.resultTitle.textContent = won ? 'Brilliant.' : 'So close.';
  window.setTimeout(() => elements.result.showModal(), 550);
}

function readStats() {
  try { return { played: 0, wins: 0, streak: 0, best: 0, ...JSON.parse(localStorage.getItem(STORAGE_KEY)) }; }
  catch { return { played: 0, wins: 0, streak: 0, best: 0 }; }
}

function updateStats(won) {
  const stats = readStats();
  stats.played += 1;
  if (won) { stats.wins += 1; stats.streak += 1; stats.best = Math.max(stats.best, stats.streak); }
  else stats.streak = 0;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  renderStats();
}

function renderStats() {
  const stats = readStats();
  document.querySelector('#playedStat').textContent = stats.played;
  document.querySelector('#winStat').textContent = `${stats.played ? Math.round(stats.wins / stats.played * 100) : 0}%`;
  document.querySelector('#streakStat').textContent = stats.streak;
  document.querySelector('#bestStat').textContent = stats.best;
}

elements.form.addEventListener('submit', submitGuess);
elements.input.addEventListener('input', () => { elements.input.value = elements.input.value.replace(/[^a-z]/gi, '').toUpperCase(); });
document.querySelector('#helpButton').addEventListener('click', () => elements.help.showModal());
document.querySelector('#statsButton').addEventListener('click', () => { renderStats(); elements.stats.showModal(); });
document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
document.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); }));
document.querySelector('#playAgain').addEventListener('click', () => { elements.result.close(); startGame(); });

renderStats();
startGame();
if (!localStorage.getItem(WELCOME_KEY)) {
  elements.help.showModal();
  localStorage.setItem(WELCOME_KEY, 'true');
}
