import fs from 'node:fs';
import path from 'node:path';
import { SITE_URL, games, hubs } from './site-data.mjs';

const root = path.resolve(import.meta.dirname, '..');
const blogs = fs.readdirSync(path.join(root, 'blogs')).filter(name => /^\d+\.html$/.test(name)).sort((a, b) => Number.parseInt(a) - Number.parseInt(b));
const pages = [
  ['index.html', '/'], ['about/index.html', '/about/'], ['editorial-policy/index.html', '/editorial-policy/'],
  ...games.map(game => [`${game.slug}/index.html`, `/${game.slug}/`]),
  ...hubs.map(hub => [`${hub.slug}/index.html`, `/${hub.slug}/`]),
  ['blogs/index.html', '/blogs/'], ...blogs.map(name => [`blogs/${name}`, `/blogs/${name.replace('.html', '')}`]),
  ['privacy.html', '/privacy'], ['terms-and-conditions.html', '/terms-and-conditions']
];
const expectedUrls = new Set(pages.map(([, route]) => `${SITE_URL}${route}`));
const errors = [];
const titles = new Map();

function tags(html, name) {
  return [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'gi'))].map(match => match[0]);
}

function attribute(tag, name) {
  return tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`, 'i'))?.[1] || '';
}

function meta(html, key, value) {
  return tags(html, 'meta').filter(tag => attribute(tag, key).toLowerCase() === value.toLowerCase());
}

function resolveInternal(file, href) {
  const clean = href.split(/[?#]/)[0];
  if (!clean || /^(?:https?:|mailto:|tel:|javascript:|data:)/i.test(clean)) return true;
  const base = clean.startsWith('/') ? path.join(root, clean.slice(1)) : path.resolve(path.dirname(file), clean);
  return [base, `${base}.html`, path.join(base, 'index.html')].some(candidate => fs.existsSync(candidate));
}

for (const [rel, route] of pages) {
  const file = path.join(root, rel);
  const html = fs.readFileSync(file, 'utf8');
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1].replace(/<[^>]+>/g, '').trim() || '';
  if (!title) errors.push(`${rel}: missing title`);
  else if (titles.has(title)) errors.push(`${rel}: duplicate title also used by ${titles.get(title)}`);
  else titles.set(title, rel);

  const descriptions = meta(html, 'name', 'description');
  if (descriptions.length !== 1 || attribute(descriptions[0] || '', 'content').length < 50) errors.push(`${rel}: requires one useful meta description`);
  const robots = meta(html, 'name', 'robots');
  if (robots.length !== 1 || /noindex/i.test(attribute(robots[0] || '', 'content'))) errors.push(`${rel}: indexable page has invalid robots metadata`);

  const canonicals = tags(html, 'link').filter(tag => attribute(tag, 'rel').toLowerCase() === 'canonical');
  const expectedCanonical = `${SITE_URL}${route}`;
  if (canonicals.length !== 1 || attribute(canonicals[0] || '', 'href') !== expectedCanonical) errors.push(`${rel}: canonical must be ${expectedCanonical}`);
  if (meta(html, 'property', 'og:image').length !== 1) errors.push(`${rel}: requires one og:image`);
  if ((html.match(/<h1\b/gi) || []).length !== 1) errors.push(`${rel}: requires exactly one h1`);
  if (!html.includes('data-bludle-schema')) errors.push(`${rel}: missing page-specific JSON-LD`);

  for (const match of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try { JSON.parse(match[1]); } catch (error) { errors.push(`${rel}: invalid JSON-LD (${error.message})`); }
  }
  for (const match of html.matchAll(/href=["']([^"']+)["']/gi)) {
    if (!resolveInternal(file, match[1])) errors.push(`${rel}: broken internal link ${match[1]}`);
  }
  if (/https?:\/\/www\.bludle\.com/i.test(html)) errors.push(`${rel}: contains the retired www host`);
  if (/\u00e2\u20ac|\u00c3\u2014|\u00c2\u00b7/.test(html)) errors.push(`${rel}: contains likely mojibake`);
}

const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
for (const url of expectedUrls) if (!sitemapUrls.includes(url)) errors.push(`sitemap.xml: missing ${url}`);
for (const url of sitemapUrls) if (!expectedUrls.has(url)) errors.push(`sitemap.xml: unexpected ${url}`);
if (new Set(sitemapUrls).size !== sitemapUrls.length) errors.push('sitemap.xml: duplicate URLs');

const redirects = fs.readFileSync(path.join(root, 'netlify.toml'), 'utf8');
if (!redirects.includes('from = "https://www.bludle.com/*"') || !redirects.includes('to = "https://bludle.com/:splat"')) errors.push('netlify.toml: missing www-to-apex redirect');
if (redirects.includes('from = "https://bludle.com/*"')) errors.push('netlify.toml: apex host must not redirect to itself');
const flatRedirects = fs.readFileSync(path.join(root, '_redirects'), 'utf8');
for (const name of blogs) {
  const number = name.replace('.html', '');
  if (!flatRedirects.includes(`/blogs/${name}  /blogs/${number}  301!`)) errors.push(`_redirects: missing clean URL redirect for ${name}`);
}
const robots = fs.readFileSync(path.join(root, 'robots.txt'), 'utf8');
if (!robots.includes('User-agent: OAI-SearchBot') || !robots.includes(`Sitemap: ${SITE_URL}/sitemap.xml`)) errors.push('robots.txt: missing crawler or sitemap declaration');

if (errors.length) {
  console.error(`Search audit failed with ${errors.length} issue${errors.length === 1 ? '' : 's'}:\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log(`Search audit passed: ${pages.length} indexable pages, ${sitemapUrls.length} sitemap URLs, valid metadata, links and JSON-LD.`);
