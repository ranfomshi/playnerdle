import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [manager, nav, mixpanel, home, homeStyles, engagement] = await Promise.all([
  readFile(path.join(root, 'globalNav', 'experimentManager.js'), 'utf8'),
  readFile(path.join(root, 'globalNav', 'globalNav.js'), 'utf8'),
  readFile(path.join(root, 'mixpanel.js'), 'utf8'),
  readFile(path.join(root, 'home.js'), 'utf8'),
  readFile(path.join(root, 'home.css'), 'utf8'),
  readFile(path.join(root, 'globalNav', 'engagementManager.js'), 'utf8')
]);

assert.match(nav, /ensureExperimentManager\(\);[\s\S]+ensureEngagementManager\(\);/,
  'the experiment manager must load before post-game engagement');
assert.match(mixpanel, /flags:\s*\{[\s\S]+variantLookupPolicy:\s*"networkFirst"/,
  'Mixpanel feature flags must be enabled with a fresh network lookup');

for (const key of ['homepage_werdle_focus_v_1', 'post-game-continuation-v-1']) {
  assert.ok(manager.includes(`'${key}'`), `${key} is missing from the shared flag allowlist`);
}

assert.match(manager, /__bludleAnalyticsDisabled/,
  'experiment enrollment must respect the internal-traffic policy');
assert.match(manager, /__bludleAnalyticsConsent === true/,
  'experiment enrollment must require analytics consent');
assert.match(manager, /mixpanel\.flags\.get_variant_value/,
  'variant resolution must use the Mixpanel feature-flag SDK so exposure is recorded');

assert.match(home, /FLAG_KEYS\?\.homepageWerdleFocus/,
  'the homepage must resolve its Werdle-focus flag');
assert.match(homeStyles, /data-home-experiment="treatment"/,
  'the homepage treatment must have a distinct layout');
assert.match(engagement, /FLAG_KEYS\?\.postGameContinuation/,
  'post-game recommendations must resolve their continuation flag');
assert.match(engagement, /experiment_variant: experimentVariant/g,
  'post-game events must record the assigned variant');

console.log('Experiment audit passed: both consent-aware Mixpanel treatments are wired and observable.');
