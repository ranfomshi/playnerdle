import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { SITE_URL, games, gameBySlug, hubs, utilityPaths } from './site-data.mjs';

const root = path.resolve(import.meta.dirname, '..');
const blogFiles = fs.readdirSync(path.join(root, 'blogs'))
  .filter(name => /^\d+\.html$/.test(name))
  .sort((a, b) => Number.parseInt(a) - Number.parseInt(b));
const blogNumbers = new Set(blogFiles.map(name => name.replace('.html', '')));
const gameSlugs = new Set(games.map(game => game.slug));
const hubSlugs = new Set(hubs.map(hub => hub.slug));
const utilitySet = new Set([...utilityPaths, 'blogs/disclaimer.html']);
const editorialOverrides = new Map([
  ['blogs/2.html', ['The Rise of Handheld Electronic Word Games', 'Trace handheld word games from early LCD devices to modern mobile puzzles, including the design ideas that made portable play enduring.']],
  ['blogs/13.html', ['Beyond Wordle: Eight Original Daily Word Game Mechanics', 'Explore daily word games that use colour decoding, silhouettes, borrowed letters and overlapping answers instead of copying Wordle’s core loop.']],
  ['blogs/14.html', ['How to Choose a Daily Word Puzzle by Its Core Mechanic', 'Compare deduction, association, code-breaking and visual word puzzles to find a daily game that suits the way you like to think.']],
  ['blogs/16.html', ['Five-Minute Daily Word Games for a Quick Browser Break', 'Find free daily word puzzles designed for short sessions, with clear comparisons of format, difficulty and replay options.']],
  ['blogs/17.html', ['Independent Word Games That Try Something Different', 'Discover original independent browser word games built around shades, shapes, transformations, overlaps and circular letter movement.']],
  ['blogs/18.html', ['Daily Word Puzzles for Vocabulary, Logic and Pattern Skills', 'Choose a free daily word puzzle by the skill it emphasises, from vocabulary recall to lateral thinking and visual pattern recognition.']],
  ['blogs/20.html', ['Browser Word Games That Are Not Wordle Clones', 'Play distinctive browser word games that use association, typography, code-breaking and overlapping answers with no app download.']],
  ['blogs/21.html', ['Mobile-Friendly Word Puzzles You Can Play Without an App', 'Compare responsive daily word games that run directly in a mobile browser without an account or app-store installation.']]
]);

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    if (entry.name === '.git') return [];
    const full = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(full) : full.endsWith('.html') ? [full] : [];
  });
}

function relative(file) {
  return path.relative(root, file).replaceAll('\\', '/');
}

function escapeHtml(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

function plainText(value) {
  return value.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&mdash;/g, '—').replace(/\s+/g, ' ').trim();
}

function existingTitle(html) {
  return plainText(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || 'Bludle');
}

