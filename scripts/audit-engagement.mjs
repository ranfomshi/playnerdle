import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { games } from './site-data.mjs';

const root = path.resolve(import.meta.dirname, '..');
const nav = await readFile(path.join(root, 'globalNav', 'globalNav.js'), 'utf8');
const manager = await readFile(path.join(root, 'globalNav', 'engagementManager.js'), 'utf8');
const issues = [];

if (!nav.includes('/globalNav/engagementManager.js')) {
  issues.push('globalNav/globalNav.js: shared engagement manager is not loaded');
}

for (const eventName of ['search_landing', 'game_start', 'game_complete', 'next_game_click', 'next_game_start', 'next_game_complete']) {
  if (!manager.includes(`'${eventName}'`)) issues.push(`globalNav/engagementManager.js: missing ${eventName} event`);
}

for (const game of games) {
  if (!manager.includes(`slug: '${game.slug}'`)) {
    issues.push(`globalNav/engagementManager.js: ${game.slug} has no recommendation metadata`);
  }
  if (!manager.includes(`    ${game.slug}: () =>`)) {
    issues.push(`globalNav/engagementManager.js: ${game.slug} has no completion rule`);
  }
}

if (!manager.includes('bludle:daily-progress:v1') || !manager.includes('bludle:play-streak:v1')) {
  issues.push('globalNav/engagementManager.js: local progress or streak storage is missing');
}

if (!manager.includes('Progress stays on this device')) {
  issues.push('globalNav/engagementManager.js: local-only progress disclosure is missing');
}

if (!manager.includes("landing_channel: landing.landing_channel")) {
  issues.push('globalNav/engagementManager.js: landing attribution is not carried into the game funnel');
}

if (issues.length) {
  console.error(`Engagement audit failed with ${issues.length} issue${issues.length === 1 ? '' : 's'}:`);
  issues.forEach(issue => console.error(`- ${issue}`));
  process.exit(1);
}

console.log(`Engagement audit passed: ${games.length} games have completion signals, recommendations and funnel tracking.`);
