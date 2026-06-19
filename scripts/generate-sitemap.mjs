import fs from 'node:fs';

const sitemapFile = new URL('../sitemap.xml', import.meta.url);
const today = new Date().toISOString().slice(0, 10);
const changedUrls = process.argv.slice(2);

if (changedUrls.length === 0) {
  console.log('No sitemap URLs supplied; leaving lastmod values unchanged.');
  process.exit(0);
}

const xml = fs.readFileSync(sitemapFile, 'utf8');
const updated = changedUrls.reduce((content, url) => {
  const escapedUrl = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`(<url><loc>${escapedUrl}<\\/loc><lastmod>)(\\d{4}-\\d{2}-\\d{2})(<\\/lastmod>)`, 'g');
  return content.replace(pattern, `$1${today}$3`);
}, xml);

fs.writeFileSync(sitemapFile, updated);
console.log(`Updated ${changedUrls.length} sitemap URL(s) to ${today}`);
