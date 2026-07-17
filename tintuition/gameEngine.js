export const RULES = Object.freeze({
  startingLives: 3,
  startingDuration: 60_000,
  durationReduction: 5_000,
  minimumDuration: 20_000,
  maximumError: 30
});

export function hueDistance(first, second) {
  const difference = Math.abs(Number(first) - Number(second)) % 360;
  return Math.min(difference, 360 - difference);
}

export function compareColours(target, guess) {
  const channels = {
    hue: Math.round(hueDistance(target.hue, guess.hue)),
    saturation: Math.round(Math.abs(target.saturation - guess.saturation)),
    brightness: Math.round(Math.abs(target.brightness - guess.brightness))
  };
  const total = channels.hue + channels.saturation + channels.brightness;
  const similarity = Math.max(0, Math.round(100 * (1 - total / 280)));
  return { channels, total, similarity, success: total <= RULES.maximumError };
}

export function durationForLevel(level) {
  return Math.max(RULES.startingDuration - (level - 1) * RULES.durationReduction, RULES.minimumDuration);
}

export function scoreMatch(comparison, remainingRatio, combo) {
  if (!comparison.success) return 0;
  const accuracy = Math.max(0, RULES.maximumError - comparison.total) * 20;
  const speed = Math.round(Math.max(0, remainingRatio) * 500);
  const comboBonus = Math.max(0, combo - 1) * 125;
  return 700 + accuracy + speed + comboBonus;
}

export function createTarget(random = Math.random) {
  return {
    hue: Math.floor(random() * 361),
    saturation: Math.floor(random() * 71) + 30,
    brightness: Math.floor(random() * 41) + 30
  };
}

export class TintuitionRun {
  constructor() { this.reset(); }
  reset() { this.level = 1; this.lives = RULES.startingLives; this.score = 0; this.combo = 0; this.active = false; this.target = null; }
  beginRound(random) { this.target = createTarget(random); this.duration = durationForLevel(this.level); this.active = true; return this.target; }
  resolve(guess, remainingRatio) {
    if (!this.active) return null;
    this.active = false;
    const comparison = compareColours(this.target, guess);
    if (comparison.success) {
      this.combo += 1;
      const points = scoreMatch(comparison, remainingRatio, this.combo);
      this.score += points;
      this.level += 1;
      return { ...comparison, points, gameOver: false };
    }
    this.lives -= 1;
    this.combo = 0;
    return { ...comparison, points: 0, gameOver: this.lives === 0 };
  }
}
