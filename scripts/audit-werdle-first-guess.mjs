import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { firstGuessProperties } from '../werdle/firstGuessTelemetry.js';

const root = path.resolve(import.meta.dirname, '..');

const opening = firstGuessProperties('SLATE', ['exact', 'present', 'absent', 'absent', 'exact'], 'daily');
assert.deepEqual(opening, {
  first_guess: 'slate',
  exact_letters: 2,
  present_letters: 1,
  absent_letters: 2,
  vowel_count: 2,
  unique_letter_count: 5,
  has_repeated_letter: false,
  game_mode: 'daily'
});

const repeated = firstGuessProperties('allee', ['absent', 'absent', 'present', 'present', 'exact'], 'practice');
assert.equal(repeated.vowel_count, 3);
assert.equal(repeated.unique_letter_count, 3);
assert.equal(repeated.has_repeated_letter, true);
assert.equal(repeated.game_mode, 'practice');

assert.equal(firstGuessProperties('four', ['exact', 'exact', 'exact', 'exact'], 'daily'), null);
assert.equal(firstGuessProperties('hello', ['exact', 'present', 'unknown', 'absent', 'absent'], 'daily'), null);

const [app, engagement, documentation, privacy] = await Promise.all([
  readFile(path.join(root, 'werdle', 'app.js'), 'utf8'),
  readFile(path.join(root, 'globalNav', 'engagementManager.js'), 'utf8'),
  readFile(path.join(root, 'GAMEPLAY_DATA.md'), 'utf8'),
  readFile(path.join(root, 'privacy.html'), 'utf8')
]);
assert.match(app, /game\.guesses\.length === 0[^\n]+trackFirstGuess/);
assert.match(engagement, /ALLOWED_GAME_EVENTS = new Set\(\['werdle_first_guess'\]\)/);
assert.match(documentation, /Werdle opening guesses/);
assert.match(privacy, /Werdle also sends the first five-letter guess/);

console.log('Werdle first-guess audit passed: the opening guess and its information profile are normalized and bounded.');
