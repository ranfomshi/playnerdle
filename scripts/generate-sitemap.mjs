import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { SITE_URL, games, hubs } from './site-data.mjs';
import { activeBlogNumbers } from './editorial-inventory.mjs';

const root = path.resolve(import.meta.dirname, '..');
const blogs = activeBlogNumbers.map(number => `${number}.html`);

const pages = [
  ['/', 'index.html', 'weekly', '1.0'],
  ['/about/', 'about/index.html', 'monthly', '0.6'],
  ['/editorial-policy/', 'editorial-policy/index.html', 'monthly', '0.4'],
  ...games.map(game => [`/${game.slug}/`, `${game.slug}/index.html`, 'weekly', '0.9']),
  ...hubs.map(hub => [`/${hub.slug}/`, `${hub.slug}/index.html`, 'monthly', '0.7']),
  ['/blogs/', 'blogs/index.html', 'weekly', '0.7'],
  ...blogs.map(name => [`/blogs/${name.replace('.html', '')}`, `blogs/${name}`, 'monthly', '0.6']),
  ['/privacy', 'privacy.html', 'yearly', '0.2'],
  ['/terms-and-conditions', 'terms-and-conditions.html', 'yearly', '0.2']
];

function lastModified(file) {
  try {
    if (execFileSync('git', ['status', '--porcelain', '--', file], { cwd: root, encoding: 'utf8' }).trim()) return new Date().toISOString().slice(0, 10);
    return execFileSync('git', ['log', '-1', '--format=%cs', '--', file], { cwd: root, encoding: 'utf8' }).trim()
      || new Date(fs.statSync(path.join(root, file)).mtime).toISOString().slice(0, 10);
  } catch {
    return new Date(fs.statSync(path.join(root, file)).mtime).toISOString().slice(0, 10);
  }
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(([route, file, changefreq, priority]) => `  <url>
    <loc>${SITE_URL}${route}</loc>
    <lastmod>${lastModified(file)}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join('\n')}
</urlset>
`;

fs.writeFileSync(path.join(root, 'sitemap.xml'), `${xml.trimEnd()}\n`);
console.log(`Generated sitemap.xml with ${pages.length} canonical URLs.`);
