const puzzles = [
  { left: 'rain', bridge: 'bow', right: 'tie', leftPhrase: 'rainbow', rightPhrase: 'bow tie', hint: 'It can be tied, drawn or used to shoot an arrow.' },
  { left: 'foot', bridge: 'ball', right: 'room', leftPhrase: 'football', rightPhrase: 'ballroom', hint: 'A round object used in many sports.' },
  { left: 'star', bridge: 'fish', right: 'tank', leftPhrase: 'starfish', rightPhrase: 'fish tank', hint: 'It swims, although the first connection does not.' },
  { left: 'sun', bridge: 'flower', right: 'bed', leftPhrase: 'sunflower', rightPhrase: 'flower bed', hint: 'Something colourful that grows from a stem.' },
  { left: 'door', bridge: 'bell', right: 'pepper', leftPhrase: 'doorbell', rightPhrase: 'bell pepper', hint: 'It rings in one connection and grows in the other.' },
  { left: 'hand', bridge: 'shake', right: 'down', leftPhrase: 'handshake', rightPhrase: 'shakedown', hint: 'A quick movement that can also seal a greeting.' },
  { left: 'fire', bridge: 'fly', right: 'paper', leftPhrase: 'firefly', rightPhrase: 'flypaper', hint: 'An insect action—and sometimes the insect itself.' },
  { left: 'moon', bridge: 'light', right: 'house', leftPhrase: 'moonlight', rightPhrase: 'lighthouse', hint: 'It helps you see and can come from the sky.' },
  { left: 'eye', bridge: 'ball', right: 'game', leftPhrase: 'eyeball', rightPhrase: 'ball game', hint: 'Round, bouncy and shared with another puzzle in this preview.' },
  { left: 'news', bridge: 'paper', right: 'clip', leftPhrase: 'newspaper', rightPhrase: 'paperclip', hint: 'You can write on it or fasten it together.' },
  { left: 'wheel', bridge: 'chair', right: 'lift', leftPhrase: 'wheelchair', rightPhrase: 'chairlift', hint: 'A seat that moves in both connections.' },
  { left: 'head', bridge: 'line', right: 'backer', leftPhrase: 'headline', rightPhrase: 'linebacker', hint: 'It might be drawn, read or defended.' },
  { left: 'brain', bridge: 'storm', right: 'drain', leftPhrase: 'brainstorm', rightPhrase: 'storm drain', hint: 'It brings heavy weather to one connection and ideas to the other.' },
  { left: 'cross', bridge: 'word', right: 'play', leftPhrase: 'crossword', rightPhrase: 'wordplay', hint: 'Exactly what this game is made from.' },
  { left: 'day', bridge: 'dream', right: 'team', leftPhrase: 'daydream', rightPhrase: 'dream team', hint: 'Something imagined while awake or asleep.' },
  { left: 'key', bridge: 'board', right: 'game', leftPhrase: 'keyboard', rightPhrase: 'board game', hint: 'A flat surface that can hold keys or pieces.' },
  { left: 'home', bridge: 'work', right: 'shop', leftPhrase: 'homework', rightPhrase: 'workshop', hint: 'A task, effort or place of making.' },
  { left: 'grand', bridge: 'mother', right: 'board', leftPhrase: 'grandmother', rightPhrase: 'motherboard', hint: 'A parent in one direction and a computer component in the other.' },
  { left: 'back', bridge: 'pack', right: 'age', leftPhrase: 'backpack', rightPhrase: 'package', hint: 'Something prepared together for carrying or delivery.' },
  { left: 'bed', bridge: 'room', right: 'mate', leftPhrase: 'bedroom', rightPhrase: 'roommate', hint: 'A part of a home that can also be shared.' },
  { left: 'after', bridge: 'party', right: 'line', leftPhrase: 'afterparty', rightPhrase: 'party line', hint: 'A celebration, gathering or political position.' },
  { left: 'pan', bridge: 'cake', right: 'mix', leftPhrase: 'pancake', rightPhrase: 'cake mix', hint: 'A sweet bake—or a flat breakfast favourite.' },
  { left: 'play', bridge: 'ground', right: 'floor', leftPhrase: 'playground', rightPhrase: 'ground floor', hint: 'Earth beneath your feet.' },
  { left: 'tooth', bridge: 'brush', right: 'fire', leftPhrase: 'toothbrush', rightPhrase: 'brushfire', hint: 'Used for cleaning in one direction; dry vegetation in the other.' },
  { left: 'blue', bridge: 'print', right: 'out', leftPhrase: 'blueprint', rightPhrase: 'printout', hint: 'A plan or a paper copy.' },
  { left: 'water', bridge: 'fall', right: 'guy', leftPhrase: 'waterfall', rightPhrase: 'fall guy', hint: 'A season, a tumble or something cascading.' },
  { left: 'air', bridge: 'port', right: 'hole', leftPhrase: 'airport', rightPhrase: 'porthole', hint: 'A harbour or an opening for connection.' },
  { left: 'butter', bridge: 'fly', right: 'wheel', leftPhrase: 'butterfly', rightPhrase: 'flywheel', hint: 'Move through the air.' },
  { left: 'counter', bridge: 'point', right: 'guard', leftPhrase: 'counterpoint', rightPhrase: 'point guard', hint: 'A position, argument or exact location.' },
  { left: 'green', bridge: 'house', right: 'boat', leftPhrase: 'greenhouse', rightPhrase: 'houseboat', hint: 'A building that can grow plants or float.' },
  { left: 'base', bridge: 'ball', right: 'park', leftPhrase: 'baseball', rightPhrase: 'ballpark', hint: 'A sporting sphere.' },
  { left: 'cup', bridge: 'cake', right: 'walk', leftPhrase: 'cupcake', rightPhrase: 'cakewalk', hint: 'A sweet treat and something very easy.' },
  { left: 'break', bridge: 'fast', right: 'food', leftPhrase: 'breakfast', rightPhrase: 'fast food', hint: 'Quickly.' },
  { left: 'over', bridge: 'time', right: 'line', leftPhrase: 'overtime', rightPhrase: 'timeline', hint: 'Measured by clocks and arranged in sequence.' },
  { left: 'under', bridge: 'ground', right: 'hog', leftPhrase: 'underground', rightPhrase: 'groundhog', hint: 'The earth or soil beneath us.' },
  { left: 'note', bridge: 'book', right: 'case', leftPhrase: 'notebook', rightPhrase: 'bookcase', hint: 'Something you read or write in.' },
  { left: 'side', bridge: 'walk', right: 'way', leftPhrase: 'sidewalk', rightPhrase: 'walkway', hint: 'A route travelled on foot.' },
  { left: 'black', bridge: 'board', right: 'room', leftPhrase: 'blackboard', rightPhrase: 'boardroom', hint: 'A flat surface—or a group that runs an organisation.' },
  { left: 'sand', bridge: 'box', right: 'office', leftPhrase: 'sandbox', rightPhrase: 'box office', hint: 'A container, a square or a place that sells tickets.' },
  { left: 'time', bridge: 'table', right: 'cloth', leftPhrase: 'timetable', rightPhrase: 'tablecloth', hint: 'Furniture that can also organise a schedule.' }
];

