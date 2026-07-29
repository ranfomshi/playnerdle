import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { axisDifferenceCopy, clueSummary, coordinateClue } from '../hunt/clues.js';

const root = path.resolve(import.meta.dirname, '..');
const app = await readFile(path.join(root, 'hunt', 'hunt.js'), 'utf8');
const html = await readFile(path.join(root, 'hunt', 'index.html'), 'utf8');

assert.deepEqual(coordinateClue(0, 3, 3, 1), {
  xDirection: 1,
  yDirection: -1,
  xDistance: 3,
  yDistance: 2,
  totalDistance: 5,
  axisDifference: 1
});
assert.deepEqual(coordinateClue(3, 3, 3, 0), {
  xDirection: 0,
  yDirection: -1,
  xDistance: 0,
  yDistance: 3,
  totalDistance: 3,
  axisDifference: 3
});
assert.equal(clueSummary('NORTH-EAST', 5, 1), 'NORTH-EAST · 5 steps total · X/Y difference 1');
assert.equal(axisDifferenceCopy(0), 'The horizontal and vertical distances are equal.');
assert.equal(axisDifferenceCopy(1), 'The horizontal and vertical distances differ by 1 step.');
assert.match(app, /coordinateClue\(x,y,game\.treasure\.x,game\.treasure\.y\)/, 'real scans must use the shared coordinate clue model');
assert.match(html, /absolute difference between the horizontal and vertical distances/, 'the rules must explain that the X\/Y difference is unsigned');

console.log('XY audit passed: clues report direction, total steps and a non-trivialising X/Y difference.');
