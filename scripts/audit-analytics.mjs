import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

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

if (!sharedScript.includes(analyticsId)) {
  issues.push(`globalNav/globalNav.js: missing GA4 property ${analyticsId}`);
}

if (!sharedScript.includes('window.__bludleAnalyticsInitialized')) {
  issues.push('globalNav/globalNav.js: missing duplicate-initialisation guard');
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

console.log('Analytics audit passed: every HTML page uses the guarded shared GA4 loader.');
