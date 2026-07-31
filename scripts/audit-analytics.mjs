import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { INTERNAL_TRAFFIC_KEY, resolveAnalyticsPolicy } from '../globalNav/analyticsPolicy.js';

const root = path.resolve(import.meta.dirname, '..');
const analyticsId = 'G-3Z3GM1YNZE';

async function htmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name === '.git' || entry.name === '.netlify') continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await htmlFiles(absolute));
    if (entry.isFile() && entry.name.endsWith('.html')) files.push(absolute);
  }

  return files;
}

const sharedScript = await readFile(path.join(root, 'globalNav', 'globalNav.js'), 'utf8');
const issues = [];

function storage(initialValue = null) {
  const values = new Map(initialValue === null ? [] : [[INTERNAL_TRAFFIC_KEY, initialValue]]);
  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: key => values.delete(key)
  };
}

const productionStorage = storage();
assert.equal(resolveAnalyticsPolicy({
  location: { protocol: 'https:', hostname: 'bludle.com', search: '' }, storage: productionStorage
}).disabled, false, 'ordinary production visitors must remain measurable');
for (const location of [
  { protocol: 'http:', hostname: 'localhost', search: '' },
  { protocol: 'http:', hostname: '127.0.0.1', search: '' },
  { protocol: 'file:', hostname: '', search: '' },
  { protocol: 'https:', hostname: 'deploy-preview-123--bludle.netlify.app', search: '' }
]) {
  assert.equal(resolveAnalyticsPolicy({ location, storage: storage() }).disabled, true,
    `${location.protocol}//${location.hostname} must not send analytics`);
}
const internalStorage = storage();
assert.equal(resolveAnalyticsPolicy({
  location: { protocol: 'https:', hostname: 'bludle.com', search: '?internal=1' }, storage: internalStorage
}).reason, 'internal', 'the production internal-user switch must persist an opt-out');
assert.equal(resolveAnalyticsPolicy({
  location: { protocol: 'https:', hostname: 'bludle.com', search: '' }, storage: internalStorage
}).disabled, true, 'the production opt-out must survive navigation');
assert.equal(resolveAnalyticsPolicy({
  location: { protocol: 'https:', hostname: 'bludle.com', search: '?internal=0' }, storage: internalStorage
}).disabled, false, 'the production opt-out must be reversible');

if (!sharedScript.includes(analyticsId)) {
  issues.push(`globalNav/globalNav.js: missing GA4 property ${analyticsId}`);
}

if (!sharedScript.includes('window.__bludleAnalyticsInitialized')) {
  issues.push('globalNav/globalNav.js: missing duplicate-initialisation guard');
}

if (!sharedScript.includes("import { resolveAnalyticsPolicy } from './analyticsPolicy.js'") ||
    (sharedScript.match(/if \(analyticsPolicy\.disabled\) return;/g) || []).length < 3) {
  issues.push('globalNav/globalNav.js: GA4, Mixpanel or shared event tracking can bypass the internal-traffic policy');
}

for (const file of await htmlFiles(root)) {
  const relative = path.relative(root, file).replaceAll('\\', '/');
  const html = await readFile(file, 'utf8');

  if (!/globalNav\/globalNav\.js/.test(html)) {
    issues.push(`${relative}: does not load the shared analytics entry point`);
  }

  if (/googletagmanager\.com\/gtag\/js|gtag\(['"]config['"]/.test(html)) {
    issues.push(`${relative}: contains a page-level GA tag that can double-count views`);
  }
}

if (issues.length) {
  console.error(`Analytics audit failed with ${issues.length} issue${issues.length === 1 ? '' : 's'}:`);
  issues.forEach(issue => console.error(`- ${issue}`));
  process.exit(1);
}

console.log('Analytics audit passed: every HTML page uses the guarded loader and internal traffic is suppressed.');
