import fs from 'node:fs';
import path from 'node:path';
import { SITE_URL, games, hubs } from './site-data.mjs';

const root = path.resolve(import.meta.dirname, '..');
const updated = new Date().toISOString().slice(0, 10);
const categoryOrder = ['Word', 'Colour', 'Logic', 'Speed', 'Audio'];

const compact = `# Bludle

> Bludle is an independent collection of free browser puzzle games created by Stuart Pecksen. Games cover words, colour perception, logic, memory, audio recognition and reaction speed. No download is required.

- Canonical site: ${SITE_URL}/
- Creator and contact: ${SITE_URL}/about/
- Editorial policy: ${SITE_URL}/editorial-policy/
- Journal: ${SITE_URL}/blogs/
- Sitemap: ${SITE_URL}/sitemap.xml
- Last updated: ${updated}

## Games

${categoryOrder.map(category => `### ${category} games

${games.filter(game => game.category === category).map(game => `- [${game.name}](${SITE_URL}/${game.slug}/): ${game.description} Format: ${game.format}. Typical round: ${game.round}.`).join('\n')}`).join('\n\n')}

## Selection guides

${hubs.map(hub => `- [${hub.name}](${SITE_URL}/${hub.slug}/)`).join('\n')}

## Access

Pages are public and may be crawled when permitted by robots.txt. Individual game pages are the authoritative source for current rules and formats.
`;

const full = `${compact}

## Detailed game notes

${games.map(game => `### ${game.name}

- URL: ${SITE_URL}/${game.slug}/
- Category: ${game.category}
- How to play: ${game.how}
- Distinguishing mechanic: ${game.why}
- Access: Free browser game; no download required.
`).join('\n')}
`;

fs.writeFileSync(path.join(root, 'llms.txt'), `${compact.trimEnd()}\n`);
fs.writeFileSync(path.join(root, 'llms-full.txt'), `${full.trimEnd()}\n`);
console.log(`Generated llms.txt and llms-full.txt for ${games.length} games.`);