const elements = {
  day: document.querySelector('#day-number'),
  left: document.querySelector('#left-word'),
  right: document.querySelector('#right-word'),
  planks: document.querySelector('#bridge-planks'),
  scene: document.querySelector('#bridge-scene'),
  leftPreview: document.querySelector('#left-preview'),
  rightPreview: document.querySelector('#right-preview'),
  form: document.querySelector('#answer-form'),
  answer: document.querySelector('#answer'),
  submit: document.querySelector('#submit-answer'),
  feedbackPanel: document.querySelector('#feedback-panel'),
  feedbackIcon: document.querySelector('#feedback-icon'),
  feedbackTitle: document.querySelector('#feedback-title'),
  feedback: document.querySelector('#feedback'),
  pips: [...document.querySelectorAll('#attempt-pips i')],
  solution: document.querySelector('#solution'),
  solutionLeft: document.querySelector('#solution-left'),
  solutionRight: document.querySelector('#solution-right'),
  solutionNote: document.querySelector('#solution-note'),
  share: document.querySelector('#share-result'),
  confetti: document.querySelector('#confetti')
};

const LAUNCH_DAY_UTC = Date.UTC(2026, 8, 25);
const formatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit'
});
const dateParts = Object.fromEntries(formatter.formatToParts(new Date()).map(part => [part.type, part.value]));
const puzzleDay = `${dateParts.year}-${dateParts.month}-${dateParts.day}`;
const [year, month, day] = puzzleDay.split('-').map(Number);
const absoluteDay = Math.max(0, Math.floor((Date.UTC(year, month - 1, day) - LAUNCH_DAY_UTC) / 86400000));
const dayIndex = absoluteDay % puzzles.length;
const puzzleNumber = absoluteDay + 1;
const stateKey = `wordBridge:${puzzleDay}`;

