import fs from 'node:fs';
import path from 'node:path';
import { SITE_URL, games, hubs } from './site-data.mjs';
import { activeBlogNumbers } from './editorial-inventory.mjs';

const root = path.resolve(import.meta.dirname, '..');
const pages = [
  ['index.html', '/'],
  ['about/index.html', '/about/'],
  ['editorial-policy/index.html', '/editorial-policy/'],
  ...games.map(game => [`${game.slug}/index.html`, `/${game.slug}/`]),
  ...hubs.map(hub => [`${hub.slug}/index.html`, `/${hub.slug}/`]),
  ['blogs/index.html', '/blogs/'],
  ...activeBlogNumbers.map(number => [`blogs/${number}.html`, `/blogs/${number}`]),
  ['privacy.html', '/privacy'],
  ['terms-and-conditions.html', '/terms-and-conditions']
];
const knownRoutes = new Set(pages.map(([, route]) => route));
const incoming = new Map([...knownRoutes].map(route => [route, new Set()]));
const issues = [];

function normalizeRoute(href, sourceRoute) {
  if (!href || /^(?:mailto:|tel:|javascript:|data:|#)/i.test(href)) return null;
  let url;
  try { url = new URL(href, `${SITE_URL}${sourceRoute}`); } catch { return null; }
  if (url.origin !== SITE_URL) return null;
  let route = url.pathname.replace(/\/index\.html$/, '/');
  if (knownRoutes.has(route)) return route;
  if (!route.endsWith('/') && knownRoutes.has(`${route}/`)) return `${route}/`;
  if (route.endsWith('/') && knownRoutes.has(route.slice(0, -1))) return route.slice(0, -1);
  return null;
}

function visibleWordCount(html) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<svg\b[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z0-9#]+;/gi, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

for (const [file, sourceRoute] of pages) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  for (const match of html.matchAll(/<a\b[^>]*href=["']([^"']+)["']/gi)) {
    const targetRoute = normalizeRoute(match[1], sourceRoute);
    if (targetRoute && targetRoute !== sourceRoute) incoming.get(targetRoute)?.add(sourceRoute);
  }

  const isGrowthPage = games.some(game => `/${game.slug}/` === sourceRoute)
    || hubs.some(hub => `/${hub.slug}/` === sourceRoute)
    || sourceRoute.startsWith('/blogs/');
  if (isGrowthPage && visibleWordCount(html) < 120) {
    issues.push(`${file}: fewer than 120 visible words`);
  }
}

const growthRoutes = new Set([
  ...games.map(game => `/${game.slug}/`),
  ...hubs.map(hub => `/${hub.slug}/`),
  '/blogs/',
  ...activeBlogNumbers.map(number => `/blogs/${number}`)
]);
for (const route of growthRoutes) {
  if ((incoming.get(route)?.size || 0) < 2) issues.push(`${route}: fewer than two static inbound links`);
}

if (issues.length) {
  console.error(`Indexability audit failed with ${issues.length} issue${issues.length === 1 ? '' : 's'}:\n- ${issues.join('\n- ')}`);
  process.exit(1);
}

console.log(`Indexability audit passed: ${growthRoutes.size} growth pages have useful content and at least two static crawl paths.`);
