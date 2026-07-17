export const RULES = Object.freeze({ lives: 3, colourDuration: 1200, maximumLength: 8 });

export const colourKey = colour => `${colour.r},${colour.g},${colour.b}`;
export const sequenceKey = sequence => sequence.map(colourKey).join('|');
export const cloneSequence = sequence => sequence.map(colour => ({ ...colour }));
export const sequenceLength = level => Math.min(2 + level, RULES.maximumLength);

export function randomColour(random = Math.random) {
  return { r: Math.floor(random() * 256), g: Math.floor(random() * 256), b: Math.floor(random() * 256) };
}

export function generateSequence(level, random = Math.random) {
  return Array.from({ length: sequenceLength(level) }, () => randomColour(random));
}

export function mutateSequence(base, edits = 1, random = Math.random) {
  const output = cloneSequence(base), used = new Set();
  const targetEdits = Math.min(edits, output.length);
  for (let attempt = 0; used.size < targetEdits && attempt < output.length * 4; attempt += 1) used.add(Math.floor(random() * output.length));
  for (let index = 0; used.size < targetEdits && index < output.length; index += 1) used.add(index);
  used.forEach(index => {
    let replacement = randomColour(random), attempt = 0;
    while (colourKey(replacement) === colourKey(output[index]) && attempt < 4) { replacement = randomColour(random); attempt += 1; }
    if (colourKey(replacement) === colourKey(output[index])) replacement = { ...replacement, r: (replacement.r + 1) % 256 };
    output[index] = replacement;
  });
  return output;
}

export function wrongOrderDecoy(correct, level, random = Math.random) {
  if (correct.length < 2) return mutateSequence(correct, 1, random);
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const decoy = cloneSequence(correct);
    if (level >= 5) {
      const index = Math.floor(random() * (decoy.length - 1));
      [decoy[index], decoy[index + 1]] = [decoy[index + 1], decoy[index]];
    } else {
      let destination = Math.floor(random() * decoy.length);
      if (destination === 0) destination = 1;
      decoy.splice(destination, 0, decoy.shift());
    }
    if (sequenceKey(decoy) !== sequenceKey(correct)) return decoy;
  }
  return mutateSequence(correct, 1, random);
}

export function shuffle(items, random = Math.random) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

export function buildOptions(correct, level, random = Math.random) {
  const options = [cloneSequence(correct)];
  const add = candidate => { if (!options.some(item => sequenceKey(item) === sequenceKey(candidate))) options.push(candidate); };
  add(wrongOrderDecoy(correct, level, random));
  add(mutateSequence(correct, 1, random));
  for (let attempt = 0; options.length < 4 && attempt < 16; attempt += 1) add(mutateSequence(correct, correct.length >= 3 && random() >= .7 ? 2 : 1, random));
  for (let offset = 1; options.length < 4; offset += 1) {
    const fallback = cloneSequence(correct), index = (offset - 1) % fallback.length;
    fallback[index].r = (fallback[index].r + offset) % 256;
    add(fallback);
  }
  return shuffle(options, random);
}

export class SeequenceRun {
  constructor() { this.reset(); }
  reset() { this.level = 1; this.lives = RULES.lives; this.score = 0; this.streak = 0; this.active = false; this.sequence = []; }
  beginRound(random) { this.sequence = generateSequence(this.level, random); this.options = buildOptions(this.sequence, this.level, random); this.active = true; return { sequence: this.sequence, options: this.options }; }
  choose(selection) {
    if (!this.active) return null;
    this.active = false;
    const correct = sequenceKey(selection) === sequenceKey(this.sequence);
    if (correct) {
      this.streak += 1;
      const points = 400 + this.level * 100 + Math.max(0, this.streak - 1) * 125;
      this.score += points; this.level += 1;
      return { correct, points, gameOver: false };
    }
    this.lives -= 1; this.streak = 0;
    return { correct, points: 0, gameOver: this.lives === 0 };
  }
}