const puzzle = puzzles[dayIndex];
let state = { attempts: [], finished: false, won: false };
try {
  state = { ...state, ...JSON.parse(localStorage.getItem(stateKey) || '{}') };
} catch { /* A blocked or malformed local store should never block the game. */ }
let attempts = state.attempts.length;
let finished = state.finished;

function saveState() {
  try { localStorage.setItem(stateKey, JSON.stringify(state)); } catch { /* Storage is optional. */ }
}

function startTracking() {
  window.BludleEngagement?.start({ trigger: 'first_guess' });
}

function normalise(value) {
  return value.toLowerCase().replace(/[^a-z]/g, '');
}

function renderPlanks() {
  elements.planks.replaceChildren();
  const typed = normalise(elements.answer.value);
  [...puzzle.bridge].forEach((_, index) => {
    const plank = document.createElement('span');
    const letter = typed[index] || '·';
    plank.textContent = letter.toUpperCase();
    plank.style.setProperty('--stagger', `${index % 2 === 0 ? -2 : 2}px`);
    plank.classList.toggle('filled', Boolean(typed[index]));
    elements.planks.append(plank);
  });
}

function renderPreview(value = '') {
  const bridge = normalise(value).toUpperCase() || '?';
  elements.leftPreview.innerHTML = `<b>${puzzle.left.toUpperCase()}</b><em>${bridge}</em>`;
  elements.rightPreview.innerHTML = `<em>${bridge}</em><b>${puzzle.right.toUpperCase()}</b>`;
}

function setFeedback(tone, icon, title, copy) {
  elements.feedbackPanel.dataset.tone = tone;
  elements.feedbackIcon.textContent = icon;
  elements.feedbackTitle.textContent = title;
  elements.feedback.textContent = copy;
}

function populateConfetti() {
  const colours = ['#2f5fde', '#f4b942', '#277455', '#cc8a4b', '#d85c51'];
  elements.confetti.replaceChildren();
  for (let index = 0; index < 26; index += 1) {
    const piece = document.createElement('i');
    const angle = (Math.PI * 2 * index) / 26;
    const distance = 90 + (index % 6) * 17;
    piece.style.setProperty('--x', `${Math.cos(angle) * distance}px`);
    piece.style.setProperty('--y', `${Math.sin(angle) * distance - 36}px`);
    piece.style.setProperty('--r', `${180 + index * 37}deg`);
    piece.style.setProperty('--delay', `${(index % 5) * 22}ms`);
    piece.style.setProperty('--piece', colours[index % colours.length]);
    elements.confetti.append(piece);
  }
}

