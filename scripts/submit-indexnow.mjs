import { execFileSync } from 'node:child_process';
import { SITE_URL, games, hubs } from './site-data.mjs';

const key = '7f3e81c9564b4d3ab241db802d67f8a1';
const [before, after = 'HEAD'] = process.argv.slice(2);
const allRoutes = ['/', '/about/', '/editorial-policy/', '/blogs/', '/privacy', '/terms-and-conditions',
  ...games.map(game => `/${game.slug}/`), ...hubs.map(hub => `/${hub.slug}/`)];

function routeForFile(file) {
  if (file === 'index.html') return '/';
  if (file === 'privacy.html') return '/privacy';
  if (file === 'terms-and-conditions.html') return '/terms-and-conditions';
  const blog = file.match(/^blogs\/(\d+)\.html$/)?.[1];
  if (blog) return `/blogs/${blog}`;
  const directory = file.match(/^([^/]+)\/index\.html$/)?.[1];
  if (directory && [...games.map(game => game.slug), ...hubs.map(hub => hub.slug), 'about', 'editorial-policy', 'blogs'].includes(directory)) return `/${directory}/`;
  return null;
}

let routes = allRoutes;
if (before && !/^0+$/.test(before)) {
  const changed = execFileSync('git', ['diff', '--name-only', before, after], { encoding: 'utf8' }).trim().split(/\r?\n/).filter(Boolean);
  routes = [...new Set(changed.map(routeForFile).filter(Boolean))];
  if (changed.some(file => file.startsWith('globalNav/') || file.startsWith('scripts/site-data'))) routes = allRoutes;
}

if (!routes.length) {
  console.log('No indexable URLs changed; skipping IndexNow.');
  process.exit(0);
}

const urlList = routes.map(route => `${SITE_URL}${route}`);
const response = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: 'bludle.com', key, keyLocation: `${SITE_URL}/${key}.txt`, urlList })
});

if (!response.ok && response.status !== 202) throw new Error(`IndexNow returned ${response.status}: ${await response.text()}`);
console.log(`Submitted ${urlList.length} changed URL${urlList.length === 1 ? '' : 's'} to IndexNow.`);

