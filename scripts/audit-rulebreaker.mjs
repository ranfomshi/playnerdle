import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = path.resolve(import.meta.dirname, '..');
const phraseSource = fs.readFileSync(path.join(root, 'rulebreaker', 'phrases.js'), 'utf8');
const context = { window: {} };
vm.runInNewContext(phraseSource, context);
const phrases = context.window.RulebreakerPhraseBank;
const game = fs.readFileSync(path.join(root, 'rulebreaker', 'rulebreaker.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'rulebreaker', 'index.html'), 'utf8');
const errors = [];

if (!Array.isArray(phrases) || phrases.length < 730) errors.push(`phrase bank has ${phrases?.length || 0} entries; expected at least 730`);
if (new Set(phrases).size !== phrases.length) errors.push('phrase bank contains duplicate entries');
phrases.forEach((phrase, index) => {
  if (!/^[A-Z ]+$/.test(phrase)) errors.push(`phrase ${index + 1} contains unsupported characters`);
  if (phrase.length < 24 || phrase.length > 90) errors.push(`phrase ${index + 1} has unsafe display length ${phrase.length}`);
});
if (!game.includes('RulebreakerPhraseBank')) errors.push('game does not consume the validated phrase bank');
if (/calendar|date rhythm/i.test(game + html)) errors.push('retired date rule is still present');
if (!game.includes("BludleEngagement?.complete")) errors.push('completion is not connected to shared engagement tracking');
if (!html.includes('data-game="rulebreaker"')) errors.push('page is missing its shared game identity');

if (errors.length) {
  console.error(`Rulebreaker audit failed with ${errors.length} issue${errors.length === 1 ? '' : 's'}:\n- ${errors.join('\n- ')}`);
  process.exit(1);
}

console.log(`Rulebreaker audit passed: ${phrases.length} unique daily phrases (${(phrases.length / 365).toFixed(2)} years).`);
