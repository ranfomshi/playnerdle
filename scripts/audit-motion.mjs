import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';

const root = path.resolve(import.meta.dirname, '..');
const [motion, nav, home, connex, borrowed, borrowedStyles, engagement] = await Promise.all([
  readFile(path.join(root, 'globalNav', 'motion.js'), 'utf8'),
  readFile(path.join(root, 'globalNav', 'globalNav.js'), 'utf8'),
  readFile(path.join(root, 'home.js'), 'utf8'),
  readFile(path.join(root, 'connex', 'index.html'), 'utf8'),
  readFile(path.join(root, 'borrowedletters', 'borrowedletters.js'), 'utf8'),
  readFile(path.join(root, 'borrowedletters', 'borrowedletters.css'), 'utf8'),
  readFile(path.join(root, 'globalNav', 'engagementManager.js'), 'utf8'),
]);

assert.ok(nav.indexOf('ensureMotion();') < nav.indexOf('ensureEngagementManager();'), 'motion manager must load before engagement tracking');
assert.match(motion, /gsap@3\.15\.0\/dist\/gsap\.min\.js/);
assert.match(motion, /gsap@3\.15\.0\/dist\/Flip\.min\.js/);
assert.equal((motion.match(/integrity: 'sha384-/g) || []).length, 2, 'both third-party assets need integrity hashes');
assert.match(motion, /prefers-reduced-motion: reduce/);

assert.match(home, /Flip\.getState\(gameTiles\)/, 'home filtering should capture the tile grid');
assert.match(home, /Flip\.from\(previous/, 'home filtering should animate the reflow');
assert.match(connex, /dataset\.flipId = `connex-word-/);
assert.match(connex, /motion\.Flip\.from\(flipState/, 'Connex should move solved words into their group');
assert.match(borrowed, /className='borrow-letter-ghost'/);
assert.match(borrowed, /async function passLetters\(\)/, 'Borrowed Letters should finish its pass after the motion cue');
assert.match(borrowedStyles, /@media\(prefers-reduced-motion:reduce\).*\.borrow-letter-ghost\{display:none\}/s);
assert.match(engagement, /motion\.gsap\.timeline/, 'shared completion recommendations should use the warmed motion runtime');

const appended = [];
const context = {
  window: {
    matchMedia: () => ({ matches: true }),
    dispatchEvent() {},
  },
  document: {
    documentElement: { dataset: {} },
    getElementById: () => null,
    createElement: () => ({}),
    head: { append: node => appended.push(node) },
  },
  CustomEvent: class {},
  console,
};
vm.runInNewContext(motion, context);
assert.equal(await context.window.BludleMotion.load({ flip: true }), null, 'reduced-motion mode should not load GSAP');
assert.equal(appended.length, 0, 'reduced-motion mode should make no third-party motion request');

console.log('Motion audit passed: purposeful GSAP enhancements are optional, pinned and reduced-motion safe.');
