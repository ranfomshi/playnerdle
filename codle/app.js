import { CodleGame, MAX_GUESSES, createPuzzle } from './gameEngine.js';
import { WORDS } from './words.js';

const $ = selector => document.querySelector(selector);
const statsKey = 'codle:stats:v2';
const welcomeKey = 'codle:welcome:v2';
let game;
let toastTimer;

function readStats() {
  try {
    return { played: 0, won: 0, streak: 0, bestStreak: 0, bestScore: 0, ...JSON.parse(localStorage.getItem(statsKey)) };
  } catch {
    return { played: 0, won: 0, streak: 0, bestStreak: 0, bestScore: 0 };
  }
}

function writeStats(stats) {
  localStorage.setItem(statsKey, JSON.stringify(stats));
  renderStats();
}

function renderStats() {
  const stats = readStats();
  $('#games-played').textContent = stats.played;
  $('#games-won').textContent = stats.won;
  $('#best-streak').textContent = stats.bestStreak;
  $('#best-score').textContent = stats.bestScore.toLocaleString();
  $('#streak').textContent = stats.streak;
}

function renderPuzzle() {
  const { puzzle } = game;
  $('#coded-word').innerHTML = [...puzzle.codedWord].map(letter => `<span class="code-tile">${letter}</span>`).join('');
  $('#coded-word').setAttribute('aria-label', `Coded word: ${[...puzzle.codedWord].join(' ')}`);
  $('#rule-level').textContent = `${puzzle.rule.tag} · ${puzzle.rule.difficulty}`;
  $('#rule-tag').textContent = `${puzzle.rule.tag} RULE`;
  $('#rule-name').textContent = puzzle.rule.name;
  $('#rule-description').textContent = puzzle.rule.description;
  renderInput();
  renderHistory();
  renderStatus();
}

function renderInput() {
  const value = $('#guess-input').value.toLowerCase();
  $('#input-tiles').innerHTML = Array.from({ length: 5 }, (_, index) => {
    const letter = value[index] || '';
    return `<span class="input-tile ${letter ? 'filled' : ''} ${index === value.length ? 'active' : ''}">${letter}</span>`;
  }).join('');
  $('#submit-button').disabled = !/^[a-z]{5}$/.test(value) || game.status !== 'playing';
}

function renderHistory() {
  $('#guess-grid').innerHTML = Array.from({ length: MAX_GUESSES }, (_, rowIndex) => {
    const entry = game.guesses[rowIndex];
    const tiles = Array.from({ length: 5 }, (_, index) => {
      const letter = entry?.guess[index] || '';
      const state = entry?.feedback[index] || '';
      return `<span class="guess-tile ${state}">${letter}</span>`;
    }).join('');
    return `<div class="guess-row ${entry && rowIndex === game.guesses.length - 1 ? 'reveal' : ''}" aria-label="${entry ? `Guess ${rowIndex + 1}: ${entry.guess}` : `Empty attempt ${rowIndex + 1}`}">${tiles}</div>`;
  }).join('');
}

function renderStatus() {
  $('#attempts-left').textContent = game.guessesLeft;
  $('#guess-count').textContent = game.status === 'playing' ? `Attempt ${game.guesses.length + 1} of ${MAX_GUESSES}` : 'Transmission closed';
  const button = $('#hint-button');
  button.disabled = !game.hintAvailable || game.hintUsed;
  if (game.hintUsed) button.innerHTML = 'Key unlocked <span>APPLIED</span>';
  else button.innerHTML = 'Unlock key <span>−350 pts</span>';
  if (!game.hintUsed) $('#hint-copy').textContent = game.hintAvailable ? 'You can reveal the cipher key now.' : 'The cipher key unlocks after two attempts.';
}

function startPuzzle() {
  game = new CodleGame(createPuzzle(WORDS));
  $('#guess-input').value = '';
  $('#input-error').textContent = '';
  $('#hint-copy').textContent = 'The cipher key unlocks after two attempts.';
  renderPuzzle();
  setTimeout(() => $('#guess-input').focus(), 0);
}

function submitGuess(event) {
  event.preventDefault();
  const result = game.submit($('#guess-input').value);
  if (result.error) { showError(result.error); return; }
  window.sendEvent?.('codle', 'submit', result.guess);
  $('#guess-input').value = '';
  $('#input-error').textContent = '';
  renderInput();
  renderHistory();
  renderStatus();
  if (result.finished) setTimeout(() => finishGame(result), 480);
  else $('#guess-input').focus();
}

function finishGame(result) {
  const stats = readStats();
  stats.played += 1;
  if (result.won) {
    stats.won += 1;
    stats.streak += 1;
    stats.bestStreak = Math.max(stats.bestStreak, stats.streak);
    stats.bestScore = Math.max(stats.bestScore, result.score);
  } else stats.streak = 0;
  writeStats(stats);

  $('#result-mark').textContent = result.won ? '✓' : '×';
  $('#result-mark').classList.toggle('lost', !result.won);
  $('#result-kicker').textContent = result.won ? 'CODE CRACKED' : 'SIGNAL LOST';
  $('#result-title').textContent = result.won ? 'Signal decoded.' : 'The code held.';
  $('#result-copy').textContent = result.won ? `You broke the ${game.puzzle.rule.name.toLowerCase()} in ${game.guesses.length} ${game.guesses.length === 1 ? 'attempt' : 'attempts'}.` : `The rule was ${game.puzzle.rule.name.toLowerCase()}. Here is the decoded word.`;
  $('#answer-reveal').innerHTML = [...game.puzzle.word].map(letter => `<span>${letter}</span>`).join('');
  $('#result-score').textContent = result.score.toLocaleString();
  $('#result-attempts').textContent = game.guesses.length;
  $('#result-streak').textContent = stats.streak;
  $('#result-dialog').showModal();
}

function showError(message) {
  $('#input-error').textContent = message;
  $('#guess-input').focus();
}

function showToast(message) {
  clearTimeout(toastTimer);
  $('#toast').textContent = message;
  $('#toast').classList.add('show');
  toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 2600);
}

$('#guess-input').addEventListener('input', event => {
  event.target.value = event.target.value.replace(/[^a-z]/gi, '').slice(0, 5).toLowerCase();
  $('#input-error').textContent = '';
  renderInput();
});
$('#guess-input').addEventListener('focus', () => $('#input-tiles').classList.add('focused'));
$('#guess-input').addEventListener('blur', () => $('#input-tiles').classList.remove('focused'));
$('#input-tiles').addEventListener('click', () => $('#guess-input').focus());
$('#guess-form').addEventListener('submit', submitGuess);
$('#hint-button').addEventListener('click', () => {
  const hint = game.useHint();
  if (!hint) return;
  $('#hint-copy').textContent = hint;
  renderStatus();
  showToast('Cipher key unlocked · 350 point cost');
});
$('#help-button').addEventListener('click', () => $('#help-dialog').showModal());
$('#stats-button').addEventListener('click', () => { renderStats(); $('#stats-dialog').showModal(); });
$('#next-button').addEventListener('click', () => { $('#result-dialog').close(); startPuzzle(); });
document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
document.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('click', event => {
  if (event.target === dialog && dialog.id !== 'result-dialog') dialog.close();
}));

renderStats();
startPuzzle();
if (!localStorage.getItem(welcomeKey)) {
  $('#help-dialog').showModal();
  localStorage.setItem(welcomeKey, 'true');
}
