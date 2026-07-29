import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';

const root = path.resolve(import.meta.dirname, '..');
const [html, styles, source] = await Promise.all([
  readFile(path.join(root, 'shiftyfades', 'index.html'), 'utf8'),
  readFile(path.join(root, 'shiftyfades', 'shiftyfades.css'), 'utf8'),
  readFile(path.join(root, 'shiftyfades', 'shiftyfades.js'), 'utf8'),
]);

assert.match(html, /id="bonusCopy"/, 'streak explanation needs a live copy target');
assert.doesNotMatch(html, /class="ad-card"/, 'obsolete empty ad placeholder should not split the page');
assert.match(styles, /grid-template-columns:\s*repeat\(5,minmax\(0,1fr\)\)/, 'all five choices should share one comparison row');
assert.match(styles, /@media\(max-width:700px\).*grid-template-areas:"heading swatch"/s, 'mobile target should use the compact side-by-side layout');

function element() {
  const classes = new Set();
  return {
    children: [], style: {}, attributes: {}, className: '', textContent: '', disabled: false, open: false,
    classList: { add: name => classes.add(name), remove: name => classes.delete(name), toggle: (name, force) => force ? classes.add(name) : classes.delete(name), contains: name => classes.has(name) },
    setAttribute(name, value) { this.attributes[name] = value; }, addEventListener() {}, append(child) { this.children.push(child); },
    showModal() { this.open = true; }, close() { this.open = false; }, closest() { return this; },
  };
}

const nodes = new Map();
const dots = Array.from({ length: 5 }, element);
const getNode = selector => {
  if (!nodes.has(selector)) nodes.set(selector, element());
  return nodes.get(selector);
};
const storage = new Map([['shiftyIntroSeen', 'true']]);
const context = {
  document: {
    querySelector: getNode,
    querySelectorAll: selector => selector === '#streakDots i' ? dots : [],
    createElement: element,
  },
  localStorage: {
    getItem: key => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
  },
  window: { setTimeout() {} }, navigator: {}, location: { href: 'https://bludle.com/shiftyfades/' },
  setTimeout() {}, Math,
};

vm.runInNewContext(`${source}\nstate.lives = 5; state.streak = 5; updateHud();`, context);

assert.equal(getNode('#bonusLabel').textContent, 'Maximum lives reached');
assert.equal(getNode('#bonusCopy').textContent, 'You have all five. Keep matching to protect your streak.');
assert.equal(getNode('#bonusProgress').style.width, '100%');
assert.equal(getNode('#streakDots').attributes['aria-label'], 'Maximum lives reached: 5 lives');
assert.equal(getNode('#bonusContainer').classList.contains('is-maxed'), true);

console.log('Shifty Fades audit passed: compact comparison layout and maximum-lives messaging are present.');
