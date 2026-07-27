import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { games } from './site-data.mjs';

const root = path.resolve(import.meta.dirname, '..');
const nav = await readFile(path.join(root, 'globalNav', 'globalNav.js'), 'utf8');
const manager = await readFile(path.join(root, 'globalNav', 'engagementManager.js'), 'utf8');
const telemetry = await readFile(path.join(root, 'globalNav', 'gameTelemetry.js'), 'utf8');
const mixpanel = await readFile(path.join(root, 'mixpanel.js'), 'utf8');
const home = await readFile(path.join(root, 'index.html'), 'utf8');
const homeScript = await readFile(path.join(root, 'home.js'), 'utf8');
const issues = [];

if (!nav.includes('/globalNav/engagementManager.js')) {
  issues.push('globalNav/globalNav.js: shared engagement manager is not loaded');
}

if (!nav.includes('/mixpanel.js') || !nav.includes('/globalNav/gameTelemetry.js')) {
  issues.push('globalNav/globalNav.js: shared product analytics or game telemetry loader is missing');
}

if (!mixpanel.includes('https://api-eu.mixpanel.com') || !mixpanel.includes('debug: false') || !mixpanel.includes('autocapture: false')) {
  issues.push('mixpanel.js: privacy-conscious EU production configuration is missing');
}

for (const eventName of ['search_landing', 'game_start', 'game_complete', 'next_game_recommendation_view', 'next_game_click', 'next_game_start', 'next_game_complete']) {
  if (!manager.includes(`'${eventName}'`)) issues.push(`globalNav/engagementManager.js: missing ${eventName} event`);
}

for (const game of games) {
  if (!manager.includes(`slug: '${game.slug}'`)) {
    issues.push(`globalNav/engagementManager.js: ${game.slug} has no recommendation metadata`);
  }
  if (!manager.includes(`    ${game.slug}: () =>`)) {
    issues.push(`globalNav/engagementManager.js: ${game.slug} has no completion rule`);
  }
  if (!manager.includes(`    ${game.slug}: { slug:`)) {
    issues.push(`globalNav/engagementManager.js: ${game.slug} has no curated next-game handoff`);
  }
  if (!telemetry.includes(`    ${game.slug}: () =>`)) {
    issues.push(`globalNav/gameTelemetry.js: ${game.slug} has no performance adapter`);
  }
}

for (const property of ['telemetry_schema_version', 'puzzle_day', 'puzzle_id', 'game_format']) {
  if (!telemetry.includes(property)) issues.push(`globalNav/gameTelemetry.js: missing ${property}`);
}

if (!manager.includes('BludleGameTelemetry?.snapshot')) {
  issues.push('globalNav/engagementManager.js: completion events do not include performance telemetry');
}

for (const forbiddenProperty of ['answer:', 'secret:', 'guess_value:', 'target_rgb:', 'player_rgb:']) {
  if (telemetry.includes(forbiddenProperty)) issues.push(`globalNav/gameTelemetry.js: forbidden raw gameplay property ${forbiddenProperty}`);
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

if (manager.includes('class="choices"') || manager.includes('slice(0, 2)')) {
  issues.push('globalNav/engagementManager.js: post-game treatment must present one clear recommendation');
}

if (!home.includes('class="werdle-anchor"') || !home.includes('id="werdleHero"')) {
  issues.push('index.html: Werdle acquisition anchor is missing from the homepage hero');
}

if (!homeScript.includes("sendEvent('home_feature_view'") || !homeScript.includes("trackClick('werdle', 'hero')")) {
  issues.push('home.js: Werdle hero impressions and clicks are not measurable');
}

if (issues.length) {
  console.error(`Engagement audit failed with ${issues.length} issue${issues.length === 1 ? '' : 's'}:`);
  issues.forEach(issue => console.error(`- ${issue}`));
  process.exit(1);
}

console.log(`Engagement audit passed: ${games.length} games have completion signals, recommendations and funnel tracking.`);