function existingDescription(html) {
  return html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["'][^>]*>/i)?.[1]
    || html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["'][^>]*>/i)?.[1]
    || '';
}

function existingH1(html) {
  return plainText(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || existingTitle(html).split('|')[0]);
}

function replaceMojibake(html) {
  const replacements = new Map([
    ['\u00e2\u20ac\u201d', '\u2014'], ['\u00e2\u20ac\u201c', '\u2013'], ['\u00e2\u20ac\u2122', '\u2019'],
    ['\u00e2\u20ac\u0153', '\u201c'], ['\u00e2\u20ac\u009d', '\u201d'], ['\u00e2\u20ac\ufffd', '\u201d'],
    ['\u00e2\u2020\u2019', '\u2192'], ['\u00e2\u2020\u2014', '\u2197'], ['\u00e2\u2020\u00af', '\u21af'],
    ['\u00e2\u2014\u2019', '\u25d2'], ['\u00e2\u2014\u2021', '\u25c7'], ['\u00e2\u2122\u00aa', '\u266a'],
    ['\u00c3\u2014', '\u00d7'], ['\u00c2\u00b7', '\u00b7'], ['\u00c2\u00a9', '\u00a9'], ['\u00c2\u00ae', '\u00ae'],
    ['\u00e2\u20ac\u00a6', '\u2026'], ['\u00c2\u00a0', ' ']
  ]);
  for (const [bad, good] of replacements) html = html.replaceAll(bad, good);
  return html;
}

function canonicalFor(rel) {
  if (rel === 'index.html') return '/';
  if (rel === 'privacy.html') return '/privacy';
  if (rel === 'terms-and-conditions.html') return '/terms-and-conditions';
  if (rel === 'about/index.html') return '/about/';
  if (rel === 'blogs/index.html') return '/blogs/';
  const blog = rel.match(/^blogs\/(\d+)\.html$/)?.[1];
  if (blog && blogNumbers.has(blog)) return `/blogs/${blog}`;
  const directory = rel.match(/^([^/]+)\/index\.html$/)?.[1];
  if (directory && (gameSlugs.has(directory) || hubSlugs.has(directory) || directory === 'editorial-policy')) return `/${directory}/`;
  return null;
}

function setMeta(html, attribute, key, content) {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const marker = new RegExp(`\\b${attribute}=["']${escapedKey}["']`, 'i');
  html = html.replace(/[ \t]*<meta\b[^>]*>[ \t]*(?:\r?\n)?/gi, tag => marker.test(tag) ? '' : tag);
  return html.replace(/<\/head>/i, `  <meta ${attribute}="${key}" content="${escapeHtml(content)}">\n</head>`);
}

function setCanonical(html, url) {
  html = html.replace(/<link\b[^>]*>\s*/gi, tag => /\brel=["']canonical["']/i.test(tag) ? '' : tag);
  return html.replace(/<\/head>/i, `  <link rel="canonical" href="${url}">\n</head>`);
}

function ensureStylesheet(html, href) {
  if (html.includes(`href="${href}"`) || html.includes(`href='${href}'`)) return html;
  return html.replace(/<\/head>/i, `  <link rel="stylesheet" href="${href}">\n</head>`);
}

function removeTaggedBlock(html, name) {
  return html.replace(new RegExp(`\\s*<!-- ${name}:start -->[\\s\\S]*?<!-- ${name}:end -->\\s*`, 'gi'), '\n');
}

function removeSchemaTypes(html, types) {
  return html.replace(/\s*<script[^>]+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>\s*/gi, block => {
    return types.some(type => block.includes(`"${type}"`) || block.includes(`'${type}'`)) ? '\n' : block;
  });
}

function cleanOutput(text) {
  return `${text.replace(/[ \t]+$/gm, '').trimEnd()}\n`;
}

function injectSchema(html, schema) {
  html = html.replace(/\s*<script[^>]+data-bludle-schema[^>]*>[\s\S]*?<\/script>\s*/gi, '\n');
  const json = JSON.stringify(schema).replaceAll('</', '<\\/');
  return html.replace(/<\/head>/i, `  <script type="application/ld+json" data-bludle-schema>${json}</script>\n</head>`);
}

function gitDate(rel) {
  try {
    if (execFileSync('git', ['status', '--porcelain', '--', rel], { cwd: root, encoding: 'utf8' }).trim()) return new Date().toISOString().slice(0, 10);
    return execFileSync('git', ['log', '-1', '--format=%cs', '--', rel], { cwd: root, encoding: 'utf8' }).trim() || '2026-07-20';
  } catch {
    return '2026-07-20';
  }
}

function gitPublishedDate(rel) {
  try {
    const dates = execFileSync('git', ['log', '--follow', '--format=%cs', '--', rel], { cwd: root, encoding: 'utf8' }).trim().split(/\r?\n/).filter(Boolean);
    return dates.at(-1) || gitDate(rel);
  } catch {
    return gitDate(rel);
  }
}

function gameGuide(game) {
  const related = game.related.map(slug => gameBySlug.get(slug)).filter(Boolean);
  return `<!-- bludle-guide:start -->
  <section class="bludle-discovery game-guide" aria-labelledby="about-${game.slug}">
    <div class="discovery-heading">
      <p class="discovery-kicker">About the game</p>
      <h2 id="about-${game.slug}">How to play ${escapeHtml(game.name)}</h2>
      <p>${escapeHtml(game.description)}</p>
    </div>
    <dl class="game-facts">
      <div><dt>Format</dt><dd>${escapeHtml(game.format)}</dd></div>
      <div><dt>Typical round</dt><dd>${escapeHtml(game.round)}</dd></div>
      <div><dt>Cost</dt><dd>Free, with no download required</dd></div>
    </dl>
    <div class="discovery-copy">
      <div><h3>The rules</h3><p>${escapeHtml(game.how)}</p></div>
      <div><h3>What makes it different</h3><p>${escapeHtml(game.why)}</p></div>
    </div>
    <nav class="related-games" aria-label="Games related to ${escapeHtml(game.name)}">
      <span>Try next</span>${related.map(item => `<a href="/${item.slug}/">${escapeHtml(item.name)}</a>`).join('')}
    </nav>
  </section>
  <!-- bludle-guide:end -->`;
}

function hubGuide(hub) {
  const selected = hub.games.map(slug => gameBySlug.get(slug)).filter(Boolean);
  return `<!-- bludle-hub-guide:start -->
  <section class="bludle-discovery choice-guide" aria-labelledby="compare-${hub.slug}">
    <div class="discovery-heading"><p class="discovery-kicker">Choose by play style</p><h2 id="compare-${hub.slug}">Compare ${escapeHtml(hub.name.toLowerCase())}</h2><p>These recommendations are selected from games built and maintained by Bludle. The table describes the actual mechanic and format rather than ranking games by sponsorship.</p></div>
    <div class="comparison-scroll"><table><thead><tr><th>Game</th><th>Core challenge</th><th>Format</th><th>Typical round</th></tr></thead><tbody>
      ${selected.map(game => `<tr><th><a href="/${game.slug}/">${escapeHtml(game.name)}</a></th><td>${escapeHtml(game.description)}</td><td>${escapeHtml(game.format)}</td><td>${escapeHtml(game.round)}</td></tr>`).join('\n      ')}
    </tbody></table></div>
    <p class="method-note"><strong>How this guide is made:</strong> selections are based on the rules, pacing and accessibility of Bludle’s own games. No placement is paid for. See the <a href="/editorial-policy/">editorial policy</a>.</p>
  </section>
  <!-- bludle-hub-guide:end -->`;
}

function addAfterMain(html, block) {
  const position = html.toLowerCase().lastIndexOf('</main>');
  if (position >= 0) return `${html.slice(0, position + 7)}\n${block}${html.slice(position + 7)}`;
  return html.replace(/<\/body>/i, `${block}\n</body>`);
}

function pageSchema(rel, route, title, description, image) {
  const url = `${SITE_URL}${route}`;
  const base = { '@context': 'https://schema.org', '@id': `${url}#page`, url, name: title, description, inLanguage: 'en-GB', isPartOf: { '@id': `${SITE_URL}/#website` } };
  const blogNumber = rel.match(/^blogs\/(\d+)\.html$/)?.[1];
  if (blogNumber) {
    return { ...base, '@type': 'BlogPosting', headline: title, datePublished: gitPublishedDate(rel), dateModified: gitDate(rel), author: { '@type': 'Person', '@id': `${SITE_URL}/about/#stuart-pecksen`, name: 'Stuart Pecksen', url: `${SITE_URL}/about/` }, publisher: { '@id': `${SITE_URL}/#organization` }, image };
  }
  if (rel === 'about/index.html') return { ...base, '@type': 'AboutPage', mainEntity: { '@type': 'Person', '@id': `${SITE_URL}/about/#stuart-pecksen`, name: 'Stuart Pecksen', url: `${SITE_URL}/about/`, worksFor: { '@id': `${SITE_URL}/#organization` } } };
  if (rel === 'editorial-policy/index.html') return { ...base, '@type': 'WebPage', about: { '@id': `${SITE_URL}/#organization` }, dateModified: gitDate(rel) };
  const hub = hubs.find(item => rel === `${item.slug}/index.html`);
  if (hub) return { ...base, '@type': 'CollectionPage', mainEntity: { '@type': 'ItemList', itemListElement: hub.games.map((slug, index) => ({ '@type': 'ListItem', position: index + 1, url: `${SITE_URL}/${slug}/`, name: gameBySlug.get(slug)?.name })) } };
  return { ...base, '@type': 'WebPage' };
}

function processFile(file) {
  const rel = relative(file);
  let html = replaceMojibake(fs.readFileSync(file, 'utf8'))
    .replaceAll('https://www.bludle.com', SITE_URL)
    .replaceAll('http://www.bludle.com', SITE_URL)
    .replaceAll('www.bludle.com', 'bludle.com')
    .replaceAll('/images/icon.png', '/android-chrome-512x512.png');
  html = html
    .replaceAll('These recommendations are grouped by player intent so search visitors and AI assistants can route people to a playable Bludle page quickly.', 'Start with the kind of challenge you enjoy, then use the short descriptions to jump straight into a game.')
    .replaceAll('aria-label="SEO game guide"', 'aria-label="Game selection guide"')
    .replaceAll('These curated recommendations match search intent to playable games, helping new visitors start quickly and discover another round after their first play.', 'Use the recommendations below to compare the mechanic, pace and format before choosing your next game.')
    .replaceAll('Internal links that keep discovery ad-safe and gameplay-first.', 'Clear rules and formats before you start.')
    .replaceAll('<h2>Ad-safe discovery</h2><p>Sponsored sections are labelled and separated from game controls so the page can grow organic traffic while protecting user experience and ad quality.</p>', '<h2>Made for quick play</h2><p>Every recommendation opens directly in the browser. Sponsored sections are labelled and kept separate from game controls.</p>');
  let navFallbackSeen = false;
  html = html.replace(/<noscript><link rel="stylesheet" href="\/globalNav\/globalNav\.css"><\/noscript>/gi, block => {
    if (navFallbackSeen) return '';
    navFallbackSeen = true;
    return block;
  });
  html = html.replace(/<html([^>]*)\blang=["'][^"']+["']([^>]*)>/i, '<html$1lang="en-GB"$2>');
  html = html.replace(/<html(?![^>]*\blang=)([^>]*)>/i, '<html lang="en-GB"$1>');
  html = html.replace(/\s*<meta[^>]+name=["']keywords["'][^>]*>\s*/gi, '\n');

  const route = canonicalFor(rel);
  const isUtility = utilitySet.has(rel) || !route;
  if (isUtility) {
    html = setMeta(html, 'name', 'robots', rel === '404.html' ? 'noindex, nofollow' : 'noindex, follow');
    fs.writeFileSync(file, cleanOutput(html));
    return;
  }

  if (rel === 'index.html') {
    const dimensions = {
      'alternate.jpg': [1080, 1080], 'bludle.jpg': [818, 746], 'cm.jpg': [631, 570], 'codle.jpg': [544, 530],
      'connex.png': [1116, 761], 'heardle.png': [720, 692], 'hue.png': [488, 491], 'hunt.png': [616, 625],
      'reaction.jpg': [663, 673], 'seequence.jpg': [1024, 559], 'shifty.png': [690, 590], 'tintuition.png': [571, 597],
      'trak.png': [673, 741], 'werdle.png': [345, 294], 'wordmash.svg': [1200, 700]
    };
    html = html.replace(/(<a class="game"[^>]*?)\s*style="background-image:\s*url\('\.\/images\/([^']+)'\)"([^>]*>)/gi, (match, before, filename, after) => {
      const label = plainText((`${before}${after}`).match(/aria-label="([^"]+)"/i)?.[1] || filename);
      const [width, height] = dimensions[filename] || [1200, 800];
      return `${before}${after}<img class="game-art" src="/images/${filename}" alt="${escapeHtml(label)} game artwork" width="${width}" height="${height}" loading="lazy" decoding="async">`;
    });
  }

  const game = games.find(item => rel === `${item.slug}/index.html`);
  let title = existingTitle(html);
  let description = game?.description || existingDescription(html) || `${existingH1(html)} on Bludle.`;
  const editorialOverride = editorialOverrides.get(rel);
  if (editorialOverride) {
    [title, description] = editorialOverride;
    html = html.replace(/<title[^>]*>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
  }
  const imagePath = game ? `/images/social/${game.slug}.jpg` : '/images/social/home.jpg';
  const image = `${SITE_URL}${imagePath}`;
  const canonical = `${SITE_URL}${route}`;

  if (game) {
    title = `${game.name} | Free ${game.category} Game | Bludle`;
    html = html.replace(/<title[^>]*>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
  }
  html = setMeta(html, 'name', 'description', description);
  html = setMeta(html, 'name', 'robots', 'index, follow, max-image-preview:large');
  html = setCanonical(html, canonical);
  html = setMeta(html, 'property', 'og:site_name', 'Bludle');
  html = setMeta(html, 'property', 'og:title', title);
  html = setMeta(html, 'property', 'og:description', description);
  html = setMeta(html, 'property', 'og:url', canonical);
  html = setMeta(html, 'property', 'og:type', rel.match(/^blogs\/\d+\.html$/) ? 'article' : 'website');
  html = setMeta(html, 'property', 'og:image', image);
  html = setMeta(html, 'property', 'og:image:alt', `${game?.name || existingH1(html)} on Bludle`);
  html = setMeta(html, 'property', 'og:image:type', 'image/jpeg');
  html = setMeta(html, 'property', 'og:image:width', '1200');
  html = setMeta(html, 'property', 'og:image:height', '630');
  html = setMeta(html, 'name', 'twitter:card', 'summary_large_image');
  html = setMeta(html, 'name', 'twitter:title', title);
  html = setMeta(html, 'name', 'twitter:description', description);
  html = setMeta(html, 'name', 'twitter:image', image);
  html = setMeta(html, 'name', 'twitter:image:alt', `${game?.name || existingH1(html)} on Bludle`);

  if (game) {
    html = removeSchemaTypes(html, ['WebApplication', 'SoftwareApplication', 'VideoGame', 'Game']);
    html = injectSchema(html, {
      '@context': 'https://schema.org', '@type': ['WebApplication', 'VideoGame'], '@id': `${canonical}#game`,
      name: game.name, url: canonical, description, image, inLanguage: 'en-GB', genre: [`${game.category} game`, 'Puzzle game'],
      applicationCategory: 'GameApplication', operatingSystem: 'Any', browserRequirements: 'Requires JavaScript and a modern web browser',
      isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'GBP', availability: 'https://schema.org/InStock' },
      publisher: { '@id': `${SITE_URL}/#organization` }, isPartOf: { '@id': `${SITE_URL}/#website` }
    });
    html = removeTaggedBlock(html, 'bludle-guide');
    html = ensureStylesheet(html, '/globalNav/discovery.css');
    html = addAfterMain(html, gameGuide(game));
  } else {
    if (/^blogs\/\d+\.html$/.test(rel)) html = removeSchemaTypes(html, ['BlogPosting', 'Article', 'NewsArticle']);
    html = injectSchema(html, pageSchema(rel, route, title, description, image));
  }

  const hub = hubs.find(item => rel === `${item.slug}/index.html`);
  if (hub) {
    html = removeTaggedBlock(html, 'bludle-hub-guide');
    html = ensureStylesheet(html, '/globalNav/discovery.css');
    html = addAfterMain(html, hubGuide(hub));
  }

  if (/^blogs\/\d+\.html$/.test(rel)) {
    html = ensureStylesheet(html, '/globalNav/discovery.css');
    const meta = `<p class="bludle-article-meta">By <a href="/about/" rel="author">Stuart Pecksen</a> · Updated ${new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${gitDate(rel)}T00:00:00Z`))} · <a href="/editorial-policy/">How we publish</a></p>`;
    if (html.includes('bludle-article-meta')) html = html.replace(/<p class="bludle-article-meta">[\s\S]*?<\/p>/i, meta);
    else html = html.replace(/<\/h1>/i, `</h1>\n${meta}`);
  }

  fs.writeFileSync(file, cleanOutput(html));
}

for (const file of walk(root)) processFile(file);
for (const file of (function walkText(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    if (entry.name === '.git' || entry.name === 'scripts') return [];
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) return walkText(full);
    return /\.(?:css|js|mjs|md|txt|toml|xml)$/i.test(entry.name) ? [full] : [];
  });
}(root))) {
  const original = fs.readFileSync(file, 'utf8');
  const updated = replaceMojibake(original);
  if (updated !== original) fs.writeFileSync(file, updated);
}
console.log(`Applied search foundations to ${walk(root).length} HTML files.`);
