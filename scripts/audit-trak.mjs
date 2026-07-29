import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { routes, routePathData } from '../trak/routes.js';

const root = path.resolve(import.meta.dirname, '..');
const app = await readFile(path.join(root, 'trak', 'trak.js'), 'utf8');
const html = await readFile(path.join(root, 'trak', 'index.html'), 'utf8');
const samples = 160;

assert.match(app, /routePathData\(activeRoute\)/, 'the visible route must come from the active movement geometry');
assert.doesNotMatch(app, /path:\s*['"]M/, 'Trak must not maintain a second hand-drawn route definition');
assert.match(html, /<path id="route-path"/, 'the generated route needs an SVG path surface');

for (const route of routes) {
  const coordinates = [...routePathData(route, samples).matchAll(/[ML]([\d.]+) ([\d.]+)/g)]
    .map(match => ({ x: Number(match[1]) / 100, y: Number(match[2]) / 100 }));
  assert.equal(coordinates.length, samples + 1, `${route.name} guide should include every sampled movement point`);
  coordinates.forEach((coordinate, index) => {
    const movingPoint = route.point(index / samples);
    assert.ok(Math.abs(coordinate.x - movingPoint.x) <= .000006, `${route.name} guide x diverges at sample ${index}`);
    assert.ok(Math.abs(coordinate.y - movingPoint.y) <= .000006, `${route.name} guide y diverges at sample ${index}`);
  });
}

const arcMiddle = routes.find(route => route.name === 'Arc').point(.5);
const sQuarter = routes.find(route => route.name === 'S-Curve').point(.25);
const eightQuarter = routes.find(route => route.name === 'Eight').point(.25);
assert.deepEqual(arcMiddle, { x: .5, y: .05999999999999994 }, 'Arc movement must remain unchanged');
assert.ok(Math.abs(sQuarter.x - .8) < Number.EPSILON && Math.abs(sQuarter.y - .29) < Number.EPSILON, 'S-Curve movement must remain unchanged');
assert.ok(Math.abs(eightQuarter.x - .86) < Number.EPSILON && Math.abs(eightQuarter.y - .5) < Number.EPSILON, 'Eight movement must remain unchanged');

console.log(`Trak audit passed: ${routes.length} dotted guides are generated from their exact movement geometry.`);
