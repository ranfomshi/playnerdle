import fs from 'node:fs';

const file = new URL('../sitemap.xml', import.meta.url);
const today = new Date().toISOString().slice(0, 10);
const xml = fs.readFileSync(file, 'utf8');
const updated = xml.replace(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g, `<lastmod>${today}</lastmod>`);

fs.writeFileSync(file, updated);
console.log(`Updated sitemap lastmod values to ${today}`);
