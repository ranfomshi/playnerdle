import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { games } from './site-data.mjs';

const root = path.resolve(import.meta.dirname, '..');
const manager = await readFile(path.join(root, 'globalNav', 'adManager.js'), 'utf8');
const nav = await readFile(path.join(root, 'globalNav', 'globalNav.js'), 'utf8');
const styles = await readFile(path.join(root, 'globalNav', 'globalNav.css'), 'utf8');
const bludle = await readFile(path.join(root, 'bludle', 'index.html'), 'utf8');
const issues = [];

if (!nav.includes('/globalNav/adManager.js')) {
  issues.push('globalNav/globalNav.js: shared ad manager is not loaded');
}

if (!manager.includes('ca-pub-5140172230633441')) {
  issues.push('globalNav/adManager.js: AdSense publisher ID is missing');
}

if (!manager.includes("const resultSummarySlot = '7551359942'")) {
  issues.push('globalNav/adManager.js: result-summary unit is missing');
}

for (const game of games) {
  if (!manager.includes(`'/${game.slug}'`)) {
    issues.push(`globalNav/adManager.js: /${game.slug}/ is not covered`);
  }
}

if (!manager.includes("window.addEventListener('bludle:game-complete'")) {
  issues.push('globalNav/adManager.js: game placements are not gated by completion');
}

if (!manager.includes('entry.intersectionRatio >= 0.5') || !manager.includes('}, 1000)')) {
  issues.push('globalNav/adManager.js: placement requests are not gated by sustained viewability');
}

if (!manager.includes("fillState === 'unfilled'") || !manager.includes("showHouseFallback('unfilled')")) {
  issues.push('globalNav/adManager.js: unfilled placements do not use the house-ad fallback');
}

if (!manager.includes("document.getElementById('bludle-engagement-host')") || !manager.includes("insertAdjacentElement('beforebegin', placement)")) {
  issues.push('globalNav/adManager.js: placement is not moved into the result summary');
}

if (!manager.includes("track('ad_eligible_view'") || manager.includes("track('ad_slot_eligible'")) {
  issues.push('globalNav/adManager.js: Mixpanel eligibility event does not match the dashboard');
}

if (!manager.includes('data-ad-format="horizontal"') || !manager.includes('https://keyzee.co.uk')) {
  issues.push('globalNav/adManager.js: compact format or Keyzee fallback is missing');
}

if (!styles.includes('margin: 28px auto 36px') || !styles.includes('border-top: 1px solid #dce1ec')) {
  issues.push('globalNav/globalNav.css: policy-safe result-summary spacing is missing');
}

for (const slug of ['werdle', 'hunt', 'trak']) {
  const html = await readFile(path.join(root, slug, 'index.html'), 'utf8');
  if (html.includes('<ins class="adsbygoogle"')) {
    issues.push(`${slug}/index.html: eager manual game placement is still present`);
  }
}

if (bludle.includes('class="ad-slot"')) {
  issues.push('bludle/index.html: obsolete empty ad placeholder is still visible');
}

let completionHandler;
let summaryInsertion;
let observedPlacement;
const trackedEvents = [];
const adUnit = { dataset: {}, hidden: false };
const houseFallback = { dataset: {}, hidden: true, addEventListener() {} };
const adLabel = { textContent: 'Advertisement' };
const placement = {
  dataset: {}, hidden: false, setAttribute() {},
  querySelector(selector) {
    if (selector === 'ins.adsbygoogle') return adUnit;
    if (selector === '[data-house-ad-fallback]') return houseFallback;
    if (selector === '.pn-ad__label') return adLabel;
    return null;
  }
};
const recommendation = {
  parentElement: {},
  insertAdjacentElement(position, element) { summaryInsertion = { position, element }; }
};
const gameSurface = { insertAdjacentElement() {} };
const main = { querySelector: () => gameSurface, append() {} };
const documentStub = {
  head: { append() {} },
  createElement: () => placement,
  getElementById: id => id === 'bludle-engagement-host' ? recommendation : null,
  querySelector: selector => selector === 'main' ? main : null
};
const windowStub = {
  location: { pathname: '/werdle/' },
  addEventListener(name, handler) { if (name === 'bludle:game-complete') completionHandler = handler; },
  gtag(...args) { trackedEvents.push(args); }
};
class IntersectionObserverStub {
  observe(element) { observedPlacement = element; }
}
windowStub.IntersectionObserver = IntersectionObserverStub;
windowStub.setTimeout = setTimeout;
windowStub.clearTimeout = clearTimeout;
vm.runInNewContext(manager, {
  window: windowStub, document: documentStub, IntersectionObserver: IntersectionObserverStub,
  MutationObserver: class {}, URL, Object, Map, Set
});
completionHandler({ detail: { outcome: 'completed' } });
assert.equal(summaryInsertion.position, 'beforebegin');
assert.equal(summaryInsertion.element, placement);
assert.equal(placement.hidden, false);
assert.equal(observedPlacement, placement);
assert.equal(trackedEvents.some(([, eventName, properties]) =>
  eventName === 'ad_eligible_view' && properties.placement === 'result_summary' && properties.summary_placement === true
), true);

if (issues.length) {
  console.error(`Monetization audit failed with ${issues.length} issue${issues.length === 1 ? '' : 's'}:`);
  issues.forEach(issue => console.error(`- ${issue}`));
  process.exit(1);
}

console.log(`Monetization audit passed: ${games.length} games use the controlled result-summary placement with a house-ad fallback.`);
