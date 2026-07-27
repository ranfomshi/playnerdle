import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';

const root = path.resolve(import.meta.dirname, '..');
const source = await readFile(path.join(root, 'globalNav', 'gameTelemetry.js'), 'utf8');

function element(value = '', extras = {}) {
  return { textContent: value, dataset: {}, querySelectorAll: () => [], ...extras };
}

function runTelemetry({ singles = {}, multiples = {}, storage = {} } = {}) {
  const html = element('', { dataset: {} });
  const document = {
    documentElement: html,
    querySelector: selector => singles[selector] || null,
    querySelectorAll: selector => multiples[selector] || []
  };
  const localStorage = { getItem: key => storage[key] ?? null };
  const window = {};
  vm.runInNewContext(source, { window, document, localStorage, Intl, Date, Object, Number, String, Math });
  return { telemetry: window.BludleGameTelemetry, html };
}

const guessedRow = element('', { querySelectorAll: () => [element('Q'), element('U'), element('I'), element('E'), element('T')] });
const emptyRow = element('', { querySelectorAll: () => [element(''), element(''), element(''), element(''), element('')] });
const werdle = runTelemetry({
  singles: { '[data-mode][aria-pressed="true"]': element('', { dataset: { mode: 'daily' } }) },
  multiples: { '#board .board-row': [guessedRow, guessedRow, emptyRow, emptyRow, emptyRow] }
});
const werdleSnapshot = werdle.telemetry.snapshot('werdle');
assert.equal(werdle.html.dataset.bludleTelemetrySchema, '1');
assert.equal(werdleSnapshot.game_mode, 'daily');
assert.equal(werdleSnapshot.attempts_used, 2);
assert.match(werdleSnapshot.puzzle_id, /^werdle:\d{4}-\d{2}-\d{2}$/);

const colour = runTelemetry({ singles: {
  '#result-red': element('Red difference 11'),
  '#result-green': element('Green difference 7'),
  '#result-blue': element('Blue difference 3')
} }).telemetry.snapshot('colormatch');
assert.equal(colour.error_total, 21);
assert.equal(colour.error_red, 11);
assert.equal(colour.error_green, 7);
assert.equal(colour.error_blue, 3);

const reaction = runTelemetry({ storage: { reactionTime: '284.7' } }).telemetry.snapshot('reaction');
assert.equal(reaction.reaction_ms, 284.7);

for (const snapshot of [werdleSnapshot, colour, reaction]) {
  for (const forbidden of ['answer', 'secret', 'guess_value', 'target_rgb', 'player_rgb']) {
    assert.equal(Object.hasOwn(snapshot, forbidden), false);
  }
}

console.log('Game telemetry audit passed: shared context and representative word, colour and speed metrics are safe and valid.');
