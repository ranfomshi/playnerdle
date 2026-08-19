import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = path.resolve(import.meta.dirname, '..');
const source = fs.readFileSync(path.join(root, 'globalNav', 'consentManager.js'), 'utf8');
const htmlFiles = [];

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === '.git') continue;
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(target);
    else if (entry.name.endsWith('.html')) htmlFiles.push(target);
  }
}
walk(root);

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  assert.equal(html.includes('pagead2.googlesyndication.com/pagead/js/adsbygoogle'), false,
    `${path.relative(root, file)} loads AdSense without the consent manager`);
  assert.equal(/<script\b[^>]*src=["']\/?mixpanel\.js["']/i.test(html), false,
    `${path.relative(root, file)} loads Mixpanel before analytics consent`);
}

const appended = [];
const events = [];
const callbacks = new Map();
const windowStub = {
  dataLayer: [],
  dispatchEvent(event) { events.push(event); },
  addEventListener() {},
  __tcfapi(command, version, callback) { callbacks.set(`${command}:${version}`, callback); }
};
const documentStub = {
  createElement() {
    const listeners = {};
    return { dataset: {}, addEventListener(name, callback) { listeners[name] = callback; }, listeners };
  },
  head: { append(element) { appended.push(element); } }
};
class CustomEventStub { constructor(type, options = {}) { this.type = type; this.detail = options.detail; } }

vm.runInNewContext(source, {
  window: windowStub, document: documentStub, CustomEvent: CustomEventStub,
  Object, Array, Map, Set
});

assert.equal(appended.length, 1, 'only the CMP may load initially');
assert.match(appended[0].src, /^https:\/\/fundingchoicesmessages\.google\.com\//);
assert.equal(windowStub.dataLayer[0][0], 'consent');
assert.equal(windowStub.dataLayer[0][1], 'default');
assert.equal(windowStub.dataLayer[0][2].ad_storage, 'denied');
assert.equal(windowStub.dataLayer[0][2].analytics_storage, 'denied');

appended[0].listeners.load();
const tcfListener = callbacks.get('addEventListener:2');
assert.equal(typeof tcfListener, 'function');
tcfListener({ gdprApplies: true, purpose: { consents: { 1: true, 7: true, 8: true, 9: true, 10: true } } });
assert.equal(windowStub.__bludleAnalyticsConsent, true);
assert.equal(events.at(-1).type, 'bludle:analytics-consent');

windowStub.googlefc.callbackQueue[0].CONSENT_DATA_READY();
assert.equal(appended.length, 2, 'AdSense loads only after consent data is ready');
assert.match(appended[1].src, /^https:\/\/pagead2\.googlesyndication\.com\//);

console.log(`Consent audit passed: ${htmlFiles.length} HTML files avoid eager ad and analytics loaders.`);
