import { WORDS } from './words.js';
import { firstGuessProperties } from './firstGuessTelemetry.js';

const WORD_LENGTH = 5;
const MAX_ATTEMPTS = 5;
const STORAGE_KEY = 'werdle:v2';
const KEY_ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];
const STATUS_RANK = { absent: 1, present: 2, exact: 3 };

const elements = {
  board: document.querySelector('#board'),
  keyboard: document.querySelector('#keyboard'),
  message: document.querySelector('#message'),
  puzzleLabel: document.querySelector('#puzzle-label'),
  attemptLabel: document.querySelector('#attempt-label'),
  help: document.querySelector('#help-dialog'),
  stats: document.querySelector('#stats-dialog'),
  resultActions: document.querySelector('#result-actions'),
  toast: document.querySelector('#toast'),
};

const todayKey = () => new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit',
}).format(new Date());

const hash = (text) => {
  let value = 2166136261;
  for (const char of text) value = Math.imul(value ^ char.charCodeAt(0), 16777619);
  return value >>> 0;
};

const dailyWord = () => WORDS[hash(`werdle:${todayKey()}`) % WORDS.length];
const practiceWord = (previous) => {
  if (WORDS.length < 2) return WORDS[0];
  let word;
  do word = WORDS[Math.floor(Math.random() * WORDS.length)]; while (word === previous);
  return word;
};

const defaultStats = () => ({ played: 0, wins: 0, streak: 0, best: 0 });
const loadStore = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return { stats: { ...defaultStats(), ...parsed?.stats }, daily: parsed?.daily || null };
  } catch { return { stats: defaultStats(), daily: null }; }
};

const store = loadStore();
let mode = localStorage.getItem('werdle:mode') || 'daily';
let game = createGame(mode);
let locked = false;

function createGame(nextMode, forceNew = false) {
  if (nextMode === 'daily' && !forceNew && store.daily?.date === todayKey()) {
    return { mode: 'daily', secret: dailyWord(), guesses: store.daily.guesses || [], current: '', status: store.daily.status || 'playing' };
  }
  return { mode: nextMode, secret: nextMode === 'daily' ? dailyWord() : practiceWord(null), guesses: [], current: '', status: 'playing' };
}

function save() {
  if (game.mode === 'daily') store.daily = { date: todayKey(), guesses: game.guesses, status: game.status };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  localStorage.setItem('werdle:mode', mode);
}

function scoreGuess(guess, secret) {
  const result = Array(WORD_LENGTH).fill('absent');
  const remaining = [...secret];
  [...guess].forEach((letter, index) => {
    if (letter === secret[index]) { result[index] = 'exact'; remaining[index] = null; }
  });
  [...guess].forEach((letter, index) => {
    if (result[index] === 'exact') return;
    const match = remaining.indexOf(letter);
    if (match !== -1) { result[index] = 'present'; remaining[match] = null; }
  });
  return result;
}

function trackFirstGuess(guess) {
  const properties = firstGuessProperties(guess, scoreGuess(guess, game.secret), game.mode);
  if (!properties) return;
  if (window.BludleEngagement?.gameEvent) {
    window.BludleEngagement.gameEvent('werdle_first_guess', properties);
    return;
  }
  window.__bludleGameplayEventQueue = window.__bludleGameplayEventQueue || [];
  window.__bludleGameplayEventQueue.push({ eventName: 'werdle_first_guess', properties });
}

