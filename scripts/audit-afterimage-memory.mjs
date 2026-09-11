import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { buildMemoryMetrics } from '../afterimage/memoryMetrics.js';

const root = path.resolve(import.meta.dirname, '..');
const afterimage = fs.readFileSync(path.join(root, 'afterimage/afterimage.js'), 'utf8');
const engagement = fs.readFileSync(path.join(root, 'globalNav/engagementManager.js'), 'utf8');

const perfect = buildMemoryMetrics({
  target: [120, 80, 40], memory: [120, 80, 40], differences: [0, 0, 0],
  error: 0, accuracy: 100, roundNumber: 1, studyMs: 5000, distractionMs: 0,
});
assert.equal(perfect.memory_minus_target_lightness, 0);
assert.equal(perfect.memory_minus_target_chroma, 0);
assert.equal(perfect.memory_minus_target_hue_degrees, 0);
assert.equal(perfect.perceptual_distance, 0);

const controlled = buildMemoryMetrics({
  target: [212, 33, 128], memory: [200, 90, 140], differences: [12, 57, 12],
  error: 81, accuracy: 89, roundNumber: 3, studyMs: 4000, distractionMs: 900,
});
assert.deepEqual([
  controlled.memory_minus_target_red,
  controlled.memory_minus_target_green,
  controlled.memory_minus_target_blue,
], [-12, 57, 12]);
assert.equal(controlled.absolute_error_total, 81);
assert.equal(controlled.round_number, 3);
assert.ok(controlled.memory_minus_target_lightness > 0, 'controlled reconstruction should be perceptually lighter');
assert.ok(controlled.perceptual_distance > 0);

const grey = buildMemoryMetrics({
  target: [180, 60, 60], memory: [128, 128, 128], differences: [52, 68, 68],
  error: 188, accuracy: 75, roundNumber: 5, studyMs: 3000, distractionMs: 1500,
});
assert.equal(grey.hue_comparison_available, false);
assert.equal(grey.memory_hue_degrees, null);
assert.equal(grey.memory_minus_target_hue_degrees, null);

assert.match(afterimage, /submittedRound === round/);
assert.match(afterimage, /afterimage_memory_reconstruction/);
assert.match(engagement, /ALLOWED_GAME_EVENTS[\s\S]{0,400}afterimage_memory_reconstruction/);
assert.match(engagement, /eventName === 'afterimage_memory_reconstruction'[\s\S]+mixpanel\.track\(eventName, payload\)/);
for (const property of Object.keys(controlled)) {
  assert.ok(engagement.includes(`'${property}'`), `${property} is missing from the gameplay-event allowlist`);
}

console.log('Afterimage memory audit passed: signed RGB and OKLab bias metrics are valid and allowlisted.');
