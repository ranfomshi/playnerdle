import { readFile } from 'node:fs/promises';
import path from 'node:path';
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

if (!manager.includes("const engagedFooterSlot = '7551359942'")) {
  issues.push('globalNav/adManager.js: engaged game-footer unit is missing');
}

for (const game of games) {
  if (!manager.includes(`'/${game.slug}'`)) {
    issues.push(`globalNav/adManager.js: /${game.slug}/ is not covered`);
  }
}

if (!manager.includes('IntersectionObserver')) {
  issues.push('globalNav/adManager.js: placements are not viewability-aware');
}

if (!styles.includes('margin: 160px auto 48px')) {
  issues.push('globalNav/globalNav.css: game/ad interaction spacing is below policy target');
}

if (bludle.includes('class="ad-slot"')) {
  issues.push('bludle/index.html: obsolete empty ad placeholder is still visible');
}

if (issues.length) {
  console.error(`Monetization audit failed with ${issues.length} issue${issues.length === 1 ? '' : 's'}:`);
  issues.forEach(issue => console.error(`- ${issue}`));
  process.exit(1);
}

console.log(`Monetization audit passed: ${games.length} games use the controlled engaged-footer placement.`);
