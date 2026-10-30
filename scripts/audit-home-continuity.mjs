import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { getHomeContinuity } from '../homeContinuity.js';

const root = path.resolve(import.meta.dirname, '..');
const now = new Date('2026-10-30T12:00:00Z');
const store = entries => ({ getItem: key => key in entries ? JSON.stringify(entries[key]) : null });
const returning = { 'bludle:last-game-start:v1': { slug: 'wordbridge', at: now.getTime() - 86400000 } };

assert.equal(getHomeContinuity(store({}), now), null, 'new visitors should not see the rail');
assert.deepEqual(getHomeContinuity(store(returning), now).map(pick => pick.slug),
  ['wordbridge', 'wordmash'], 'returning players should see two unplayed games, not another Werdle hero');

const saved = {
  ...returning,
  'werdle:v2': { daily: { date: '2026-10-30', guesses: ['crane', 'slate'], status: 'playing' } },
  'wordBridge:2026-10-30': { attempts: ['a'], finished: false },
};
const picks = getHomeContinuity(store(saved), now);
assert.deepEqual(picks.map(pick => [pick.slug, pick.kind, pick.attemptsSaved]),
  [['wordbridge', 'resume', 1], ['werdle', 'resume', 2]], 'saved daily attempts should take precedence');
assert.equal(picks[1].detail, '3 tries left');

assert.deepEqual(getHomeContinuity(store({
  ...returning,
  'werdle:v2': { daily: { date: '2026-10-29', guesses: ['crane'], status: 'playing' } },
  'wordBridge:2026-10-29': { attempts: ['a'], finished: false },
}), now).map(pick => pick.kind), ['unplayed_daily', 'unplayed_daily'],
'yesterday’s attempts must never be called resumable');

assert.deepEqual(getHomeContinuity(store({
  ...returning,
  'wordmash-state-2026-10-30': { attempts: [1, 2, 3, 4, 5, 6], solved: false },
  'wordBridge:2026-10-30': { attempts: ['a'], finished: true },
  'werdle:v2': { daily: { date: '2026-10-30', guesses: ['crane'], status: 'won' } },
}), now), [], 'completed or exhausted games should not be promoted as unplayed or resumable');

assert.deepEqual(getHomeContinuity(store({
  ...returning,
  'bludle:daily-progress:v1': { date: '2026-10-30', completed: ['wordbridge', 'wordmash'] },
}), now).map(pick => pick.slug), ['werdle'], 'shared completion data should remove finished games');

assert.deepEqual(getHomeContinuity(store({
  'werdle:v2': { stats: { played: 2 }, daily: { date: '2026-10-29', guesses: ['crane'], status: 'playing' } },
}), now).map(pick => pick.kind), ['unplayed_daily', 'unplayed_daily'],
'existing Werdle players should qualify without a newly written marker');

const html = await readFile(path.join(root, 'index.html'), 'utf8');
const script = await readFile(path.join(root, 'home.js'), 'utf8');
const manager = await readFile(path.join(root, 'globalNav', 'engagementManager.js'), 'utf8');
assert.match(html, /id="home-continuation"[^>]*hidden/, 'rail must be hidden without JavaScript or play history');
for (const event of ['home_returning_visit', 'home_continuation_view', 'home_continuation_click']) {
  assert.ok(script.includes(`'${event}'`), `homepage must send ${event}`);
}
assert.ok(manager.includes('home_continuation_type: fromHomeContinuation'),
  'actual game starts must carry the continuation source');
console.log('Home continuity audit passed: only saved attempts resume; returning-player links and attribution are present.');
