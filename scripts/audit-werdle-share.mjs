import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { chooseShareVariant, readSharedChallenge, shareText, shareUrl, solveStory } from '../werdle/shareResult.js';

const root = path.resolve(import.meta.dirname, '..');
assert.equal(chooseShareVariant(() => 0), 'control');
assert.equal(chooseShareVariant(() => 0.499), 'control');
assert.equal(chooseShareVariant(() => 0.5), 'challenge');

const story = solveStory([
  ['absent', 'absent', 'absent', 'absent', 'absent'],
  ['exact', 'exact', 'present', 'absent', 'absent'],
  ['exact', 'exact', 'exact', 'exact', 'exact']
], 'won', 5);
assert.deepEqual(story, {
  opening: 'Your opening guess found no letters from the answer.',
  progress: 'You solved it in 3 guesses.'
});
assert.equal(solveStory([['exact', 'exact', 'exact', 'exact', 'exact']], 'won', 5).progress, 'You solved it on your first try.');
assert.equal(solveStory([
  ['exact', 'present', 'absent', 'absent', 'absent'],
  ['exact', 'exact', 'exact', 'exact', 'absent'],
  ['exact', 'exact', 'exact', 'exact', 'exact']
], 'won', 5).progress, 'Guess 2 had 4 letters in place before the solve.');
assert.equal(solveStory([
  ['absent', 'present', 'absent', 'absent', 'absent'],
  ['exact', 'exact', 'present', 'absent', 'absent']
], 'lost', 5).progress, 'Your strongest clue found 3 letters from the answer.');
assert.equal(solveStory([], 'playing', 5), null);

const params = { mode: 'daily', date: '2026-11-26', status: 'won', guessCount: 3, maxAttempts: 5, rows: '⬛⬛⬛⬛⬛\n🟩🟩🟦⬛⬛\n🟩🟩🟩🟩🟩', story };
const control = shareText({ ...params, variant: 'control' });
const challenge = shareText({ ...params, variant: 'challenge' });
assert.equal(control, `Werdle 2026-11-26 3/5\n\n${params.rows}\n\n${story.opening}\n${story.progress}`);
assert.equal(challenge, `${control}\n\nCan you crack today's word?`);
assert.equal(shareText({ ...params, mode: 'practice', variant: 'challenge' }), `Werdle Practice 3/5\n\n${params.rows}\n\n${story.opening}\n${story.progress}`);
assert.match(shareText({ ...params, status: 'lost', variant: 'challenge' }), / X\/5/);

for (const variant of ['control', 'challenge']) {
  const url = new URL(shareUrl(variant, params));
  assert.equal(url.origin, 'https://bludle.com');
  assert.equal(url.pathname, '/werdle/');
  assert.deepEqual(Object.fromEntries(url.searchParams), {
    utm_source: 'player_share', utm_medium: 'game_share',
    utm_campaign: 'werdle_result', utm_content: variant,
    challenge_day: '2026-11-26', challenge_score: '3'
  });
  assert.deepEqual(readSharedChallenge(url.search, '2026-11-26', 5), { current: true, score: 3 });
  assert.deepEqual(readSharedChallenge(url.search, '2026-11-27', 5), { current: false, score: 3 });
}
assert.equal(readSharedChallenge(new URL(shareUrl('control', { ...params, mode: 'practice' })).search, '2026-11-26', 5), null);
assert.deepEqual(readSharedChallenge(new URL(shareUrl('control', { ...params, status: 'lost' })).search, '2026-11-26', 5), { current: true, score: null });
assert.equal(readSharedChallenge('?utm_source=player_share&utm_medium=game_share&utm_campaign=werdle_result&utm_content=control&challenge_day=2026-11-26&challenge_score=9', '2026-11-26', 5), null);

const [app, engagement, documentation, html, css] = await Promise.all([
  readFile(path.join(root, 'werdle', 'app.js'), 'utf8'),
  readFile(path.join(root, 'globalNav', 'engagementManager.js'), 'utf8'),
  readFile(path.join(root, 'GAMEPLAY_DATA.md'), 'utf8'),
  readFile(path.join(root, 'werdle', 'index.html'), 'utf8'),
  readFile(path.join(root, 'werdle', 'nerdle.css'), 'utf8')
]);
assert.match(app, /navigator\.share\(\{ title: 'Werdle', text, url \}\)/);
assert.match(app, /navigator\.clipboard\.writeText\(`\$\{text\}\\n\\n\$\{url\}`\)/);
assert.match(app, /BludleEngagement\.gameEvent\('game_share', properties\)/);
assert.match(app, /renderSharedChallenge\(\)/);
assert.match(app, /solveStory\(scoredGuesses\(\), game\.status, MAX_ATTEMPTS\)/);
assert.match(html, /id="shared-challenge"/);
assert.match(html, /id="solve-story"/);
assert.match(css, /\.shared-challenge\[hidden\],#stats-dialog \.solve-story\[hidden\]\{display:none\}/);
assert.match(engagement, /game_share: new Set\(\['game_mode', 'share_variant', 'share_method', 'share_score', 'outcome'\]\)/);
assert.match(engagement, /currentGame\?\.slug === 'werdle' && source === 'player_share'/);
assert.equal((engagement.match(/share_variant: landing\.share_variant/g) || []).length, 3);
assert.equal((engagement.match(/share_score: landing\.share_score/g) || []).length, 3);
assert.match(documentation, /cannot identify who received a share/);

function landingEvents(search, priorLanding) {
  const events = [];
  const values = new Map();
  if (priorLanding) values.set('bludle:landing-context:v1', JSON.stringify(priorLanding));
  const storage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: key => values.delete(key)
  };
  const window = {
    location: { pathname: '/werdle/', search, origin: 'https://bludle.com' },
    mixpanel: { track: (name, properties) => events.push({ name, properties }) }
  };
  const document = { referrer: '', addEventListener() {}, documentElement: {}, querySelector: () => null };
  vm.runInNewContext(engagement, {
    window, document, sessionStorage: storage, localStorage: storage,
    URLSearchParams, URL, Date, performance: { now: () => 0 },
    MutationObserver: class { observe() {} }, requestAnimationFrame() {}
  });
  window.BludleEngagement.start({ trigger: 'test' });
  return events;
}

const tagged = new URL(shareUrl('challenge', params)).search;
const previous = { landing_page: '/', landing_channel: 'direct', landed_at: 1 };
const taggedEvents = landingEvents(tagged, previous);
for (const eventName of ['game_page_view', 'game_start']) {
  const event = taggedEvents.find(item => item.name === eventName);
  assert.equal(event.properties.landing_channel, 'player_share');
  assert.equal(event.properties.share_variant, 'challenge');
  assert.equal(event.properties.share_score, '3');
  assert.equal(event.properties.landing_page, '/werdle/');
}
const untagged = landingEvents('?utm_source=player_share&utm_medium=other&utm_campaign=werdle_result&utm_content=challenge', previous);
assert.equal(untagged.find(item => item.name === 'game_start').properties.landing_channel, 'direct');
assert.equal(untagged.find(item => item.name === 'game_start').properties.share_variant, undefined);

console.log('Werdle share audit passed: balanced variants, bounded URLs, share success and landing attribution.');
