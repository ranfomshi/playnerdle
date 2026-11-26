import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import {
  afterimageShareCard, resultShareUrl, secondSightShareCard, wordBridgeShareCard
} from '../globalNav/shareCards.js';

const root = path.resolve(import.meta.dirname, '..');

for (const slug of ['wordbridge', 'afterimage', 'secondsight']) {
  const url = new URL(resultShareUrl(slug));
  assert.equal(url.origin, 'https://bludle.com');
  assert.equal(url.pathname, `/${slug}/`);
  assert.deepEqual(Object.fromEntries(url.searchParams), {
    utm_source: 'player_share',
    utm_medium: 'game_share',
    utm_campaign: `${slug}_result`
  });
}

const bridge = wordBridgeShareCard({
  number: 42, left: 'rain', right: 'tie', attempts: [false, true], won: true
});
assert.match(bridge, /Word Bridge #42 2\/3/);
assert.match(bridge, /RAIN \+ \?  ·  \? \+ TIE/);
assert.match(bridge, /🟫🟩/);
assert.doesNotMatch(bridge, /bow/i);
assert.match(wordBridgeShareCard({ number: 42, left: 'rain', right: 'tie', attempts: [false, false, false], won: false }), /X\/3/);

const afterimage = afterimageShareCard({ date: '2026-11-26', accuracy: 80, rounds: [90, 70, 95, 80, 65] });
assert.match(afterimage, /Afterimage 2026-11-26 · 80% accuracy/);
assert.match(afterimage, /90% → 70% → 95% → 80% → 65%/);
assert.match(afterimage, /Sharpest recall: colour 3 \(95%\)/);

const secondSight = secondSightShareCard({
  date: '2026-11-26', score: 1280, bestStreak: 3,
  answers: [
    { dimension: 'lightness', correct: true },
    { dimension: 'chroma', correct: false },
    { dimension: 'redGreen', correct: true },
    { dimension: 'yellowBlue', correct: false }
  ]
});
assert.match(secondSight, /Second Sight 2026-11-26 · 2\/4/);
assert.match(secondSight, /Brightness 1\/1 · Intensity 0\/1 · Hue 1\/2/);
assert.match(secondSight, /Best streak: 3 · 1,280 points/);
assert.doesNotMatch(secondSight, /redder|greener|yellower|bluer/i);

for (const [slug, formatter] of [
  ['wordbridge', 'wordBridgeShareCard'],
  ['afterimage', 'afterimageShareCard'],
  ['secondsight', 'secondSightShareCard']
]) {
  const source = await readFile(path.join(root, slug, `${slug}.js`), 'utf8');
  assert.match(source, new RegExp(`\\b${formatter}\\(`));
  assert.match(source, new RegExp(`resultShareUrl\\('${slug}'\\)`));
  assert.match(source, /navigator\.share\(\{ title: .* text, url \}\)/);
  assert.match(source, /clipboard\.writeText\(`\$\{text\}\\n\\n\$\{url\}`\)/);
}

console.log('Game share-card audit passed: distinct spoiler-free stories and tagged canonical game links.');
