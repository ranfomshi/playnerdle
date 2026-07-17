export const ALPHABET = 'abcdefghijklmnopqrstuvwxyz';
export const MAX_GUESSES = 5;

const shiftLetter = (letter, amount) => ALPHABET[(ALPHABET.indexOf(letter) + amount + 260) % 26];

export const RULES = Object.freeze([
  {
    id: 'uniform',
    name: 'Single shift',
    tag: 'CLASSIC',
    difficulty: 1,
    description: 'Every letter moves forward by the same hidden amount.',
    keyRange: [3, 13],
    encode: (word, key) => [...word].map(letter => shiftLetter(letter, key)).join(''),
    hint: key => `The hidden shift is +${key}. Move every coded letter back ${key}.`
  },
  {
    id: 'alternating',
    name: 'Split signal',
    tag: 'RHYTHM',
    difficulty: 2,
    description: 'Odd positions move forward; even positions move backward by the same hidden amount.',
    keyRange: [2, 8],
    encode: (word, key) => [...word].map((letter, index) => shiftLetter(letter, index % 2 ? -key : key)).join(''),
    hint: key => `The hidden amount is ${key}: move positions 1, 3 and 5 back ${key}, but 2 and 4 forward ${key}.`
  },
  {
    id: 'staircase',
    name: 'Staircase',
    tag: 'SEQUENCE',
    difficulty: 2,
    description: 'The shift grows by one at every position, starting from a hidden step.',
    keyRange: [1, 6],
    encode: (word, key) => [...word].map((letter, index) => shiftLetter(letter, key + index)).join(''),
    hint: key => `The staircase begins at +${key}, so the five shifts are +${key}, +${key + 1}, +${key + 2}, +${key + 3}, +${key + 4}.`
  },
  {
    id: 'mirror',
    name: 'Mirror code',
    tag: 'REFLECTION',
    difficulty: 3,
    description: 'Letters reflect across the alphabet (A↔Z), then move forward by a hidden amount.',
    keyRange: [1, 5],
    encode: (word, key) => [...word].map(letter => shiftLetter(ALPHABET[25 - ALPHABET.indexOf(letter)], key)).join(''),
    hint: key => `Reflect each coded letter across A↔Z after moving it back ${key}.`
  },
  {
    id: 'reverse',
    name: 'Backtrace',
    tag: 'REORDER',
    difficulty: 3,
    description: 'The word is reversed first, then every letter moves forward by the same hidden amount.',
    keyRange: [2, 9],
    encode: (word, key) => [...word].reverse().map(letter => shiftLetter(letter, key)).join(''),
    hint: key => `Move every coded letter back ${key}, then reverse the result.`
  }
]);

export function randomInteger(min, max, random = Math.random) {
  return Math.floor(random() * (max - min + 1)) + min;
}

export function createPuzzle(words, random = Math.random, rulePool = RULES) {
  const word = words[randomInteger(0, words.length - 1, random)];
  const rule = rulePool[randomInteger(0, rulePool.length - 1, random)];
  const key = randomInteger(rule.keyRange[0], rule.keyRange[1], random);
  return { word, rule, key, codedWord: rule.encode(word, key) };
}

export function evaluateGuess(guess, answer) {
  const result = Array(5).fill('absent');
  const remaining = [...answer];
  [...guess].forEach((letter, index) => {
    if (letter === answer[index]) { result[index] = 'exact'; remaining[index] = null; }
  });
  [...guess].forEach((letter, index) => {
    if (result[index] === 'exact') return;
    const match = remaining.indexOf(letter);
    if (match !== -1) { result[index] = 'present'; remaining[match] = null; }
  });
  return result;
}

export function calculateScore({ guessesUsed, difficulty, hintUsed }) {
  return Math.max(250, 1000 + (MAX_GUESSES - guessesUsed) * 300 + difficulty * 200 - (hintUsed ? 350 : 0));
}

export class CodleGame {
  constructor(puzzle) {
    this.puzzle = puzzle;
    this.guesses = [];
    this.hintUsed = false;
    this.status = 'playing';
  }

  submit(rawGuess) {
    if (this.status !== 'playing') return { error: 'This puzzle is already finished.' };
    const guess = rawGuess.trim().toLowerCase();
    if (!/^[a-z]{5}$/.test(guess)) return { error: 'Enter exactly five letters.' };
    const feedback = evaluateGuess(guess, this.puzzle.word);
    this.guesses.push({ guess, feedback });
    const won = guess === this.puzzle.word;
    if (won) this.status = 'won';
    else if (this.guesses.length === MAX_GUESSES) this.status = 'lost';
    return {
      guess,
      feedback,
      won,
      finished: this.status !== 'playing',
      score: won ? calculateScore({ guessesUsed: this.guesses.length, difficulty: this.puzzle.rule.difficulty, hintUsed: this.hintUsed }) : 0
    };
  }

  useHint() {
    if (this.guesses.length < 2 || this.status !== 'playing') return null;
    this.hintUsed = true;
    return this.puzzle.rule.hint(this.puzzle.key);
  }

  get guessesLeft() { return MAX_GUESSES - this.guesses.length; }
  get hintAvailable() { return this.guesses.length >= 2 && this.status === 'playing'; }
}
