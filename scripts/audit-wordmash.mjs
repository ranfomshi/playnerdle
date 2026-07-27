import assert from 'node:assert/strict';
import { mashWord, normalizeAnswer, overlapLength, scoreAnswerParts } from '../wordmash/gameLogic.mjs';

assert.equal(normalizeAnswer(' Buzz Aldrin '), 'buzzaldrin');
assert.equal(normalizeAnswer('GUY-RITCHIE'), 'guyritchie');
assert.equal(overlapLength('Buzz Aldrin', 'Inception'), 2);
assert.equal(mashWord('Buzz Aldrin', 'Inception'), 'buzzaldrinception');
assert.equal(mashWord('egg fried rice', 'ice lolly'), 'eggfriedricelolly');
assert.deepEqual(scoreAnswerParts('Buzz Aldrinception', 'Buzz Aldrin', 'Inception'), {
  firstCorrect: true,
  secondCorrect: true
});
assert.deepEqual(scoreAnswerParts('moonception', 'Buzz Aldrin', 'Inception'), {
  firstCorrect: false,
  secondCorrect: true
});

console.log('Word Mash audit passed: names, phrases, spacing and case share one normalised validation path.');