function render() {
  renderBoard();
  renderKeyboard();
  document.querySelectorAll('[data-mode]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.mode === mode)));
  elements.puzzleLabel.textContent = mode === 'daily' ? `Daily · ${todayKey()}` : 'Unlimited practice';
  const left = MAX_ATTEMPTS - game.guesses.length;
  elements.attemptLabel.textContent = game.status === 'playing' ? `${left} ${left === 1 ? 'try' : 'tries'} left` : game.status === 'won' ? `Solved in ${game.guesses.length}` : 'Round complete';
  elements.resultActions.hidden = game.status === 'playing';
  document.querySelector('#next-button').hidden = mode === 'daily';
}

function renderBoard() {
  elements.board.replaceChildren();
  for (let rowIndex = 0; rowIndex < MAX_ATTEMPTS; rowIndex++) {
    const row = document.createElement('div');
    row.className = 'board-row'; row.setAttribute('role', 'row'); row.dataset.row = rowIndex;
    const guess = game.guesses[rowIndex] || (rowIndex === game.guesses.length ? game.current : '');
    const scores = game.guesses[rowIndex] ? scoreGuess(guess, game.secret) : [];
    for (let index = 0; index < WORD_LENGTH; index++) {
      const tile = document.createElement('div');
      tile.className = `tile${guess[index] ? ' filled' : ''}${scores[index] ? ` ${scores[index]}` : ''}`;
      tile.textContent = guess[index] || '';
      tile.setAttribute('role', 'gridcell');
      tile.setAttribute('aria-label', scores[index] ? `${guess[index]}, ${scores[index]}` : guess[index] || 'Empty');
      row.append(tile);
    }
    elements.board.append(row);
  }
}

function renderKeyboard() {
  const statuses = {};
  game.guesses.forEach((guess) => scoreGuess(guess, game.secret).forEach((status, index) => {
    const key = guess[index].toUpperCase();
    if (!statuses[key] || STATUS_RANK[status] > STATUS_RANK[statuses[key]]) statuses[key] = status;
  }));
  elements.keyboard.replaceChildren();
  KEY_ROWS.forEach((letters, rowIndex) => {
    const row = document.createElement('div'); row.className = 'key-row';
    if (rowIndex === 2) row.append(makeKey('ENTER', 'Enter', true));
    [...letters].forEach((letter) => row.append(makeKey(letter, letter, false, statuses[letter])));
    if (rowIndex === 2) row.append(makeKey('BACKSPACE', 'Delete', true, '', '⌫'));
    elements.keyboard.append(row);
  });
}

function makeKey(value, label, wide, status = '', text = value) {
  const button = document.createElement('button');
  button.type = 'button'; button.className = `key${wide ? ' wide' : ''}${status ? ` ${status}` : ''}`;
  button.dataset.key = value; button.textContent = text; button.setAttribute('aria-label', label);
  return button;
}

function handleKey(key) {
  if (locked || game.status !== 'playing') return;
  if (key === 'ENTER') return submitGuess();
  if (key === 'BACKSPACE') game.current = game.current.slice(0, -1);
  else if (/^[A-Z]$/.test(key) && game.current.length < WORD_LENGTH) game.current += key.toLowerCase();
  setMessage(game.current ? `${game.current.length} of ${WORD_LENGTH} letters` : 'Type any five letters to begin');
  renderBoard();
}

async function submitGuess() {
  if (game.current.length !== WORD_LENGTH) return invalid('Enter five letters first');
  locked = true;
  const guess = game.current;
  if (game.guesses.length === 0) trackFirstGuess(guess);
  game.guesses.push(guess); game.current = '';
  render();
  const row = elements.board.querySelector(`[data-row="${game.guesses.length - 1}"]`);
  row.querySelectorAll('.tile').forEach((tile, index) => { tile.classList.add('reveal'); tile.style.animationDelay = `${index * 80}ms`; });
  await new Promise((resolve) => setTimeout(resolve, 420 + WORD_LENGTH * 80));
  if (guess === game.secret) finish('won');
  else if (game.guesses.length >= MAX_ATTEMPTS) finish('lost');
  else { locked = false; setMessage('Good clue. Keep going.'); render(); save(); }
}

function finish(status) {
  game.status = status; locked = false;
  store.stats.played += 1;
  if (status === 'won') { store.stats.wins += 1; store.stats.streak += 1; store.stats.best = Math.max(store.stats.best, store.stats.streak); setMessage('Brilliant — you found it!', 'success'); }
  else { store.stats.streak = 0; setMessage(`The word was ${game.secret.toUpperCase()}`, 'error'); }
  save(); render(); updateStats();
  setTimeout(() => elements.stats.showModal(), 550);
}

function invalid(message) {
  const row = elements.board.querySelector(`[data-row="${game.guesses.length}"]`);
  row?.classList.add('shake'); setTimeout(() => row?.classList.remove('shake'), 400);
  setMessage(message, 'error');
}

function setMessage(text, type = '') { elements.message.textContent = text; elements.message.className = `message${type ? ` ${type}` : ''}`; }
function updateStats() {
  const { played, wins, streak, best } = store.stats;
  document.querySelector('#stat-played').textContent = played;
  document.querySelector('#stat-win-rate').textContent = `${played ? Math.round(wins / played * 100) : 0}%`;
  document.querySelector('#stat-streak').textContent = streak;
  document.querySelector('#stat-best').textContent = best;
}

function newPracticeGame() {
  game = createGame('practice', true); elements.stats.close(); setMessage('A fresh word is ready'); render(); save();
}

function shareText() {
  const rows = game.guesses.map((guess) => scoreGuess(guess, game.secret).map((status) => ({ exact: '🟩', present: '🟦', absent: '⬛' })[status]).join('')).join('\n');
  return `Werdle ${game.mode === 'daily' ? todayKey() : 'Practice'} ${game.status === 'won' ? game.guesses.length : 'X'}/${MAX_ATTEMPTS}\n\n${rows}\n\nbludle.com/werdle`;
}

async function share() {
  const text = shareText();
  try {
    if (navigator.share) await navigator.share({ title: 'Werdle', text });
    else { await navigator.clipboard.writeText(text); toast('Result copied'); }
  } catch (error) { if (error.name !== 'AbortError') toast('Could not share result'); }
}

let toastTimer;
function toast(text) { clearTimeout(toastTimer); elements.toast.textContent = text; elements.toast.classList.add('show'); toastTimer = setTimeout(() => elements.toast.classList.remove('show'), 2200); }

document.addEventListener('keydown', (event) => {
  if (document.querySelector('dialog[open]')) return;
  const key = event.key === 'Enter' ? 'ENTER' : event.key === 'Backspace' ? 'BACKSPACE' : event.key.toUpperCase();
  if (key === 'ENTER' || key === 'BACKSPACE' || /^[A-Z]$/.test(key)) { event.preventDefault(); handleKey(key); }
});
elements.keyboard.addEventListener('click', (event) => { const button = event.target.closest('[data-key]'); if (button) handleKey(button.dataset.key); });
document.querySelectorAll('[data-mode]').forEach((button) => button.addEventListener('click', () => {
  const nextMode = button.dataset.mode;
  if (nextMode === mode) return;
  mode = nextMode; game = createGame(mode); setMessage(mode === 'daily' ? 'Today’s puzzle is ready' : 'A fresh practice word is ready'); render(); save();
}));
document.querySelector('#help-button').addEventListener('click', () => elements.help.showModal());
document.querySelector('#stats-button').addEventListener('click', () => { updateStats(); elements.stats.showModal(); });
document.querySelector('#share-button').addEventListener('click', share);
document.querySelector('#next-button').addEventListener('click', newPracticeGame);
document.querySelectorAll('.dialog-close,[data-close]').forEach((button) => button.addEventListener('click', () => button.closest('dialog').close()));
document.querySelectorAll('dialog').forEach((dialog) => dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); }));

updateStats(); render();
if (!localStorage.getItem('werdle:welcomed')) { localStorage.setItem('werdle:welcomed', '1'); elements.help.showModal(); }