function finish(won, restoring = false) {
  finished = true;
  state.finished = true;
  state.won = won;
  saveState();
  elements.answer.disabled = true;
  elements.submit.disabled = true;
  elements.form.hidden = true;
  elements.solution.hidden = false;
  elements.solutionLeft.textContent = puzzle.leftPhrase.toUpperCase();
  elements.solutionRight.textContent = puzzle.rightPhrase.toUpperCase();
  elements.solutionNote.textContent = `${puzzle.bridge.toUpperCase()} completes both connections.`;
  renderPreview(puzzle.bridge);
  elements.answer.value = puzzle.bridge;
  renderPlanks();

  if (won) {
    elements.scene.classList.add('is-complete');
    populateConfetti();
    setFeedback('correct', '✓', 'The bridge holds.', `${puzzle.leftPhrase.toUpperCase()} and ${puzzle.rightPhrase.toUpperCase()} connect perfectly.`);
  } else {
    setFeedback('wrong', '•', 'Bridge revealed.', `The missing word was ${puzzle.bridge.toUpperCase()}.`);
  }

  if (!restoring) {
    window.BludleEngagement?.complete({ surface: elements.solution, outcome: won ? 'won' : 'lost' });
  }
}

function submitAnswer(event) {
  event.preventDefault();
  if (finished) return;

  const guess = normalise(elements.answer.value);
  if (!guess) {
    setFeedback('wrong', '!', 'Add a word first.', 'Type the word you think connects both sides.');
    elements.answer.focus();
    return;
  }

  startTracking();
  attempts += 1;
  state.attempts.push(guess);
  saveState();
  elements.pips.slice(0, attempts).forEach(pip => pip.classList.add('used'));

  if (guess === puzzle.bridge) {
    finish(true);
    return;
  }

  elements.scene.classList.remove('is-wrong');
  void elements.scene.offsetWidth;
  elements.scene.classList.add('is-wrong');

  if (attempts >= 3) {
    finish(false);
    return;
  }

  if (attempts === 1) {
    setFeedback('hint', '?', 'Not quite. Here’s a clue.', `${puzzle.hint} The bridge has ${puzzle.bridge.length} letters.`);
  } else {
    setFeedback('wrong', '×', 'One crossing left.', 'That answer does not make both familiar connections. Try once more.');
  }
  elements.answer.select();
}

function initialise() {
  elements.day.textContent = String(puzzleNumber).padStart(2, '0');
  elements.left.textContent = puzzle.left.toUpperCase();
  elements.right.textContent = puzzle.right.toUpperCase();
  renderPreview();
  renderPlanks();
  elements.answer.setAttribute('aria-label', `Word connecting ${puzzle.left} and ${puzzle.right}`);
  elements.pips.slice(0, attempts).forEach(pip => pip.classList.add('used'));
  if (finished) finish(Boolean(state.won), true);
  else elements.answer.focus();
}

async function shareResult() {
  const result = state.won ? `${state.attempts.length}/3` : 'X/3';
  const path = state.attempts.map(guess => guess === puzzle.bridge ? '🟩' : '🟫').join('');
  const copy = `Word Bridge #${puzzleNumber} ${result}\n${path}\nhttps://bludle.com/wordbridge/`;
  try {
    if (navigator.share) await navigator.share({ title: 'Word Bridge', text: copy });
    else {
      await navigator.clipboard.writeText(copy);
      elements.share.textContent = 'Copied to clipboard';
    }
  } catch { /* Cancelling the share sheet is not an error. */ }
}

elements.answer.addEventListener('input', () => {
  elements.answer.value = elements.answer.value.replace(/[^a-zA-Z]/g, '').slice(0, puzzle.bridge.length);
  renderPreview(elements.answer.value);
  renderPlanks();
});
elements.form.addEventListener('submit', submitAnswer);
elements.share.addEventListener('click', shareResult);

initialise();
